export const OTHER_SERVICES_CATEGORY = 'Other Services';
export function isFallbackCategory(name: string) {
  return name.trim().replace(/\s+/g, ' ').toLocaleLowerCase('en-PH') === 'other services';
}
/** Preserve Admin category order and IDs, with Other Services always last. */
export function orderServiceCategories<T extends { name: string }>(categories: readonly T[]): T[] {
  return [...categories.filter(category => !isFallbackCategory(category.name)),
    ...categories.filter(category => isFallbackCategory(category.name))];
}

/** Existing bookmarks and an open filter follow the renamed official choice. */
export function resolveServiceCategoryName(categories: readonly { name: string; aliases?: readonly string[] }[] = [], selected: string) {
  const key = (name: string) => name.normalize('NFKC').toLocaleLowerCase('en-PH').replace(/[&/]+/g, ' and ').replace(/[^\p{L}\p{N}]+/gu, ' ').trim().replace(/\s+/g, ' ');
  return categories.find(category => [category.name, ...(category.aliases ?? [])].some(name => key(name) === key(selected)))?.name ?? selected;
}
