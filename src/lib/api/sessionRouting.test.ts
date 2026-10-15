import { describe, expect, it } from 'vitest';
import { sessionProxyRewrites, sessionRequestBaseUrl } from './sessionRouting';

const backend = 'https://api.servicehubcordova.tech/api';

describe('first-party session transport after a frontend domain change', () => {
  it.each(['/auth/login', '/auth/google-login', '/auth/register', '/auth/session', '/auth/refresh', '/auth/logout', '/auth/reset-password', '/auth/change-password', '/users/me/account-deletion'])(
    'uses the website origin for cookie lifecycle request %s', path => {
      expect(sessionRequestBaseUrl(path, backend, true)).toBe('/api');
      expect(sessionProxyRewrites(backend)).toContainEqual({ source: `/api${path}`, destination: `${backend}${path}` });
    },
  );

  it.each(['/admin/verifications/submission', '/auth/me', '/upload/verification', '/services/nearby', '/auth/login/unexpected', '/payments/paymongo/webhook'])(
    'keeps %s outside the narrow session proxy', path => {
      expect(sessionRequestBaseUrl(path, backend, true)).toBe(backend);
      expect(sessionProxyRewrites(backend).some(rule => rule.source === `/api${path}`)).toBe(false);
    },
  );

  it('retains server API calls and configured reverse-proxy prefixes', () => {
    expect(sessionRequestBaseUrl('/auth/session', backend, false)).toBe(backend);
    expect(sessionProxyRewrites('http://localhost:3001/prefix/api/')).toContainEqual({ source: '/api/auth/session', destination: 'http://localhost:3001/prefix/api/auth/session' });
  });

  it.each(['/api', 'https://user:secret@example.test/api', 'https://example.test/api?target=other', 'file:///api'])(
    'rejects ambiguous or unsafe upstream configuration %s', value => expect(() => sessionProxyRewrites(value)).toThrow(),
  );
});
