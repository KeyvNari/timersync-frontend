import { useMutation } from '@tanstack/react-query';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { notifications } from '@mantine/notifications';
import { auth } from '@/services/firebase';
import { setClientAccessToken } from '@/api/axios';
import { useRegister } from '@/hooks/api/auth';

// Initialize Google Auth Provider
const googleProvider = new GoogleAuthProvider();
// Request specific scopes to ensure we get user info
googleProvider.addScope('profile');
googleProvider.addScope('email');

export function useFirebaseGoogleLogin() {
  return useMutation({
    mutationFn: async () => {
      try {
        const userCredential = await signInWithPopup(auth, googleProvider);

        // Get the Firebase ID token
        const firebaseToken = await userCredential.user.getIdToken();

        // Store the Firebase token as the access token
        setClientAccessToken(firebaseToken);

        return {
          user: userCredential.user,
          token: firebaseToken,
          email: userCredential.user.email,
          displayName: userCredential.user.displayName,
        };
      } catch (error: any) {
        if (error.code === 'auth/popup-closed-by-user') {
          throw new Error('Sign-in was cancelled. Please try again.');
        }
        if (error.code === 'auth/popup-blocked') {
          throw new Error('Sign-in popup was blocked. Please enable popups and try again.');
        }
        throw error;
      }
    },
    onError: (error: any) => {
      let errorMessage = 'Google sign-in failed. Please try again.';

      if (error.message) {
        errorMessage = error.message;
      }

      notifications.show({
        title: 'Sign-In Failed',
        message: errorMessage,
        color: 'red',
      });
    },
  });
}

interface UseFirebaseGoogleRegisterParams {
  name: string;
}

export function useFirebaseGoogleRegister() {
  const { mutate: register } = useRegister();

  return useMutation({
    mutationFn: async (params: UseFirebaseGoogleRegisterParams) => {
      try {
        const userCredential = await signInWithPopup(auth, googleProvider);
        const user = userCredential.user;

        // Get the Firebase ID token
        const firebaseToken = await userCredential.user.getIdToken();

        // Store the Firebase token as the access token
        setClientAccessToken(firebaseToken);

        // Generate username from email
        const baseUsername = user.email
          ?.split('@')[0]
          .toLowerCase()
          .replace(/[^a-z0-9]/g, '') || 'user';

        const username =
          baseUsername.length < 2 ? (baseUsername + '1').substring(0, 20) : baseUsername.substring(0, 20);

        return {
          user,
          token: firebaseToken,
          email: user.email || '',
          displayName: user.displayName || params.name,
          username,
        };
      } catch (error: any) {
        if (error.code === 'auth/popup-closed-by-user') {
          throw new Error('Sign-up was cancelled. Please try again.');
        }
        if (error.code === 'auth/popup-blocked') {
          throw new Error('Sign-up popup was blocked. Please enable popups and try again.');
        }
        throw error;
      }
    },
    onError: (error: any) => {
      let errorMessage = 'Google sign-up failed. Please try again.';

      if (error.message) {
        errorMessage = error.message;
      }

      notifications.show({
        title: 'Sign-Up Failed',
        message: errorMessage,
        color: 'red',
      });
    },
  });
}
