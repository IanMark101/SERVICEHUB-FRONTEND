import { describe, expect, it } from 'vitest';
import { normalizeUserSearchName } from './userSearchName';

describe('public people-search name mapping', () => {
  it.each([
    ['john sefuesca', 'john', 'sefuesca'],
    ['  John   Vincent Santos  ', 'John', 'Vincent Santos'],
    ['José María Dela Cruz', 'José', 'María Dela Cruz'],
    ['Alex', 'Alex', ''],
  ])('keeps the complete name for %s', (name, firstName, lastName) => {
    const result = normalizeUserSearchName({ id: 'member', name, role: 'user', location: 'Cordova' });
    expect(result).toEqual({ id: 'member', name, role: 'user', location: 'Cordova', firstName, lastName });
  });

  it('preserves legacy first and last names when the API name is absent', () => {
    expect(normalizeUserSearchName({ firstName: ' John Mark ', lastName: ' Buenaflor ' })).toEqual({ firstName: 'John Mark', lastName: 'Buenaflor' });
  });

  it('handles a genuinely missing name without inventing a username or contact information', () => {
    expect(normalizeUserSearchName({ name: null })).toEqual({ name: null, firstName: '', lastName: '' });
  });
});
