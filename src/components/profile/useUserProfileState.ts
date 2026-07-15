"use client";
import { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { UserSession } from '../auth/LoginContainer';
import {
  apiGetPublicProfile,
  apiUpdateProfile,
  apiChangePassword,
} from '../../api/auth.api';
import { apiGetProviderSummary } from '../../api/ai.api';
import { useToast } from '../Toast';

export interface UseUserProfileStateProps {
  targetUser: UserSession;
  isOwnProfile?: boolean;
  onProfileUpdated?: (updated: Partial<UserSession>) => void;
}

export function useUserProfileState({
  targetUser,
  isOwnProfile = false,
  onProfileUpdated,
}: UseUserProfileStateProps) {
  const { isDark, setUser, user, toggleTheme, services, jobRequests } = useApp();
  const { success: toastSuccess, error: toastError } = useToast();

  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // AI Summary state
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [aiReason, setAiReason] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiLoaded, setAiLoaded] = useState(false);

  // UI state
  const [activeTab, setActiveTab] = useState<'portfolio' | 'reviews' | 'about'>('portfolio');
  const [showEdit, setShowEdit] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Forms
  const [editForm, setEditForm] = useState({
    name: '',
    bio: '',
    phone: '',
    location: '',
    avatarUrl: '',
    occupation: 'Service Specialist',
    languages: 'English, Cebuano, Tagalog',
    availability: 'Mon - Sat (8:00 AM - 6:00 PM)',
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
          }));
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [targetUser?.id]);

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

  // Derived Properties
  const displayName = profile?.name || `${targetUser?.firstName || ''} ${targetUser?.lastName || ''}`.trim() || 'ServiceHub User';
  const trustScore = profile?.trustScore || targetUser?.trustScore || 50;
  const verStatus = profile?.verificationStatus || targetUser?.verificationStatus || 'UNVERIFIED';
  const avatarUrl = profile?.avatarUrl || targetUser?.avatarUrl;
  const bio = profile?.bio || targetUser?.bio || '';
  const location = profile?.location || targetUser?.location || '';
  const phone = profile?.phone || targetUser?.phone || '';
  const email = profile?.email || targetUser?.email || '';
  const role = targetUser?.role || 'seeker';
  const createdAt = profile?.createdAt;
  const completedJobs = profile?.completedServiceCount || 0;

  const rawRating = profile?.averageRating;
  const averageRating: number = typeof rawRating === 'number' && !isNaN(rawRating) && rawRating > 0
    ? rawRating
    : (role === 'provider' ? 5.0 : 5.0);

  const reviews: any[] = Array.isArray(profile?.reviews) ? profile.reviews : [];

  // Provider Categories & Services
  const providerServices = services.filter(s => s.providerId === targetUser?.id);
  const providerCategories = Array.from(new Set(providerServices.map(s => s.category)));
  const displayCategories = providerCategories.length > 0
    ? providerCategories
    : ['Plumbing', 'Electrical', 'Home Repairs', 'Aircon Cleaning'];

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
    const percentage = reviews.length > 0 ? Math.round((count / reviews.length) * 100) : (star === 5 ? 85 : star === 4 ? 15 : 0);
    return { star, count: reviews.length > 0 ? count : (star === 5 ? 4 : star === 4 ? 1 : 0), percentage };
  });

  // Dynamic Trust History Timeline
  const trustHistory: { delta: string; label: string; date: string; type: 'positive' | 'negative' }[] = [];
  if (verStatus === 'APPROVED') {
    trustHistory.push({ delta: '+5', label: 'Residency Verification Approved by Admin', date: 'Cordova Admin Verified', type: 'positive' });
  }
  if (completedJobs > 0) {
    trustHistory.push({ delta: `+${completedJobs * 2}`, label: `${completedJobs} Verified Bookings Completed & Confirmed`, date: 'Marketplace History', type: 'positive' });
  }
  if (reviews.length > 0) {
    trustHistory.push({ delta: `+${reviews.length}`, label: `${reviews.length} Client Review Ratings Received`, date: 'Client Reviews', type: 'positive' });
  }
  trustHistory.push({ delta: '+50', label: 'Initial Account Base Trust Rating', date: 'System Baseline', type: 'positive' });

  // Handlers
  const handleShareProfile = () => {
    const targetId = targetUser?.id || '';
    const profileUrl = `${window.location.origin}/${role}/user-profile?id=${targetId}`;
    navigator.clipboard.writeText(profileUrl);
    toastSuccess('Profile link copied to clipboard!');
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const res = await apiUpdateProfile({
        name: editForm.name,
        bio: editForm.bio,
        phone: editForm.phone,
        location: editForm.location,
        avatarUrl: editForm.avatarUrl
      });
      if (res.success) {
        setProfile((p: any) => ({ ...p, ...res.data }));
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
      toastError(err?.response?.data?.error || 'Failed to update profile');
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
  const inputClass = `w-full px-3.5 py-2.5 rounded-xl border text-sm transition-colors ${
    isDark ? 'bg-[#1c1b18] border-neutral-800 text-[#f2efe9] placeholder-neutral-600 focus:border-emerald-600' : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:border-emerald-500'
  } focus:outline-none focus:ring-1`;

  const usernameHandle = `@${displayName.toLowerCase().replace(/[^a-z0-9]/g, '') || 'cordova_user'}`;
  const responseRate = role === 'provider' ? '< 1 hr' : 'Within minutes';

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
    location,
    phone,
    email,
    role,
    createdAt,
    completedJobs,
    averageRating,
    ratingDistribution,
    reviews,
    providerServices,
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
    pwForm,
    setPwForm,
    pwSaving,
    handleChangePassword,
    handleShareProfile,
    aiSummary,
    aiReason,
    aiLoading,
    aiLoaded,
    cardBg,
    innerBg,
    labelText,
    headingText,
    inputClass,
  };
}
