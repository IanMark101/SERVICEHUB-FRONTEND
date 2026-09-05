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
import { UserSession } from '../components/auth/LoginContainer';
import { apiRecoverSession } from '../api/auth.api';
import { clearAccessToken } from '../lib/api/axios';


// Modular Helpers and Hooks
import { useSeekerActions } from '../hooks/useSeekerActions';
import { useProviderActions } from '../hooks/useProviderActions';
import { useSharedActions } from '../hooks/useSharedActions';
import { useAppDataSync } from '../hooks/useAppDataSync';
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
  acceptBid: (bidId: string, paymentMethod?: 'GCash' | 'Maya' | 'On-site Cash') => void;
  declineBid: (bidId: string) => void;
  confirmJobCompletion: (jobId: string) => void;
  disputeJob: (jobId: string, reason: string) => void;
  suggestCategory: (seekerName: string, name: string, description: string) => void;
  bookProviderDirectly: (seekerId: string, serviceId: string, price: number, description: string, paymentMethod: 'GCash' | 'Maya' | 'On-site Cash') => void;
  cancelQueue: (id: string) => void;

  // Provider actions
  createServiceListing: (
    providerId: string,
    title: string,
    category: string,
    price: number,
    description: string,
    paymentMethods: { cash: boolean; gcash: boolean; maya: boolean; card: boolean },
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
      paymentMethods?: { cash: boolean; gcash: boolean; maya: boolean; card: boolean };
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

  // Cached profile data is only a session hint. Protected data waits until the
  // HttpOnly refresh cookie has restored an in-memory token and /auth/me passes.
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const { success: toastSuccess, error: toastError } = useToast();

  const {
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
  } = useAppDataSync({
    isAuthenticated,
    authLoading,
    user,
    toastSuccess,
    toastError
  });
  // ─── Session Recovery ──────────────────────────────────────────
  useEffect(() => {
    let active = true;
    const hasSessionCandidate = typeof window !== 'undefined' && Boolean(localStorage.getItem('userSession'));
    if (!hasSessionCandidate) {
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
