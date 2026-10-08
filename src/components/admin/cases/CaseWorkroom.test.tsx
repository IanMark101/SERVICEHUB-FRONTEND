import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import CaseWorkroom from './CaseWorkroom';
import { safetyCase, closedCase, escalationCase } from '@/test/fixtures/moderation-cases';
import { apiGetAdminBookingMessages } from '@/api/admin.api';
vi.mock('@/api/admin.api', () => ({ apiGetAdminBookingMessages: vi.fn(), apiAccessReportEvidence: vi.fn() }));
const resolve = vi.fn().mockResolvedValue(undefined);
function mount(item = safetyCase) { return render(<CaseWorkroom item={item} onBack={vi.fn()} onResolve={resolve} submitting={false} error="" />); }
describe('Admin case decisions', () => {
  beforeEach(() => { vi.clearAllMocks(); });
  it('requires an explicit outcome, explanation and consequence acknowledgement', async () => {
    mount();
    expect(screen.getByRole('button', { name: 'Review decision' })).toBeDisabled();
    fireEvent.click(screen.getByRole('radio', { name: /Record a supported safety finding/ }));
    fireEvent.change(screen.getByLabelText(/Decision explanation/), { target: { value: 'The conversation establishes inappropriate behavior.' } });
    fireEvent.click(screen.getByRole('button', { name: 'Review decision' }));
    expect(resolve).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'Confirm decision' })).toBeDisabled();
    fireEvent.click(screen.getByRole('checkbox', { name: /I reviewed/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Confirm decision' }));
    await waitFor(() => expect(resolve).toHaveBeenCalledWith('resolve_safety','none','The conversation establishes inappropriate behavior.'));
  });
  it('clears the penalty when dismissing and hides impossible completion settlement', () => {
    mount();
    expect(screen.queryByRole('radio', { name: /Complete in provider/ })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('radio', { name: /Record a supported safety finding/ }));
    fireEvent.change(screen.getByLabelText(/Account consequence/), { target: { value: 'ban' } });
    fireEvent.click(screen.getByRole('radio', { name: /Dismiss report/ }));
    expect(screen.queryByLabelText(/Account consequence/)).not.toBeInTheDocument();
    fireEvent.change(screen.getByLabelText(/Decision explanation/), { target: { value: 'Insufficient evidence to uphold the report.' } });
    fireEvent.click(screen.getByRole('button', { name: 'Review decision' }));
    expect(screen.getByText(/No account penalty. Both/)).toBeInTheDocument();
  });
  it('requires a cancellation fault finding and submits only the explicitly selected participant', async () => {
    mount({ ...safetyCase, type: 'CANCELLATION_ESCALATION', allowedOutcomes: ['approve_cancellation', 'deny_cancellation'],
      booking: { ...safetyCase.booking, started: true } });
    fireEvent.click(screen.getByRole('radio', { name: /Approve cancellation/ }));
    fireEvent.change(screen.getByLabelText(/Decision explanation/), { target: { value: 'The provider abandoned started work.' } });
    expect(screen.getByRole('button', { name: 'Review decision' })).toBeDisabled();
    fireEvent.change(screen.getByLabelText(/Who was at fault/), { target: { value: 'provider' } });
    fireEvent.click(screen.getByRole('button', { name: 'Review decision' }));
    expect(screen.getByText(/Only this participant’s trust score will decrease/)).toHaveTextContent(safetyCase.booking.provider.name);
    fireEvent.click(screen.getByRole('checkbox', { name: /I reviewed/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Confirm decision' }));
    await waitFor(() => expect(resolve).toHaveBeenCalledWith('approve_cancellation', 'none', 'The provider abandoned started work.', 'provider'));
  });
  it('restores the exact reserved fault finding for retries', () => {
    mount({ ...safetyCase, type: 'CANCELLATION_ESCALATION', allowedOutcomes: ['approve_cancellation'],
      resolutionOperation: { status: 'FAILED_RETRYABLE', stage: 'FINANCIAL_EFFECT_ESTABLISHED', requestedOutcome: 'ADMIN_APPROVE', requestedPenalty: 'cancellation_fault_seeker', notes: 'The seeker abandoned the agreed started work.' } });
    expect(screen.getByLabelText(/Who was at fault/)).toHaveValue('seeker');
    expect(screen.getByLabelText(/Who was at fault/)).toBeDisabled();
  });
  it('blocks financial decisions when another active case exists', () => {
    mount({ ...safetyCase, otherBlockingCases: 1 });
    fireEvent.click(screen.getByRole('radio', { name: /Cancel booking/ }));
    fireEvent.change(screen.getByLabelText(/Decision explanation/), { target: { value: 'Review this incident.' } });
    expect(screen.getByRole('button', { name: 'Review decision' })).toBeDisabled();
    expect(screen.getByText(/Resolve the other active cases before/)).toBeInTheDocument();
  });
  it('closed cases show the rationale without mutation controls', () => {
    mount(closedCase);
    expect(screen.getByRole('heading', { name: 'Recorded decision' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Recorded decision' }));
    expect(screen.getByRole('heading', { name: 'Recorded decision' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'What was reported' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Review decision' })).not.toBeInTheDocument();
    expect(screen.getByText(closedCase.decisionExplanation!)).toBeInTheDocument();
  });
  it('loads only this booking’s messages on demand and supports retry', async () => {
    vi.mocked(apiGetAdminBookingMessages).mockRejectedValueOnce(new Error('offline')).mockResolvedValueOnce({ data: { messages: [] } });
    mount();
    expect(apiGetAdminBookingMessages).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Messages (2)' }));
    await screen.findByRole('button', { name: 'Retry messages' });
    fireEvent.click(screen.getByRole('button', { name: 'Retry messages' }));
    await screen.findByText('No messages have been sent in this booking.');
    expect(apiGetAdminBookingMessages).toHaveBeenCalledWith(safetyCase.booking.id);
  });
  it('completion escalations expose the cooldown path without account penalties', () => {
    mount(escalationCase);
    fireEvent.click(screen.getByRole('radio', { name: /Keep awaiting confirmation/ }));
    expect(screen.queryByLabelText(/Account consequence/)).not.toBeInTheDocument();
    expect(screen.getByText(/72-hour cooldown/)).toBeInTheDocument();
  });
  it('shows the provider’s escalation explanation without presenting it as a reported violation', () => {
    mount(escalationCase);
    expect(screen.getByRole('heading', { name: 'Why Admin help is needed' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Completion escalation' })).toBeInTheDocument();
    expect(screen.getByText(escalationCase.explanation)).toBeInTheDocument();
    expect(screen.queryByText(/Reported issue:/)).not.toBeInTheDocument();
  });
  it('focuses the impact summary and blocks an explanation longer than the API limit', () => {
    mount();
    fireEvent.click(screen.getByRole('radio', { name: /supported safety finding|Uphold safety report/ }));
    const explanation = screen.getByLabelText(/Decision explanation/);
    fireEvent.change(explanation, { target: { value: 'a'.repeat(2001) } });
    expect(screen.getByRole('button', { name: 'Review decision' })).toBeDisabled();
    fireEvent.change(explanation, { target: { value: 'The conversation supports this safety finding.' } });
    fireEvent.click(screen.getByRole('button', { name: 'Review decision' }));
    expect(screen.getByRole('heading', { name: 'Confirm the impact' })).toHaveFocus();
  });
  it('separates booking facts from the complaint and preserves the draft across sections', () => {
    mount();
    expect(screen.queryByText('Current payment state')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('radio', { name: /Record a supported safety finding/ }));
    fireEvent.change(screen.getByLabelText(/Decision explanation/), { target: { value: 'The evidence supports a warning.' } });
    fireEvent.click(screen.getByRole('button', { name: 'Booking & people' }));
    expect(screen.getByText('Current payment state')).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /Record a supported safety finding/ })).toBeChecked();
    expect(screen.getByLabelText(/Decision explanation/)).toHaveValue('The evidence supports a warning.');
    expect(resolve).not.toHaveBeenCalled();
  });
});
