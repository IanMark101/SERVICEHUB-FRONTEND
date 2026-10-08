import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { apiGetProviderSummary, apiGetSeekerSummary } from '../../api/ai.api';
import ReviewSummaryPanel from './ReviewSummaryPanel';
import { responseCache } from '../../lib/api/responseCache';

vi.mock('../../api/ai.api', () => ({
  getCachedProviderSummary: () => undefined, getCachedSeekerSummary: () => undefined,
  apiGetProviderSummary: vi.fn(), apiGetSeekerSummary: vi.fn(),
}));
const response = (summary: string, source: 'computed' | 'gemini' = 'computed') => ({ success: true, data: { summary, source } });

describe('booking review digest', () => {
  beforeEach(() => { vi.resetAllMocks(); });
  it('loads provider-wide feedback for direct booking and labels computed facts honestly', async () => {
    vi.mocked(apiGetProviderSummary).mockResolvedValue(response('Friendly (1 review).'));
    render(<ReviewSummaryPanel subjectId="provider-1" context="provider" serviceId="service-1" />);
    expect(await screen.findByText('Friendly (1 review).')).toBeInTheDocument();
    expect(apiGetProviderSummary).toHaveBeenCalledWith('provider-1', 'service-1', { force: true, waitForFresh: false });
    expect(apiGetSeekerSummary).not.toHaveBeenCalled();
    expect(screen.getByText(/Calculated from review ratings/)).toBeInTheDocument();
    expect(screen.queryByText(/AI-Generated/)).not.toBeInTheDocument();
  });
  it('loads reviews received as a client when a provider prepares an offer', async () => {
    vi.mocked(apiGetSeekerSummary).mockResolvedValue(response('Respectful (1 review).', 'gemini'));
    render(<ReviewSummaryPanel subjectId="seeker-1" context="seeker" isDark />);
    expect(await screen.findByText('Respectful (1 review).')).toBeInTheDocument();
    expect(apiGetSeekerSummary).toHaveBeenCalledWith('seeker-1', { force: true, waitForFresh: false });
    expect(apiGetProviderSummary).not.toHaveBeenCalled();
    expect(screen.getByText(/AI-assisted selection/)).toHaveTextContent('Feedback received as a service seeker from service providers.');
  });
  it('renders no history as an empty state rather than a broken AI feature', async () => {
    vi.mocked(apiGetSeekerSummary).mockResolvedValue({ success: true, data: { summary: null, source: 'empty', reason: 'No reviews as a service seeker from completed bookings yet.' } });
    render(<ReviewSummaryPanel subjectId="new-client" context="seeker" />);
    expect(await screen.findByText('No reviews as a service seeker from completed bookings yet.')).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
  it('offers retry without blocking or submitting the booking form', async () => {
    vi.mocked(apiGetSeekerSummary).mockRejectedValueOnce(new Error('Network error')).mockResolvedValueOnce(response('Recovered client feedback.'));
    const submit = vi.fn(e => e.preventDefault());
    render(<form onSubmit={submit}><ReviewSummaryPanel subjectId="client" context="seeker" /><button type="submit">Send Offer</button></form>);
    fireEvent.click(await screen.findByRole('button', { name: 'Retry review summary' }));
    expect(await screen.findByText('Recovered client feedback.')).toBeInTheDocument();
    expect(submit).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'Send Offer' })).toBeEnabled();
  });
  it('never displays another account’s summary while the selected client changes', async () => {
    let resolveLate!: (value: ReturnType<typeof response>) => void;
    vi.mocked(apiGetSeekerSummary).mockResolvedValueOnce(response('First client feedback.')).mockImplementationOnce(() => new Promise(resolve => { resolveLate = resolve; })).mockResolvedValueOnce(response('Third client feedback.'));
    const view = render(<ReviewSummaryPanel subjectId="first" context="seeker" />);
    await screen.findByText('First client feedback.');
    view.rerender(<ReviewSummaryPanel subjectId="second" context="seeker" />);
    expect(screen.queryByText('First client feedback.')).not.toBeInTheDocument();
    view.rerender(<ReviewSummaryPanel subjectId="third" context="seeker" />);
    await screen.findByText('Third client feedback.');
    await act(async () => resolveLate(response('Late second client feedback.')));
    expect(screen.queryByText('Late second client feedback.')).not.toBeInTheDocument();
  });
  it('replaces fast calculated facts with validated AI feedback once ready', async () => {
    vi.mocked(apiGetSeekerSummary).mockResolvedValueOnce({ success: true, data: { summary: 'Calculated facts.', source: 'computed', refreshing: true } }).mockResolvedValueOnce(response('Calculated facts. Selected written feedback.', 'gemini'));
    render(<ReviewSummaryPanel subjectId="client" context="seeker" />);
    await screen.findByText('Calculated facts.');
    await waitFor(() => expect(apiGetSeekerSummary).toHaveBeenCalledWith('client', { force: true, waitForFresh: true }), { timeout: 3000 });
    expect(await screen.findByText('Calculated facts. Selected written feedback.')).toBeInTheDocument();
  });

  it('refreshes an open digest when reviews are invalidated and withdraws old facts', async () => {
    let resolveRefresh!: (value: ReturnType<typeof response>) => void;
    vi.mocked(apiGetProviderSummary).mockResolvedValueOnce(response('Old 5-star feedback.'))
      .mockImplementationOnce(() => new Promise(resolve => { resolveRefresh = resolve; }));
    render(<ReviewSummaryPanel subjectId="provider" context="provider" />);
    await screen.findByText('Old 5-star feedback.');
    act(() => responseCache.invalidate(['summaries'], 'socket'));
    await screen.findByText('Loading completed-booking reviews…');
    expect(screen.queryByText('Old 5-star feedback.')).not.toBeInTheDocument();
    await act(async () => resolveRefresh(response('Updated 3-star feedback.')));
    expect(await screen.findByText('Updated 3-star feedback.')).toBeInTheDocument();
    expect(apiGetProviderSummary).toHaveBeenLastCalledWith('provider', undefined, { force: true, waitForFresh: false });
  });

  it('does not put invalidated facts back when their older request finishes late', async () => {
    let resolveOld!: (value: ReturnType<typeof response>) => void;
    vi.mocked(apiGetSeekerSummary).mockImplementationOnce(() => new Promise(resolve => { resolveOld = resolve; }))
      .mockResolvedValueOnce(response('Current client feedback.'));
    render(<ReviewSummaryPanel subjectId="client" context="seeker" />);
    act(() => responseCache.invalidate(['summaries'], 'mutation'));
    await screen.findByText('Current client feedback.');
    await act(async () => resolveOld(response('Outdated client feedback.')));
    expect(screen.queryByText('Outdated client feedback.')).not.toBeInTheDocument();
    expect(screen.getByText('Current client feedback.')).toBeInTheDocument();
  });

  it('shows retry instead of old facts if a review refresh fails', async () => {
    vi.mocked(apiGetProviderSummary).mockResolvedValueOnce(response('Old provider feedback.'))
      .mockRejectedValueOnce(new Error('Network error')).mockResolvedValueOnce(response('Current provider feedback.'));
    render(<ReviewSummaryPanel subjectId="provider" context="provider" />);
    await screen.findByText('Old provider feedback.');
    act(() => responseCache.invalidate(['summaries'], 'focus'));
    fireEvent.click(await screen.findByRole('button', { name: 'Retry review summary' }));
    expect(screen.queryByText('Old provider feedback.')).not.toBeInTheDocument();
    expect(await screen.findByText('Current provider feedback.')).toBeInTheDocument();
  });
});
