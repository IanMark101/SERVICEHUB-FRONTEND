"use client";

import { useCallback, useEffect, useState } from "react";
import type {
  Bid,
  CategorySuggestion,
  JobEngagement,
  JobRequest,
  Message,
  Notification,
  ServiceListing,
  Transaction,
  UserReport
} from "../types";
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
import {
  mapBookingToEngagement,
  mapCompletedServiceToEngagement,
  mapServiceToListing,
  mapRequestToJobRequest,
  mapOfferToBid,
  mapDbNotification,
  mapDbTransaction
} from "../context/mappers";

interface UseAppDataSyncOptions {
  isAuthenticated: boolean;
  authLoading: boolean;
  user: UserSession | null;
  toastSuccess: (title: string, message?: string) => void;
  toastError: (title: string, message?: string) => void;
}

export function useAppDataSync({
  isAuthenticated,
  authLoading,
  user,
  toastSuccess,
  toastError
}: UseAppDataSyncOptions) {
  // Data states — start with empty state, populated strictly by live database APIs
  const [services, setServices] = useState<ServiceListing[]>([]);
  const [jobRequests, setJobRequests] = useState<JobRequest[]>([]);
  const [bids, setBids] = useState<Bid[]>([]);
  const [jobEngagements, setJobEngagements] = useState<JobEngagement[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState<number>(0);
  const [categorySuggestions, setCategorySuggestions] = useState<CategorySuggestion[]>([]);
  const [userReports, setUserReports] = useState<UserReport[]>([]);
  const [dbCategories, setDbCategories] = useState<{ id: string; name: string }[]>([]);

  const clearPrivateData = useCallback(() => {
    setJobRequests([]);
    setBids([]);
    setJobEngagements([]);
    setTransactions([]);
    setNotifications([]);
    setMessages([]);
    setUnreadMessagesCount(0);
    setCategorySuggestions([]);
    setUserReports([]);
  }, []);
  // ─── Live Data Sync Helpers ────────────────────────────────────

  const syncPublicServices = useCallback(async () => {
    try {
      if (isAuthenticated) {
        const [browseRes, mineRes] = await Promise.allSettled([
          apiBrowseServices(),
          apiGetMyServices(),
        ]);

        const publicServices: ServiceListing[] =
          browseRes.status === 'fulfilled' && browseRes.value?.success && Array.isArray(browseRes.value.data)
            ? browseRes.value.data.map(mapServiceToListing)
            : [];

        const myServices: ServiceListing[] =
          mineRes.status === 'fulfilled' && mineRes.value?.success && Array.isArray(mineRes.value.data)
            ? mineRes.value.data.map(mapServiceToListing)
            : [];

        const serviceMap = new Map<string, ServiceListing>();
        publicServices.forEach(s => serviceMap.set(s.id, s));
        myServices.forEach(s => serviceMap.set(s.id, s));

        setServices(Array.from(serviceMap.values()));
      } else {
        // Unauthenticated visitor (landing page): fetch public active listings only
        const browseRes = await apiBrowseServices();
        if (browseRes?.success && Array.isArray(browseRes.data)) {
          setServices(browseRes.data.map(mapServiceToListing));
        }
      }
    } catch {
      // ignore
    }
  }, [isAuthenticated]);

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
    syncCategories();
  }, [syncCategories]);

  const syncRequests = useCallback(async () => {
    const token = getAccessToken();
    if (!token) {
      setJobRequests([]);
      return;
    }
    try {
      const res = await apiGetRequests();
      if (res.success && Array.isArray(res.data)) {
        setJobRequests(res.data.map(mapRequestToJobRequest));
      }
    } catch {
      // ignore
    }
  }, []);

  const syncBids = useCallback(async () => {
    const token = getAccessToken();
    if (!token) {
      setBids([]);
      return;
    }
    try {
      const [receivedRes, mineBidsRes] = await Promise.allSettled([
        apiGetReceivedOffers(),
        apiGetMyOffers(),
      ]);

      const receivedOffers: Bid[] = receivedRes.status === 'fulfilled' && receivedRes.value?.success
        ? receivedRes.value.data.map(mapOfferToBid)
        : [];

      const myOffers: Bid[] = mineBidsRes.status === 'fulfilled' && mineBidsRes.value?.success
        ? mineBidsRes.value.data.map(mapOfferToBid)
        : [];

      setBids([...receivedOffers, ...myOffers]);
    } catch {
      // ignore
    }
  }, []);

  const syncEngagements = useCallback(async () => {
    const token = getAccessToken();
    if (!token) {
      setJobEngagements([]);
      setTransactions([]);
      return;
    }
    try {
      const res = await apiGetMyEngagements();
      if (res.success) {
        const dbBookings = res.data.bookings || [];
        const dbCompleted = res.data.completedServices || [];

        const mappedBookings = dbBookings
          .filter((b: any) => b.status !== "COMPLETED")
          .map(mapBookingToEngagement);
        const mappedCompleted = dbCompleted.map(mapCompletedServiceToEngagement);

        setJobEngagements([...mappedBookings, ...mappedCompleted]);

        // Sync transactions from completed services
        const txs: Transaction[] = dbCompleted.map((cs: any) => ({
          id: cs.id,
          jobId: cs.bookingId || cs.id,
          seekerId: cs.seekerId,
          providerId: cs.providerId,
          amount: Number(cs.finalPrice),
          paymentMethod: cs.booking?.paymentMethod === 'GCash' ? 'GCash' : 'On-site Cash',
          serviceTitle: cs.booking?.service?.title || cs.booking?.offer?.request?.title || cs.booking?.directRequest?.service?.title || 'Service Payout',
          createdAt: cs.completedAt?.split('T')[0] || '',
        }));

        setTransactions(txs);
      }
    } catch {
      // ignore
    }
  }, []);

  const syncNotifications = useCallback(async () => {
    const token = getAccessToken();
    if (!token) {
      setNotifications([]);
      return;
    }
    try {
      const res = await apiGetNotifications();
      if (res.success && Array.isArray(res.data)) {
        setNotifications(res.data.map(mapDbNotification));
      }
    } catch {
      // ignore
    }
  }, []);

  const syncUnreadMessages = useCallback(async () => {
    const token = getAccessToken();
    if (!token) {
      setUnreadMessagesCount(0);
      return;
    }
    try {
      const res = await apiGetConversations();
      if (res.success && Array.isArray(res.data)) {
        const totalUnread = res.data.reduce((acc: number, conv: any) => acc + (conv.unreadCount || 0), 0);
        setUnreadMessagesCount(totalUnread);
      }
    } catch {
      // ignore
    }
  }, []);

  const syncTransactions = useCallback(async () => {
    const token = getAccessToken();
    if (!token) {
      setTransactions([]);
      return;
    }
    try {
      const res = await apiGetTransactions();
      if (res.success && Array.isArray(res.data)) {
        setTransactions(res.data.map(mapDbTransaction));
      }
    } catch {
      // ignore
    }
  }, []);

  const refreshEngagements = useCallback(() => {
    syncEngagements();
  }, [syncEngagements]);

  const refreshAll = useCallback(() => {
    syncPublicServices();
    if (isAuthenticated && !authLoading) {
      syncRequests();
      syncBids();
      syncEngagements();
      syncNotifications();
      syncTransactions();
      syncUnreadMessages();
    }
  }, [isAuthenticated, authLoading, syncPublicServices, syncRequests, syncBids, syncEngagements, syncNotifications, syncTransactions, syncUnreadMessages]);

  // ─── Initial Data Load on Mount ────────────────────────────────
  useEffect(() => {
    // Always load categories and public services
    syncCategories();
    syncPublicServices();
  }, [syncCategories, syncPublicServices]);

  useEffect(() => {
    // Load private data only after the authoritative session check succeeds.
    if (authLoading) return;
    if (!isAuthenticated || !user?.id) {
      clearPrivateData();
      return;
    }

    {
      syncRequests();
      syncBids();
      syncEngagements();
      syncNotifications();
      syncTransactions();
      syncUnreadMessages();

      // Check for returning GCash payment checkout
      if (typeof window !== "undefined") {
        const pendingPaymentIntentId = localStorage.getItem('pending_payment_intent_id');
        const pendingServiceId = localStorage.getItem('pending_service_id');
        const pendingOfferId = localStorage.getItem('pending_offer_id');

        if (pendingPaymentIntentId && pendingServiceId) {
          localStorage.removeItem('pending_payment_intent_id');
          localStorage.removeItem('pending_service_id');
          localStorage.removeItem('pending_offer_id');

          apiConfirmOnlineBooking({
            serviceId: pendingServiceId,
            paymentIntentId: pendingPaymentIntentId,
            offerId: pendingOfferId || undefined,
          })
            .then((res) => {
              if (res.success && res.data?.status === 'SUCCEEDED') {
                toastSuccess("Payment confirmed", "Your booking was created and added to the provider queue.");
                refreshAll();
              } else if (res.success && res.data?.status === 'PENDING') {
                toastSuccess("Payment submitted", "Secure provider confirmation is still processing. Your Activity page will update automatically.");
              } else {
                toastError("Booking Verification Failed", res.error || "Payment could not be verified.");
              }
            })
            .catch((err) => {
              console.error("Error confirming online booking:", err);
              toastError("Booking Verification Error", err.response?.data?.error || err.message);
            })
            .finally(() => {
              // Smoothly remove payment_intent_id query param from address bar
              if (typeof window !== "undefined" && window.history && window.history.replaceState) {
                window.history.replaceState({}, document.title, window.location.pathname);
              }
            });
        }
      }
    }
  }, [authLoading, isAuthenticated, user?.id, clearPrivateData, refreshAll, syncRequests, syncBids, syncEngagements, syncNotifications, syncTransactions, syncUnreadMessages, toastError, toastSuccess]);

  // ─── Socket.io — connect when authenticated, disconnect on logout ───
  useEffect(() => {
    const token = getAccessToken();
    if (!token || authLoading || !isAuthenticated || !user?.id) return;

    const sock = connectSocket(token);
    if (!sock) return;

    // Bursts often contain both `notification` and `ENGAGEMENT_CHANGED` for
    // the same mutation. Coalesce each resource refresh so one action does not
    // fan out into repeated identical API calls and visible dashboard lag.
    const refreshTimers = new Map<string, ReturnType<typeof setTimeout>>();
    const scheduleRefresh = (key: string, refresh: () => void) => {
      const pending = refreshTimers.get(key);
      if (pending) clearTimeout(pending);
      refreshTimers.set(key, setTimeout(() => {
        refreshTimers.delete(key);
        refresh();
      }, 180));
    };
    const scheduleOperationalRefresh = () => {
      scheduleRefresh('notifications', syncNotifications);
      scheduleRefresh('engagements', syncEngagements);
      scheduleRefresh('bids', syncBids);
      scheduleRefresh('requests', syncRequests);
      scheduleRefresh('transactions', syncTransactions);
    };

    // Real-time notification badge and data synchronization
    sock.on('notification', () => {
      scheduleOperationalRefresh();
    });

    // Real-time booking / engagement status updates (create, accept, decline, cancel, start, complete, dispute)
    sock.on('ENGAGEMENT_CHANGED', () => {
      scheduleOperationalRefresh();
    });

    // Real-time queue counter update — update the services list in place
    sock.on('queue_update', (data: { serviceId: string; delta: number; currentSize?: number }) => {
      setServices(prev =>
        prev.map(s => {
          if (s.id !== data.serviceId) return s;
          const newSize = data.currentSize !== undefined
            ? data.currentSize
            : Math.max(0, (s.queueSize || 0) + data.delta);
          return { ...s, queueSize: newSize };
        })
      );
      scheduleRefresh('engagements', syncEngagements);
    });

    // Unread message badge — re-sync unread messages count in real-time
    sock.on('message_notification', () => {
      scheduleRefresh('unreadMessages', syncUnreadMessages);
    });

    // Real-time service request / broadcast updates
    sock.on('SERVICE_REQUEST_CREATED', () => {
      scheduleRefresh('requests', syncRequests);
      scheduleRefresh('bids', syncBids);
    });
    sock.on('SERVICE_REQUEST_UPDATED', () => {
      scheduleRefresh('requests', syncRequests);
      scheduleRefresh('bids', syncBids);
    });
    sock.on('SERVICE_REQUEST_DELETED', () => {
      scheduleRefresh('requests', syncRequests);
      scheduleRefresh('bids', syncBids);
    });
    sock.on('SERVICE_REQUESTS_CHANGED', () => {
      scheduleRefresh('requests', syncRequests);
      scheduleRefresh('bids', syncBids);
    });

    // Real-time service listing updates (active/paused toggles, edits, deletes, approvals)
    sock.on('SERVICE_LISTING_TOGGLED', (data: { id: string; isAvailable: boolean }) => {
      setServices(prev =>
        prev.map(s => (s.id === data.id ? { ...s, isPaused: !data.isAvailable } : s))
      );
      scheduleRefresh('publicServices', syncPublicServices);
    });
    sock.on('SERVICE_LISTING_UPDATED', () => {
      scheduleRefresh('publicServices', syncPublicServices);
    });
    sock.on('SERVICE_LISTING_DELETED', (data: { id: string }) => {
      setServices(prev => prev.filter(s => s.id !== data.id));
      scheduleRefresh('publicServices', syncPublicServices);
    });
    sock.on('SERVICE_LISTING_APPROVED', () => {
      scheduleRefresh('publicServices', syncPublicServices);
    });
    sock.on('SERVICE_LISTINGS_CHANGED', () => {
      scheduleRefresh('publicServices', syncPublicServices);
    });

    return () => {
      refreshTimers.forEach(clearTimeout);
      sock.off('notification');
      sock.off('ENGAGEMENT_CHANGED');
      sock.off('queue_update');
      sock.off('message_notification');
      sock.off('SERVICE_REQUEST_CREATED');
      sock.off('SERVICE_REQUEST_UPDATED');
      sock.off('SERVICE_REQUEST_DELETED');
      sock.off('SERVICE_REQUESTS_CHANGED');
      sock.off('SERVICE_LISTING_TOGGLED');
      sock.off('SERVICE_LISTING_UPDATED');
      sock.off('SERVICE_LISTING_DELETED');
      sock.off('SERVICE_LISTING_APPROVED');
      sock.off('SERVICE_LISTINGS_CHANGED');
    };
  }, [authLoading, isAuthenticated, user?.id, syncNotifications, syncUnreadMessages, syncRequests, syncBids, syncPublicServices, syncEngagements, syncTransactions]);

  // Disconnect socket when user explicitly logs out
  useEffect(() => {
    if (!isAuthenticated) {
      disconnectSocket();
    }
  }, [isAuthenticated]);

  // ─── Notification polling every 60 seconds when authenticated ──
  useEffect(() => {
    if (authLoading || !isAuthenticated || !user?.id) return;

    const interval = setInterval(() => {
      syncNotifications();
      syncUnreadMessages();
    }, 60000);

    return () => clearInterval(interval);
  }, [authLoading, isAuthenticated, user?.id, syncNotifications, syncUnreadMessages]);

  return {
    services,
    setServices,
    jobRequests,
    setJobRequests,
    bids,
    setBids,
    jobEngagements,
    setJobEngagements,
    transactions,
    setTransactions,
    notifications,
    setNotifications,
    messages,
    setMessages,
    unreadMessagesCount,
    categorySuggestions,
    setCategorySuggestions,
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
    syncUnreadMessages
  };
}
