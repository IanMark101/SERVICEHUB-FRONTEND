"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Bid, JobEngagement, JobRequest, Message, Notification, ServiceListing, Transaction, UserReport } from "../types";
import type { UserSession } from "../components/auth/LoginContainer";
import { apiGetCategories } from "../api/categories.api";
import { apiGetRequests } from "../api/requests.api";
import { apiGetReceivedOffers, apiGetMyOffers } from "../api/offers.api";
import { apiGetMyEngagements, apiConfirmOnlineBooking } from "../api/bookings.api";
import { apiGetNotifications } from "../api/notifications.api";
import { apiBrowseServices, apiGetMyServices } from "../api/services.api";
import { apiGetTransactions } from "../api/transactions.api";
import { apiGetConversations } from "../api/messages.api";
import { connectSocket, disconnectSocket } from "../lib/socket";
import { getAccessToken } from "../lib/api/axios";
import { useApiCacheRefresh } from './useApiCacheRefresh';
import { invalidateApiCache } from '../lib/api/responseCache';
import { mergeBookingAction, type BookingActionResult } from '../lib/bookingActionUpdate';
import {
  mapEngagements,
  mapServiceToListing,
  mapRequestToJobRequest,
  mapOfferToBid,
  mapDbNotification,
  mapDbTransaction
} from "../context/mappers";
import type { ApiBooking, ApiCompletedService } from "../context/mappers";

interface ConversationSummary { unreadCount?: number }

interface UseAppDataSyncOptions {
  isAuthenticated: boolean;
  authLoading: boolean;
  shouldLoadMarketplaceData?: boolean;
  user: UserSession | null;
  toastSuccess: (title: string, message?: string) => void;
  toastError: (title: string, message?: string) => void;
}

