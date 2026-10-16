import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import ContentCaseAction from './ContentCaseAction';
import { apiSubmitContentCase } from '../../api/contentCases.api';

vi.mock('../../api/contentCases.api', () => ({ apiSubmitContentCase: vi.fn() }));
vi.mock('../ui/Toast', () => ({ useToast: () => ({ success: vi.fn(), error: vi.fn() }) }));

describe('Public content report dialog', () => {
  it('requires both a report reason and an explanation before submitting', () => {
    render(<ContentCaseAction caseType="REPORT" contentType="SERVICE_LISTING" resourceId="listing-1" />);
    fireEvent.click(screen.getByRole('button', { name: 'Report content' }));
    expect(screen.getByRole('textbox')).toHaveFocus();
    expect(screen.getByRole('button', { name: 'Send report' })).toBeDisabled();
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Too short' } });
    expect(screen.getByRole('button', { name: 'Send report' })).toBeDisabled();
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'The stated price does not match the description.' } });
    expect(screen.getByRole('button', { name: 'Send report' })).toBeDisabled();
    fireEvent.change(screen.getByLabelText('Report reason'), { target: { value: 'MISLEADING' } });
    expect(screen.getByRole('button', { name: 'Send report' })).toBeEnabled();
  });

  it('keeps a pending report open and prevents duplicate submissions', async () => {
    let finish!: (value: Awaited<ReturnType<typeof apiSubmitContentCase>>) => void;
    vi.mocked(apiSubmitContentCase).mockImplementationOnce(() => new Promise(resolve => { finish = resolve; }));
    render(<ContentCaseAction caseType="REPORT" contentType="SERVICE_REQUEST" resourceId="request-1" />);
    fireEvent.click(screen.getByRole('button', { name: 'Report content' }));
    fireEvent.change(screen.getByLabelText('Report reason'), { target: { value: 'SCAM' } });
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Please review this request description.' } });
    fireEvent.click(screen.getByRole('button', { name: 'Send report' }));
    expect(screen.getByRole('button', { name: 'Sending…' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled();
    expect(screen.getByRole('textbox')).toBeDisabled();
    expect(screen.getByLabelText('Report reason')).toBeDisabled();
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    fireEvent.submit(screen.getByRole('dialog'));
    expect(apiSubmitContentCase).toHaveBeenCalledOnce();
    expect(apiSubmitContentCase).toHaveBeenCalledWith(expect.objectContaining({ reportReason: 'SCAM' }));
    await act(async () => { finish({ success: true } as Awaited<ReturnType<typeof apiSubmitContentCase>>); });
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

  it('preserves the selected reason and explanation after a failed submission', async () => {
    vi.mocked(apiSubmitContentCase).mockRejectedValueOnce(new Error('Offline'));
    render(<ContentCaseAction caseType="REPORT" contentType="SERVICE_LISTING" resourceId="listing-2" />);
    fireEvent.click(screen.getByRole('button', { name: 'Report content' }));
    fireEvent.change(screen.getByLabelText('Report reason'), { target: { value: 'SPAM' } });
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'This listing has been duplicated several times.' } });
    fireEvent.click(screen.getByRole('button', { name: 'Send report' }));
    await waitFor(() => expect(screen.getByRole('button', { name: 'Send report' })).toBeEnabled());
    expect(screen.getByLabelText('Report reason')).toHaveValue('SPAM');
    expect(screen.getByRole('textbox')).toHaveValue('This listing has been duplicated several times.');
  });

  it('keeps an owner appeal separate from report reasons', () => {
    render(<ContentCaseAction caseType="APPEAL" contentType="SERVICE_LISTING" resourceId="listing-3" />);
    fireEvent.click(screen.getByRole('button', { name: 'Appeal decision' }));
    expect(screen.queryByLabelText('Report reason')).not.toBeInTheDocument();
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Please review why my listing was removed.' } });
    expect(screen.getByRole('button', { name: 'Send appeal' })).toBeEnabled();
  });
});
