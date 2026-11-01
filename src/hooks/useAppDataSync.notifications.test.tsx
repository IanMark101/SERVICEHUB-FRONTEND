import { act, cleanup, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { UserSession } from '../components/auth/LoginContainer';
import { useAppDataSync } from './useAppDataSync';
import { apiGetNotifications } from '../api/notifications.api';
import { invalidateApiCache } from '../lib/api/responseCache';

const auth=vi.hoisted(()=>({token:'reader-token' as string|null}));
vi.mock('../lib/api/axios',()=>({getAccessToken:()=>auth.token}));
vi.mock('../lib/socket',()=>({connectSocket:vi.fn(()=>null),disconnectSocket:vi.fn()}));
vi.mock('../api/categories.api',()=>({apiGetCategories:vi.fn().mockResolvedValue({success:true,data:[]})}));
vi.mock('../api/services.api',()=>({apiBrowseServices:vi.fn().mockResolvedValue({success:true,data:[]}),apiGetMyServices:vi.fn().mockResolvedValue({success:true,data:[]})}));
vi.mock('../api/requests.api',()=>({apiGetRequests:vi.fn().mockResolvedValue({success:true,data:[]}),apiGetMyRequests:vi.fn().mockResolvedValue({success:true,data:[]})}));
vi.mock('../api/offers.api',()=>({apiGetReceivedOffers:vi.fn().mockResolvedValue({success:true,data:[]}),apiGetMyOffers:vi.fn().mockResolvedValue({success:true,data:[]})}));
vi.mock('../api/bookings.api',()=>({apiGetMyEngagements:vi.fn().mockResolvedValue({success:true,data:{bookings:[],completedServices:[]}}),apiConfirmOnlineBooking:vi.fn()}));
vi.mock('../api/transactions.api',()=>({apiGetTransactions:vi.fn().mockResolvedValue({success:true,data:[]})}));
vi.mock('../api/messages.api',()=>({apiGetConversations:vi.fn().mockResolvedValue({success:true,data:[]})}));
vi.mock('../api/notifications.api',()=>({apiGetNotifications:vi.fn()}));
const user={id:'reader',role:'seeker',emailVerified:true} as UserSession;
const options={user,authLoading:false,isAuthenticated:true,toastSuccess:vi.fn(),toastError:vi.fn()};
const notice=(id:string,createdAt='2026-10-14T10:00:00.000Z',userId='reader')=>({id,userId,createdAt,title:'Booking cancelled',body:'The booking was cancelled.',isRead:false,link:'/seeker/seeker-activity?tab=canceled&booking=book'});
const reply=(data:ReturnType<typeof notice>[],unread=25)=>({success:true,data,pagination:{page:1,total:60,totalPages:3,unread}});
const start=async()=>{const view=renderHook(()=>useAppDataSync(options));await act(async()=>{await vi.advanceTimersByTimeAsync(0);});return view;};
beforeEach(()=>{vi.useFakeTimers();vi.clearAllMocks();auth.token='reader-token';vi.mocked(apiGetNotifications).mockReset().mockResolvedValue(reply([notice('one'),notice('two')]));});
afterEach(()=>{cleanup();vi.useRealTimers();});

describe('notification delivery and unread state',()=>{
 it('uses the server unread total, including alerts outside the first page',async()=>{
  const {result}=await start();expect(result.current.notifications).toHaveLength(2);expect(result.current.unreadNotificationsCount).toBe(25);
  act(()=>result.current.applyNotificationRead('reader','one',24));
  expect(result.current.notifications.find(item=>item.id==='one')?.read).toBe(true);
  expect(result.current.notifications.find(item=>item.id==='two')?.read).toBe(false);expect(result.current.unreadNotificationsCount).toBe(24);
 });
 it('a late response cannot undo an acknowledged read',async()=>{
  const {result}=await start();let finish!:(value:ReturnType<typeof reply>)=>void;
  vi.mocked(apiGetNotifications).mockImplementationOnce(()=>new Promise(resolve=>{finish=resolve;}));
  let pending!:Promise<void>;act(()=>{pending=result.current.syncNotifications();});
  act(()=>result.current.applyNotificationRead('reader','one',24));
  await act(async()=>{finish(reply([notice('one'),notice('two')]));await pending;});
  expect(result.current.notifications.find(item=>item.id==='one')?.read).toBe(true);expect(result.current.unreadNotificationsCount).toBe(24);
 });
 it('retains older loaded alerts and sorts new alerts without duplicates',async()=>{
  const {result}=await start();const old=notice('old','2026-10-13T00:00:00.000Z');
  vi.mocked(apiGetNotifications).mockResolvedValueOnce(reply([old,notice('two')]));
  await act(async()=>{await result.current.syncNotifications(2,true);});
  const latest=notice('latest','2026-10-14T12:00:00.000Z');
  vi.mocked(apiGetNotifications).mockResolvedValueOnce(reply([latest,notice('one')],26));
  act(()=>invalidateApiCache(['notifications'],'socket'));await act(async()=>{await vi.advanceTimersByTimeAsync(200);});
  expect(result.current.notifications.map(item=>item.id)).toEqual(['latest','two','one','old']);
  expect(result.current.unreadNotificationsCount).toBe(26);
 });
 it('ignores an older page response after a newer refresh',async()=>{
  const {result}=await start();let finish!:(value:ReturnType<typeof reply>)=>void;
  vi.mocked(apiGetNotifications).mockImplementationOnce(()=>new Promise(resolve=>{finish=resolve;}));
  let oldPage!:Promise<void>;act(()=>{oldPage=result.current.syncNotifications(2,true);});
  vi.mocked(apiGetNotifications).mockResolvedValueOnce(reply([notice('latest','2026-10-14T12:00:00.000Z')],26));
  await act(async()=>{await result.current.syncNotifications();finish(reply([notice('stale-page')],10));await oldPage;});
  expect(result.current.notifications.some(item=>item.id==='stale-page')).toBe(false);expect(result.current.unreadNotificationsCount).toBe(26);
 });
 it('does not expose a previous account response after switching accounts',async()=>{
  const view=renderHook(({session})=>useAppDataSync({...options,user:session}),{initialProps:{session:user}});
  await act(async()=>{await vi.advanceTimersByTimeAsync(0);});let finish!:(value:ReturnType<typeof reply>)=>void;
  vi.mocked(apiGetNotifications).mockImplementationOnce(()=>new Promise(resolve=>{finish=resolve;}));
  let pending!:Promise<void>;act(()=>{pending=view.result.current.syncNotifications();});
  const second={...user,id:'second'};auth.token='second-token';
  vi.mocked(apiGetNotifications).mockResolvedValueOnce(reply([notice('second-alert',undefined,'second')],1));
  view.rerender({session:second});
  await act(async()=>{await vi.advanceTimersByTimeAsync(0);finish(reply([notice('old-account')]));await pending;});
  expect(view.result.current.notifications.map(item=>item.userId)).toEqual(['second']);expect(view.result.current.unreadNotificationsCount).toBe(1);
 });
 it('keeps newly arriving alerts unread when applying a mark-all cutoff',async()=>{
  vi.mocked(apiGetNotifications).mockResolvedValueOnce(reply([notice('old','2026-10-14T10:00:00.000Z'),notice('new','2026-10-14T10:01:00.000Z')],2));
  const {result}=await start();act(()=>result.current.applyNotificationRead('reader',undefined,1,'2026-10-14T10:00:30.000Z'));
  expect(result.current.notifications.find(item=>item.id==='old')?.read).toBe(true);expect(result.current.notifications.find(item=>item.id==='new')?.read).toBe(false);
  expect(result.current.unreadNotificationsCount).toBe(1);
 });
 it('keeps alerts on refresh failure and recovers through the existing poll',async()=>{
  const {result}=await start();vi.mocked(apiGetNotifications).mockRejectedValueOnce(new Error('Offline'));
  await act(async()=>{await result.current.syncNotifications();});expect(result.current.notifications).toHaveLength(2);
  vi.mocked(apiGetNotifications).mockResolvedValueOnce(reply([notice('recovered','2026-10-14T12:00:00.000Z')],26));
  await act(async()=>{await vi.advanceTimersByTimeAsync(60000);});expect(result.current.notifications[0].id).toBe('recovered');
 });
});
