import { createContext, ReactNode, useEffect, useMemo, useState } from 'react';
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

export function AuthProvider({ children }: AuthProviderProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

useEffect(() => {
  // Skip authentication check for controller routes and checkout routes - they use other auth methods
  if (window.location.pathname.startsWith('/controller') ||
      window.location.pathname.startsWith('/checkout')) {
    setIsAuthenticated(false);
    setIsInitialized(true);
    return;
  }

  // Listen to Firebase authentication state changes
  const unsubscribe = onAuthStateChanged(auth, async (user) => {
    try {
      if (user) {
        // User is signed in, get fresh Firebase token
        const firebaseToken = await user.getIdToken();
        setClientAccessToken(firebaseToken);

        // Verify token with backend
        try {
          await getAccountInfo();
          setIsAuthenticated(true);
        } catch (error) {
          // Token verification failed
          setIsAuthenticated(false);
        }
      } else {
        // User is signed out
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Auth state change error:', error);
      setIsAuthenticated(false);
    } finally {
      setIsInitialized(true);
    }
  });

  return () => unsubscribe();
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

  const value = useMemo(
    () => ({ isAuthenticated, isInitialized, setIsAuthenticated }),
    [isAuthenticated, isInitialized]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
