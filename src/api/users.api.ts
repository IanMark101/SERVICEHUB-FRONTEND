import { api } from '../lib/api/axios';

const CANDIDATE_PATHS = ['/users', '/user', '/users/search', '/user/search'];
const CACHE_KEY = 'users_api_path';

async function tryPath(path: string, params?: any) {
  try {
    const res = await api.get(path, { params });
    return res.data;
  } catch (err: any) {
    // propagate 404/other to caller
    throw err;
  }
}

export async function apiSearchUsers(params?: { search?: string; page?: number; limit?: number }) {
  // Check cache first
  const cached = typeof window !== 'undefined' ? localStorage.getItem(CACHE_KEY) : null;
  if (cached) {
    try {
      return await tryPath(cached, params);
    } catch (e) {
      // fall through to try candidates
    }
  }

  for (const p of CANDIDATE_PATHS) {
    try {
      const data = await tryPath(p, params);
      if (typeof window !== 'undefined') localStorage.setItem(CACHE_KEY, p);
      return data;
    } catch (err: any) {
      if (err?.response?.status === 404) continue;
      // For non-404, still continue to let other paths try
      continue;
    }
  }

  // As a last resort throw an error indicating not found
  const e: any = new Error('Users endpoint not found');
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
    } catch (err: any) {
      if (err?.response?.status === 404) continue;
      continue;
    }
  }
  const e: any = new Error('User detail endpoint not found');
  e.response = { status: 404 };
  throw e;
}
