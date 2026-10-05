import { describe, expect, it } from 'vitest';
import { getWorkspaceEntryPath } from './workspaceEntry';

describe('explicit workspace entry', () => {
  it.each([
    ['seeker', '/seeker/seek-services'],
    ['provider', '/provider/browse-services'],
    ['admin', '/admin/overview'],
  ] as const)('takes %s directly to its content page', (role, path) => {
    expect(getWorkspaceEntryPath({ role, emailVerified: true })).toBe(path);
  });

  it.each(['seeker', 'provider'] as const)('keeps email verification required for %s', role => {
    expect(getWorkspaceEntryPath({ role, emailVerified: false })).toBe('/email-verification-required');
    expect(getWorkspaceEntryPath({ role })).toBe('/email-verification-required');
  });

  it.each(['seeker', 'provider', 'admin'] as const)('keeps banned %s accounts out of the workspace', role => {
    expect(getWorkspaceEntryPath({ role, emailVerified: true, moderationStatus: 'BANNED' })).toBe('/account-banned');
  });
});
