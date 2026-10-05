import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as api from '@/api/contentWorkspace.api';
import ContentWorkspace from '@/components/admin/content/ContentWorkspace';
import { fixtureCase, fixtureContent } from '@/components/admin/content/fixtures.test-support';
const navigation = vi.hoisted(() => ({ params: new URLSearchParams(), push: vi.fn(), replace: vi.fn() }));
vi.mock('next/navigation', () => ({ useSearchParams: () => navigation.params, useRouter: () => navigation }));
vi.mock('next/link', () => ({ default: ({ children, href, ...props }: React.ComponentProps<'a'>) => <a href={href} {...props}>{children}</a> }));
vi.mock('@/components/ui/Toast', () => ({ useToast: () => ({ success: vi.fn() }) }));
vi.mock('@/lib/socket', () => ({ getSocket: () => null }));
vi.mock('@/api/contentWorkspace.api', () => ({ apiGetContentCases: vi.fn(), apiGetContentCase: vi.fn(), apiGetMarketplaceContent: vi.fn(), apiGetMarketplaceItem: vi.fn() }));
const pagination = { page: 1, limit: 10, total: 1, totalPages: 1 };
describe('Unified admin content workspace', () => {
  beforeEach(() => {
    vi.clearAllMocks(); navigation.params = new URLSearchParams();
    vi.mocked(api.apiGetContentCases).mockResolvedValue({ success: true, data: [fixtureCase], pagination });
    vi.mocked(api.apiGetContentCase).mockResolvedValue({ data: fixtureCase });
    vi.mocked(api.apiGetMarketplaceContent).mockResolvedValue({ success: true, data: [fixtureContent], pagination });
  });
  it('opens the exact reported content and keeps the three views understandable', async () => {
    render(<ContentWorkspace />);
    expect(await screen.findByText('Kitchen faucet repair')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'All content' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'History' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Review case/ }));
    expect(navigation.push).toHaveBeenCalledWith('/admin/content-cases?caseId=case-1', { scroll: false });
    fireEvent.change(screen.getByLabelText('Content type'), { target: { value: 'SERVICE_REQUEST' } });
    expect(navigation.replace).toHaveBeenCalledWith('/admin/content-cases?type=SERVICE_REQUEST', { scroll: false });
  });
  it('all content includes unreported content and opens the exact item', async () => {
    navigation.params = new URLSearchParams('view=content&type=SERVICE_LISTING'); render(<ContentWorkspace />);
    fireEvent.click(await screen.findByRole('button', { name: /Inspect content/ }));
    expect(api.apiGetMarketplaceContent).toHaveBeenCalledWith(expect.objectContaining({ contentType: 'SERVICE_LISTING' }));
    expect(navigation.push).toHaveBeenCalledWith('/admin/content-cases?view=content&type=SERVICE_LISTING&contentId=content-1', { scroll: false });
    expect(screen.queryByRole('button', { name: /Review case/ })).not.toBeInTheDocument();
  });
  it('deep links load the case without asking the admin to hunt through a list', async () => {
    navigation.params = new URLSearchParams('caseId=case-1'); render(<ContentWorkspace />);
    expect(await screen.findByRole('heading', { name: 'Kitchen faucet repair' })).toBeInTheDocument();
    expect(api.apiGetContentCase).toHaveBeenCalledWith('case-1');
    expect(api.apiGetContentCases).not.toHaveBeenCalled();
  });
  it('shows completed outcomes honestly and supports retry on list failures', async () => {
    navigation.params = new URLSearchParams('view=history');
    vi.mocked(api.apiGetContentCases).mockRejectedValueOnce(new Error('Network unavailable'));
    render(<ContentWorkspace />);
    fireEvent.click(await screen.findByRole('button', { name: 'Retry' }));
    await waitFor(() => expect(screen.getByText('Legacy explanation only')).toBeInTheDocument());
    expect(api.apiGetContentCases).toHaveBeenLastCalledWith(expect.objectContaining({ status: 'RESOLVED' }));
  });
  it('explains the public-content scope and provides a separate booking workflow', async () => {
    render(<ContentWorkspace />); await screen.findByText('Kitchen faucet repair');
    expect(screen.getByRole('navigation', { name: 'Report workflows' })).toHaveTextContent('Listings and public requests');
    expect(screen.getByRole('link', { name: /Content Reports & Appeals/ })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('link', { name: /Disputes & Reports/ })).toHaveAttribute('href', '/admin/reports');
    expect(screen.getByText('No booking required. Content decisions do not cancel bookings or settle payments.')).toBeInTheDocument();
  });
});
