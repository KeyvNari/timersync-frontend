import axios from 'axios';
import { client } from '../axios';
import { auth } from '@/services/firebase';
import { app } from '@/config';

export interface CheckoutPayload {
  plan_id: string;
  success_url: string;
  cancel_url: string;
}

export interface CheckoutResponse {
  checkout_url: string;
}

export interface SubscriptionStatus {
  status: 'active' | 'inactive' | 'canceled' | 'pending';
  plan_id?: string;
  plan_name?: string;
  next_billing_date?: string;
  cancel_at_period_end?: boolean;
  subscription_id?: string;
}

export interface CancelSubscriptionPayload {
  at_period_end: boolean;
}

export interface CancelSubscriptionResponse {
  status: 'scheduled' | 'canceled';
  next_billing_date?: string;
}

/**
 * Get fresh Firebase token for API requests
 */
async function getFreshToken(): Promise<string | null> {
  try {
    const user = auth.currentUser;
    if (!user) {
      console.log('[BILLING] No authenticated user found');
      return null;
    }

    // Force refresh the token (true = force refresh)
    const token = await user.getIdToken(true);
    console.log('[BILLING] Fresh token obtained:', token.substring(0, 20) + '...');
    return token;
  } catch (error) {
    console.error('[BILLING] Failed to get fresh token:', error);
    return null;
  }
}

/**
 * Create a checkout session for plan upgrade
 */
export async function createCheckoutSession(payload: CheckoutPayload) {
  console.log('[BILLING] POST /api/v1/payments/checkout', { payload });

  try {
    const token = await getFreshToken();

    if (token) {
      // Use fresh token directly
      console.log('[BILLING] Sending request with fresh Firebase token');
      const response = await axios.post<CheckoutResponse>(
        `${app.apiBaseUrl}/api/v1/payments/checkout`,
        payload,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      console.log('[BILLING] Checkout response:', response.data);
      return response.data;
    } else {
      // Fallback to client with cached token
      console.log('[BILLING] Falling back to axios client (cached token)');
      const response = await client.post<CheckoutResponse>(
        '/api/v1/payments/checkout',
        payload
      );
      console.log('[BILLING] Checkout response:', response.data);
      return response.data;
    }
  } catch (error) {
    console.error('[BILLING] Checkout request failed:', error);

    // Detailed error logging for debugging
    if (axios.isAxiosError(error)) {
      console.error('[BILLING] ❌ Axios Error Details:');
      console.error('[BILLING] Status Code:', error.response?.status);
      console.error('[BILLING] Status Text:', error.response?.statusText);
      console.error('[BILLING] Request URL:', error.config?.url);
      console.error('[BILLING] Request Method:', error.config?.method);
      console.error('[BILLING] Request Headers:', error.config?.headers);
      console.error('[BILLING] Request Data:', error.config?.data);
      console.error('[BILLING] Response Data:', error.response?.data);
      console.error('[BILLING] Response Headers:', error.response?.headers);
    } else if (error instanceof Error) {
      console.error('[BILLING] Standard Error:', error.message);
      console.error('[BILLING] Stack:', error.stack);
    } else {
      console.error('[BILLING] Unknown error type:', typeof error, error);
    }

    throw error;
  }
}

/**
 * Get current subscription status
 */
export async function getSubscriptionStatus(sessionId?: string) {
  console.log('[BILLING] GET /api/v1/payments/status', sessionId ? `(sessionId: ${sessionId})` : '');

  try {
    const token = await getFreshToken();

    if (token) {
      // Use fresh token directly
      console.log('[BILLING] Sending request with fresh Firebase token');
      const response = await axios.get<SubscriptionStatus>(
        `${app.apiBaseUrl}/api/v1/payments/status`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      console.log('[BILLING] Subscription status response:', response.data);
      return response.data;
    } else if (sessionId) {
      // Use session ID for unauthenticated access (Stripe redirect scenario)
      console.log('[BILLING] Using session ID for unauthenticated verification');
      const response = await axios.get<SubscriptionStatus>(
        `${app.apiBaseUrl}/api/v1/payments/status`,
        {
          params: { session_id: sessionId },
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      console.log('[BILLING] Subscription status response:', response.data);
      return response.data;
    } else {
      // Fallback to client with cached token
      console.log('[BILLING] Falling back to axios client (cached token)');
      const response = await client.get<SubscriptionStatus>(
        '/api/v1/payments/status'
      );
      console.log('[BILLING] Subscription status response:', response.data);
      return response.data;
    }
  } catch (error) {
    console.error('[BILLING] Status request failed:', error);

    // Detailed error logging for debugging
    if (axios.isAxiosError(error)) {
      console.error('[BILLING] ❌ Axios Error Details:');
      console.error('[BILLING] Status Code:', error.response?.status);
      console.error('[BILLING] Status Text:', error.response?.statusText);
      console.error('[BILLING] Request URL:', error.config?.url);
      console.error('[BILLING] Request Method:', error.config?.method);
      console.error('[BILLING] Request Headers:', error.config?.headers);
      console.error('[BILLING] Response Data:', error.response?.data);
      console.error('[BILLING] Response Headers:', error.response?.headers);
    } else if (error instanceof Error) {
      console.error('[BILLING] Standard Error:', error.message);
      console.error('[BILLING] Stack:', error.stack);
    } else {
      console.error('[BILLING] Unknown error type:', typeof error, error);
    }

    throw error;
  }
}

/**
 * Cancel subscription
 */
export async function cancelSubscription(payload: CancelSubscriptionPayload) {
  console.log('[BILLING] POST /api/v1/payments/cancel-subscription', { payload });

  try {
    const token = await getFreshToken();

    if (token) {
      // Use fresh token directly
      console.log('[BILLING] Sending request with fresh Firebase token');
      const response = await axios.post<CancelSubscriptionResponse>(
        `${app.apiBaseUrl}/api/v1/payments/cancel-subscription`,
        payload,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      console.log('[BILLING] Cancel subscription response:', response.data);
      return response.data;
    } else {
      // Fallback to client with cached token
      console.log('[BILLING] Falling back to axios client (cached token)');
      const response = await client.post<CancelSubscriptionResponse>(
        '/api/v1/payments/cancel-subscription',
        payload
      );
      console.log('[BILLING] Cancel subscription response:', response.data);
      return response.data;
    }
  } catch (error) {
    console.error('[BILLING] Cancel subscription request failed:', error);

    // Detailed error logging for debugging
    if (axios.isAxiosError(error)) {
      console.error('[BILLING] ❌ Axios Error Details:');
      console.error('[BILLING] Status Code:', error.response?.status);
      console.error('[BILLING] Status Text:', error.response?.statusText);
      console.error('[BILLING] Request URL:', error.config?.url);
      console.error('[BILLING] Request Method:', error.config?.method);
      console.error('[BILLING] Request Headers:', error.config?.headers);
      console.error('[BILLING] Request Data:', error.config?.data);
      console.error('[BILLING] Response Data:', error.response?.data);
      console.error('[BILLING] Response Headers:', error.response?.headers);
    } else if (error instanceof Error) {
      console.error('[BILLING] Standard Error:', error.message);
      console.error('[BILLING] Stack:', error.stack);
    } else {
      console.error('[BILLING] Unknown error type:', typeof error, error);
    }

    throw error;
  }
}
