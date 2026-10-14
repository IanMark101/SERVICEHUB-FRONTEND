import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useSharedActions } from './useSharedActions';
import { apiMarkNotificationsRead } from '../api/notifications.api';
const auth=vi.hoisted(()=>({token:'token' as string|null}));
vi.mock('../lib/api/axios',()=>({getAccessToken:()=>auth.token}));
vi.mock('../api/messages.api',()=>({apiSendMessage:vi.fn()}));
vi.mock('../api/notifications.api',()=>({apiMarkNotificationsRead:vi.fn()}));
const applyNotificationRead=vi.fn();
const setup=()=>renderHook(()=>useSharedActions({jobEngagements:[],setMessages:vi.fn(),applyNotificationRead}));
beforeEach(()=>{vi.clearAllMocks();auth.token='token';vi.mocked(apiMarkNotificationsRead).mockReset().mockResolvedValue({success:true,data:{unread:2}});});
describe('notification read acknowledgements',()=>{
 it('marks only the clicked alert and preserves the authoritative remaining count',async()=>{
  const {result}=setup();await act(async()=>{await result.current.markNotificationsRead('reader','cancel-alert');});
  expect(apiMarkNotificationsRead).toHaveBeenCalledWith('cancel-alert');expect(applyNotificationRead).toHaveBeenCalledWith('reader','cancel-alert',2,undefined);
 });
 it('marks all only for the explicit mark-all action',async()=>{
  const cutoff='2026-10-14T10:00:00.000Z';vi.mocked(apiMarkNotificationsRead).mockResolvedValueOnce({success:true,data:{unread:0,readBefore:cutoff}});
  const {result}=setup();await act(async()=>{await result.current.markNotificationsRead('reader');});
  expect(apiMarkNotificationsRead).toHaveBeenCalledWith(undefined);expect(applyNotificationRead).toHaveBeenCalledWith('reader',undefined,0,cutoff);
 });
 it('ignores a read response completed after sign-out',async()=>{
  let finish!:(value:unknown)=>void;vi.mocked(apiMarkNotificationsRead).mockImplementationOnce(()=>new Promise(resolve=>{finish=resolve;}));
  const {result}=setup();let pending!:Promise<void>;act(()=>{pending=result.current.markNotificationsRead('reader','notice');});
  auth.token=null;await act(async()=>{finish({success:true,data:{unread:0}});await pending;});expect(applyNotificationRead).not.toHaveBeenCalled();
 });
 it('does not send a read action without an authenticated session',async()=>{
  auth.token=null;const {result}=setup();await act(async()=>{await result.current.markNotificationsRead('reader','notice');});
  expect(apiMarkNotificationsRead).not.toHaveBeenCalled();
 });
});
