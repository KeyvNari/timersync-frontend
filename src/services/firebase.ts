import { initializeApp } from 'firebase/app';
import { getAuth, setPersistence, browserLocalPersistence, onIdTokenChanged } from 'firebase/auth';

// Firebase configuration - update with your actual Firebase config
// These should come from your Firebase project settings
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(firebaseApp);

// Set persistence to LOCAL so user stays logged in after refresh
setPersistence(auth, browserLocalPersistence).catch((error) => {
  console.error('Failed to set persistence:', error);
});

// Token refresh manager
let tokenRefreshTimeoutId: NodeJS.Timeout | null = null;

// Helper function to decode JWT claims
function decodeIdTokenClaims(token: string): any {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Failed to decode token:', error);
    return null;
  }
}

// Setup proactive token refresh
onIdTokenChanged(auth, async (user) => {
  // Clear any existing timeout
  if (tokenRefreshTimeoutId) {
    clearTimeout(tokenRefreshTimeoutId);
  }

  if (user) {
    try {
      // Get the token and decode it to find expiration
      const token = await user.getIdToken();
      const claims = decodeIdTokenClaims(token);

      if (claims?.exp) {
        const expirationTime = claims.exp * 1000; // Convert to milliseconds
        const now = Date.now();
        const timeUntilExpiration = expirationTime - now;

        // Refresh token 5 minutes before expiration
        const refreshDelayMs = Math.max(timeUntilExpiration - 5 * 60 * 1000, 0);

        if (refreshDelayMs > 0) {
          console.debug(`Token will expire in ${Math.round(timeUntilExpiration / 1000)}s, refreshing in ${Math.round(refreshDelayMs / 1000)}s`);

          tokenRefreshTimeoutId = setTimeout(async () => {
            try {
              console.debug('Proactively refreshing Firebase token before expiration');
              await user.getIdToken(true);
            } catch (error) {
              console.error('Failed to proactively refresh token:', error);
            }
          }, refreshDelayMs);
        } else {
          console.debug('Token expires in less than 5 minutes, refreshing immediately');
          try {
            await user.getIdToken(true);
          } catch (error) {
            console.error('Failed to refresh expiring token:', error);
          }
        }
      }
    } catch (error) {
      console.error('Error setting up token refresh:', error);
    }
  }
});

export default firebaseApp;
