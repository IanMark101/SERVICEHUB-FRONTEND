import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import useSavedListings from './useSavedListings';
import { apiGetSavedStatus, apiSetListingSaved } from '../api/savedListings.api';

vi.mock('../api/savedListings.api', () => ({ apiGetSavedStatus: vi.fn(), apiSetListingSaved: vi.fn() }));
const feedback=vi.hoisted(() => ({ success:vi.fn(), error:vi.fn() }));
vi.mock('../components/ui/Toast', () => ({ useToast: () => feedback }));
vi.mock('./useApiCacheRefresh', () => ({ useApiCacheRefresh: vi.fn() }));

describe('Saved card state', () => {
  beforeEach(() => { vi.clearAllMocks(); vi.mocked(apiGetSavedStatus).mockResolvedValue([]); vi.mocked(apiSetListingSaved).mockResolvedValue(undefined); });
  it.each([['SERVICE_LISTING','seeker'], ['SERVICE_REQUEST','provider']] as const)('uses the %s saving workspace for save and unsave feedback', async (type,tone) => {
    const {result}=renderHook(() => useSavedListings(type, 'member', ['one']));
    await waitFor(() => expect(result.current.isSaved('one')).toBe(false));
    await act(async () => { await result.current.toggle('one'); });
    expect(feedback.success).toHaveBeenLastCalledWith('Listing saved','You can find it in Saved.',tone);
    await act(async () => { await result.current.toggle('one'); });
    expect(feedback.success).toHaveBeenLastCalledWith('Listing removed','Removed from your saved listings.',tone);
  });
  it('loads saved status in one batch and saves/unsaves using the correct listing type', async () => {
    vi.mocked(apiGetSavedStatus).mockResolvedValue(['two']);
    const { result } = renderHook(() => useSavedListings('SERVICE_REQUEST', 'ian', ['one', 'two', 'one']));
    await waitFor(() => expect(result.current.isSaved('two')).toBe(true));
    expect(apiGetSavedStatus).toHaveBeenCalledTimes(1); expect(apiGetSavedStatus).toHaveBeenCalledWith('SERVICE_REQUEST', ['one', 'two']);
    await act(async () => { await result.current.toggle('one'); });
    expect(apiSetListingSaved).toHaveBeenLastCalledWith('SERVICE_REQUEST', 'one', true); expect(result.current.isSaved('one')).toBe(true);
    await act(async () => { await result.current.toggle('one'); });
    expect(apiSetListingSaved).toHaveBeenLastCalledWith('SERVICE_REQUEST', 'one', false); expect(result.current.isSaved('one')).toBe(false);
  });
  it('rejects repeated clicks while pending and retains state when a save fails', async () => {
    let reject!: (error: Error) => void;
    vi.mocked(apiSetListingSaved).mockImplementation(() => new Promise((_resolve, fail) => { reject = fail; }));
    const { result } = renderHook(() => useSavedListings('SERVICE_LISTING', 'john', ['one']));
    await waitFor(() => expect(result.current.isSaved('one')).toBe(false));
    let first!: Promise<boolean>;
    act(() => { first = result.current.toggle('one'); void result.current.toggle('one'); });
    expect(apiSetListingSaved).toHaveBeenCalledTimes(1); expect(result.current.isBusy('one')).toBe(true);
    await act(async () => { reject(new Error('Unavailable')); await first; });
    expect(result.current.isSaved('one')).toBe(false); expect(result.current.isBusy('one')).toBe(false);
  });
  it('does not expose another account’s saves and ignores its late response', async () => {
    let resolve!: (ids: string[]) => void;
    vi.mocked(apiGetSavedStatus).mockImplementationOnce(() => new Promise(done => { resolve = done; })).mockResolvedValueOnce([]);
    const { result, rerender } = renderHook(({ user }) => useSavedListings('SERVICE_LISTING', user, ['one']), { initialProps: { user: 'john' } });
    rerender({ user: 'ian' });
    await waitFor(() => expect(result.current.isSaved('one')).toBe(false));
    await act(async () => { resolve(['one']); });
    expect(result.current.isSaved('one')).toBe(false);
  });
  it('does not carry a pending save spinner or result into another account', async () => {
    let resolve!: () => void;
    vi.mocked(apiSetListingSaved).mockImplementationOnce(() => new Promise(done => { resolve = done; }));
    const { result, rerender } = renderHook(({ user }) => useSavedListings('SERVICE_LISTING', user, ['one']), { initialProps: { user: 'john' } });
    await waitFor(() => expect(result.current.isSaved('one')).toBe(false));
    let saving!: Promise<boolean>;
    act(() => { saving = result.current.toggle('one'); });
    expect(result.current.isBusy('one')).toBe(true);
    rerender({ user: 'ian' });
    await waitFor(() => expect(result.current.isSaved('one')).toBe(false));
    expect(result.current.isBusy('one')).toBe(false);
    await act(async () => { resolve(); await saving; });
    expect(result.current.isBusy('one')).toBe(false);
    expect(result.current.isSaved('one')).toBe(false);
  });
});
