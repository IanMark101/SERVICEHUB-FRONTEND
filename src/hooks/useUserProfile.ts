"use client";
import { useState, useEffect } from 'react';
import { useApiCacheRefresh } from './useApiCacheRefresh';
import { usePathname } from 'next/navigation';
import { useApp } from '../context/AppContext';
import { UserSession } from '../components/auth/LoginContainer';
import {
  apiGetPublicProfile,
  apiUpdateProfile,
  apiGetTrustHistory,
} from '../api/auth.api';
import { apiGetProviderSummary } from '../api/ai.api';
import { useToast } from '../components/ui/Toast';
import { getApiErrorMessage, getApiErrorStatus } from '../lib/api/errors';
import type { JobEngagement } from '../types';
import type { ProfileReviewContext, ProfileReviewStatsByContext } from '../types/reviews';

interface ProfileReview {
  id: string;
  rating: number;
  text?: string;
  comment?: string;
  createdAt?: string;
  authorName?: string;
  authorAvatar?: string;
  author?: { name?: string; avatarUrl?: string };
  reviewContext?: ProfileReviewContext;
}
interface PublicProfile extends Partial<UserSession> {
  name?: string;
  role?: UserSession['role'];
  facebookUrl?: string;
  instagramUrl?: string;
  websiteUrl?: string;
  createdAt?: string;
  completedServiceCount?: number;
  averageRating?: number;
  availability?: string;
  languages?: string;
  reviews?: ProfileReview[];
  reviewStats?: ProfileReviewStatsByContext;
}

export interface UseUserProfileProps {
  targetUser: UserSession;
  isOwnProfile?: boolean;
  initialTab?: 'overview' | 'reviews' | 'trust' | 'verification' | 'settings';
  onProfileUpdated?: (updated: Partial<UserSession>) => void;
}

export type UseUserProfileStateProps = UseUserProfileProps;

