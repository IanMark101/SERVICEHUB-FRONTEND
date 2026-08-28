"use client";
import React, { useRef, useState } from 'react';
import { useUserProfileState } from './useUserProfileState';
import PhonePasswordConfirmModal from './PhonePasswordConfirmModal';
import {
  User,
  Lock,
  Bell,
  Sun,
  Moon,
  Trash2,
  Check,
  ShieldAlert,
  Save,
  Globe,
  MapPin,
  Smartphone,
  Edit3,
  Camera,
  Upload,
  ShieldCheck,
  TrendingUp,
  TrendingDown,
  HelpCircle,
  Award,
  ChevronDown,
  ChevronUp,
  Shield,
} from 'lucide-react';
import { UserSession } from '../auth/LoginContainer';
import { uploadAvatarToCloudinary } from '../../lib/imageUtils';

const CORDOVA_BARANGAYS = [
  "Alegria", "Bangbang", "Buagsong", "Catarman", "Cogon",
  "Dapitan", "Day-as", "Gabi", "Ibabao-Estancia", "Pilipog",
  "Poblacion", "San Miguel",
];

interface AccountSettingsViewProps {
  user: UserSession;
}

export default function AccountSettingsView({ user }: AccountSettingsViewProps) {
  const {
    isDark,
    toggleTheme,
    email,
    role,
    pwForm,
    setPwForm,
    pwSaving,
    handleChangePassword,
    emailNotifications,
    setEmailNotifications,
    pushNotifications,
    setPushNotifications,
    publicProfileVisible,
    setPublicProfileVisible,
    editForm,
    setEditForm,
    saving,
    handleSaveProfile,
    hasActiveEngagements,
    phonePasswordModalOpen,
    setPhonePasswordModalOpen,
    phonePasswordError,
    phone,
  } = useUserProfileState({ targetUser: user, isOwnProfile: true });

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleting, setDeleting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [processingImage, setProcessingImage] = useState(false);
  const [showTrustGuide, setShowTrustGuide] = useState(true);

  const handleAvatarFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError(null);
    setProcessingImage(true);
    try {
      const cdnUrl = await uploadAvatarToCloudinary(file);
      setEditForm((f: any) => ({ ...f, avatarUrl: cdnUrl }));
    } catch (err: any) {
      setUploadError(err.message || 'Failed to process and upload image');
    } finally {
      setProcessingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDeleteAccount = () => {
    setDeleting(true);
    setTimeout(() => {
      alert('Account deletion request submitted to ServiceHub Administrators.');
      setDeleting(false);
      setShowDeleteModal(false);
    }, 1000);
  };

  const isProvider = role === 'provider';
  const isAdmin = role === 'admin';
  const accentColor = isProvider ? 'text-emerald-500' : isAdmin ? 'text-blue-500' : 'text-orange-500';
  const btnBg = isProvider ? 'bg-emerald-600 hover:bg-emerald-700' : isAdmin ? 'bg-blue-600 hover:bg-blue-700' : 'bg-orange-600 hover:bg-orange-700';

  const cardBg = isDark ? 'bg-[#1e1d1a] border-neutral-800' : 'bg-white border-slate-200';
  const innerBg = isDark ? 'bg-[#252420] border-neutral-800' : 'bg-slate-50 border-slate-200';
  const labelText = isDark ? 'text-neutral-400' : 'text-slate-500';
  const headingText = isDark ? 'text-[#f2efe9]' : 'text-slate-900';
  const inputClass = `w-full px-3.5 py-2.5 rounded-xl border text-xs font-medium transition-all ${
    isDark
      ? 'bg-[#191815] border-neutral-800 text-[#f2efe9] focus:border-emerald-500 focus:outline-none'
      : 'bg-white border-slate-200 text-slate-900 focus:border-emerald-500 focus:outline-none'
  }`;

  return (
    <div className={`max-w-4xl mx-auto space-y-6 transition-colors duration-200 ${isDark ? 'text-[#f2efe9]' : 'text-slate-800'}`}>
      
      {/* Header Banner */}
      <div className={`${cardBg} rounded-[24px] p-6 border space-y-1`}>
        <h2 className={`text-xl font-extrabold tracking-tight ${headingText}`}>Account & Security Settings</h2>
        <p className={`text-xs ${labelText}`}>Manage your login credentials, notification preferences, privacy controls, and security.</p>
      </div>

      {/* Account Details & Email Card */}
      <div className={`${cardBg} rounded-[24px] p-6 border space-y-4`}>
        <h3 className={`font-black text-sm uppercase tracking-wider flex items-center gap-2 ${headingText}`}>
          <User size={17} className={accentColor} /> Account Identity
        </h3>

        <div className="space-y-3 text-xs">
          <div className="space-y-1.5">
            <label className={`block font-semibold ${labelText}`}>Email Address</label>
            <div className="flex items-center gap-2">
              <input
                type="email"
                value={email}
                disabled
                className={`${inputClass} opacity-80 cursor-not-allowed`}
              />
              <span className={`px-2.5 py-2 rounded-xl text-[11px] font-bold ${isProvider ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-orange-500/10 text-orange-500 border-orange-500/20'} border flex items-center gap-1 flex-shrink-0`}>
                <Check size={12} /> Verified
              </span>
            </div>
          </div>

          <div className="space-y-1.5 pt-2">
            <label className={`block font-semibold ${labelText}`}>Account Role</label>
            <input
              type="text"
              value={role.toUpperCase()}
              disabled
              className={`${inputClass} opacity-80 cursor-not-allowed uppercase font-bold`}
            />
          </div>
        </div>
      </div>

      {/* 🌟 Profile & Social Presence Settings Card */}
      <div className={`${cardBg} rounded-[24px] p-6 border space-y-4`}>
        <div className="flex items-center justify-between border-b pb-3 dark:border-neutral-800">
          <h3 className={`font-black text-sm uppercase tracking-wider flex items-center gap-2 ${headingText}`}>
            <Edit3 size={17} className={accentColor} /> Personal & Social Profile
          </h3>
          <span className={`text-[11px] font-semibold ${labelText}`}>
            Synced with Public Profile
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="sm:col-span-2 space-y-1.5">
            <label className={`block font-semibold ${labelText}`}>Full Name</label>
            <input
              type="text"
              value={editForm.name}
              onChange={e => setEditForm((f: any) => ({ ...f, name: e.target.value }))}
              placeholder="First and last name"
              className={inputClass}
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className={`block font-semibold ${labelText}`}>Phone Number (GCash Account)</label>
              {hasActiveEngagements && (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                  <Lock className="w-3 h-3" /> Locked: Active Job
                </span>
              )}
            </div>
            <div className="relative">
              <input
                type="text"
                disabled={hasActiveEngagements}
                value={editForm.phone}
                onChange={e => setEditForm((f: any) => ({ ...f, phone: e.target.value }))}
                placeholder="+63 9XX XXX XXXX"
                className={`${inputClass} ${hasActiveEngagements ? 'opacity-60 cursor-not-allowed bg-neutral-100 dark:bg-neutral-900 pr-9' : ''}`}
              />
              {hasActiveEngagements && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400">
                  <Lock className="w-4 h-4" />
                </div>
              )}
            </div>
            {hasActiveEngagements ? (
              <p className="text-[11px] text-amber-500/90 font-medium">
                🔒 Payout mobile number is locked while you have active service engagements in progress to safeguard your funds.
              </p>
            ) : (
              <p className={`text-[11px] ${labelText}`}>
                This mobile number serves as your official GCash payout address.
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className={`block font-semibold ${labelText}`}>Barangay (Cordova, Cebu)</label>
            <select
              value={editForm.location}
              onChange={e => setEditForm((f: any) => ({ ...f, location: e.target.value }))}
              className={inputClass}
            >
              <option value="">Select Barangay...</option>
              {CORDOVA_BARANGAYS.map(b => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-2 space-y-1.5">
            <label className={`block font-semibold ${labelText}`}>Bio & Service Overview</label>
            <textarea
              rows={3}
              value={editForm.bio}
              onChange={e => setEditForm((f: any) => ({ ...f, bio: e.target.value }))}
              placeholder="Tell clients or providers about your background, experience, and services..."
              className={`${inputClass} resize-none`}
            />
          </div>

          {/* 📸 Profile Photo Upload & Preview */}
          <div className="sm:col-span-2 p-4 rounded-2xl border dark:border-neutral-800 bg-slate-50/50 dark:bg-[#1c1b18]/40 space-y-3">
            <label className={`block font-semibold ${labelText}`}>Profile Picture</label>
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="relative group flex-shrink-0">
                <img
                  src={editForm.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(editForm.name || 'User')}&background=random`}
                  alt="Profile Preview"
                  className="w-20 h-20 rounded-full object-cover border-2 border-slate-300 dark:border-neutral-700 shadow-sm"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={processingImage}
                  className="absolute inset-0 rounded-full bg-black/40 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  title="Change Photo"
                >
                  <Camera size={20} />
                </button>
              </div>

              <div className="flex-1 space-y-2 text-center sm:text-left w-full">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleAvatarFileSelect}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={processingImage}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold ${btnBg} text-white flex items-center gap-1.5 shadow-sm transition-all active:scale-95 cursor-pointer disabled:opacity-60`}
                  >
                    <Upload size={13} />
                    <span>{processingImage ? 'Optimizing...' : 'Upload New Photo'}</span>
                  </button>

                  {editForm.avatarUrl && (
                    <button
                      type="button"
                      onClick={() => setEditForm((f: any) => ({ ...f, avatarUrl: '' }))}
                      className="px-3 py-2 rounded-xl text-xs font-bold border border-slate-200 dark:border-neutral-800 text-slate-500 hover:text-rose-500 hover:border-rose-500/30 transition-all flex items-center gap-1"
                    >
                      <Trash2 size={13} />
                      <span>Reset</span>
                    </button>
                  )}
                </div>
                <p className={`text-[11px] ${labelText}`}>
                  Supported formats: JPG, PNG, WebP (Max 10MB). Automatically cropped & optimized.
                </p>
                {uploadError && (
                  <p className="text-[11px] font-bold text-rose-500">⚠️ {uploadError}</p>
                )}
              </div>
            </div>
          </div>

          {/* Social Media & Web Links */}
          <div className="sm:col-span-2 pt-3 border-t dark:border-neutral-800 space-y-3">
            <h4 className={`text-xs font-black uppercase tracking-wider ${headingText}`}>
              Social Media & Web Presence
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <label className={`block font-semibold ${labelText}`}>Facebook Profile URL</label>
                <input
                  type="text"
                  value={editForm.facebookUrl || ''}
                  onChange={e => setEditForm((f: any) => ({ ...f, facebookUrl: e.target.value }))}
                  placeholder="https://facebook.com/username"
                  className={inputClass}
                />
              </div>

              <div className="space-y-1.5">
                <label className={`block font-semibold ${labelText}`}>Instagram Profile URL</label>
                <input
                  type="text"
                  value={editForm.instagramUrl || ''}
                  onChange={e => setEditForm((f: any) => ({ ...f, instagramUrl: e.target.value }))}
                  placeholder="https://instagram.com/username"
                  className={inputClass}
                />
              </div>

              <div className="space-y-1.5">
                <label className={`block font-semibold ${labelText}`}>Website / Portfolio URL</label>
                <input
                  type="text"
                  value={editForm.websiteUrl || ''}
                  onChange={e => setEditForm((f: any) => ({ ...f, websiteUrl: e.target.value }))}
                  placeholder="https://yourwebsite.com"
                  className={inputClass}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-3 border-t dark:border-neutral-800">
          <button
            type="button"
            onClick={() => handleSaveProfile()}
            disabled={saving}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold ${btnBg} text-white transition-all shadow-sm active:scale-95 disabled:opacity-50 flex items-center gap-1.5`}
          >
            <Save size={14} />
            <span>{saving ? 'Saving Profile...' : 'Save Profile Changes'}</span>
          </button>
        </div>
      </div>

      {/* Password Security Card */}
      <div className={`${cardBg} rounded-[24px] p-6 border space-y-4`}>
        <h3 className={`font-black text-sm uppercase tracking-wider flex items-center gap-2 ${headingText}`}>
          <Lock size={17} className={accentColor} /> Password & Security
        </h3>

        <form onSubmit={(e) => { e.preventDefault(); handleChangePassword(); }} className="space-y-3 text-xs">
          <div className="space-y-1.5">
            <label className={`block font-semibold ${labelText}`}>Current Password</label>
            <input
              type="password"
              value={pwForm.currentPassword}
              onChange={(e) => setPwForm(p => ({ ...p, currentPassword: e.target.value }))}
              placeholder="Enter current password"
              className={inputClass}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className={`block font-semibold ${labelText}`}>New Password</label>
              <input
                type="password"
                value={pwForm.newPassword}
                onChange={(e) => setPwForm(p => ({ ...p, newPassword: e.target.value }))}
                placeholder="At least 8 characters"
                className={inputClass}
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className={`block font-semibold ${labelText}`}>Confirm New Password</label>
              <input
                type="password"
                value={pwForm.confirmPassword}
                onChange={(e) => setPwForm(p => ({ ...p, confirmPassword: e.target.value }))}
                placeholder="Re-enter new password"
                className={inputClass}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={pwSaving}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold ${btnBg} text-white transition-all shadow-sm active:scale-95 disabled:opacity-50`}
          >
            {pwSaving ? 'Updating Password...' : 'Update Password'}
          </button>
        </form>
      </div>

      {/* Preferences & Appearance Card */}
      <div className={`${cardBg} rounded-[24px] p-6 border space-y-4`}>
        <h3 className={`font-black text-sm uppercase tracking-wider flex items-center gap-2 ${headingText}`}>
          <Bell size={17} className="text-emerald-500" /> Preferences & Appearance
        </h3>

        <div className="space-y-3 text-xs">
          <div className="flex items-center justify-between py-2 border-b border-slate-200/60 dark:border-neutral-800">
            <div>
              <div className={`font-bold ${headingText}`}>Email Notifications</div>
              <div className={labelText}>Receive updates on bookings and reviews</div>
            </div>
            <input
              type="checkbox"
              checked={emailNotifications}
              onChange={(e) => setEmailNotifications(e.target.checked)}
              className="w-4 h-4 accent-emerald-600 rounded cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between py-2 border-b border-slate-200/60 dark:border-neutral-800">
            <div>
              <div className={`font-bold ${headingText}`}>Push & In-App Notifications</div>
              <div className={labelText}>Alerts for messages and direct requests</div>
            </div>
            <input
              type="checkbox"
              checked={pushNotifications}
              onChange={(e) => setPushNotifications(e.target.checked)}
              className="w-4 h-4 accent-emerald-600 rounded cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between py-2 border-b border-slate-200/60 dark:border-neutral-800">
            <div>
              <div className={`font-bold ${headingText}`}>Public Profile Visibility</div>
              <div className={labelText}>Allow users to view your public profile</div>
            </div>
            <input
              type="checkbox"
              checked={publicProfileVisible}
              onChange={(e) => setPublicProfileVisible(e.target.checked)}
              className="w-4 h-4 accent-emerald-600 rounded cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between py-2">
            <div>
              <div className={`font-bold ${headingText}`}>Appearance Theme</div>
              <div className={labelText}>Toggle between Light and Dark visual modes</div>
            </div>
            <button
              type="button"
              onClick={toggleTheme}
              className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 ${innerBg} ${headingText}`}
            >
              {isDark ? <Sun size={14} className="text-amber-400" /> : <Moon size={14} className="text-slate-600" />}
              <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 🛡️ How Trust Score Works Guide (Masterprompt Part 15) */}
      <div className={`${cardBg} rounded-[24px] p-6 border space-y-4`}>
        <div className="flex items-center justify-between border-b pb-3 dark:border-neutral-800">
          <div className="flex items-center gap-2">
            <ShieldCheck size={18} className={accentColor} />
            <h3 className={`font-black text-sm uppercase tracking-wider ${headingText}`}>
              How Trust Score Works
            </h3>
          </div>
          <button
            type="button"
            onClick={() => setShowTrustGuide(!showTrustGuide)}
            className={`text-xs font-bold flex items-center gap-1 ${labelText} hover:opacity-80 transition-opacity`}
          >
            <span>{showTrustGuide ? 'Hide Guide' : 'Show Guide'}</span>
            {showTrustGuide ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>

        {showTrustGuide && (
          <div className="space-y-4 text-xs leading-relaxed">
            <p className={labelText}>
              Your Trust Score (0–100) reflects your reliability, transparency, and history in the Cordova marketplace. All accounts start at a baseline of 50.
            </p>

            {/* Score Bands */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className={`p-3 rounded-2xl border ${isDark ? 'bg-emerald-950/20 border-emerald-900/30' : 'bg-emerald-50 border-emerald-200'}`}>
                <div className="text-emerald-500 font-extrabold text-[11px]">90 – 100</div>
                <div className={`font-bold text-xs ${headingText}`}>Highly Trusted</div>
                <div className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-0.5">Top-tier marketplace standing</div>
              </div>
              <div className={`p-3 rounded-2xl border ${isDark ? 'bg-blue-950/20 border-blue-900/30' : 'bg-blue-50 border-blue-200'}`}>
                <div className="text-blue-500 font-extrabold text-[11px]">70 – 89</div>
                <div className={`font-bold text-xs ${headingText}`}>Trusted</div>
                <div className="text-[10px] text-blue-600 dark:text-blue-400 mt-0.5">Consistent positive track record</div>
              </div>
              <div className={`p-3 rounded-2xl border ${isDark ? 'bg-amber-950/20 border-amber-900/30' : 'bg-amber-50 border-amber-200'}`}>
                <div className="text-amber-500 font-extrabold text-[11px]">50 – 69</div>
                <div className={`font-bold text-xs ${headingText}`}>Average</div>
                <div className="text-[10px] text-amber-600 dark:text-amber-400 mt-0.5">New or standard activity level</div>
              </div>
              <div className={`p-3 rounded-2xl border ${isDark ? 'bg-rose-950/20 border-rose-900/30' : 'bg-rose-50 border-rose-200'}`}>
                <div className="text-rose-500 font-extrabold text-[11px]">Below 50</div>
                <div className={`font-bold text-xs ${headingText}`}>Needs Attention</div>
                <div className="text-[10px] text-rose-600 dark:text-rose-400 mt-0.5">Impacted by cancellations or issues</div>
              </div>
            </div>

            {/* Principles: What Helps vs What Hurts */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className={`p-4 rounded-2xl border ${isDark ? 'bg-[#191919] border-neutral-800/80' : 'bg-slate-50/80 border-slate-200/80'} space-y-2`}>
                <div className="flex items-center gap-1.5 font-bold text-emerald-600 dark:text-emerald-400">
                  <TrendingUp size={15} />
                  <span>What Increases Your Score</span>
                </div>
                <ul className={`space-y-1 text-[11px] ${labelText}`}>
                  <li className="flex items-start gap-1.5">
                    <span className="text-emerald-500 font-bold">•</span>
                    <span>Admin verification of residency and identity credentials</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-emerald-500 font-bold">•</span>
                    <span>Successfully completing and confirming service bookings</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-emerald-500 font-bold">•</span>
                    <span>Receiving positive (4-star & 5-star) client reviews</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-emerald-500 font-bold">•</span>
                    <span>Smooth, undisputed escrow payments and confirmations</span>
                  </li>
                </ul>
              </div>

              <div className={`p-4 rounded-2xl border ${isDark ? 'bg-[#191919] border-neutral-800/80' : 'bg-slate-50/80 border-slate-200/80'} space-y-2`}>
                <div className="flex items-center gap-1.5 font-bold text-rose-600 dark:text-rose-400">
                  <TrendingDown size={15} />
                  <span>What Decreases Your Score</span>
                </div>
                <ul className={`space-y-1 text-[11px] ${labelText}`}>
                  <li className="flex items-start gap-1.5">
                    <span className="text-rose-500 font-bold">•</span>
                    <span>Cancelling bookings at fault after work has already started</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-rose-500 font-bold">•</span>
                    <span>Valid disputes or complaints confirmed by admin moderators</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-rose-500 font-bold">•</span>
                    <span>Receiving low-rating reviews (1-star or 2-star)</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-rose-500 font-bold">•</span>
                    <span>Repeated service listing rejections for policy violations</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className={`p-3 rounded-xl border flex items-center gap-2 text-[11px] ${isDark ? 'bg-[#1c1b18] border-neutral-800 text-neutral-400' : 'bg-amber-50/60 border-amber-200/60 text-amber-900'}`}>
              <HelpCircle size={15} className="flex-shrink-0 text-amber-500" />
              <span>
                To prevent gaming and ensure authentic interactions, exact mathematical formulas are not published. Earning trust is based on genuine reliability.
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Danger Zone Card */}
      <div className="bg-rose-500/5 border border-rose-500/20 rounded-[24px] p-6 space-y-3">
        <h3 className="font-black text-sm uppercase tracking-wider text-rose-500 flex items-center gap-2">
          <Trash2 size={17} /> Danger Zone
        </h3>
        <p className="text-xs text-rose-400/90 leading-relaxed">
          Deleting your ServiceHub account will permanently erase your profile, booking records, trust score, and message history. This action cannot be undone.
        </p>
        <button
          type="button"
          onClick={() => setShowDeleteModal(true)}
          className="px-4 py-2.5 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white transition-all shadow-sm active:scale-95"
        >
          Delete Account
        </button>
      </div>

      {/* Delete Account Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`${cardBg} max-w-md w-full rounded-3xl p-6 border shadow-2xl space-y-4`}>
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center justify-center">
              <Trash2 size={24} />
            </div>
            <h4 className={`text-base font-black ${headingText}`}>Confirm Account Deletion</h4>
            <p className={`text-xs ${labelText} leading-relaxed`}>
              Type <strong className="text-rose-500">DELETE</strong> below to permanently erase your ServiceHub profile and account data.
            </p>

            <input
              type="text"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder="Type DELETE"
              className={inputClass}
            />

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => { setShowDeleteModal(false); setDeleteConfirmText(''); }}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold border ${innerBg} ${headingText}`}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleteConfirmText !== 'DELETE' || deleting}
                onClick={handleDeleteAccount}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white transition-all disabled:opacity-50"
              >
                {deleting ? 'Deleting...' : 'Permanently Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Phone Password Confirmation Modal */}
      <PhonePasswordConfirmModal
        isOpen={phonePasswordModalOpen}
        onClose={() => setPhonePasswordModalOpen(false)}
        oldPhone={phone || user?.phone || ''}
        newPhone={editForm.phone}
        onConfirm={(password) => handleSaveProfile(password)}
        isLoading={saving}
        error={phonePasswordError}
      />
    </div>
  );
}
