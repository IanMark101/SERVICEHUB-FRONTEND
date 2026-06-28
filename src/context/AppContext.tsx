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
import {
  mockUsers,
  mockServices,
  mockJobRequests,
  mockBids,
  mockJobEngagements,
  mockTransactions,
  mockNotifications,
  mockMessages,
  mockCategorySuggestions,
  mockUserReports
} from './mockData';
import { apiGetCategories } from '../api/categories.api';
import { apiGetRequests } from '../api/requests.api';
import { apiGetReceivedOffers, apiGetMyOffers } from '../api/offers.api';
import { apiGetMyEngagements, apiConfirmOnlineBooking } from '../api/bookings.api';
import { apiGetNotifications } from '../api/notifications.api';
import { apiBrowseServices } from '../api/services.api';
import { apiGetTransactions } from '../api/transactions.api';
import { UserSession } from '../components/LoginSignup';
import { apiGetMe } from '../api/auth.api';
import { connectSocket, disconnectSocket } from '../lib/socket';


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
import { useAdminActions } from '../hooks/useAdminActions';
import { useSharedActions } from '../hooks/useSharedActions';

interface AppContextType {
  users: User[];
  services: ServiceListing[];
  jobRequests: JobRequest[];
  bids: Bid[];
  jobEngagements: JobEngagement[];
  transactions: Transaction[];
  notifications: Notification[];
  messages: Message[];
  categorySuggestions: CategorySuggestion[];
  userReports: UserReport[];

  // Auth helper callbacks
  updateUserProfile: (userId: string, data: Partial<User>) => void;

  // Seeker actions
  postJobRequest: (seekerId: string, title: string, category: string, urgency: 'low' | 'medium' | 'high', budget: number, description: string) => void;
  editJobRequest: (requestId: string, title: string, budget: number, description: string) => void;
  deleteJobRequest: (requestId: string) => void;
  acceptBid: (bidId: string, paymentMethod?: 'GCash' | 'On-site Cash') => void;
  declineBid: (bidId: string) => void;
  confirmJobCompletion: (jobId: string) => void;
  disputeJob: (jobId: string, reason: string) => void;
  suggestCategory: (seekerName: string, name: string, description: string) => void;
  bookProviderDirectly: (seekerId: string, serviceId: string, price: number, description: string, paymentMethod: 'GCash' | 'On-site Cash') => void;
  cancelQueue: (id: string) => void;

  // Provider actions
  createServiceListing: (providerId: string, title: string, category: string, price: number, description: string, proofUrl: string) => void;
  editServiceListing: (serviceId: string, title: string, price: number, description: string) => void;
  toggleServiceListingStatus: (serviceId: string) => void;
  submitBid: (requestId: string, providerId: string, price: number, message: string) => void;
  respondToDirectBooking: (jobId: string, accept: boolean) => void;
  requestJobApproval: (jobId: string) => void;
  providerStartJob: (id: string) => void;
  providerRemoveFromQueue: (id: string) => void;

  // Admin actions
  verifyProvider: (providerId: string, approve: boolean) => void;
  approveCategorySuggestion: (suggestionId: string, approve: boolean) => void;
  resolveDispute: (jobId: string, payoutToProvider: boolean) => void;

  // Shared actions
  sendMessage: (senderId: string, receiverId: string, text: string) => void;
  markNotificationsRead: (userId: string) => void;
  isDark: boolean;
  toggleTheme: () => void;
  refreshEngagements: () => void;
  refreshAll: () => void;
  user: UserSession | null;
  setUser: (user: UserSession | null) => void;
  isAuthenticated: boolean;
  setIsAuthenticated: (auth: boolean) => void;
  authLoading: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [isDark, setIsDark] = useState<boolean>(false);

  // Global Auth States
  const [user, setUser] = useState<UserSession | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [authLoading, setAuthLoading] = useState<boolean>(true);

