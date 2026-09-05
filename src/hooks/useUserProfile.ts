"use client";
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useApp } from '../context/AppContext';
import { UserSession } from '../components/auth/LoginContainer';
import {
  apiGetPublicProfile,
  apiUpdateProfile,
  apiChangePassword,
  apiGetTrustHistory,
} from '../api/auth.api';
import { apiGetProviderSummary } from '../api/ai.api';
import { useToast } from '../components/ui/Toast';

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
    (je: any) =>
      (je.providerId === targetUser?.id || je.seekerId === targetUser?.id) &&
      je.status !== 'completed' &&
      je.status !== 'canceled'
  );

  // Phone Password Confirmation Modal state
  const [phonePasswordModalOpen, setPhonePasswordModalOpen] = useState(false);
  const [phonePasswordError, setPhonePasswordError] = useState<string | null>(null);

  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // AI Summary state
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [aiReason, setAiReason] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiLoaded, setAiLoaded] = useState(false);

  // Trust History — loaded from DB, never fabricated
  const [trustHistory, setTrustHistory] = useState<{
    id: string;
    delta: number;
    reason: string;
    scoreBefore: number;
    scoreAfter: number;
    createdAt: string;
  }[]>([]);
  const [trustHistoryLoading, setTrustHistoryLoading] = useState(false);

  // UI state
  const [activeTab, setActiveTab] = useState<'overview' | 'reviews' | 'trust' | 'verification' | 'settings'>(
    initialTab || 'overview'
  );

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    } else if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get('tab');
      if (params.get('verify') === 'true' || tab === 'verification') {
        setActiveTab('verification');
      } else if (tab === 'reviews') {
        setActiveTab('reviews');
      } else if (tab === 'trust') {
        setActiveTab('trust');
      } else if (tab === 'settings') {
        setActiveTab('settings');
      } else if (tab === 'overview') {
        setActiveTab('overview');
      }
    }
  }, [initialTab]);
  const [showEdit, setShowEdit] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Settings states
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [publicProfileVisible, setPublicProfileVisible] = useState(true);

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

  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [pwSaving, setPwSaving] = useState(false);

  // Fetch Public Profile
  useEffect(() => {
    if (!targetUser?.id) return;
    setLoading(true);
    apiGetPublicProfile(targetUser.id)
      .then((res: any) => {
        if (res.success) {
          setProfile(res.data);
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
                trustScore: res.data.trustScore !== undefined ? res.data.trustScore : prev.trustScore,
                verificationStatus: res.data.verificationStatus || prev.verificationStatus,
              };
            });
          }
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [targetUser?.id, isOwnProfile, setUser]);

  // Fetch AI Summary for Provider
  useEffect(() => {
    if (!targetUser?.id || targetUser.role !== 'provider') return;
    setAiLoading(true);
    apiGetProviderSummary(targetUser.id)
      .then((res: any) => {
        if (res.success && res.data.summary) setAiSummary(res.data.summary);
        else if (res.success && res.data.reason) setAiReason(res.data.reason);
      })
      .catch(() => setAiReason('Could not load AI summary.'))
      .finally(() => { setAiLoading(false); setAiLoaded(true); });
  }, [targetUser?.id, targetUser?.role]);

  // Fetch trust score history & milestones for the viewed profile
  useEffect(() => {
    if (!targetUser?.id) return;
    if (user?.id !== targetUser.id && user?.role !== 'admin') {
      setTrustHistory([]);
      setTrustHistoryLoading(false);
      return;
    }
    setTrustHistoryLoading(true);
    apiGetTrustHistory(targetUser.id)
      .then(res => {
        if (res.success && Array.isArray(res.data)) {
          setTrustHistory(res.data);
        }
      })
      .catch(() => {})
      .finally(() => setTrustHistoryLoading(false));
  }, [targetUser?.id, user?.id, user?.role]);

  // Derived Properties
  const displayName = profile?.name || `${targetUser?.firstName || ''} ${targetUser?.lastName || ''}`.trim() || 'ServiceHub User';
  const trustScore = profile?.trustScore || targetUser?.trustScore || 50;
  const verStatus = profile?.verificationStatus || targetUser?.verificationStatus || 'UNVERIFIED';
  const avatarUrl = profile?.avatarUrl || targetUser?.avatarUrl || '';
  const bio = profile?.bio || targetUser?.bio || 'Active member on ServiceHub Cordova. Looking for reliable local service providers.';
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
  const workspaceRole: 'seeker' | 'provider' | 'admin' = isProviderWorkspace
    ? 'provider'
    : isAdminWorkspace
    ? 'admin'
    : isSeekerWorkspace
    ? 'seeker'
    : (targetUser?.role as any) || 'seeker';

  const role = workspaceRole;
  const accountRole = targetUser?.role || profile?.role || 'seeker';

  const createdAt = profile?.createdAt;
  const completedJobs = profile?.completedServiceCount || 0;

  const rawRating = profile?.averageRating;
  const reviews: any[] = Array.isArray(profile?.reviews) ? profile.reviews : [];
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
    const count = reviews.filter(r => Math.round(r.rating) === star).length;
    const percentage = reviews.length > 0 ? Math.round((count / reviews.length) * 100) : 0;
    return { star, count, percentage };
  });

  // Derived User Activity (Posted Service Listings, Requests, and Offers)
  const userServices = (services || []).filter(s => s.providerId === targetUser?.id);
  const userRequests = (jobRequests || []).filter(r => (r.seekerId === targetUser?.id || (r as any).userId === targetUser?.id) && r.status !== 'CANCELED' && (r.status as string) !== 'canceled');
  const userBids = (bids || []).filter(b => b.providerId === targetUser?.id && b.status !== 'CANCELED' && (b.status as string) !== 'canceled');

  // trustHistory is now loaded from the DB above — do NOT reconstruct it here.

  // Handlers
  const handleShareProfile = () => {
    const targetId = targetUser?.id || '';
    const profileUrl = `${window.location.origin}/${role}/user-profile?id=${targetId}`;
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
        setProfile((p: any) => ({ ...p, ...res.data }));
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
            avatarUrl: res.data.avatarUrl
          });
        }
        setShowEdit(false);
        toastSuccess('Profile updated successfully');
      }
    } catch (err: any) {
      const errMsg = err?.response?.data?.error || err?.response?.data?.message || 'Failed to update profile';
      if (phonePasswordModalOpen) {
        setPhonePasswordError(errMsg);
      }
      toastError(errMsg);
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      toastError('New passwords do not match');
      return;
    }
    if (pwForm.newPassword.length < 8 || !/\d/.test(pwForm.newPassword)) {
      toastError('Password must be at least 8 characters and contain a number');
      return;
    }
    setPwSaving(true);
    try {
      const res = await apiChangePassword({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
      if (res.success) {
        setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        toastSuccess('Password changed successfully');
      }
    } catch (err: any) {
      toastError(err?.response?.data?.error || 'Failed to change password');
    } finally {
      setPwSaving(false);
    }
  };

  // Styling helper classes
  const cardBg = isDark ? 'bg-[#22211e] border-neutral-800/80' : 'bg-white border-slate-200/90 shadow-sm';
  const innerBg = isDark ? 'bg-[#1c1b18] border-neutral-800' : 'bg-slate-50/70 border-slate-200/70';
  const labelText = isDark ? 'text-[#b4b0a9]' : 'text-slate-500';
  const headingText = isDark ? 'text-[#f2efe9]' : 'text-slate-900';
  const focusBorder = workspaceRole === 'provider'
    ? (isDark ? 'focus:border-emerald-600' : 'focus:border-emerald-500')
    : workspaceRole === 'admin'
    ? (isDark ? 'focus:border-blue-600' : 'focus:border-blue-500')
    : (isDark ? 'focus:border-orange-600' : 'focus:border-orange-500');

  const inputClass = `w-full px-3.5 py-2.5 rounded-xl border text-sm transition-colors ${
    isDark ? 'bg-[#1c1b18] border-neutral-800 text-[#f2efe9] placeholder-neutral-600' : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400'
  } ${focusBorder} focus:outline-none focus:ring-1`;

  const usernameHandle = `@${displayName.toLowerCase().replace(/[^a-z0-9]/g, '') || 'cordova_user'}`;
  const responseRate = accountRole === 'provider' ? '< 1 hr' : 'Within minutes';

  return {
    isDark,
    toggleTheme,
    loading,
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
    pwForm,
    setPwForm,
    pwSaving,
    handleChangePassword,
    handleShareProfile,
    emailNotifications,
    setEmailNotifications,
    pushNotifications,
    setPushNotifications,
    publicProfileVisible,
    setPublicProfileVisible,
    aiSummary,
    aiReason,
    aiLoading,
    aiLoaded,
    trustHistoryLoading,
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
