import axios from 'axios';
import { app } from '@/config';
import { auth } from '@/services/firebase';

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

// Response interceptor to handle token refresh
// In src/api/axios.ts
client.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Don't try to refresh tokens for login/auth endpoints or controller routes
    const isAuthEndpoint = originalRequest.url?.includes('/login') ||
                          originalRequest.url?.includes('/refresh') ||
                          originalRequest.url?.includes('/register');

    // Don't redirect to login if we're on a controller page - controller uses room tokens, not user auth
    const isControllerRoute = window.location.pathname.startsWith('/controller') ||
                             window.location.pathname.startsWith('/viewer');

    if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      originalRequest._retry = true;

      try {
        // Try to refresh Firebase token from current user
        const currentUser = auth.currentUser;
        if (currentUser) {
          // Force refresh the Firebase token
          const newFirebaseToken = await currentUser.getIdToken(true);
          setClientAccessToken(newFirebaseToken);

          originalRequest.headers.authorization = `Bearer ${newFirebaseToken}`;
          return client(originalRequest);
        } else {
          throw new Error('No user logged in');
        }
      } catch (refreshError) {
        removeClientAccessToken();

        // Only redirect to login if not on controller/viewer routes
        if (!isControllerRoute) {
          window.location.href = '/auth/login';
        }
        return Promise.reject(refreshError);
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
