"use client";
import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import {
  User,
  ServiceListing,
  JobRequest,
  Bid,
  JobEngagement,
  Transaction,
  Notification,
  Message,
  CategorySuggestion,
  UserReport
} from '../types';
import { apiGetCategories } from '../api/categories.api';
import { apiGetRequests } from '../api/requests.api';
import { apiGetReceivedOffers, apiGetMyOffers } from '../api/offers.api';
import { apiGetMyEngagements, apiConfirmOnlineBooking } from '../api/bookings.api';
import { apiGetNotifications } from '../api/notifications.api';
import { apiBrowseServices, apiGetMyServices } from '../api/services.api';
import { apiGetTransactions } from '../api/transactions.api';
import { apiGetConversations } from '../api/messages.api';
import { UserSession } from '../components/auth/LoginContainer';
import { apiRecoverSession } from '../api/auth.api';
import { connectSocket, disconnectSocket } from '../lib/socket';
import { clearAccessToken } from '../lib/api/axios';


// Modular Helpers and Hooks
import {
  mapBookingToEngagement,
  mapCompletedServiceToEngagement,
  mapServiceToListing,
  mapRequestToJobRequest,
  mapOfferToBid,
  mapDbNotification,
  mapDbTransaction
} from './mappers';
import { useSeekerActions } from '../hooks/useSeekerActions';
import { useProviderActions } from '../hooks/useProviderActions';
import { useSharedActions } from '../hooks/useSharedActions';
import { useToast } from '../components/ui/Toast';

interface AppContextType {
  users: User[];
  services: ServiceListing[];
  setServices: React.Dispatch<React.SetStateAction<ServiceListing[]>>;
  refreshServices: () => void;
  jobRequests: JobRequest[];
  bids: Bid[];
  jobEngagements: JobEngagement[];
  transactions: Transaction[];
  notifications: Notification[];
  messages: Message[];
  categorySuggestions: CategorySuggestion[];
  userReports: UserReport[];
  // Live admin-controlled category list. Always sourced from the database.
  // Populated on mount and refreshable via refreshCategories().
  // OfferServices and SeekServices use this — never hardcoded lists.
  dbCategories: { id: string; name: string }[];
  refreshCategories: () => void;

  // Auth helper callbacks
  updateUserProfile: (userId: string, data: Partial<User>) => void;

  // Seeker actions
  postJobRequest: (seekerId: string, title: string, category: string, urgency: string, budget: number, description: string) => void;
  editJobRequest: (requestId: string, title: string, budget: number, description: string) => void;
  deleteJobRequest: (requestId: string) => void;
  toggleJobRequestStatus: (requestId: string, currentStatus?: string) => Promise<boolean>;
  acceptBid: (bidId: string, paymentMethod?: 'GCash' | 'On-site Cash') => void;
  declineBid: (bidId: string) => void;
  confirmJobCompletion: (jobId: string) => void;
  disputeJob: (jobId: string, reason: string) => void;
  suggestCategory: (seekerName: string, name: string, description: string) => void;
  bookProviderDirectly: (seekerId: string, serviceId: string, price: number, description: string, paymentMethod: 'GCash' | 'On-site Cash') => void;
  cancelQueue: (id: string) => void;

  // Provider actions
  createServiceListing: (
    providerId: string,
    title: string,
    category: string,
    price: number,
    description: string,
    proofUrl: string,
    paymentMethods: { cash: boolean; gcash: boolean },
    options?: {
      serviceType?: string;
      priceType?: string;
      estimatedDurationMins?: number;
      queueLimit?: number;
    }
  ) => void;
  editServiceListing: (
    serviceId: string,
    title: string,
    price: number,
    description: string,
    options?: {
      priceType?: string;
      serviceType?: string;
      estimatedDurationMins?: number;
    }
  ) => void;
  toggleServiceListingStatus: (serviceId: string) => void;
  deleteServiceListing: (serviceId: string) => void;
  submitBid: (requestId: string, providerId: string, price: number, message: string) => void;
  respondToDirectBooking: (jobId: string, accept: boolean) => void;
  requestJobApproval: (jobId: string) => void;
  providerStartJob: (id: string) => void;
  providerRemoveFromQueue: (id: string) => void;

  // Admin actions

