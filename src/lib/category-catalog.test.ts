import { describe, expect, it } from 'vitest';
import { orderServiceCategories, resolveServiceCategoryName } from './category-catalog';

describe('official category labels', () => {
  const categories = [{ id:'other', name:'Other Services' }, { id:'computer', name:'Computer & Laptop Repair', aliases:['Computer / IT Services'] }, { id:'cleaning', name:'Home & Office Cleaning', aliases:['House Cleaning','Cleaning Services'] }];
  it('keeps the fallback last without changing IDs or creating extra alias choices', () => {
    expect(orderServiceCategories(categories).map(category => category.id)).toEqual(['computer','cleaning','other']);
  });
  it('resolves old bookmarks and spelling variants to the visible official category', () => {
    expect(resolveServiceCategoryName(categories, 'Computer / IT Services')).toBe('Computer & Laptop Repair');
    expect(resolveServiceCategoryName(categories, '  HOUSE CLEANING  ')).toBe('Home & Office Cleaning');
    expect(resolveServiceCategoryName(categories, 'Home and Office Cleaning')).toBe('Home & Office Cleaning');
    expect(resolveServiceCategoryName(categories, 'All Categories')).toBe('All Categories');
    expect(resolveServiceCategoryName([], 'Custom Skill')).toBe('Custom Skill');
  });
});