  // Data states — start with mock data as fallback, replaced by live API on mount
  const [services, setServices] = useState<ServiceListing[]>(mockServices);
  const [jobRequests, setJobRequests] = useState<JobRequest[]>(mockJobRequests);
  const [bids, setBids] = useState<Bid[]>(mockBids);
  const [jobEngagements, setJobEngagements] = useState<JobEngagement[]>(mockJobEngagements);
  const [transactions, setTransactions] = useState<Transaction[]>(mockTransactions);
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const [categorySuggestions, setCategorySuggestions] = useState<CategorySuggestion[]>(mockCategorySuggestions);
  const [userReports, setUserReports] = useState<UserReport[]>(mockUserReports);
  const [dbCategories, setDbCategories] = useState<{ id: string; name: string }[]>([]);

  // ─── Session Recovery ──────────────────────────────────────────
  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    if (token) {
      apiGetMe()
        .then((res) => {
          if (res.success) {
            const dbUser = res.data.user;
            const names = dbUser.name.split(' ');
            const firstName = names[0] || '';
            const lastName = names.slice(1).join(' ') || '';
            const savedRole = (localStorage.getItem('workspaceRole') as any) || 'seeker';

            const sessionData: UserSession = {
              id: dbUser.id,
              email: dbUser.email,
              firstName,
              lastName,
              role: savedRole,
              avatarUrl: dbUser.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
              bio: dbUser.bio || '',
              phone: dbUser.phone,
              trustScore: dbUser.trustScore,
              verificationStatus: dbUser.verificationStatus,
              emailVerified: dbUser.emailVerified,
            };
            setUser(sessionData);
            setIsAuthenticated(true);
          } else {
            localStorage.removeItem('accessToken');
          }
          setAuthLoading(false);
        })
        .catch(() => {
          localStorage.removeItem('accessToken');
          setAuthLoading(false);
        });
    } else {
      setAuthLoading(false);
    }

    const handleSessionExpired = () => {
      setIsAuthenticated(false);
      setUser(null);
    };

