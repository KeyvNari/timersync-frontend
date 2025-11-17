import { useMutation } from '@tanstack/react-query';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { notifications } from '@mantine/notifications';
import { auth } from '@/services/firebase';
import { setClientAccessToken, client } from '@/api/axios';

// Initialize Google Auth Provider
const googleProvider = new GoogleAuthProvider();
// Request specific scopes to ensure we get user info
googleProvider.addScope('profile');
googleProvider.addScope('email');

interface FirebaseLoginResponse {
  id: number;
  name: string;
  username: string;
  email: string;
  profile_image_url: string;
  plan: string;
}

export function useFirebaseGoogleLogin() {
  return useMutation({
    mutationFn: async () => {
      try {
        const userCredential = await signInWithPopup(auth, googleProvider);

        // Get the Firebase ID token
        const firebaseToken = await userCredential.user.getIdToken();

        // Send token to backend for verification and user sync
        const response = await client.post<FirebaseLoginResponse>(
          '/api/v1/firebase-login',
          { token: firebaseToken }
        );

        // Store the Firebase token as the access token
        setClientAccessToken(firebaseToken);

        return {
          user: response.data,
          token: firebaseToken,
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
      } else if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      }

      notifications.show({
        title: 'Sign-In Failed',
        message: errorMessage,
        color: 'red',
      });
    },
  });
}

export function useFirebaseGoogleRegister() {
  return useMutation({
    mutationFn: async () => {
      try {
        const userCredential = await signInWithPopup(auth, googleProvider);
        const user = userCredential.user;

        // Get the Firebase ID token
        const firebaseToken = await userCredential.user.getIdToken();

        // Send token to backend for verification and user creation
        const response = await client.post<FirebaseLoginResponse>(
          '/api/v1/firebase-login',
          { token: firebaseToken }
        );

        // Store the Firebase token as the access token
        setClientAccessToken(firebaseToken);

        return {
          user: response.data,
          token: firebaseToken,
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
      } else if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      }

      notifications.show({
        title: 'Sign-Up Failed',
        message: errorMessage,
        color: 'red',
      });
    },
  });
}
