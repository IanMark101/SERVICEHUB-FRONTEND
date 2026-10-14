import { beforeEach, expect, it, vi } from 'vitest';
import { api } from '../lib/api/axios';
import { apiGetGCashNumber, apiSaveGCashNumber } from './gcashNumber.api';
vi.mock('../lib/api/axios', () => ({ api: { get: vi.fn(), put: vi.fn() } }));
beforeEach(() => vi.clearAllMocks());

it('reads and saves only the current account private GCash preference', async () => {
  const response = { data: { success: true, data: { gcashNumber: '09123456789' } } };
  vi.mocked(api.get).mockResolvedValue(response); vi.mocked(api.put).mockResolvedValue(response);
  const controller = new AbortController();
  expect(await apiGetGCashNumber(controller.signal)).toEqual(response.data.data);
  expect(await apiSaveGCashNumber('09123456789', controller.signal)).toEqual(response.data.data);
  expect(api.get).toHaveBeenCalledWith('/auth/gcash-number', { signal: controller.signal, timeout: 15_000 });
  expect(api.put).toHaveBeenCalledWith('/auth/gcash-number', { gcashNumber: '09123456789' }, { signal: controller.signal, timeout: 15_000 });
});
it.each([{ success: true }, { success: false, data: { gcashNumber: null } }, { success: true, data: { gcashNumber: 9123456789 } }, { success: true, data: { gcashNumber: 'invalid' } }])('rejects malformed responses rather than presenting them as saved: %j', async body => {
  vi.mocked(api.get).mockResolvedValue({ data: body }); await expect(apiGetGCashNumber()).rejects.toThrow('could not be loaded');
});