export function useUserProfile({
  targetUser,
  isOwnProfile = false,
  initialTab,
  onProfileUpdated,
}: UseUserProfileProps) {
  const { isDark, setUser, user, toggleTheme, services = [], jobRequests = [], bids = [], jobEngagements = [] } = useApp();
  const { success: toastSuccess, error: toastError } = useToast();

  // Active Job Lock: check if user has ongoing/in-progress service engagements
  const hasActiveEngagements = jobEngagements.some(
    (je: JobEngagement) =>
      (je.providerId === targetUser?.id || je.seekerId === targetUser?.id) &&
      je.status !== 'completed' &&
      je.status !== 'canceled'
  );

  // Phone Password Confirmation Modal state
  const [phonePasswordModalOpen, setPhonePasswordModalOpen] = useState(false);
  const [phonePasswordError, setPhonePasswordError] = useState<string | null>(null);

  const [profileState, setProfileState] = useState<{
    userId: string; data: PublicProfile | null; error: boolean;
  }>({ userId: targetUser?.id, data: null, error: false });
  const profile = profileState.userId === targetUser?.id ? profileState.data : null;
  const profileLoadError = profileState.userId === targetUser?.id && profileState.error && !profile;
  const profileRefreshError = profileState.userId === targetUser?.id && profileState.error && !!profile;
  // A background refresh must not unmount the already loaded profile or tabs.
  const loading = !profile && !profileLoadError;

  // AI Summary state
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [aiReason, setAiReason] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiLoaded, setAiLoaded] = useState(false);

  // Trust History — loaded from DB, never fabricated
  const trustScope = JSON.stringify([targetUser?.id, user?.id, user?.role]);
  const [trustState, setTrustState] = useState<{
    scope: string;
    events: { id: string; delta: number; reason: string; scoreBefore: number; scoreAfter: number; createdAt: string }[];
    loaded: boolean; error: boolean;
  }>({ scope: trustScope, events: [], loaded: false, error: false });
  const currentTrust = trustState.scope === trustScope ? trustState : null;
  const trustHistory = currentTrust?.events ?? [];
  const trustHistoryError = currentTrust?.error ?? false;
  const trustHistoryLoading = !currentTrust?.loaded && !trustHistoryError;

  // UI state
  const [activeTab, setActiveTab] = useState<'overview' | 'reviews' | 'trust' | 'verification' | 'settings'>(() => {
    if (initialTab) return initialTab;
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get('tab');
      if (params.get('verify') === 'true' || tab === 'verification') return 'verification';
      if (tab === 'reviews' || tab === 'trust' || tab === 'settings' || tab === 'overview') return tab;
    }
    return 'overview';
  });
  const [showEdit, setShowEdit] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [cacheRevision, setCacheRevision] = useState(0);
  useApiCacheRefresh(['profiles', 'reviews', 'summaries'], () => setCacheRevision(value => value + 1), !showEdit && !phonePasswordModalOpen);

  // Query-string tab changes select a section without remounting its profile.
  useEffect(() => {
    if (!initialTab) return;
    const timer = window.setTimeout(() => setActiveTab(initialTab), 0);
    return () => window.clearTimeout(timer);
  }, [initialTab]);

  // Forms
  const [editForm, setEditForm] = useState({
    name: '',
    bio: '',
    phone: '',
    location: '',
    avatarUrl: '',
    facebookUrl: '',
    instagramUrl: '',
    websiteUrl: '',
    occupation: '',
    languages: '',
    availability: '',
  });
  const [saving, setSaving] = useState(false);


  // Fetch Public Profile
  useEffect(() => {
    if (!targetUser?.id) return;
    const userId = targetUser.id;
    let active = true;
    const timer = window.setTimeout(() => {
      setProfileState(previous => previous.userId === userId
        ? { ...previous, error: false }
        : { userId, data: null, error: false });
      apiGetPublicProfile(userId)
      .then((res: { success: boolean; data: PublicProfile }) => {
        if (!active) return;
        if (!res.success || !res.data) throw new Error('Profile could not load.');
          setProfileState({ userId, data: res.data, error: false });
          setEditForm(prev => ({
            ...prev,
            name: res.data.name || '',
            bio: res.data.bio || '',
            phone: res.data.phone || '',
            location: res.data.location || '',
            avatarUrl: res.data.avatarUrl || '',
            facebookUrl: res.data.facebookUrl || '',
            instagramUrl: res.data.instagramUrl || '',
            websiteUrl: res.data.websiteUrl || '',
          }));

          if (isOwnProfile && setUser) {
            setUser((prev: UserSession | null) => {
              if (!prev) return prev;
              const names = (res.data.name || '').split(' ');
              return {
                ...prev,
                firstName: names[0] || prev.firstName,
                lastName: names.slice(1).join(' ') || prev.lastName,
                avatarUrl: res.data.avatarUrl !== undefined ? (res.data.avatarUrl || '') : prev.avatarUrl,
                bio: res.data.bio !== undefined ? (res.data.bio || '') : prev.bio,
                phone: res.data.phone !== undefined ? res.data.phone : prev.phone,
                location: res.data.location !== undefined ? res.data.location : prev.location,
                trustScore: res.data.trustScore !== undefined ? res.data.trustScore : prev.trustScore,
                verificationStatus: res.data.verificationStatus || prev.verificationStatus,
              };
            });
          }
      })
      .catch(error => {
        if (!active) return;
        const status = getApiErrorStatus(error);
        const unavailable = status === 401 || status === 403 || status === 404 || status === 410;
        setProfileState(previous => ({ userId,
          data: !unavailable && previous.userId === userId ? previous.data : null,
          error: true,
        }));
      });
    }, 0);
    return () => { active = false; window.clearTimeout(timer); };
  }, [targetUser?.id, isOwnProfile, setUser, cacheRevision]);

  // Fetch AI Summary for Provider
  useEffect(() => {
    if (!targetUser?.id || targetUser.role !== 'provider') return;
    const timer = window.setTimeout(() => {
      setAiLoading(true);
      apiGetProviderSummary(targetUser.id)
      .then((res: { success: boolean; data: { summary?: string | null; reason?: string | null } }) => {
        if (res.success && res.data.summary) setAiSummary(res.data.summary);
        else if (res.success && res.data.reason) setAiReason(res.data.reason);
      })
      .catch(() => setAiReason('Could not load AI summary.'))
      .finally(() => { setAiLoading(false); setAiLoaded(true); });
    }, 0);
    return () => window.clearTimeout(timer);
  }, [targetUser?.id, targetUser?.role, cacheRevision]);

  // Fetch trust score history & milestones for the viewed profile
  useEffect(() => {
    if (!targetUser?.id) return;
    let active = true;
    const timer = window.setTimeout(() => {
      setTrustState(previous => previous.scope === trustScope
        ? { ...previous, error: false }
        : { scope: trustScope, events: [], loaded: false, error: false });
      apiGetTrustHistory(targetUser.id)
      .then(res => {
        if (!active) return;
        if (res.success && Array.isArray(res.data)) {
          setTrustState({ scope: trustScope, events: res.data, loaded: true, error: false });
        } else throw new Error('Trust history could not load.');
      })
      .catch(error => {
        if (!active) return;
        const status = getApiErrorStatus(error);
        const unavailable = status === 401 || status === 403 || status === 404 || status === 410;
        setTrustState(previous => previous.scope === trustScope && !unavailable
          ? { ...previous, error: true }
          : { scope: trustScope, events: [], loaded: false, error: true });
      });
    }, 0);
    return () => { active = false; window.clearTimeout(timer); };
  }, [targetUser?.id, trustScope, cacheRevision]);

  // Derived Properties
  const displayName = profile?.name || `${targetUser?.firstName || ''} ${targetUser?.lastName || ''}`.trim() || 'ServiceHub User';
  const trustScore = profile?.trustScore ?? targetUser?.trustScore ?? 50;
  const verStatus = profile?.verificationStatus || targetUser?.verificationStatus || 'UNVERIFIED';
  const avatarUrl = profile?.avatarUrl || targetUser?.avatarUrl || '';
  const bio = profile?.bio ?? targetUser?.bio ?? '';
  const facebookUrl = profile?.facebookUrl || '';
  const instagramUrl = profile?.instagramUrl || '';
  const websiteUrl = profile?.websiteUrl || '';
  const location = profile?.location || targetUser?.location || '';
  const phone = profile?.phone || targetUser?.phone || '';
  const email = profile?.email || targetUser?.email || '';
  
  const pathname = usePathname();
  const isProviderWorkspace = pathname?.startsWith('/provider');
  const isAdminWorkspace = pathname?.startsWith('/admin');
  const isSeekerWorkspace = pathname?.startsWith('/seeker');
  const rawAccountRole = String(profile?.role || targetUser?.role || 'seeker').toLowerCase();
  const accountRole = rawAccountRole === 'admin' ? 'admin' : rawAccountRole === 'provider' ? 'provider' : 'seeker';
  const workspaceRole: 'seeker' | 'provider' | 'admin' = isProviderWorkspace
    ? 'provider'
    : isAdminWorkspace
    ? 'admin'
    : isSeekerWorkspace
    ? 'seeker'
    : accountRole;

  const role = workspaceRole;

  const createdAt = profile?.createdAt;
  const completedJobs = profile?.completedServiceCount || 0;

  const rawRating = profile?.averageRating;
  const reviews: ProfileReview[] = Array.isArray(profile?.reviews) ? profile.reviews : [];
  const reviewStats = profile?.reviewStats;
  const reviewCount = reviewStats ? reviewStats.PROVIDER.reviewCount + reviewStats.SEEKER.reviewCount : reviews.length;
  const averageRating: number = typeof rawRating === 'number' && Number.isFinite(rawRating) && rawRating >= 0
    ? rawRating
    : 0;

  const availability = profile?.availability || '';
  const languages = profile?.languages || '';

  // Provider Categories & Services
  const providerServices = services.filter(s => s.providerId === targetUser?.id);
  const providerCategories = Array.from(new Set(providerServices.map(s => s.category)));
  const displayCategories = (role === 'provider' || accountRole === 'provider') ? providerCategories : [];

  // Completion Score
  const missingItems: { label: string; key: string }[] = [];
  let completionScore = 0;
  if (avatarUrl) completionScore += 15; else missingItems.push({ label: 'Profile Picture', key: 'avatar' });
  if (bio && bio.length > 10) completionScore += 20; else missingItems.push({ label: 'Bio / Description', key: 'bio' });
  if (phone) completionScore += 15; else missingItems.push({ label: 'Phone Number', key: 'phone' });
  if (location) completionScore += 15; else missingItems.push({ label: 'Cordova Barangay Location', key: 'location' });
  if (verStatus === 'APPROVED') completionScore += 25; else missingItems.push({ label: 'Residency Verification', key: 'verification' });
  if (completedJobs > 0 || providerServices.length > 0) completionScore += 10; else missingItems.push({ label: 'Active Listing or Booking', key: 'listing' });

  // Rating Distribution breakdown (5★ to 1★)
  const ratingDistribution = [5, 4, 3, 2, 1].map(star => {
    const serviceReviews = reviews.filter(review => review.reviewContext === 'PROVIDER');
    const count = reviewStats?.PROVIDER.ratingDistribution.find(bucket => bucket.star === star)?.count ?? serviceReviews.filter(r => r.rating === star).length;
    const total = reviewStats?.PROVIDER.reviewCount ?? serviceReviews.length;
    const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
    return { star, count, percentage };
  });

  // Derived User Activity (Posted Service Listings, Requests, and Offers)
  const userServices = (services || []).filter(s => s.providerId === targetUser?.id);
  const userRequests = (jobRequests || []).filter(r => r.seekerId === targetUser?.id && r.status !== 'CANCELED' && (r.status as string) !== 'canceled');
  const userBids = (bids || []).filter(b => b.providerId === targetUser?.id && b.status !== 'CANCELED' && (b.status as string) !== 'canceled');

  // trustHistory is now loaded from the DB above — do NOT reconstruct it here.

  // Handlers
  const handleShareProfile = () => {
    const targetId = targetUser?.id || '';
    const profileUrl = `${window.location.origin}/profile/${encodeURIComponent(targetId)}`;
    navigator.clipboard.writeText(profileUrl);
    toastSuccess('Profile link copied to clipboard!');
  };

  const handleSaveProfile = async (confirmedPassword?: string) => {
    const originalPhone = (profile?.phone || targetUser?.phone || '').trim();
    const newPhone = (editForm.phone || '').trim();
    const isPhoneChanging = newPhone !== '' && newPhone !== originalPhone;

    if (isPhoneChanging) {
      if (hasActiveEngagements) {
        toastError('Mobile number cannot be changed while you have active service engagements in progress.');
        return;
      }
      if (!confirmedPassword) {
        setPhonePasswordError(null);
        setPhonePasswordModalOpen(true);
        return;
      }
    }

    setSaving(true);
    try {
      const res = await apiUpdateProfile({
        name: editForm.name,
        bio: editForm.bio,
        phone: editForm.phone,
        location: editForm.location,
        avatarUrl: editForm.avatarUrl,
        facebookUrl: editForm.facebookUrl,
        instagramUrl: editForm.instagramUrl,
        websiteUrl: editForm.websiteUrl,
        ...(confirmedPassword ? { currentPassword: confirmedPassword } : {}),
      });
      if (res.success) {
        setProfileState(current => ({ userId: targetUser.id, data: { ...(current.userId === targetUser.id ? current.data : null), ...res.data }, error: false }));
        setPhonePasswordModalOpen(false);
        setPhonePasswordError(null);
        if (onProfileUpdated) {
          const names = (res.data.name || '').split(' ');
          onProfileUpdated({
            firstName: names[0] || '',
            lastName: names.slice(1).join(' ') || '',
            bio: res.data.bio,
            phone: res.data.phone,
            avatarUrl: res.data.avatarUrl,
          });
        }
        if (user && setUser) {
          const names = (res.data.name || '').split(' ');
          setUser({
            ...user,
            firstName: names[0] || user.firstName,
            lastName: names.slice(1).join(' ') || user.lastName,
            bio: res.data.bio,
            phone: res.data.phone,
            location: res.data.location,
            avatarUrl: res.data.avatarUrl
          });
        }
        setShowEdit(false);
        toastSuccess('Profile updated successfully');
      }
    } catch (err: unknown) {
      const errMsg = getApiErrorMessage(err, 'Failed to update profile');
      if (phonePasswordModalOpen) {
        setPhonePasswordError(errMsg);
      }
      toastError(errMsg);
    } finally {
      setSaving(false);
    }
  };

  // Styling helper classes
  const cardBg = 'bg-[color:var(--workspace-surface)] border-[color:var(--workspace-border)] shadow-sm';
  const innerBg = 'bg-[color:var(--workspace-surface-muted)] border-[color:var(--workspace-border)]';
  const labelText = 'text-[color:var(--workspace-muted)]';
  const headingText = 'text-[color:var(--workspace-ink)]';
  const focusBorder = workspaceRole === 'provider'
    ? (isDark ? 'focus:border-emerald-600' : 'focus:border-emerald-500')
    : workspaceRole === 'admin'
    ? (isDark ? 'focus:border-blue-600' : 'focus:border-blue-500')
    : (isDark ? 'focus:border-orange-600' : 'focus:border-orange-500');

  const inputClass = `w-full px-3.5 py-2.5 rounded-xl border text-sm transition-colors ${
    isDark ? 'bg-charcoal-inset border-neutral-800 text-[#f2efe9] placeholder-neutral-600' : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400'
  } ${focusBorder} focus:outline-none focus:ring-1`;

  const usernameHandle = `@${displayName.toLowerCase().replace(/[^a-z0-9]/g, '') || 'cordova_user'}`;
  const responseRate = accountRole === 'provider' ? '< 1 hr' : 'Within minutes';

  return {
    isDark,
    toggleTheme,
    loading,
    profileLoadError,
    profileRefreshError,
    retryProfile: () => setCacheRevision(value => value + 1),
    profile,
    displayName,
    usernameHandle,
    responseRate,
    trustScore,
    trustHistory,
    verStatus,
    avatarUrl,
    bio,
    facebookUrl,
    instagramUrl,
    websiteUrl,
    location,
    phone,
    email,
    role,
    workspaceRole,
    accountRole,
    availability,
    languages,
    createdAt,
    completedJobs,
    averageRating,
    ratingDistribution,
    reviews,
    reviewStats,
    reviewCount,
    providerServices,
    userServices,
    userRequests,
    userBids,
    jobRequests,
    displayCategories,
    completionScore,
    missingItems,
    activeTab,
    setActiveTab,
    showEdit,
    setShowEdit,
    showSettingsModal,
    setShowSettingsModal,
    showPassword,
    setShowPassword,
    editForm,
    setEditForm,
    saving,
    handleSaveProfile,
    hasActiveEngagements,
    phonePasswordModalOpen,
    setPhonePasswordModalOpen,
    phonePasswordError,
    setPhonePasswordError,
    handleShareProfile,
    aiSummary,
    aiReason,
    aiLoading,
    aiLoaded,
    trustHistoryLoading,
    trustHistoryError,
    retryTrustHistory: () => setCacheRevision(value => value + 1),
    isViewerVerified: user?.verificationStatus === 'APPROVED',
    cardBg,
    innerBg,
    labelText,
    headingText,
    inputClass,
  };
}

// Backward compatibility alias
export const useUserProfileState = useUserProfile;
export default useUserProfile;
