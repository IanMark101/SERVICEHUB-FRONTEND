import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { apiChangeMarketplaceItem } from '@/api/contentWorkspace.api';
import ContentInspector from './ContentInspector';
import { fixtureContent } from './fixtures.test-support';
vi.mock('@/api/contentWorkspace.api', () => ({ apiChangeMarketplaceItem: vi.fn() }));
describe('Routine content inspection', () => {
  beforeEach(() => vi.clearAllMocks());
  it('does not show actions for a request with a booking obligation', () => {
    render(<ContentInspector item={{ ...fixtureContent, contentType: 'SERVICE_REQUEST', canRemove: false, canRestore: false, actionBlock: 'Handle the linked booking or payment in Disputes & Reports first.' }} onBack={vi.fn()} onReload={vi.fn()} onSaved={vi.fn()} />);
    expect(screen.getByText(/Handle the linked booking/)).toBeInTheDocument();
    expect(screen.queryByRole('radio')).not.toBeInTheDocument();
    expect(apiChangeMarketplaceItem).not.toHaveBeenCalled();
  });
  it('requires a reason and confirmation before restoring an eligible removed request', async () => {
    const onSaved = vi.fn(); const item = { ...fixtureContent, contentType: 'SERVICE_REQUEST' as const, canRemove: false, canRestore: true };
    vi.mocked(apiChangeMarketplaceItem).mockResolvedValue({ data: item });
    render(<ContentInspector item={item} onBack={vi.fn()} onReload={vi.fn()} onSaved={onSaved} />);
    fireEvent.click(screen.getByRole('radio', { name: /Restore after review/ }));
    expect(screen.getByRole('button', { name: 'Review action' })).toBeDisabled();
    fireEvent.change(screen.getByLabelText(/^Reason/), { target: { value: 'Reviewed this removal and confirmed restoration is appropriate.' } });
    fireEvent.click(screen.getByRole('button', { name: 'Review action' }));
    expect(screen.getByRole('heading', { name: 'Restore this content?' })).toHaveFocus();
    expect(screen.getByRole('button', { name: 'Restore content' })).toBeDisabled();
    fireEvent.click(screen.getByRole('checkbox', { name: 'I reviewed the impact.' }));
    fireEvent.click(screen.getByRole('button', { name: 'Restore content' }));
    await waitFor(() => expect(onSaved).toHaveBeenCalledTimes(1));
    expect(apiChangeMarketplaceItem).toHaveBeenCalledWith(item, 'RESTORE', 'Reviewed this removal and confirmed restoration is appropriate.');
    expect(screen.queryByLabelText(/Account consequence/)).not.toBeInTheDocument();
  });
  it('keeps the inspection reason while checking owner and publication status', () => {
    render(<ContentInspector item={fixtureContent} onBack={vi.fn()} onReload={vi.fn()} onSaved={vi.fn()} />);
    fireEvent.click(screen.getByRole('radio', { name: /Remove from marketplace/ }));
    fireEvent.change(screen.getByLabelText(/^Reason/), { target: { value: 'The publication rules require removing this listing.' } });
    fireEvent.click(screen.getByRole('button', { name: 'Owner account' }));
    expect(screen.getByText(fixtureContent.owner.email)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Publication status' }));
    expect(screen.getByText('Marketplace visibility')).toBeInTheDocument();
    expect(screen.getByLabelText(/^Reason/)).toHaveValue('The publication rules require removing this listing.');
    expect(apiChangeMarketplaceItem).not.toHaveBeenCalled();
  });
});
