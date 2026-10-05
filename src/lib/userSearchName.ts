interface SearchNameFields {
  name?: string | null;
  firstName?: string | null;
  lastName?: string | null;
}

/** The public people-search API supplies one name; older local users use two. */
export function normalizeUserSearchName<T extends SearchNameFields>(user: T): T & { firstName: string; lastName: string } {
  const name = typeof user.name === 'string' ? user.name.trim() : '';
  if (name) {
    const [firstName, ...lastName] = name.split(/\s+/);
    return { ...user, firstName, lastName: lastName.join(' ') };
  }
  return {
    ...user,
    firstName: typeof user.firstName === 'string' ? user.firstName.trim() : '',
    lastName: typeof user.lastName === 'string' ? user.lastName.trim() : '',
  };
}