  // Shared actions
  sendMessage: (senderId: string, receiverId: string, text: string) => void;
  markNotificationsRead: (userId: string) => void;
  isDark: boolean;
  toggleTheme: () => void;
  refreshEngagements: () => void;
  refreshAll: () => void;
  user: UserSession | null;
  setUser: (user: UserSession | null | ((prev: UserSession | null) => UserSession | null)) => void;
  isAuthenticated: boolean;
  setIsAuthenticated: (auth: boolean) => void;
  authLoading: boolean;
  unreadMessagesCount: number;
  syncUnreadMessages: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<User[]>([]);
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("theme") === "dark";
    }
    return false;
  });

  // Global Auth States
  const [user, setUserState] = useState<UserSession | null>(() => {
    if (typeof window !== 'undefined') {
      const cached = localStorage.getItem('userSession');
      if (cached) {
        try {
          return JSON.parse(cached);
        } catch {
          return null;
        }
      }
    }
    return null;
  });

  const setUser = useCallback((valOrFn: UserSession | null | ((prev: UserSession | null) => UserSession | null)) => {
    setUserState(prev => {
      const next = typeof valOrFn === 'function' ? valOrFn(prev) : valOrFn;
      if (typeof window !== 'undefined') {
        if (next) {
          localStorage.setItem('userSession', JSON.stringify(next));
        } else {
          localStorage.removeItem('userSession');
        }
      }
      return next;
    });
  }, []);

  // A cached token is only a session candidate. Protected data must wait until
  // /auth/me has validated it (and refreshed it when possible).
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const { success: toastSuccess, error: toastError } = useToast();

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

  // ─── Session Recovery ──────────────────────────────────────────
  useEffect(() => {
    let active = true;
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    if (!token) {
      setUser(null);
      setIsAuthenticated(false);
      setAuthLoading(false);
      return () => {
        active = false;
      };
    }

    apiRecoverSession()
        .then((res) => {
          if (!active) return;
          if (res.success) {
            const dbUser = res.data.user;
            const names = (dbUser.name || '').split(' ');
            const firstName = names[0] || '';
            const lastName = names.slice(1).join(' ') || '';
            const savedRole = (localStorage.getItem('workspaceRole') as any) || 'seeker';
            const finalRole = dbUser.role === 'admin' ? 'admin' : savedRole;

            const sessionData: UserSession = {
              id: dbUser.id,
              email: dbUser.email,
              firstName,
              lastName,
              role: finalRole,
              avatarUrl: dbUser.avatarUrl || '',
              bio: dbUser.bio || '',
              phone: dbUser.phone,
              trustScore: dbUser.trustScore,
              verificationStatus: dbUser.verificationStatus,
              emailVerified: dbUser.emailVerified,
            };
            setUser(sessionData);
            setIsAuthenticated(true);
          } else {
            clearAccessToken();
            setUser(null);
            setIsAuthenticated(false);
          }
        })
        .catch(() => {
          if (!active) return;
          // Fail closed: cached identity/role data must never render a protected
          // workspace when the authoritative /auth/me check did not succeed.
          clearAccessToken();
          setUser(null);
          setIsAuthenticated(false);
        })
        .finally(() => {
          if (active) setAuthLoading(false);
        });

    return () => {
      active = false;
    };
  }, [setUser]);

  useEffect(() => {
    const handleSessionExpired = () => {
      clearAccessToken();
      setIsAuthenticated(false);
      setUser(null);
      clearPrivateData();
    };

    window.addEventListener('auth_session_expired', handleSessionExpired);
    return () => {
      window.removeEventListener('auth_session_expired', handleSessionExpired);
    };
  }, [clearPrivateData, setUser]);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      if (isDark) {
        document.documentElement.classList.add('dark');
        document.documentElement.style.colorScheme = 'dark';
      } else {
        document.documentElement.classList.remove('dark');
        document.documentElement.style.colorScheme = 'light';
      }
    }
  }, [isDark]);

  const toggleTheme = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    localStorage.setItem('theme', nextDark ? 'dark' : 'light');
  };

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
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
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
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
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
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
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
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
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
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
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
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
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
              if (res.success) {
                toastSuccess("Payment Secured in Escrow! 🔒", res.message || "Your booking request has been sent to the provider for confirmation.");
                refreshAll();
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
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
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


  // ─── Shared helper ─────────────────────────────────────────────
  const helperAddNotification = useCallback((userId: string, title: string, desc: string) => {
    const newNotif: Notification = {
      id: `n_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      userId,
      title,
      desc,
      time: 'Just now',
      read: false
    };
    setNotifications(prev => [newNotif, ...prev]);
  }, []);

  const updateUserProfile = (userId: string, data: Partial<User>) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, ...data } : u));
  };

  // ─── Modularize Seeker Actions ──────────────────────────────────
  const seekerActions = useSeekerActions({
    users,
    services,
    jobRequests,
    bids,
    jobEngagements,
    dbCategories,
    setJobRequests,
    setBids,
    setJobEngagements,
    setTransactions,
    setNotifications,
    setUserReports,
    setCategorySuggestions,
    syncRequests,
    syncEngagements,
    syncBids,
    syncNotifications,
    syncTransactions,
    helperAddNotification
  });

  // ─── Modularize Provider Actions ────────────────────────────────
  const providerActions = useProviderActions({
    users,
    services,
    jobRequests,
    bids,
    jobEngagements,
    dbCategories,
    setServices,
    setBids,
    setJobEngagements,
    syncEngagements,
    syncNotifications,
    syncBids,
    helperAddNotification
  });

  // ─── Modularize Admin Actions ───────────────────────────────────

  // ─── Modularize Shared Actions ──────────────────────────────────
  const sharedActions = useSharedActions({
    jobEngagements,
    setMessages,
    setNotifications
  });

  return (
    <AppContext.Provider value={{
      users,
      services,
      setServices,
      refreshServices: syncPublicServices,
      jobRequests,
      bids,
      jobEngagements,
      transactions,
      notifications,
      messages,
      categorySuggestions,
      userReports,
      dbCategories,
      refreshCategories,
      updateUserProfile,
      ...seekerActions,
      ...providerActions,
      ...sharedActions,
      isDark,
      toggleTheme,
      refreshEngagements,
      refreshAll,
      user,
      setUser,
      isAuthenticated,
      setIsAuthenticated,
      authLoading,
      unreadMessagesCount,
      syncUnreadMessages
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
