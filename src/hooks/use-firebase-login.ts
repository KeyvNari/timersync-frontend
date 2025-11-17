import { useMutation } from '@tanstack/react-query';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { notifications } from '@mantine/notifications';
import { auth } from '@/services/firebase';
import { setClientAccessToken } from '@/api/axios';

interface FirebaseLoginParams {
  email: string;
  password: string;
}

export function useFirebaseLogin() {
  return useMutation({
    mutationFn: async ({ email, password }: FirebaseLoginParams) => {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);

      // Get the Firebase ID token
      const firebaseToken = await userCredential.user.getIdToken();

      // Store the Firebase token as the access token
      setClientAccessToken(firebaseToken);

      return {
        user: userCredential.user,
        token: firebaseToken,
      };
    },
    onError: (error: any) => {
      let errorMessage = 'Login failed. Please try again.';

      if (error.code === 'auth/user-not-found') {
        errorMessage = 'User not found. Please check your email.';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Incorrect password. Please try again.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address.';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many login attempts. Please try again later.';
      } else if (error.message) {
        errorMessage = error.message;
      }

      notifications.show({
        title: 'Login Failed',
        message: errorMessage,
        color: 'red',
      });
    },
  });
}
