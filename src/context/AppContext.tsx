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
import { apiBrowseServices } from '../api/services.api';
import { apiGetTransactions } from '../api/transactions.api';
import { apiGetConversations } from '../api/messages.api';
import { UserSession } from '../components/auth/LoginContainer';
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
  postJobRequest: (seekerId: string, title: string, category: string, urgency: string, budget: number, description: string) => void;
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
  createServiceListing: (providerId: string, title: string, category: string, price: number, description: string, proofUrl: string, paymentMethods: { cash: boolean; gcash: boolean }) => void;
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
  const [user, setUser] = useState<UserSession | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [authLoading, setAuthLoading] = useState<boolean>(true);

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

  // ─── Session Recovery ──────────────────────────────────────────
  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    if (token) {
      apiGetMe()
        .then((res) => {
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
      const res = await apiBrowseServices();
      if (res.success && Array.isArray(res.data)) {
        setServices(res.data.map(mapServiceToListing));
      }
    } catch {
      // ignore
    }
  }, []);

  const syncRequests = useCallback(async () => {
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
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    syncPublicServices();
    if (token) {
      syncRequests();
      syncBids();
      syncEngagements();
      syncNotifications();
      syncTransactions();
      syncUnreadMessages();
    }
  }, [syncPublicServices, syncRequests, syncBids, syncEngagements, syncNotifications, syncTransactions, syncUnreadMessages]);

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

    // Load private data only if authenticated
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    if (token) {
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

    // Unread message badge — re-sync unread messages count in real-time
    sock.on('message_notification', () => {
      syncUnreadMessages();
    });

    return () => {
      sock.off('notification');
      sock.off('queue_update');
      sock.off('message_notification');
    };
  }, [isAuthenticated, syncNotifications, syncUnreadMessages]);

  // Disconnect socket when user explicitly logs out
  useEffect(() => {
    if (!isAuthenticated) {
      disconnectSocket();
    }
  }, [isAuthenticated]);

  // Sync data automatically upon successful login
  useEffect(() => {
    if (isAuthenticated) {
      syncPublicServices();
      syncRequests();
      syncBids();
      syncEngagements();
      syncNotifications();
      syncTransactions();
      syncUnreadMessages();
    }
  }, [isAuthenticated, syncPublicServices, syncRequests, syncBids, syncEngagements, syncNotifications, syncTransactions, syncUnreadMessages]);

  // ─── Notification polling every 60 seconds when authenticated ──
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) return;

    const interval = setInterval(() => {
      syncNotifications();
      syncUnreadMessages();
    }, 60000);

    return () => clearInterval(interval);
  }, [syncNotifications, syncUnreadMessages]);


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
