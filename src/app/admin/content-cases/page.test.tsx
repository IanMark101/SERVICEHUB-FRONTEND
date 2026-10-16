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
    expect(screen.getByRole('button', { name: 'Case history' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Review case/ }));
    expect(navigation.push).toHaveBeenCalledWith('/admin/content-cases?caseId=case-1', { scroll: false });
    expect(screen.queryByLabelText('Case type')).not.toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Show'), { target: { value: 'APPEAL' } });
    expect(navigation.replace).toHaveBeenCalledWith('/admin/content-cases?kind=APPEAL', { scroll: false });
    fireEvent.change(screen.getByLabelText('Listing type'), { target: { value: 'SERVICE_REQUEST' } });
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
  it('keeps content reviews separate from booking cases and ban appeals', async () => {
    render(<ContentWorkspace />); await screen.findByText('Kitchen faucet repair');
    expect(screen.getByRole('link', { name: /Content Reports & Appeals/ })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('link', { name: /Disputes & Reports/ })).toHaveAttribute('href', '/admin/reports');
    expect(screen.getByRole('link', { name: 'Ban Appeals' })).toHaveAttribute('href', '/admin/ban-appeals');
  });
  it('applies the report reason to server requests and resets pagination when it changes', async () => {
    navigation.params = new URLSearchParams('view=history&type=SERVICE_REQUEST&kind=REPORT&reason=SCAM&page=2');
    render(<ContentWorkspace />); await screen.findByText('Kitchen faucet repair');
    expect(api.apiGetContentCases).toHaveBeenCalledWith(expect.objectContaining({ page: 2, contentType: 'SERVICE_REQUEST', caseType: 'REPORT', reportReason: 'SCAM', status: 'RESOLVED' }));
    expect(screen.getByLabelText('Report reason')).toHaveValue('SCAM');
    fireEvent.change(screen.getByLabelText('Report reason'), { target: { value: 'UNSPECIFIED' } });
    const next = new URL(navigation.replace.mock.calls.at(-1)![0], 'http://localhost');
    expect(next.searchParams.get('reason')).toBe('UNSPECIFIED');
    expect(next.searchParams.get('type')).toBe('SERVICE_REQUEST');
    expect(next.searchParams.get('kind')).toBe('REPORT');
    expect(next.searchParams.has('page')).toBe(false);
  });
  it('selecting a reason narrows to reports and clear filters removes it', async () => {
    const { rerender } = render(<ContentWorkspace />); await screen.findByText('Kitchen faucet repair');
    fireEvent.change(screen.getByLabelText('Report reason'), { target: { value: 'SCAM' } });
    expect(navigation.replace).toHaveBeenCalledWith('/admin/content-cases?reason=SCAM&kind=REPORT', { scroll: false });
    navigation.params = new URLSearchParams('reason=SCAM&kind=REPORT'); rerender(<ContentWorkspace />);
    fireEvent.click(screen.getByRole('button', { name: 'Clear filters' }));
    expect(navigation.replace).toHaveBeenLastCalledWith('/admin/content-cases', { scroll: false });
    fireEvent.change(screen.getByLabelText('Show'), { target: { value: 'APPEAL' } });
    expect(navigation.replace).toHaveBeenLastCalledWith('/admin/content-cases?kind=APPEAL', { scroll: false });
    fireEvent.click(screen.getByRole('button', { name: 'All content' }));
    expect(navigation.replace).toHaveBeenLastCalledWith('/admin/content-cases?view=content', { scroll: false });
  });
  it('ignores invalid reasons and hides the reason control for appeals and marketplace content', async () => {
    navigation.params = new URLSearchParams('reason=NOT_A_REASON');
    const { rerender } = render(<ContentWorkspace />); await screen.findByText('Kitchen faucet repair');
    expect(api.apiGetContentCases).toHaveBeenLastCalledWith(expect.objectContaining({ reportReason: undefined }));
    navigation.params = new URLSearchParams('kind=APPEAL&reason=SCAM'); rerender(<ContentWorkspace />);
    await waitFor(() => expect(api.apiGetContentCases).toHaveBeenLastCalledWith(expect.objectContaining({ caseType: 'APPEAL', reportReason: undefined })));
    expect(screen.queryByLabelText('Report reason')).not.toBeInTheDocument();
    navigation.params = new URLSearchParams('view=content&reason=SCAM'); rerender(<ContentWorkspace />);
    await waitFor(() => expect(api.apiGetMarketplaceContent).toHaveBeenCalled());
    expect(vi.mocked(api.apiGetMarketplaceContent).mock.calls.at(-1)![0]).not.toHaveProperty('reportReason');
    expect(screen.queryByLabelText('Report reason')).not.toBeInTheDocument();
  });
});
