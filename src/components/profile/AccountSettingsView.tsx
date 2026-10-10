"use client";
import React, { useRef, useState } from 'react';
import { useUserProfile } from '../../hooks/useUserProfile';
import PhonePasswordConfirmModal from './PhonePasswordConfirmModal';
import {
  User,
  Lock,
  Sun,
  Moon,
  Trash2,
  Check,
  Save,
  Edit3,
  Camera,
  Upload,
  AlertTriangle,
} from 'lucide-react';
import { UserSession } from '../auth/LoginContainer';
import { uploadAvatarToCloudinary } from '../../lib/imageUtils';
import TrustScoreGuide from './account-settings/TrustScoreGuide';
import AccountDeletionPanel from './account-settings/AccountDeletionPanel';
import PasswordSecurityPanel from './account-settings/PasswordSecurityPanel';
import UserAvatar from '../ui/UserAvatar';
import VerificationUpload from './VerificationUpload';

interface AccountSettingsViewProps {
  user: UserSession;
}

export default function AccountSettingsView({ user }: AccountSettingsViewProps) {
  const {
    isDark,
    toggleTheme,
    email,
    role,
    editForm,
    setEditForm,
    saving,
    handleSaveProfile,
    hasActiveEngagements,
    phonePasswordModalOpen,
    setPhonePasswordModalOpen,
    phonePasswordError,
    phone,
  } = useUserProfile({ targetUser: user, isOwnProfile: true });


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
      setEditForm((form) => ({ ...form, avatarUrl: cdnUrl }));
    } catch (err: unknown) {
      setUploadError(err instanceof Error ? err.message : 'Failed to process and upload image');
    } finally {
      setProcessingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };


  const isProvider = role === 'provider';
  const isAdmin = role === 'admin';
  const accentColor = isProvider ? 'text-emerald-500' : isAdmin ? 'text-[var(--admin-accent)]' : 'text-brand-text';
  const verifiedBadge = isProvider
    ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
    : isAdmin
      ? 'bg-[var(--admin-soft)] text-[var(--admin-accent)] border-[var(--admin-border)]'
      : 'bg-orange-500/10 text-brand-text border-orange-500/20';

  const cardBg = 'bg-[color:var(--workspace-surface)] border-[color:var(--workspace-border)]';
  const innerBg = 'bg-[color:var(--workspace-surface-muted)] border-[color:var(--workspace-border)]';
  const labelText = 'text-[color:var(--workspace-muted)]';
  const headingText = 'text-[color:var(--workspace-ink)]';
  const inputClass = 'workspace-form-control w-full px-3.5 py-2.5 text-sm font-medium';

  return (
    <div className={`max-w-5xl mx-auto space-y-5 transition-colors duration-200 ${isDark ? 'text-white' : 'text-ink'}`}>
      
      {/* Header Banner */}
      <div className="px-1 py-4">
        <h2 className={`text-2xl font-extrabold tracking-[-0.035em] ${headingText}`}>Account & Security Settings</h2>
        <p className={`mt-2 max-w-2xl text-sm leading-6 ${labelText}`}>Manage your profile, residency verification, password, and appearance.</p>
      </div>

      <nav className="workspace-section-nav" aria-label="Account settings sections">
        <a href="#account-identity">Account</a>
        <a href="#contact-information">Profile</a>
        {!isAdmin && <a href="#verification">Verification</a>}
        <a href="#password-security">Security</a>
        <a href="#appearance">Appearance</a>
        {!isAdmin && <a href="#trust-safety">Trust & safety</a>}
      </nav>

      {/* Account Details & Email Card */}
      <section id="account-identity" className={`${cardBg} scroll-mt-24 rounded-2xl p-5 sm:p-6 border space-y-4`}>
        <h3 className={`font-bold text-base flex items-center gap-2 ${headingText}`}>
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
              <span className={`px-2.5 py-2 rounded-xl text-[11px] font-bold ${verifiedBadge} border flex items-center gap-1 flex-shrink-0`}>
                <Check size={12} /> Verified
              </span>
            </div>
          </div>

          <div className="space-y-1.5 pt-2">
            <label className={`block font-semibold ${labelText}`}>Account Role</label>
            <input
              type="text"
              value={isAdmin ? 'Administrator' : 'Member · Seeker and Provider'}
              disabled
              className={`${inputClass} opacity-80 cursor-not-allowed uppercase font-bold`}
            />
          </div>
        </div>
      </section>

      {/* 🌟 Profile & Social Presence Settings Card */}
      <section id="contact-information" className={`${cardBg} scroll-mt-24 rounded-2xl p-5 sm:p-6 border space-y-4`}>
        <div className="flex items-center justify-between border-b border-[color:var(--workspace-border)] pb-4">
          <h3 className={`font-bold text-base flex items-center gap-2 ${headingText}`}>
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
              onChange={e => setEditForm((form) => ({ ...form, name: e.target.value }))}
              placeholder="First and last name"
              className={inputClass}
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className={`block font-semibold ${labelText}`}>Philippine Mobile Number</label>
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
                onChange={e => setEditForm((form) => ({ ...form, phone: e.target.value }))}
                placeholder="+63 9XX XXX XXXX"
                className={`${inputClass} ${hasActiveEngagements ? 'opacity-60 cursor-not-allowed bg-neutral-100 dark:bg-charcoal pr-9' : ''}`}
              />
              {hasActiveEngagements && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-subtle">
                  <Lock className="w-4 h-4" />
                </div>
              )}
            </div>
            {hasActiveEngagements ? (
              <p className="text-[11px] text-amber-500/90 font-medium">
                This mobile number is locked while service engagements are active to preserve transaction records.
              </p>
            ) : (
              <p className={`text-[11px] ${labelText}`}>
                Used as account and service contact information. Online Test Mode payments are not paid out to this number.
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <label htmlFor="account-profile-location" className={`block font-semibold ${labelText}`}>City / municipality and barangay</label>
            <input
              id="account-profile-location"
              aria-label="City / municipality and barangay"
              maxLength={100}
              placeholder="e.g. Marigondon, Lapu-Lapu City, Cebu"
              value={editForm.location}
              onChange={e => setEditForm((form) => ({ ...form, location: e.target.value }))}
              className={inputClass}
            />
            <p className={`text-[11px] ${labelText}`}>Your general profile area. Marketplace search and actual job locations are set separately.</p>
          </div>

          <div className="sm:col-span-2 space-y-1.5">
            <label className={`block font-semibold ${labelText}`}>Bio & Service Overview</label>
            <textarea
              rows={3}
              value={editForm.bio}
              onChange={e => setEditForm((form) => ({ ...form, bio: e.target.value }))}
              placeholder="Tell service seekers or providers about your background, experience, and services..."
              className={`${inputClass} resize-none`}
            />
          </div>

          {/* 📸 Profile Photo Upload & Preview */}
          <div className="sm:col-span-2 space-y-3 rounded-2xl border border-[color:var(--workspace-border)] bg-[color:var(--workspace-surface-muted)] p-4">
            <label className={`block font-semibold ${labelText}`}>Profile Picture</label>
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="relative group flex-shrink-0">
                <UserAvatar src={editForm.avatarUrl} name={editForm.name} alt="Profile preview" size={80} role={isProvider ? 'provider' : isAdmin ? 'admin' : 'seeker'} shape="soft" />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={processingImage}
                  className="absolute inset-0 flex cursor-pointer items-center justify-center rounded-[24%] bg-charcoal/40 text-white opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
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
                    className="workspace-primary-button inline-flex min-h-10 items-center gap-1.5 rounded-xl px-3.5 text-xs font-bold shadow-sm transition-colors disabled:opacity-60"
                  >
                    <Upload size={13} />
                    <span>{processingImage ? 'Optimizing...' : 'Upload New Photo'}</span>
                  </button>

                  {editForm.avatarUrl && (
                    <button
                      type="button"
                      onClick={() => setEditForm((form) => ({ ...form, avatarUrl: '' }))}
                      className="flex min-h-10 items-center gap-1 rounded-xl border border-[color:var(--workspace-border)] bg-[color:var(--workspace-surface)] px-3 py-2 text-xs font-bold text-[color:var(--workspace-muted)] transition-colors hover:border-rose-500/30 hover:text-rose-500"
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
                  <p className="flex items-center gap-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400"><AlertTriangle size={14} /> {uploadError}</p>
                )}
              </div>
            </div>
          </div>

          {/* Social Media & Web Links */}
          <div className="sm:col-span-2 space-y-3 border-t border-[color:var(--workspace-border)] pt-4">
            <h4 className={`text-sm font-bold ${headingText}`}>
              Social Media & Web Presence
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <label className={`block font-semibold ${labelText}`}>Facebook Profile URL</label>
                <input
                  type="text"
                  value={editForm.facebookUrl || ''}
                  onChange={e => setEditForm((form) => ({ ...form, facebookUrl: e.target.value }))}
                  placeholder="https://facebook.com/username"
                  className={inputClass}
                />
              </div>

              <div className="space-y-1.5">
                <label className={`block font-semibold ${labelText}`}>Instagram Profile URL</label>
                <input
                  type="text"
                  value={editForm.instagramUrl || ''}
                  onChange={e => setEditForm((form) => ({ ...form, instagramUrl: e.target.value }))}
                  placeholder="https://instagram.com/username"
                  className={inputClass}
                />
              </div>

              <div className="space-y-1.5">
                <label className={`block font-semibold ${labelText}`}>Website / Portfolio URL</label>
                <input
                  type="text"
                  value={editForm.websiteUrl || ''}
                  onChange={e => setEditForm((form) => ({ ...form, websiteUrl: e.target.value }))}
                  placeholder="https://yourwebsite.com"
                  className={inputClass}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end border-t border-[color:var(--workspace-border)] pt-4">
          <button
            type="button"
            onClick={() => handleSaveProfile()}
            disabled={saving}
            className="workspace-primary-button flex min-h-11 items-center gap-1.5 rounded-xl px-5 text-sm font-semibold transition-colors shadow-sm disabled:opacity-50"
          >
            <Save size={14} />
            <span>{saving ? 'Saving Profile...' : 'Save Profile Changes'}</span>
          </button>
        </div>
      </section>

      {!isAdmin && <section id="verification" className={`${cardBg} scroll-mt-24 rounded-2xl border p-5 sm:p-6`}>
        <h2 className={`text-base font-bold ${headingText}`}>Residency verification</h2>
        <p className={`mt-2 mb-5 text-sm ${labelText}`}>Manage your private verification submission. Only your verification status appears on your profile.</p>
        <VerificationUpload isDark={isDark} embedded />
      </section>}

      <PasswordSecurityPanel isDark={isDark} />

      {/* Appearance Card */}
      <section id="appearance" className={`${cardBg} scroll-mt-24 rounded-2xl p-5 sm:p-6 border space-y-4`}>
        <h3 className={`font-bold text-base flex items-center gap-2 ${headingText}`}>
          <Moon size={17} className="text-emerald-500" /> Appearance
        </h3>

        <div className="space-y-3 text-xs">
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
              {isDark ? <Sun size={14} className="text-amber-400" /> : <Moon size={14} className="text-ink-muted" />}
              <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>
            </button>
          </div>
        </div>
      </section>

      {!isAdmin && (
        <section id="trust-safety" className="scroll-mt-24 space-y-5">
          <TrustScoreGuide
            isDark={isDark}
            isOpen={showTrustGuide}
            cardBg={cardBg}
            accentColor={accentColor}
            headingText={headingText}
            labelText={labelText}
            onToggle={() => setShowTrustGuide(!showTrustGuide)}
          />

          <AccountDeletionPanel email={email || user.email} isDark={isDark} />
        </section>
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
