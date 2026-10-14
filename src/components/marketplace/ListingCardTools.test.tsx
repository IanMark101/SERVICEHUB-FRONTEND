import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import ListingCardTools from './ListingCardTools';
import { apiSubmitContentCase } from '../../api/contentCases.api';

vi.mock('../../api/contentCases.api', () => ({ apiSubmitContentCase: vi.fn() }));
vi.mock('../ui/Toast', () => ({ useToast: () => ({ success: vi.fn(), error: vi.fn() }) }));

describe('Save and Report listing controls', () => {
  beforeEach(() => { vi.clearAllMocks(); vi.mocked(apiSubmitContentCase).mockResolvedValue({ success: true }); });
  it('hides both actions on own listings', () => {
    render(<ListingCardTools contentType="SERVICE_LISTING" listingId="one" isOwned isDark={false} saved={false} onToggleSaved={vi.fn()} />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
  it('shows an accessible saved state and calls the unsave handler', () => {
    const toggle = vi.fn();
    render(<ListingCardTools contentType="SERVICE_REQUEST" listingId="one" isOwned={false} isDark saved onToggleSaved={toggle} />);
    const button = screen.getByRole('button', { name: 'Remove from Saved' });
    expect(button).toHaveAttribute('aria-pressed', 'true'); fireEvent.click(button); expect(toggle).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('button', { name: 'Report listing' })).toHaveAttribute('title', 'Report listing');
  });
  it.each(['SERVICE_LISTING', 'SERVICE_REQUEST'] as const)('submits a %s report to the existing flow once', async contentType => {
    render(<ListingCardTools contentType={contentType} listingId="one" isOwned={false} isDark={false} />);
    fireEvent.click(screen.getByRole('button', { name: 'Report listing' }));
    fireEvent.change(screen.getByLabelText('Your explanation'), { target: { value: 'This listing misrepresents the service.' } });
    const form = screen.getByRole('dialog'); fireEvent.submit(form); fireEvent.submit(form);
    await waitFor(() => expect(apiSubmitContentCase).toHaveBeenCalledTimes(1));
    expect(apiSubmitContentCase).toHaveBeenCalledWith({ caseType: 'REPORT', contentType, resourceId: 'one', reason: 'This listing misrepresents the service.' });
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(screen.getByRole('button', { name: 'Report sent' })).toBeDisabled();
  });
});