export function useAppDataSync({
  isAuthenticated,
  authLoading,
  shouldLoadMarketplaceData = true,
  user,
  toastSuccess,
  toastError
}: UseAppDataSyncOptions) {
  // Data states — start with empty state, populated strictly by live database APIs
  const [services, setServices] = useState<ServiceListing[]>([]);
  const [servicesStatus, setServicesStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const serviceRequestVersion = useRef(0);
  const servicesResolved = useRef(false);
  const [jobRequests, setJobRequests] = useState<JobRequest[]>([]);
  const [bids, setBids] = useState<Bid[]>([]);
  const [jobEngagements, setJobEngagements] = useState<JobEngagement[]>([]);
  const [requestsStatus, setRequestsStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [offersStatus, setOffersStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [engagementsStatus, setEngagementsStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const engagementRequestVersion = useRef(0);
  const engagementsResolved = useRef(false);
  const applyBookingAction = useCallback((result: BookingActionResult) => {
    // An older in-flight read must not undo a just-committed action. The cache
    // invalidation schedules one fresh read for the rest of the booking detail.
    engagementRequestVersion.current++;
    setJobEngagements(current => mergeBookingAction(current, result));
  }, []);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notificationPage, setNotificationPage] = useState(1);
  const [notificationTotalPages, setNotificationTotalPages] = useState(1);
  const [transactionPage, setTransactionPage] = useState(1);
  const [transactionTotalPages, setTransactionTotalPages] = useState(1);
  const [messages, setMessages] = useState<Message[]>([]);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState<number>(0);
  const [userReports, setUserReports] = useState<UserReport[]>([]);
  const [dbCategories, setDbCategories] = useState<{ id: string; name: string }[]>([]);
  const isAdmin = user?.role === 'admin';
  const canLoadWorkspace = isAuthenticated && user?.moderationStatus !== 'BANNED' && (isAdmin || user?.emailVerified === true);

  const clearPrivateData = useCallback(() => {
    engagementRequestVersion.current += 1;
    engagementsResolved.current = false;
    setJobRequests([]);
    setBids([]);
    setJobEngagements([]);
    setRequestsStatus('loading');
    setOffersStatus('loading');
    setEngagementsStatus('loading');
    setTransactions([]);
    setNotifications([]);
    setNotificationPage(1);
    setNotificationTotalPages(1);
    setTransactionPage(1);
    setTransactionTotalPages(1);
    setMessages([]);
    setUnreadMessagesCount(0);
    setUserReports([]);
  }, []);
  // ─── Live Data Sync Helpers ────────────────────────────────────
  const userModerationStatus = user?.moderationStatus;

  const syncPublicServices = useCallback(async () => {
    const version = ++serviceRequestVersion.current;
    setServicesStatus(previous => servicesResolved.current ? previous : 'loading');
    const current = () => version === serviceRequestVersion.current;
    const loadMine = isAuthenticated && userModerationStatus !== 'BANNED' && !isAdmin;
    let owned: ServiceListing[] | undefined;
    let published: ServiceListing[] | undefined;
    const browse = apiBrowseServices().then(res => {
      if (!current()) return;
      if (!res?.success || !Array.isArray(res.data)) throw new Error('Services could not be loaded');
      const listings: ServiceListing[] = res.data.map(mapServiceToListing);
      published = listings;
      servicesResolved.current = true;
      setServices(previous => {
        const mine = owned ?? (loadMine ? previous.filter(service => service.providerId === user?.id) : []);
        const merged = new Map(listings.map(service => [service.id, service]));
        mine.forEach(service => merged.set(service.id, service));
        return Array.from(merged.values());
      });
      setServicesStatus('ready');
    }).catch(() => { if (current()) setServicesStatus('error'); });
    const mine = loadMine ? apiGetMyServices().then(res => {
      if (!current() || !res?.success || !Array.isArray(res.data)) return;
      owned = res.data.map(mapServiceToListing);
      setServices(previous => {
        const base = published ?? previous.filter(service => service.providerId !== user?.id);
        const merged = new Map(base.map(service => [service.id, service]));
        owned!.forEach(service => merged.set(service.id, service));
        return Array.from(merged.values());
      });
    }).catch(() => { /* A private listing failure must not erase public listings. */ }) : Promise.resolve();
    // Each side updates independently: browsing never waits for private listings.
    await Promise.all([browse, mine]);
  }, [isAuthenticated, isAdmin, userModerationStatus, user?.id]);

  useEffect(() => {
    if (!authLoading && !canLoadWorkspace) {
      const timer = window.setTimeout(() => {
        serviceRequestVersion.current++;
        servicesResolved.current = false;
        setServices([]);
        setServicesStatus('loading');
      }, 0);
      return () => window.clearTimeout(timer);
    }
  }, [authLoading, canLoadWorkspace]);

  useEffect(() => () => { serviceRequestVersion.current++; }, []);

  const syncCategories = useCallback(async () => {
    try {
      const res = await apiGetCategories();
      if (res.success && Array.isArray(res.data)) {
        setDbCategories(res.data);
      }
    } catch {
      // ignore
    }
  }, []);

  const refreshCategories = useCallback(() => {
    invalidateApiCache(['categories']);
    syncCategories();
  }, [syncCategories]);

  const syncRequests = useCallback(async () => {
    const token = getAccessToken();
    if (!token || isAdmin) {
      setJobRequests([]);
      setRequestsStatus('loading');
      return;
    }
    try {
      const response = await apiGetRequests();
      if (response?.success && Array.isArray(response.data)) {
        setJobRequests(response.data.map(mapRequestToJobRequest));
        setRequestsStatus('ready');
      } else {
        setRequestsStatus('error');
      }
    } catch {
      setRequestsStatus('error');
    }
  }, [isAdmin]);

  const syncBids = useCallback(async () => {
    const token = getAccessToken();
    if (!token || isAdmin) {
      setBids([]);
      setOffersStatus('loading');
      return;
    }
    // Each response updates its own side of the inbox. A slow /offers/mine
    // request must not hold back a newly received offer (or vice versa).
    await Promise.allSettled([
      apiGetReceivedOffers().then((res) => {
        if (res?.success && Array.isArray(res.data)) {
          const receivedOffers: Bid[] = res.data.map(mapOfferToBid);
          setBids((current) => [...receivedOffers, ...current.filter((bid) => bid.providerId === user?.id)]);
          setOffersStatus('ready');
        } else {
          setOffersStatus('error');
        }
      }).catch(() => { setOffersStatus('error'); }),
      apiGetMyOffers().then((res) => {
        if (res?.success && Array.isArray(res.data)) {
          const myOffers: Bid[] = res.data.map(mapOfferToBid);
          setBids((current) => [...current.filter((bid) => bid.providerId !== user?.id), ...myOffers]);
        }
      }),
    ]);
  }, [isAdmin, user?.id]);

  const syncEngagements = useCallback(async () => {
    const version = ++engagementRequestVersion.current;
    const token = getAccessToken();
    if (!token || isAdmin) {
      setJobEngagements([]);
      setTransactions([]);
      setEngagementsStatus('loading');
      return;
    }
    // A confirmed empty workspace also stays visible during revalidation.
    setEngagementsStatus(previous => engagementsResolved.current ? previous : 'loading');
    try {
      const res = await apiGetMyEngagements();
      if (version !== engagementRequestVersion.current) return;
      if (res.success) {
        engagementsResolved.current = true;
        const dbBookings = (res.data.bookings || []) as ApiBooking[];
        const dbCompleted = (res.data.completedServices || []) as ApiCompletedService[];

        setJobEngagements(mapEngagements(dbBookings, dbCompleted));
        setEngagementsStatus('ready');
      } else {
        setEngagementsStatus('error');
      }
    } catch {
      if (version === engagementRequestVersion.current) setEngagementsStatus('error');
    }
  }, [isAdmin]);

  const syncNotifications = useCallback(async (page = 1, append = false) => {
    const token = getAccessToken();
    if (!token) {
      setNotifications([]);
      return;
    }
    try {
      const res = await apiGetNotifications(page, 20);
      if (res.success && Array.isArray(res.data)) {
        const mapped: Notification[] = res.data.map(mapDbNotification);
        setNotifications((current) => append ? [...current, ...mapped.filter((item) => !current.some((existing) => existing.id === item.id))] : mapped);
        setNotificationPage(page);
        setNotificationTotalPages(Math.max(1, res.pagination?.totalPages || 1));
      }
    } catch {
      // ignore
    }
  }, []);

  const syncUnreadMessages = useCallback(async () => {
    const token = getAccessToken();
    if (!token || isAdmin) {
      setUnreadMessagesCount(0);
      return;
    }
    try {
      const res = await apiGetConversations();
      if (res.success && Array.isArray(res.data)) {
        const totalUnread = typeof res.pagination?.unread === 'number'
          ? res.pagination.unread
          : (res.data as ConversationSummary[]).reduce((acc, conversation) => acc + (conversation.unreadCount || 0), 0);
        setUnreadMessagesCount(totalUnread);
      }
    } catch {
      // ignore
    }
  }, [isAdmin]);

  const syncTransactions = useCallback(async (page = 1, append = false) => {
    const token = getAccessToken();
    if (!token || isAdmin) {
      setTransactions([]);
      return;
    }
    try {
      const res = await apiGetTransactions(page, 20);
      if (res.success && Array.isArray(res.data)) {
        const mapped: Transaction[] = res.data.map(mapDbTransaction);
        setTransactions((current) => append ? [...current, ...mapped.filter((item) => !current.some((existing) => existing.id === item.id))] : mapped);
        setTransactionPage(page);
        setTransactionTotalPages(Math.max(1, res.pagination?.totalPages || 1));
      }
    } catch {
      // ignore
    }
  }, [isAdmin]);

  const loadMoreNotifications = useCallback(() => {
    if (notificationPage < notificationTotalPages) void syncNotifications(notificationPage + 1, true);
  }, [notificationPage, notificationTotalPages, syncNotifications]);

  const loadMoreTransactions = useCallback(() => {
    if (transactionPage < transactionTotalPages) void syncTransactions(transactionPage + 1, true);
  }, [transactionPage, transactionTotalPages, syncTransactions]);

  const refreshEngagements = useCallback(() => {
    invalidateApiCache(['bookings']);
    return syncEngagements();
  }, [syncEngagements]);

  const refreshAll = useCallback(() => {
    if (!canLoadWorkspace) return;
    invalidateApiCache();
    syncPublicServices();
    if (isAuthenticated && !authLoading) {
      syncNotifications();
    }
    if (isAuthenticated && !authLoading && !isAdmin) {
      syncRequests();
      syncBids();
      syncEngagements();
      syncTransactions();
      syncUnreadMessages();
    }
  }, [isAuthenticated, authLoading, isAdmin, canLoadWorkspace, syncPublicServices, syncRequests, syncBids, syncEngagements, syncNotifications, syncTransactions, syncUnreadMessages]);

  const cacheSyncEnabled = !authLoading && canLoadWorkspace && !!user?.id;
  useApiCacheRefresh(['categories'], () => syncCategories(), cacheSyncEnabled);
  useApiCacheRefresh(['services'], () => syncPublicServices(), cacheSyncEnabled);
  useApiCacheRefresh(['requests'], () => syncRequests(), cacheSyncEnabled && !isAdmin);
  useApiCacheRefresh(['offers'], () => syncBids(), cacheSyncEnabled && !isAdmin);
  useApiCacheRefresh(['bookings'], () => syncEngagements(), cacheSyncEnabled && !isAdmin);
  useApiCacheRefresh(['transactions'], () => syncTransactions(), cacheSyncEnabled && !isAdmin);
  useApiCacheRefresh(['notifications'], () => syncNotifications(), cacheSyncEnabled);
  useApiCacheRefresh(['messages'], () => syncUnreadMessages(), cacheSyncEnabled && !isAdmin);

  // ─── Marketplace data is needed after session recovery, not on public pages ──
  useEffect(() => {
    if (!shouldLoadMarketplaceData || authLoading || !canLoadWorkspace || !user?.id) return;

    const timer = window.setTimeout(() => {
      syncCategories();
      syncPublicServices();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [shouldLoadMarketplaceData, authLoading, canLoadWorkspace, user?.id, syncCategories, syncPublicServices]);

  useEffect(() => {
    // Load private data only after the authoritative session check succeeds.
    if (authLoading) return;
    if (!canLoadWorkspace || !user?.id) {
      const timer = window.setTimeout(clearPrivateData, 0);
      return () => window.clearTimeout(timer);
    }

    if (isAdmin) {
      const timer = window.setTimeout(() => {
        clearPrivateData();
        syncNotifications();
      }, 0);
      return () => window.clearTimeout(timer);
    }

    {
      const timer = window.setTimeout(() => {
        syncRequests();
        syncBids();
        syncEngagements();
        syncNotifications();
        syncTransactions();
        syncUnreadMessages();
      }, 0);

      return () => window.clearTimeout(timer);
    }
  }, [authLoading, canLoadWorkspace, user?.id, isAdmin, clearPrivateData, syncRequests, syncBids, syncEngagements, syncNotifications, syncTransactions, syncUnreadMessages]);

  useEffect(() => {
    if (authLoading || !canLoadWorkspace || !user?.id || isAdmin || !window.location.pathname.includes('/seeker/seeker-activity')) return;
    const paymentIntentId = localStorage.getItem('pending_payment_intent_id');
    const serviceId = localStorage.getItem('pending_service_id');
    const offerId = localStorage.getItem('pending_offer_id');
    if (!paymentIntentId || !serviceId) return;
    if (window.location.search.includes('payment_intent_id')) {
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    let stopped = false;
    let checks = 0;
    let pendingNotified = false;
    let retryTimer: ReturnType<typeof setTimeout>;
    const clearPending = () => {
      localStorage.removeItem('pending_payment_intent_id');
      localStorage.removeItem('pending_service_id');
      localStorage.removeItem('pending_offer_id');
    };
    const check = async () => {
      checks += 1;
      try {
        const res = await apiConfirmOnlineBooking({ serviceId, paymentIntentId, offerId: offerId || undefined });
        if (stopped) return;
        if (res.success && res.data?.status === 'SUCCEEDED') {
          clearPending();
          toastSuccess('Payment confirmed', 'Your booking was created and added to the provider queue.');
          refreshAll();
          return;
        }
        if (res.success && res.data?.status === 'PENDING') {
          if (!pendingNotified) {
            pendingNotified = true;
            toastSuccess('Payment processing', 'Waiting for secure GCash confirmation. This is not a completed booking yet.');
          }
        } else if (res.success) {
          clearPending();
          toastError('Payment not booked', 'The payment could not be added to the queue. Check your payment status before trying again.');
          return;
        }
      } catch (error) {
        if (stopped) return;
        if (process.env.NODE_ENV === 'development') console.error('Error checking online payment:', error);
      }
      if (checks < 12) retryTimer = setTimeout(() => { void check(); }, 5000);
      else if (!stopped) toastError('Payment confirmation pending', 'We could not confirm the booking yet. Reopen Activity to check again; do not pay a second time.');
    };
    retryTimer = setTimeout(() => { void check(); }, 0);
    return () => { stopped = true; clearTimeout(retryTimer); };
  }, [authLoading, canLoadWorkspace, user?.id, isAdmin, refreshAll, toastError, toastSuccess]);

  // ─── Socket.io — connect when authenticated, disconnect on logout ───
  useEffect(() => {
    const token = getAccessToken();
    if (!token || authLoading || !canLoadWorkspace || !user?.id) return;

    const sock = connectSocket(token);
    if (!sock) return;

    // socket.ts invalidates resources before feature handlers run. The cache
    // subscriptions above coalesce all data reloads into one path per resource.
    const accountUpdated = () => window.dispatchEvent(new Event('servicehub_account_updated'));
    const queueUpdated = (data: { serviceId: string; delta: number; currentSize?: number }) => {
      setServices(prev => prev.map(service => {
        if (service.id !== data.serviceId) return service;
        const size = data.currentSize ?? Math.max(0, (service.queueSize || 0) + data.delta);
        return { ...service, queueSize: size, providerWaitingCount: size };
      }));
    };
    sock.on('accountStatusChanged', accountUpdated);
    sock.on('queue_update', queueUpdated);
    return () => {
      sock.off('accountStatusChanged', accountUpdated);
      sock.off('queue_update', queueUpdated);
    };
  }, [authLoading, canLoadWorkspace, user?.id]);

  // An email-unverified session may authenticate but may not join workspace feeds.
  useEffect(() => {
    if (!canLoadWorkspace) {
      disconnectSocket();
    }
  }, [canLoadWorkspace]);

  // ─── Notification polling every 60 seconds when authenticated ──
  useEffect(() => {
    if (authLoading || !canLoadWorkspace || !user?.id) return;

    const interval = setInterval(() => {
      syncNotifications();
      syncUnreadMessages();
    }, 60000);

    return () => clearInterval(interval);
  }, [authLoading, canLoadWorkspace, user?.id, syncNotifications, syncUnreadMessages]);

  return {
    services,
    servicesStatus,
    setServices,
    jobRequests,
    setJobRequests,
    bids,
    setBids,
    jobEngagements,
    setJobEngagements,
    applyBookingAction,
    requestsStatus,
    offersStatus,
    engagementsStatus,
    transactions,
    setTransactions,
    notifications,
    setNotifications,
    messages,
    setMessages,
    unreadMessagesCount,
    userReports,
    setUserReports,
    dbCategories,
    clearPrivateData,
    refreshCategories,
    refreshEngagements,
    refreshAll,
    syncPublicServices,
    syncRequests,
    syncBids,
    syncEngagements,
    syncNotifications,
    syncTransactions,
    loadMoreNotifications,
    hasMoreNotifications: notificationPage < notificationTotalPages,
    loadMoreTransactions,
    hasMoreTransactions: transactionPage < transactionTotalPages,
    syncUnreadMessages
  };
}
