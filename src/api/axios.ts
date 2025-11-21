import axios from 'axios';
import { app } from '@/config';
import { auth } from '@/services/firebase';

// Track retry attempts per request config
const retryCountMap = new WeakMap<any, number>();
const MAX_RETRY_ATTEMPTS = 3;
const RETRY_DELAY_MS = 100;

export const client = axios.create({
  baseURL: app.apiBaseUrl,
  headers: {
    'Content-type': 'application/json',
    Accept: 'application/json',
  },
  withCredentials: true, // Enable cookies for refresh tokens
  timeout: 30000, // 30 second timeout for all requests
});

// Request interceptor to add auth token
client.interceptors.request.use(
  (config) => {
    // Skip adding bearer token for controller routes - they use room tokens instead
    if (config.url?.includes('/controller') || window.location.pathname.startsWith('/controller')) {
      return config;
    }

    const token = localStorage.getItem(app.accessTokenStoreKey);
    if (token) {
      config.headers.authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Helper: Exponential backoff delay
function getExponentialBackoffDelay(retryCount: number): number {
  return RETRY_DELAY_MS * Math.pow(2, retryCount);
}

// Response interceptor to handle token refresh with retry logic
client.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Get current retry count for this request
    const retryCount = retryCountMap.get(originalRequest) || 0;

    // Don't try to refresh tokens for login/auth endpoints or controller routes
    const isAuthEndpoint = originalRequest.url?.includes('/login') ||
                          originalRequest.url?.includes('/refresh') ||
                          originalRequest.url?.includes('/register') ||
                          originalRequest.url?.includes('/firebase-login');

    // Don't redirect to login if we're on a controller page - controller uses room tokens, not user auth
    const isControllerRoute = window.location.pathname.startsWith('/controller') ||
                             window.location.pathname.startsWith('/viewer');

    if (error.response?.status === 401 &&
        retryCount < MAX_RETRY_ATTEMPTS &&
        !isAuthEndpoint) {

      // Increment retry count for this request
      retryCountMap.set(originalRequest, retryCount + 1);

      try {
        // Calculate exponential backoff delay
        const delayMs = getExponentialBackoffDelay(retryCount);
        await new Promise(resolve => setTimeout(resolve, delayMs));

        // Try to refresh Firebase token from current user
        const currentUser = auth.currentUser;
        if (currentUser) {
          // Force refresh the Firebase token
          const newFirebaseToken = await currentUser.getIdToken(true);
          setClientAccessToken(newFirebaseToken);

          originalRequest.headers.authorization = `Bearer ${newFirebaseToken}`;

          // Retry the original request
          return client(originalRequest);
        } else {
          throw new Error('No user logged in');
        }
      } catch (refreshError) {
        removeClientAccessToken();

        // Only dispatch auth-required event if not on controller/viewer routes
        if (!isControllerRoute) {
          // Dispatch a custom event that auth-provider can listen to
          // This prevents hard navigation and allows React Router to handle redirect
          window.dispatchEvent(new CustomEvent('auth-required', {
            detail: { reason: 'token-refresh-failed' }
          }));
        }

        return Promise.reject(refreshError);
      }
    }

    // If max retries exceeded and still 401, clear token and signal auth required
    if (error.response?.status === 401 && retryCount >= MAX_RETRY_ATTEMPTS) {
      removeClientAccessToken();

      if (!isControllerRoute) {
        window.dispatchEvent(new CustomEvent('auth-required', {
          detail: { reason: 'max-retries-exceeded' }
        }));
      }
    }

    return Promise.reject(error);
  }
);

export function setClientAccessToken(token: string) {
  localStorage.setItem(app.accessTokenStoreKey, token);
  client.defaults.headers.common.authorization = `Bearer ${token}`;
}

export function removeClientAccessToken() {
  localStorage.removeItem(app.accessTokenStoreKey);
  delete client.defaults.headers.common.authorization;
}

export function loadAccessToken() {
  const token = localStorage.getItem(app.accessTokenStoreKey);
  if (token) {
    setClientAccessToken(token);
  }
}
