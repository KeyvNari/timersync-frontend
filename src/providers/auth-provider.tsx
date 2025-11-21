import { createContext, ReactNode, useEffect, useMemo, useState, useRef } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { loadAccessToken, setClientAccessToken } from '@/api/axios';
import { getAccountInfo } from '@/api/resources';
import { auth } from '@/services/firebase';
import { app } from '@/config';

interface AuthContextValues {
  isAuthenticated: boolean;
  isInitialized: boolean;
  setIsAuthenticated: (isAuthenticated: boolean) => void;
}

export const AuthContext = createContext<AuthContextValues | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

// Helper function: retry with exponential backoff
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelayMs: number = 100
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      if (attempt < maxRetries - 1) {
        const delayMs = baseDelayMs * Math.pow(2, attempt);
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    }
  }

  throw lastError || new Error('Max retries exceeded');
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Prevent race conditions with a debounce ref
  const authStateChangeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastAuthCheckRef = useRef<{ timestamp: number; userId: string } | null>(null);

useEffect(() => {
  // Skip authentication check for controller routes - they use room tokens instead
  // NOTE: DO NOT skip for /checkout routes - users should stay authenticated if they were logged in
  if (window.location.pathname.startsWith('/controller')) {
    setIsAuthenticated(false);
    setIsInitialized(true);
    return;
  }

  // Listen to Firebase authentication state changes
  const unsubscribe = onAuthStateChanged(auth, async (user) => {
    // Clear any pending auth state changes to prevent race conditions
    if (authStateChangeTimeoutRef.current) {
      clearTimeout(authStateChangeTimeoutRef.current);
    }

    try {
      if (user) {
        // Check if this is a duplicate call (same user within 500ms)
        const now = Date.now();
        if (lastAuthCheckRef.current?.userId === user.uid &&
            now - lastAuthCheckRef.current.timestamp < 500) {
          return;
        }

        lastAuthCheckRef.current = { timestamp: now, userId: user.uid };

        // Get fresh Firebase token with explicit force refresh
        const firebaseToken = await retryWithBackoff(
          () => user.getIdToken(true), // forceRefresh = true
          3,
          100
        );

        setClientAccessToken(firebaseToken);

        // Verify token with backend using exponential backoff
        await retryWithBackoff(
          () => getAccountInfo(),
          3,
          100
        );

        setIsAuthenticated(true);
      } else {
        // User is signed out
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Auth state change error:', error);
      // DON'T sign out on verification failure! This is critical for two reasons:
      // 1. Race condition during Google login: Backend hasn't synced user yet (200-500ms delay)
      //    If we sign out immediately, first login attempt fails, but second attempt works
      // 2. Page refresh: Transient network failures shouldn't cause logout
      //    User is still in Firebase, so they're still authenticated
      //
      // Strategy: Let axios interceptor handle 401 errors with retry logic.
      // If backend truly rejects the user, the 401 response will trigger:
      //   - Axios interceptor retry with exponential backoff
      //   - After 3 retries, it dispatches 'auth-required' event
      //   - This event listener WILL sign them out
      //
      // Firebase auth state is the source of truth. We trust it until the user
      // explicitly signs out or a 401 is definitely confirmed after retries.

      // Keep user authenticated - let axios handle the verification
      setIsAuthenticated(true);
    } finally {
      setIsInitialized(true);
    }
  });

  return () => {
    unsubscribe();
    if (authStateChangeTimeoutRef.current) {
      clearTimeout(authStateChangeTimeoutRef.current);
    }
  };
}, []);

  // Listen for storage changes (logout from another tab)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === app.accessTokenStoreKey && !e.newValue) {
        setIsAuthenticated(false);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Listen for auth-required event (from axios interceptor)
  useEffect(() => {
    const handleAuthRequired = () => {
      setIsAuthenticated(false);
    };

    window.addEventListener('auth-required', handleAuthRequired as EventListener);
    return () => window.removeEventListener('auth-required', handleAuthRequired as EventListener);
  }, []);

  const value = useMemo(
    () => ({ isAuthenticated, isInitialized, setIsAuthenticated }),
    [isAuthenticated, isInitialized]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
