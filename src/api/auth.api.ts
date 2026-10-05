import { api, getSessionGeneration, setAccessToken } from '../lib/api/axios';
import axios from 'axios';
import type { AxiosRequestConfig } from 'axios';

let sessionRecoveryRequest: ReturnType<typeof apiGetMe> | null = null;
const SESSION_RECOVERY_TIMEOUT_MS = 15_000;

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  phone: string;
  location: string;
  bio?: string;
  avatarUrl?: string;
}

export async function apiRegister(data: RegisterPayload) {
  const response = await api.post('/auth/register', data);
  return response.data;
}

export async function apiLogin(data: { email: string; password: string }) {
  const response = await api.post('/auth/login', data, { timeout: 15_000, timeoutErrorMessage: 'Sign-in took too long. Please try again.' });
  return response.data;
}

export async function apiLogout() {
  const response = await api.post('/auth/logout');
  return response.data;
}

export async function apiRefresh() {
  const response = await api.post('/auth/refresh');
  return response.data;
}

export async function apiSession(config?: AxiosRequestConfig) {
  const response = await api.post('/auth/session', {}, config);
  return response.data;
}

export async function apiGetMe(config?: AxiosRequestConfig) {
  const response = await api.get('/auth/me', config);
  return response.data;
}

export async function apiGetBanAppeal() {
  const response = await api.get('/auth/ban-appeal');
  return response.data;
}

export async function apiSubmitBanAppeal(message: string) {
  const response = await api.post('/auth/ban-appeal', { message });
  return response.data;
}

/**
 * Deduplicate the initial session check. React intentionally mounts effects
 * twice in development, but recovery must issue only one non-rotating session
 * request and one /me check. Bound the entire operation, including HTTP retries.
 */
export function apiRecoverSession() {
  if (!sessionRecoveryRequest) {
    const controller = new AbortController();
    const generation = getSessionGeneration();
    let timeout: ReturnType<typeof setTimeout>;
    const deadline = new Promise<never>((_, reject) => {
      timeout = setTimeout(() => {
        controller.abort();
        reject(new Error('Session recovery timed out. Please try again.'));
      }, SESSION_RECOVERY_TIMEOUT_MS);
    });
    const config = { signal: controller.signal, timeout: SESSION_RECOVERY_TIMEOUT_MS };
    const recovery = (async () => {
      // Initial page recovery is intentionally non-rotating. A user can reload
      // again before the previous response commits its Set-Cookie header; using
      // the one-time rotation endpoint here would incorrectly revoke the session.
      let sessionResult;
      try {
        sessionResult = await apiSession(config);
      } catch (error) {
        // Retry one transient transport/server failure within the same deadline.
        // Authentication refusals and explicit session changes are not retried.
        if (!axios.isAxiosError(error) || axios.isCancel(error)
          || (error.response && error.response.status < 500)
          || generation !== getSessionGeneration() || controller.signal.aborted) throw error;
        sessionResult = await apiSession(config);
      }
      controller.signal.throwIfAborted();
      if (generation !== getSessionGeneration()) throw new axios.CanceledError('Session changed during recovery');
      if (!sessionResult?.data?.authenticated) {
        return { success: false, data: { user: null } };
      }
      const accessToken = sessionResult.data.accessToken;
      if (!accessToken) throw new Error('No access token returned from session recovery');
      setAccessToken(accessToken);
      // New servers return the profile verified by the cookie check. Retain
      // /me compatibility while an older backend is being restarted/deployed.
      if (sessionResult.data.user?.id) return { success: true, data: { user: sessionResult.data.user } };
      const result = await apiGetMe(config);
      controller.signal.throwIfAborted();
      return result;
    })();
    sessionRecoveryRequest = Promise.race([recovery, deadline]).finally(() => {
      clearTimeout(timeout);
      sessionRecoveryRequest = null;
    });
  }
  return sessionRecoveryRequest;
}

export async function apiVerifyEmail(token: string) {
  const response = await api.get(`/auth/verify-email/${token}`);
  return response.data;
}

export async function apiResendVerification(email: string) {
  const response = await api.post('/auth/resend-verification', { email });
  return response.data;
}

export async function apiForgotPassword(email: string) {
  const response = await api.post('/auth/forgot-password', { email });
  return response.data;
}

export async function apiResetPassword(data: { token: string; password: string; confirmPassword: string }) {
  const response = await api.post('/auth/reset-password', data);
  return response.data;
}

export async function apiGoogleLogin(token: string) {
  const response = await api.post('/auth/google-login', { token }, { timeout: 15_000, timeoutErrorMessage: 'Google sign-in took too long. Please try again.' });
  return response.data;
}

export async function apiGetPublicProfile(userId: string) {
  const response = await api.get(`/auth/profile/${userId}`);
  return response.data;
}

export async function apiUpdateProfile(data: {
  name?: string;
  bio?: string;
  phone?: string;
  location?: string;
  avatarUrl?: string;
  facebookUrl?: string;
  instagramUrl?: string;
  websiteUrl?: string;
  currentPassword?: string;
}) {
  const response = await api.put('/auth/profile', data);
  return response.data;
}

export async function apiChangePassword(data: { currentPassword: string; newPassword: string; confirmPassword: string }) {
  const response = await api.post('/auth/change-password', data);
  return response.data;
}

export interface SecurityMethods { passwordEnabled: boolean; googleConnected: boolean; legacyPasswordUnconfirmed: boolean; googleAvailable: boolean; email: string }
export async function apiGetSecurityMethods(): Promise<{ success: boolean; data: SecurityMethods }> {
  return (await api.get('/auth/security')).data;
}
export async function apiStartPasswordSetup(): Promise<{ data: { nonce: string; challenge: string; expiresInSeconds: number } }> {
  return (await api.post('/auth/password-setup/challenge')).data;
}
export async function apiVerifyPasswordSetup(data: { challenge: string; credential: string }): Promise<{ data: { grant: string; expiresInSeconds: number } }> {
  return (await api.post('/auth/password-setup/verify', data)).data;
}
export async function apiSetPassword(data: { grant: string; newPassword: string; confirmPassword: string }): Promise<{ success: boolean }> {
  return (await api.post('/auth/set-password', data)).data;
}

// Trust Score History — reads real TrustScoreEvent records from DB.
export async function apiGetTrustHistory(userId?: string) {
  const url = userId ? `/auth/trust-history/${userId}` : '/auth/trust-history';
  const response = await api.get(url);
  return response.data;
}
