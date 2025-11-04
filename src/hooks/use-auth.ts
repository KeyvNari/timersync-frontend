import { useContext } from 'react';
import invariant from 'tiny-invariant';
import { AuthContext } from '@/providers/auth-provider';

export function useAuth() {
  const context = useContext(AuthContext);
  invariant(context, 'useAuth must be used within an AuthProvider');
  return context;
}

/**
 * Safe version of useAuth that returns a default context if AuthProvider is not available.
 * Use this in components that may be rendered outside of an AuthProvider context.
 */
export function useSafeAuth() {
  const context = useContext(AuthContext);
  // Return a default context if not within AuthProvider (for controller/viewer routes)
  if (!context) {
    return {
      isAuthenticated: true,
      isInitialized: true,
      setIsAuthenticated: () => {},
    };
  }
  return context;
}
