import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import ContentCaseAction from './ContentCaseAction';
import { apiSubmitContentCase } from '../../api/contentCases.api';

vi.mock('../../api/contentCases.api', () => ({ apiSubmitContentCase: vi.fn() }));
vi.mock('../ui/Toast', () => ({ useToast: () => ({ success: vi.fn(), error: vi.fn() }) }));

describe('Public content report dialog', () => {
  it('requires an explanation before submitting a listing report', () => {
    render(<ContentCaseAction caseType="REPORT" contentType="SERVICE_LISTING" resourceId="listing-1" />);
    fireEvent.click(screen.getByRole('button', { name: 'Report content' }));
    expect(screen.getByRole('textbox')).toHaveFocus();
    expect(screen.getByRole('button', { name: 'Send report' })).toBeDisabled();
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Too short' } });
    expect(screen.getByRole('button', { name: 'Send report' })).toBeDisabled();
  });

  it('keeps a pending report open and prevents duplicate submissions', async () => {
    let finish!: (value: Awaited<ReturnType<typeof apiSubmitContentCase>>) => void;
    vi.mocked(apiSubmitContentCase).mockImplementationOnce(() => new Promise(resolve => { finish = resolve; }));
    render(<ContentCaseAction caseType="REPORT" contentType="SERVICE_REQUEST" resourceId="request-1" />);
    fireEvent.click(screen.getByRole('button', { name: 'Report content' }));
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Please review this request description.' } });
    fireEvent.click(screen.getByRole('button', { name: 'Send report' }));
    expect(screen.getByRole('button', { name: 'Sending…' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled();
    expect(screen.getByRole('textbox')).toBeDisabled();
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    fireEvent.submit(screen.getByRole('dialog'));
    expect(apiSubmitContentCase).toHaveBeenCalledOnce();
    await act(async () => { finish({ success: true } as Awaited<ReturnType<typeof apiSubmitContentCase>>); });
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });
});
