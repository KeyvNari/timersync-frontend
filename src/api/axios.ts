import axios from 'axios';
import { app } from '@/config';

export const client = axios.create({
  baseURL: app.apiBaseUrl,
  headers: {
    'Content-type': 'application/json',
    Accept: 'application/json',
  },
  withCredentials: true, // Enable cookies for refresh tokens
});

// Request interceptor to add auth token
client.interceptors.request.use(
  (config) => {
    // Skip adding bearer token for controller routes - they use room tokens instead
    if (config.url?.includes('/controller') || window.location.pathname.startsWith('/controller')) {
      console.log('🔑 Request interceptor - Skipping bearer token for controller route');
      return config;
    }

    const token = localStorage.getItem(app.accessTokenStoreKey);
    console.log('🔑 Request interceptor - Token exists:', !!token); // Debug log
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

    // Add debugging
    console.log('Response interceptor triggered:', {
      url: originalRequest.url,
      status: error.response?.status,
      hasRetry: originalRequest._retry
    });

    // Don't try to refresh tokens for login/auth endpoints or controller routes
    const isAuthEndpoint = originalRequest.url?.includes('/login') ||
                          originalRequest.url?.includes('/refresh') ||
                          originalRequest.url?.includes('/register');

    // Don't redirect to login if we're on a controller page - controller uses room tokens, not user auth
    const isControllerRoute = window.location.pathname.startsWith('/controller') ||
                             window.location.pathname.startsWith('/viewer');

    console.log('Is auth endpoint:', isAuthEndpoint, 'Is controller route:', isControllerRoute);

    if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      console.log('Attempting token refresh...');
      originalRequest._retry = true;

      try {
        const refreshResponse = await axios.post(
          `${app.apiBaseUrl}/api/v1/refresh`,
          {},
          { withCredentials: true }
        );

        const newToken = refreshResponse.data.access_token;
        setClientAccessToken(newToken);

        originalRequest.headers.authorization = `Bearer ${newToken}`;
        return client(originalRequest);
      } catch (refreshError) {
        console.log('Token refresh failed:', refreshError);
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
