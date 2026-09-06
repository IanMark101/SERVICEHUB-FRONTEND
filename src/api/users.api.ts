import { api } from '../lib/api/axios';
import { isAxiosError } from 'axios';

export interface AccountDeletionRequest {
  id: string;
  status: 'PENDING' | 'BLOCKED' | 'CANCELLED' | 'COMPLETED';
  blockers?: Array<{ type: string; count: number }>;
  requestedAt: string;
}

export async function apiRequestAccountDeletion() {
  const response = await api.post('/users/me/account-deletion', { confirmation: 'DELETE' });
  return response.data as { success: true; data: AccountDeletionRequest };
}

export async function apiGetAccountDeletionRequest() {
  const response = await api.get('/users/me/account-deletion');
  return response.data as { success: true; data: AccountDeletionRequest | null };
}

export async function apiCancelAccountDeletionRequest() {
  const response = await api.delete('/users/me/account-deletion');
  return response.data as { success: true; data: AccountDeletionRequest };
}

const CANDIDATE_PATHS = ['/users', '/user', '/users/search', '/user/search'];
const CACHE_KEY = 'users_api_path';

type UserSearchParams = { search?: string; page?: number; limit?: number };

async function tryPath(path: string, params?: UserSearchParams) {
  const res = await api.get(path, { params });
  return res.data;
}

export async function apiSearchUsers(params?: UserSearchParams) {
  // Check cache first
  const cached = typeof window !== 'undefined' ? localStorage.getItem(CACHE_KEY) : null;
  if (cached) {
    try {
      return await tryPath(cached, params);
    } catch {
      // fall through to try candidates
    }
  }

  for (const p of CANDIDATE_PATHS) {
    try {
      const data = await tryPath(p, params);
      if (typeof window !== 'undefined') localStorage.setItem(CACHE_KEY, p);
      return data;
    } catch (error: unknown) {
      if (isAxiosError(error) && error.response?.status === 404) continue;
      // For non-404, still continue to let other paths try
      continue;
    }
  }

  // As a last resort throw an error indicating not found
  const e = new Error('Users endpoint not found') as Error & { response: { status: number } };
  e.response = { status: 404 };
  throw e;
}

export async function apiGetUserById(id: string) {
  const cached = typeof window !== 'undefined' ? localStorage.getItem(CACHE_KEY) : null;
  const paths = cached ? [cached, ...CANDIDATE_PATHS] : CANDIDATE_PATHS;
  for (const base of paths) {
    try {
      const path = base.endsWith('/') ? `${base}${id}` : `${base}/${id}`;
      const res = await api.get(path);
      if (typeof window !== 'undefined') localStorage.setItem(CACHE_KEY, base);
      return res.data;
    } catch (error: unknown) {
      if (isAxiosError(error) && error.response?.status === 404) continue;
      continue;
    }
  }
  const e = new Error('User detail endpoint not found') as Error & { response: { status: number } };
  e.response = { status: 404 };
  throw e;
}