    window.addEventListener('auth_session_expired', handleSessionExpired);
    return () => {
      window.removeEventListener('auth_session_expired', handleSessionExpired);
    };
  }, []);

  const toggleTheme = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    localStorage.setItem('theme', nextDark ? 'dark' : 'light');
    if (typeof document !== 'undefined') {
      if (nextDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  };

  // ─── Live Data Sync Helpers ────────────────────────────────────

  const syncPublicServices = useCallback(async () => {
    try {
      const res = await apiBrowseServices();
      if (res.success && Array.isArray(res.data) && res.data.length > 0) {
        setServices(res.data.map(mapServiceToListing));
      }
    } catch {
      // silently keep mock data as fallback
    }
  }, []);

  const syncRequests = useCallback(async () => {
    try {
      const res = await apiGetRequests();
      if (res.success && Array.isArray(res.data) && res.data.length > 0) {
        const mapped = res.data.map(mapRequestToJobRequest);
        const dbIds = new Set(mapped.map((x: JobRequest) => x.id));
        setJobRequests([
          ...mapped,
          ...mockJobRequests.filter(m => !dbIds.has(m.id))
        ]);
      }
    } catch {
      // keep mock fallback
    }
  }, []);

  const syncBids = useCallback(async () => {
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

      const allOffers = [...receivedOffers, ...myOffers];
      const dbIds = new Set(allOffers.map((b: Bid) => b.id));
      setBids([
        ...allOffers,
        ...mockBids.filter(m => !dbIds.has(m.id))
      ]);
    } catch {
      // keep mock fallback
    }
  }, []);

  const syncEngagements = useCallback(async () => {
    try {
      const res = await apiGetMyEngagements();
      if (res.success) {
        const dbBookings = res.data.bookings || [];
        const dbCompleted = res.data.completedServices || [];

        const mappedBookings = dbBookings.map(mapBookingToEngagement);
        const mappedCompleted = dbCompleted.map(mapCompletedServiceToEngagement);

        const dbIds = new Set([...mappedBookings, ...mappedCompleted].map((x: any) => x.id));
        setJobEngagements([
          ...mappedBookings,
          ...mappedCompleted,
          ...mockJobEngagements.filter(m => !dbIds.has(m.id))
        ]);

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

        const txIds = new Set(txs.map((x: Transaction) => x.id));
        setTransactions([
          ...txs,
          ...mockTransactions.filter(t => !txIds.has(t.id))
        ]);
      }
    } catch {
      // keep mock fallback
    }
  }, []);

  const syncNotifications = useCallback(async () => {
    try {
      const res = await apiGetNotifications();
      if (res.success && Array.isArray(res.data)) {
        const mapped = res.data.map(mapDbNotification);
        const dbIds = new Set(mapped.map((n: Notification) => n.id));
        setNotifications([
          ...mapped,
          ...mockNotifications.filter(m => !dbIds.has(m.id))
        ]);
      }
    } catch {
      // keep mock fallback
    }
  }, []);

  const syncTransactions = useCallback(async () => {
    try {
      const res = await apiGetTransactions();
      if (res.success && Array.isArray(res.data) && res.data.length > 0) {
        const mapped = res.data.map(mapDbTransaction);
        const dbIds = new Set(mapped.map((t: Transaction) => t.id));
        setTransactions([
          ...mapped,
          ...mockTransactions.filter(m => !dbIds.has(m.id))
        ]);
      }
    } catch {
      // keep mock fallback
    }
  }, []);

  const refreshEngagements = useCallback(() => {
    syncEngagements();
  }, [syncEngagements]);

  const refreshAll = useCallback(() => {
    const token = localStorage.getItem('accessToken');
    syncPublicServices();
    syncRequests();
    if (token) {
      syncBids();
      syncEngagements();
      syncNotifications();
      syncTransactions();
    }
  }, [syncPublicServices, syncRequests, syncBids, syncEngagements, syncNotifications, syncTransactions]);

  // ─── Initial Data Load on Mount ────────────────────────────────
  useEffect(() => {
    // Restore theme
    if (typeof window !== "undefined") {
      const savedDark = localStorage.getItem("theme") === "dark";
      setIsDark(savedDark);
      if (savedDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }

    // Always load categories and public services
    apiGetCategories()
      .then((res) => {
        if (res.success && Array.isArray(res.data)) {
          setDbCategories(res.data);
        }
      })
      .catch(() => { });

    syncPublicServices();
    syncRequests();

    // Load private data only if authenticated
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    if (token) {
      syncBids();
      syncEngagements();
      syncNotifications();
      syncTransactions();

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
                alert("Payment completed and booking confirmed! " + (res.message || ""));
                refreshAll();
              } else {
                alert("Failed to confirm booking: " + (res.error || "Unknown error"));
              }
            })
            .catch((err) => {
              console.error("Error confirming online booking:", err);
              alert("Error confirming online booking: " + (err.response?.data?.error || err.message));
            });
        }
      }
    }
  }, [refreshAll]);

  // ─── Socket.io — connect when authenticated, disconnect on logout ───
  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    if (!token || !isAuthenticated) return;

    const sock = connectSocket(token);

    // Real-time notification badge
    sock.on('notification', () => {
      syncNotifications();
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
    });

    // Unread message badge — re-sync notifications to update badge
    sock.on('message_notification', () => {
      syncNotifications();
    });

    return () => {
      sock.off('notification');
      sock.off('queue_update');
      sock.off('message_notification');
    };
  }, [isAuthenticated, syncNotifications]);

  // Disconnect socket when user explicitly logs out
  useEffect(() => {
    if (!isAuthenticated) {
      disconnectSocket();
    }
  }, [isAuthenticated]);

  // ─── Notification polling every 60 seconds when authenticated ──
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) return;

    const interval = setInterval(() => {
      syncNotifications();
    }, 60000);

    return () => clearInterval(interval);
  }, [syncNotifications]);


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
  const adminActions = useAdminActions({
    jobEngagements,
    setUsers,
    setCategorySuggestions,
    setJobEngagements,
    setTransactions,
    setUserReports,
    helperAddNotification
  });

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
      jobRequests,
      bids,
      jobEngagements,
      transactions,
      notifications,
      messages,
      categorySuggestions,
      userReports,
      updateUserProfile,
      ...seekerActions,
      ...providerActions,
      ...adminActions,
      ...sharedActions,
      isDark,
      toggleTheme,
      refreshEngagements,
      refreshAll,
      user,
      setUser,
      isAuthenticated,
      setIsAuthenticated,
      authLoading
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
