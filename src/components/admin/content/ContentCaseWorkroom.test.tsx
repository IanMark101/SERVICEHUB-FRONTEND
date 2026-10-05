import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { apiDecideContentCase } from '@/api/contentWorkspace.api';
import ContentCaseWorkroom from './ContentCaseWorkroom';
import { fixtureCase } from './fixtures.test-support';
vi.mock('@/api/contentWorkspace.api', () => ({ apiDecideContentCase: vi.fn() }));
const notes = 'The advertised price excluded promised parts. Remove the misleading content and explain the rules.';
function chooseRemoval() {
  fireEvent.click(screen.getByRole('radio', { name: /Remove content/ }));
  fireEvent.change(screen.getByLabelText(/Decision explanation/), { target: { value: notes } });
}
describe('Content case decision safety', () => {
  beforeEach(() => vi.clearAllMocks());
  it('requires impact review and acknowledgement, targets the owner, and blocks repeated submissions', async () => {
    const onSaved = vi.fn(); let resolve!: () => void;
    vi.mocked(apiDecideContentCase).mockImplementation(() => new Promise<void>(r => { resolve = r; }));
    render(<ContentCaseWorkroom item={fixtureCase} onBack={vi.fn()} onReload={vi.fn()} onSaved={onSaved} />);
    expect(screen.getByRole('button', { name: 'Review decision' })).toBeDisabled();
    chooseRemoval();
    fireEvent.change(screen.getByLabelText(/Account consequence for Maria Santos/), { target: { value: 'warn' } });
    fireEvent.click(screen.getByRole('button', { name: 'Review decision' }));
    expect(apiDecideContentCase).not.toHaveBeenCalled();
    const confirm = screen.getByRole('button', { name: 'Confirm decision' }); expect(confirm).toBeDisabled();
    fireEvent.click(screen.getByRole('checkbox', { name: /I reviewed the content/ }));
    fireEvent.click(confirm); fireEvent.click(confirm);
    expect(apiDecideContentCase).toHaveBeenCalledTimes(1);
    expect(apiDecideContentCase).toHaveBeenCalledWith('case-1', expect.objectContaining({ decision: 'REMOVE', penalty: 'warn', resolution: notes, expectedUpdatedAt: fixtureCase.content!.updatedAt, expectedOwnerStatus: 'ACTIVE' }));
    expect(onSaved).not.toHaveBeenCalled(); resolve(); await waitFor(() => expect(onSaved).toHaveBeenCalledTimes(1));
  });
  it('keeps a failed case open with the explanation intact', async () => {
    const onSaved = vi.fn(); vi.mocked(apiDecideContentCase).mockRejectedValue(new Error('Content changed. Reload this case.'));
    render(<ContentCaseWorkroom item={fixtureCase} onBack={vi.fn()} onReload={vi.fn()} onSaved={onSaved} />);
    chooseRemoval(); fireEvent.click(screen.getByRole('button', { name: 'Review decision' }));
    fireEvent.click(screen.getByRole('checkbox', { name: /I reviewed the content/ })); fireEvent.click(screen.getByRole('button', { name: 'Confirm decision' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Content changed');
    expect(screen.getByLabelText(/Decision explanation/)).toHaveValue(notes); expect(onSaved).not.toHaveBeenCalled();
  });
  it('does not offer owner penalties for dismissals or appeals and explains suspension blockers', () => {
    const { rerender } = render(<ContentCaseWorkroom item={{ ...fixtureCase, obligations: { ...fixtureCase.obligations, unstartedProviderBookings: 2 } }} onBack={vi.fn()} onReload={vi.fn()} onSaved={vi.fn()} />);
    fireEvent.click(screen.getByRole('radio', { name: /Dismiss report/ }));
    expect(screen.queryByLabelText(/Account consequence/)).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('radio', { name: /Remove content/ }));
    expect(screen.getByRole('option', { name: 'Temporarily suspend account' })).toBeDisabled();
    expect(screen.getByText(/Temporary suspension is unavailable/)).toBeInTheDocument();
    rerender(<ContentCaseWorkroom key="appeal" item={{ ...fixtureCase, caseType: 'APPEAL', allowedDecisions: ['KEEP_REMOVED', 'RESTORE', 'GUIDANCE'] }} onBack={vi.fn()} onReload={vi.fn()} onSaved={vi.fn()} />);
    fireEvent.click(screen.getByRole('radio', { name: /Restore content/ }));
    expect(screen.queryByLabelText(/Account consequence/)).not.toBeInTheDocument();
  });
});
