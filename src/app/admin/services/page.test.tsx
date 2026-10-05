import { describe, expect, it, vi } from 'vitest';
import { redirect } from 'next/navigation';
import LegacyPage from './page';
vi.mock('next/navigation', () => ({ redirect: vi.fn() }));
describe('Legacy services links', () => {
  it('opens the merged workspace and preserves the exact content id', async () => {
    await LegacyPage({ searchParams: Promise.resolve({ id: 'content-1' }) });
    expect(redirect).toHaveBeenCalledWith('/admin/content-cases?view=content&type=SERVICE_LISTING&contentId=content-1');
  });
});
