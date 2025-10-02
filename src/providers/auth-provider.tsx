import { createContext, ReactNode, useEffect, useMemo, useState } from 'react';
import { loadAccessToken } from '@/api/axios';
import { getAccountInfo } from '@/api/resources';
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
  loadAccessToken(); // This should load the token into axios and localStorage

  // Debug: Check if token exists after loading
  const token = localStorage.getItem(app.accessTokenStoreKey);
  console.log('🔐 Auth Provider - Token loaded:', token ? 'Yes' : 'No');

  // Check if user is authenticated
  const checkAuth = async () => {
    const token = localStorage.getItem(app.accessTokenStoreKey);
    
    if (!token) {
      console.log('❌ No token found in storage');
      setIsAuthenticated(false);
      setIsInitialized(true);
      return;
    }

    try {
      await getAccountInfo();
      console.log('✅ Token valid, user authenticated');
      setIsAuthenticated(true);
    } catch (error) {
      console.log('❌ Token invalid:', error);
      // Token is invalid, remove it
      localStorage.removeItem(app.accessTokenStoreKey);
      setIsAuthenticated(false);
    } finally {
      setIsInitialized(true);
    }
  };

  checkAuth();
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