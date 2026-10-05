"use client";
import React, { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
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
import { apiGetMe, apiRecoverSession } from '../api/auth.api';
import { clearAccessToken, getSessionGeneration } from '../lib/api/axios';
import { clearApiCache, invalidateApiCache } from '../lib/api/responseCache';
import EmptyState from '../components/ui/EmptyState';
import { hasStoredSessionHint, isPublicEntryRoute } from '../lib/publicRoutes';
import { clearLegacyAuthStorage, clearSessionHint, markSessionPresent } from '../lib/browserStorage';
import { shouldLoadMarketplaceData } from '../lib/routeDataPolicy';


// Modular Helpers and Hooks
import { useSeekerActions } from '../hooks/useSeekerActions';
import { useProviderActions } from '../hooks/useProviderActions';
import { useSharedActions } from '../hooks/useSharedActions';
import { useAppDataSync } from '../hooks/useAppDataSync';
import { useToast } from '../components/ui/Toast';

interface AppContextType {
  users: User[];
  services: ServiceListing[];
  servicesStatus: 'loading' | 'ready' | 'error';
  setServices: React.Dispatch<React.SetStateAction<ServiceListing[]>>;
  refreshServices: () => void;
  jobRequests: JobRequest[];
  bids: Bid[];
  jobEngagements: JobEngagement[];
  requestsStatus: 'loading' | 'ready' | 'error';
  offersStatus: 'loading' | 'ready' | 'error';
  engagementsStatus: 'loading' | 'ready' | 'error';
  transactions: Transaction[];
  notifications: Notification[];
  messages: Message[];
  categorySuggestions: CategorySuggestion[];
  userReports: UserReport[];
  // Live admin-controlled category list. Always sourced from the database.
  // Populated after session recovery and refreshable via refreshCategories().
  // PostRequest, OfferServices, and SeekServices use this — never hardcoded lists.
  dbCategories: { id: string; name: string }[];
  refreshCategories: () => void;

  // Auth helper callbacks
  updateUserProfile: (userId: string, data: Partial<User>) => void;

  // Seeker actions
  postJobRequest: (seekerId: string, title: string, category: string, urgency: import('../lib/requestUrgency').RequestUrgency, budget: number, description: string, paymentMethods?: { cash: boolean; gcash: boolean }) => Promise<boolean | { success: false; error: string; field?: 'title' | 'description' | 'category' }>;
  editJobRequest: (requestId: string, title: string, budget: number, description: string, urgency?: import('../lib/requestUrgency').RequestUrgency) => Promise<(Pick<JobRequest, 'title' | 'budget' | 'description'> & { urgency?: string }) | null>;
  deleteJobRequest: (requestId: string) => Promise<boolean>;
  toggleJobRequestStatus: (requestId: string, currentStatus?: string) => Promise<boolean>;
  acceptBid: (bidId: string, paymentMethod?: 'GCash' | 'On-site Cash') => void;
  declineBid: (bidId: string) => void;
  confirmJobCompletion: (jobId: string) => void;
  disputeJob: (jobId: string, reason: string) => void;
  suggestCategory: (seekerName: string, name: string, description: string) => void;
  bookProviderDirectly: (seekerId: string, serviceId: string, price: number, description: string, paymentMethod: 'GCash' | 'On-site Cash', quantity?: number) => void;

  // Provider actions
  createServiceListing: (
    providerId: string,
    title: string,
    category: string,
    price: number,
    description: string,
    paymentMethods: { cash: boolean; gcash: boolean },
    options?: {
      serviceType?: ServiceListing['serviceType'];
      priceType?: ServiceListing['priceType'];
      estimatedDurationMins?: number;
      queueLimit?: number;
    }
  ) => Promise<{ success: boolean; data?: unknown; error?: string; field?: 'title' | 'description' | 'category' } | void>;
  editServiceListing: (
    serviceId: string,
    title: string,
    price: number,
    description: string,
    options?: {
      priceType?: ServiceListing['priceType'];
      serviceType?: ServiceListing['serviceType'];
      estimatedDurationMins?: number;
      paymentMethods?: { cash: boolean; gcash: boolean };
    }
  ) => Promise<boolean>;
  toggleServiceListingStatus: (serviceId: string) => void;
  deleteServiceListing: (serviceId: string) => void;
  submitBid: (requestId: string, providerId: string, serviceId: string | undefined, price: number, estimatedDuration: number, message: string, availability?: string) => Promise<boolean>;
  respondToDirectBooking: (jobId: string, accept: boolean) => void;
  requestJobApproval: (jobId: string) => void;
  providerStartJob: (id: string) => Promise<void>;

  // Admin actions

  // Shared actions
  sendMessage: (senderId: string, receiverId: string, text: string) => void;
  markNotificationsRead: (userId: string) => void;
  isDark: boolean;
  toggleTheme: () => void;
  refreshEngagements: () => Promise<void>;
  refreshAll: () => void;
  user: UserSession | null;
  setUser: (user: UserSession | null | ((prev: UserSession | null) => UserSession | null)) => void;
  isAuthenticated: boolean;
  setIsAuthenticated: (auth: boolean) => void;
  authLoading: boolean;
  authError: string | null;
  retrySession: () => void;
  unreadMessagesCount: number;
  syncUnreadMessages: () => Promise<void>;
  loadMoreNotifications: () => void;
  hasMoreNotifications: boolean;
  loadMoreTransactions: () => void;
  hasMoreTransactions: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  // Keep the server render and the client's first render identical. Browser
  // preferences are restored after hydration; the root initializer prevents a
  // visible theme flash before React starts.
  const [isDark, setIsDark] = useState(false);

  // Global Auth States
  const [user, setUserState] = useState<UserSession | null>(null);

  const setUser = useCallback((valOrFn: UserSession | null | ((prev: UserSession | null) => UserSession | null)) => {
    setUserState(valOrFn);
  }, []);

  // A non-sensitive boolean is only a session hint. Protected data waits until the
  // HttpOnly refresh cookie has restored an in-memory token and /auth/me passes.
  const [isAuthenticated, setAuthenticated] = useState<boolean>(false);
  const authenticatedRef = useRef(false);
  const publicPage = isPublicEntryRoute(pathname);
  const [sessionChecked, setSessionChecked] = useState(false);
  const [recoveryLoading, setAuthLoading] = useState<boolean>(true);
  // Entering a protected route must wait even if recovery was skipped on the
  // public page. Compute this before effects so protected content cannot flash.
  const authLoading = recoveryLoading || (!publicPage && !sessionChecked && !isAuthenticated);
  const [authError, setAuthError] = useState<string | null>(null);
  const setIsAuthenticated = useCallback((authenticated: boolean) => {
    authenticatedRef.current = authenticated;
    setAuthenticated(authenticated);
    setSessionChecked(true);
    // A verified sign-in can finish before the background cookie check.
    // Let it open the workspace immediately; generation checks reject stale recovery.
    if (authenticated) {
      markSessionPresent();
      setAuthLoading(false);
      setAuthError(null);
    }
  }, []);
  const [recoveryAttempt, setRecoveryAttempt] = useState(0);
  const retrySession = useCallback(() => {
    setAuthError(null);
    setAuthLoading(true);
    setRecoveryAttempt(attempt => attempt + 1);
  }, []);
  useEffect(() => {
    if (!authLoading && isAuthenticated && user?.moderationStatus === 'BANNED' && pathname !== '/account-banned') router.replace('/account-banned');
  }, [authLoading, isAuthenticated, user?.moderationStatus, pathname, router]);
  const { success: toastSuccess, error: toastError } = useToast();

  const {
    services,
    servicesStatus,
    setServices,
    jobRequests,
    setJobRequests,
    bids,
    setBids,
    jobEngagements,
    setJobEngagements,
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
    loadMoreNotifications,
    hasMoreNotifications,
    loadMoreTransactions,
    hasMoreTransactions,
    syncUnreadMessages
  } = useAppDataSync({
    isAuthenticated,
    authLoading,
    shouldLoadMarketplaceData: shouldLoadMarketplaceData(pathname),
    user,
    toastSuccess,
    toastError
  });

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setIsDark(localStorage.getItem('theme') === 'dark');
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  // ─── Session Recovery ──────────────────────────────────────────
  /* eslint-disable react-hooks/set-state-in-effect -- Browser storage determines whether post-hydration recovery is needed; protected routes remain gated before effects run. */
  useEffect(() => {
    clearLegacyAuthStorage();
    // Preserve a session already verified in this tab when returning home.
    if (authenticatedRef.current) return;
    const hadCachedProfile = hasStoredSessionHint();
    // Guests can browse and open account forms while the API is unavailable.
    // Protected routes still check the authoritative HttpOnly cookie even when
    // no profile hint exists (for example after browser storage was cleared).
    if (publicPage && !hadCachedProfile) {
      setAuthLoading(false);
      setAuthError(null);
      setSessionChecked(false);
      return;
    }
    setAuthLoading(true);
    let active = true;
    const recoveryGeneration = getSessionGeneration();

    apiRecoverSession()
        .then((res) => {
          if (!active || getSessionGeneration() !== recoveryGeneration) return;
          if (res.success && res.data?.authenticated !== false && res.data?.user) {
            setAuthError(null);
            const dbUser = res.data.user;
            const names = (dbUser.name || '').split(' ');
            const firstName = names[0] || '';
            const lastName = names.slice(1).join(' ') || '';
            const storedRole = localStorage.getItem('workspaceRole');
            const savedRole: UserSession['role'] = storedRole === 'provider' ? 'provider' : 'seeker';
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
              location: dbUser.location,
              trustScore: dbUser.trustScore,
              verificationStatus: dbUser.verificationStatus,
              emailVerified: dbUser.emailVerified,
              onboardingStatus: dbUser.onboardingStatus,
              moderationStatus: dbUser.moderationStatus,
            };
            setUser(sessionData);
            setIsAuthenticated(true);
          } else {
            clearAccessToken();
            clearSessionHint();
            if (hadCachedProfile && !['account-deleted', 'password-changed'].includes(window.sessionStorage.getItem('servicehub:auth-notice') || '')) window.sessionStorage.setItem('servicehub:auth-notice', 'session-expired');
            setUser(null);
            setIsAuthenticated(false);
          }
        })
        .catch(() => {
          if (!active || getSessionGeneration() !== recoveryGeneration) return;
          // A timeout, canceled read or server failure does not prove sign-out.
          // Keep cached hints/cookies intact, but do not authorize a workspace
          // until the server has verified it. The user can retry in place.
          setAuthError('Could not restore your session. Check your connection and try again.');
        })
        .finally(() => {
          if (active) {
            // A public guest result must not skip a new cookie check when the
            // visitor subsequently enters a protected route.
            setSessionChecked(!publicPage);
            setAuthLoading(false);
          }
        });

    return () => {
      active = false;
    };
  }, [publicPage, setUser, setIsAuthenticated, recoveryAttempt]);
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    if (!authError) return;
    window.addEventListener('online', retrySession);
    return () => window.removeEventListener('online', retrySession);
  }, [authError, retrySession]);

  useEffect(() => {
    const handleAccountDeleted = () => {
      setAuthError(null);
      clearAccessToken();
      clearSessionHint();
      window.sessionStorage.setItem('servicehub:auth-notice', 'account-deleted');
      setIsAuthenticated(false);
      setUser(null);
      clearPrivateData();
    };
    const handleSessionExpired = () => {
      setAuthError(null);
      clearAccessToken();
      clearSessionHint();
      if (!['account-deleted', 'password-changed'].includes(window.sessionStorage.getItem('servicehub:auth-notice') || '')) window.sessionStorage.setItem('servicehub:auth-notice', 'session-expired');
      setIsAuthenticated(false);
      setUser(null);
      clearPrivateData();
    };

    const handleAccountBanned = () => {
      clearApiCache();
      setUser(previous => previous ? { ...previous, moderationStatus: 'BANNED' } : previous);
      clearPrivateData();
      if (window.location.pathname !== '/account-banned') window.location.replace('/account-banned');
    };

    window.addEventListener('auth_session_expired', handleSessionExpired);
    window.addEventListener('account_banned', handleAccountBanned);
    window.addEventListener('account_deleted', handleAccountDeleted);
    return () => {
      window.removeEventListener('auth_session_expired', handleSessionExpired);
      window.removeEventListener('account_banned', handleAccountBanned);
      window.removeEventListener('account_deleted', handleAccountDeleted);
    };
  }, [clearPrivateData, setUser, setIsAuthenticated]);

  useEffect(() => {
    const handleAccountUpdated = async () => {
      try {
        const response = await apiGetMe();
        const updated = response.data.user;
        if (updated.moderationStatus === 'BANNED') {
          window.dispatchEvent(new Event('account_banned'));
          return;
        }
        setUser(previous => previous && previous.id === updated.id ? {
          ...previous,
          moderationStatus: updated.moderationStatus,
          verificationStatus: updated.verificationStatus,
          trustScore: updated.trustScore,
          emailVerified: updated.emailVerified,
        } : previous);
      } catch { /* The shared API handler redirects banned sessions. */ }
    };
    window.addEventListener('servicehub_account_updated', handleAccountUpdated);
    return () => window.removeEventListener('servicehub_account_updated', handleAccountUpdated);
  }, [setUser]);

  // Email-unverified accounts do not join the workspace socket, so they still
  // need a bounded status check to see a new ban without refreshing the page.
  useEffect(() => {
    if (authLoading || !isAuthenticated || !user?.id || user.moderationStatus === 'BANNED') return;
    const check = () => {
      if (!document.hidden) window.dispatchEvent(new Event('servicehub_account_updated'));
    };
    const interval = window.setInterval(check, 5000);
    window.addEventListener('focus', check);
    return () => { window.clearInterval(interval); window.removeEventListener('focus', check); };
  }, [authLoading, isAuthenticated, user?.id, user?.moderationStatus]);

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
  }, [setNotifications]);

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

  const refreshServices = useCallback(() => {
    invalidateApiCache(['services']);
    void syncPublicServices();
  }, [syncPublicServices]);

  return (
    <AppContext.Provider value={{
      users,
      services,
      servicesStatus,
      setServices,
      refreshServices,
      jobRequests,
      bids,
      jobEngagements,
      requestsStatus,
      offersStatus,
      engagementsStatus,
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
      authError,
      retrySession,
      unreadMessagesCount,
      syncUnreadMessages,
      loadMoreNotifications,
      hasMoreNotifications,
      loadMoreTransactions,
      hasMoreTransactions
    }}>
      {/* Session recovery must not replace public sign-in or account-recovery forms. */}
      {authError && !publicPage
        ? <main className="flex min-h-screen items-center justify-center bg-[#f7f6f3] p-5 dark:bg-[#141312]">
            <div className="w-full max-w-lg" role="alert">
              <EmptyState title="Connection interrupted" description={authError} actionLabel="Try again" onAction={retrySession} />
              <button type="button" onClick={() => router.push('/')} className="mt-4 block w-full text-center text-sm underline">Back to home</button>
            </div>
          </main>
        : authLoading || user?.moderationStatus !== 'BANNED' || pathname === '/account-banned'
        ? children
        : <main className="flex min-h-screen items-center justify-center bg-[#151313] text-white" role="status">Opening account notice…</main>}
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
