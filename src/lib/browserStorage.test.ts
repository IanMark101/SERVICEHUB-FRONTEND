import { beforeEach, describe, expect, it } from 'vitest';
import {
  clearLegacyAuthStorage,
  clearSessionHint,
  hasSessionHint,
  markSessionPresent,
} from './browserStorage';

describe('clearLegacyAuthStorage', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  it('removes legacy credentials and cached identity data', () => {
    localStorage.setItem('userToken', 'legacy-user-jwt');
    localStorage.setItem('adminToken', 'legacy-admin-jwt');
    localStorage.setItem('userSession', JSON.stringify({ email: 'resident@example.com' }));
    sessionStorage.setItem('refreshToken', 'legacy-refresh-token');

    clearLegacyAuthStorage();

    expect(localStorage.getItem('userToken')).toBeNull();
    expect(localStorage.getItem('adminToken')).toBeNull();
    expect(localStorage.getItem('userSession')).toBeNull();
    expect(sessionStorage.getItem('refreshToken')).toBeNull();
    expect(hasSessionHint()).toBe(true);
  });

  it('preserves non-sensitive interface preferences', () => {
    localStorage.setItem('theme', 'dark');
    localStorage.setItem('workspaceRole', 'provider');
    localStorage.setItem('servicehub:marketplace-sidebar-collapsed', 'true');

    clearLegacyAuthStorage();

    expect(localStorage.getItem('theme')).toBe('dark');
    expect(localStorage.getItem('workspaceRole')).toBe('provider');
    expect(localStorage.getItem('servicehub:marketplace-sidebar-collapsed')).toBe('true');
  });

  it('stores only a non-sensitive boolean session hint', () => {
    expect(hasSessionHint()).toBe(false);
    markSessionPresent();
    expect(hasSessionHint()).toBe(true);
    expect(localStorage.getItem('servicehub:session-present')).toBe('true');

    clearSessionHint();
    expect(hasSessionHint()).toBe(false);
  });
});
