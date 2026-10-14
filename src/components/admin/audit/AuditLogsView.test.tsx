import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import AuditLogsView from './AuditLogsView';
import { apiListAdminAuditLogs } from '../../../api/admin.api';
import type { AuditHistoryResponse, SecurityRecord } from './types';
vi.mock('../../../api/admin.api', () => ({ apiListAdminAuditLogs: vi.fn() }));
vi.mock('../../../hooks/useApiCacheRefresh', () => ({ useApiCacheRefresh: vi.fn() }));
const row: SecurityRecord = { id: 'security-1', userId: 'user-1', action: 'SIGN_IN_SUCCESS', reason: 'Authentication succeeded', method: 'PASSWORD', createdAt: '2026-10-13T02:10:00.000Z', ipAddress: '203.0.113.1', locationStatus: 'APPROXIMATE', city: 'Cebu', region: 'CEB', country: 'PH', browser: 'Chrome', device: 'Windows', userAgent: 'Chrome/130 Windows', sessionReference: 'a'.repeat(64), requestId: 'request-1', user: { id: 'user-1', name: 'Sample User', email: 'sample@example.test' } };
const response = (items: SecurityRecord[] = [row]): AuditHistoryResponse => ({ success: true, kind: 'security', data: items, retentionDays: 90, pagination: { page: 1, limit: 20, total: 41, totalPages: 3 } });
beforeEach(() => { vi.clearAllMocks(); vi.mocked(apiListAdminAuditLogs).mockImplementation(async params => params?.kind === 'security' ? response() : { ...response([]), kind: 'admin', pagination: { page: 1, limit: 20, total: 0, totalPages: 0 } }); });
async function openHistory() { render(<AuditLogsView isDark={false}/>); await screen.findByText('No administrator actions found.'); fireEvent.click(screen.getByRole('button', { name: 'Sign-in history' })); await screen.findByText('Sample User'); }
describe('admin sign-in history', () => {
  it('shows identity, sign-in time, coarse location, IP and device with honest location labels', async () => {
    await openHistory(); expect(screen.getByText('Cebu, CEB, PH')).toBeInTheDocument(); expect(screen.getByText('IP: 203.0.113.1')).toBeInTheDocument(); expect(screen.getByText('Approximate IP location')).toBeInTheDocument(); expect(screen.getByText('Chrome')).toBeInTheDocument(); expect(screen.getByText(/retained for 90 days/)).toBeInTheDocument();
    expect(document.querySelector('time')).toHaveAttribute('dateTime', row.createdAt); expect(screen.getByText(row.sessionReference!)).not.toBeVisible();
    fireEvent.click(screen.getByText('Event details')); expect(screen.getByText(row.sessionReference!)).toBeVisible();
  });
  it('applies server-side filters and resets pagination to page one', async () => {
    await openHistory(); fireEvent.click(screen.getByRole('button', { name: 'Next page' })); await waitFor(() => expect(apiListAdminAuditLogs).toHaveBeenLastCalledWith(expect.objectContaining({ page: 2 })));
    fireEvent.change(screen.getByPlaceholderText('Search sign-in history'), { target: { value: 'Sample' } }); fireEvent.change(screen.getByLabelText('Event'), { target: { value: 'SIGN_IN_FAILED' } }); fireEvent.click(screen.getByRole('button', { name: 'Apply filters' }));
    await waitFor(() => expect(apiListAdminAuditLogs).toHaveBeenLastCalledWith(expect.objectContaining({ page: 1, search: 'Sample', action: 'SIGN_IN_FAILED', kind: 'security' })));
  });
  it('rejects inverted dates without making another history request', async () => {
    await openHistory(); const count = vi.mocked(apiListAdminAuditLogs).mock.calls.length;
    fireEvent.change(screen.getByLabelText('From (UTC)'), { target: { value: '2026-10-13' } }); fireEvent.change(screen.getByLabelText('To (UTC)'), { target: { value: '2026-10-12' } }); fireEvent.click(screen.getByRole('button', { name: 'Apply filters' }));
    expect(screen.getByRole('alert')).toHaveTextContent('Start date must be on or before end date.'); expect(apiListAdminAuditLogs).toHaveBeenCalledTimes(count);
  });
  it('labels local connections and unidentified failed attempts without inventing a location', async () => {
    vi.mocked(apiListAdminAuditLogs).mockResolvedValue(response([{ ...row, action: 'SIGN_IN_FAILED', user: null, userId: null, locationStatus: 'LOCAL_NETWORK', city: null, region: null, country: null, ipAddress: '127.0.0.1' }]));
    render(<AuditLogsView isDark/>); await screen.findByText('Sign-in failed'); expect(screen.getByText('Local / private network')).toBeInTheDocument(); expect(screen.getByText('Unidentified account')).toBeInTheDocument(); expect(screen.queryByText('Cebu, CEB, PH')).not.toBeInTheDocument();
  });
  it('shows errors with a retry and hides stale private records after a failed refresh', async () => {
    await openHistory(); vi.mocked(apiListAdminAuditLogs).mockRejectedValueOnce(new Error('History unavailable'));
    fireEvent.click(screen.getByRole('button', { name: 'Refresh' })); await screen.findByRole('alert'); expect(screen.queryByText('Sample User')).not.toBeInTheDocument(); expect(screen.getByText('Refresh to try loading these records again.')).toBeInTheDocument();
  });
  it('ignores a stale security response after switching back to administrator actions', async () => {
    let finish!: (value: AuditHistoryResponse) => void;
    vi.mocked(apiListAdminAuditLogs).mockImplementation(async params => params?.kind === 'security' ? new Promise(resolve => { finish = resolve; }) : { ...response([]), kind: 'admin' });
    render(<AuditLogsView isDark={false}/>); await screen.findByText('No administrator actions found.'); fireEvent.click(screen.getByRole('button', { name: 'Sign-in history' })); await waitFor(() => expect(finish).toBeTypeOf('function'));
    fireEvent.click(screen.getByRole('button', { name: 'Administrator actions' })); await screen.findByText('No administrator actions found.'); await act(async () => { finish(response()); }); expect(screen.queryByText('Sample User')).not.toBeInTheDocument();
  });
});
