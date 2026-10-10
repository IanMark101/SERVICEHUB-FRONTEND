export const OTHER_SERVICES_CATEGORY = 'Other Services';
export function isFallbackCategory(name: string) {
  return name.trim().replace(/\s+/g, ' ').toLocaleLowerCase('en-PH') === 'other services';
}
/** Preserve Admin category order and IDs, with Other Services always last. */
export function orderServiceCategories<T extends { name: string }>(categories: readonly T[]): T[] {
  return [...categories.filter(category => !isFallbackCategory(category.name)),
    ...categories.filter(category => isFallbackCategory(category.name))];
}
