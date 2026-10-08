"use client";
import FormSelect from '../ui/FormSelect';
import React, { useRef, useState } from 'react';
import { AlertTriangle, Edit3, X, Save, Camera, Upload, Trash2, Lock } from 'lucide-react';
import { uploadAvatarToCloudinary } from '../../lib/imageUtils';
import UserAvatar from '../ui/UserAvatar';

const CORDOVA_BARANGAYS = [
  "Alegria", "Bangbang", "Buagsong", "Catarman", "Cogon",
  "Dapitan", "Day-as", "Gabi", "Ibabao-Estancia", "Pilipog",
  "Poblacion", "San Miguel",
];

interface ProfileEditFormValue {
    name: string;
    bio: string;
    phone: string;
    location: string;
    avatarUrl: string;
    facebookUrl: string;
    instagramUrl: string;
    websiteUrl: string;
    occupation: string;
    languages: string;
    availability: string;
}

interface ProfileEditFormProps {
  editForm: ProfileEditFormValue;
  setEditForm: React.Dispatch<React.SetStateAction<ProfileEditFormValue>>;
  setShowEdit: (v: boolean) => void;
  handleSaveProfile: (confirmedPassword?: string) => Promise<void>;
  saving: boolean;
  isDark: boolean;
  cardBg: string;
  labelText: string;
  headingText: string;
  inputClass: string;
  role?: string;
  hasActiveEngagements?: boolean;
}

export default function ProfileEditForm({
  editForm,
  setEditForm,
  setShowEdit,
  handleSaveProfile,
  saving,
  cardBg,
  labelText,
  headingText,
  inputClass,
  role = 'seeker',
  hasActiveEngagements = false,
}: ProfileEditFormProps) {
  const isProvider = role === 'provider';
  const isAdmin = role === 'admin';
  const accentColor = isProvider ? 'text-emerald-500' : isAdmin ? 'text-blue-500' : 'text-orange-500';

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [processingImage, setProcessingImage] = useState(false);

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

  return (
    <div className={`${cardBg} rounded-2xl p-5 sm:p-6 border shadow-sm space-y-5`}>
      <div className="flex items-center justify-between border-b border-[color:var(--workspace-border)] pb-4">
        <h3 className={`flex items-center gap-2 text-base font-bold ${headingText}`}>
          <Edit3 size={16} className={accentColor} /> Edit Profile Information
        </h3>
        <button type="button" onClick={() => setShowEdit(false)} aria-label="Close profile editor" className="grid size-9 place-items-center rounded-xl text-ink-subtle transition-colors hover:bg-[color:var(--workspace-surface-muted)] hover:text-ink-secondary dark:hover:text-ink">
          <X size={18} />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className={`block text-xs font-bold mb-1 ${labelText}`}>Full Name</label>
          <input
            className={inputClass}
            value={editForm.name}
            onChange={e => setEditForm((form) => ({ ...form, name: e.target.value }))}
            placeholder="First and last name"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className={`block text-xs font-bold ${labelText}`}>Philippine Mobile Number</label>
            {hasActiveEngagements && (
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded-full border border-amber-500/20">
                <Lock className="w-2.5 h-2.5" /> Locked: Active Job
              </span>
            )}
          </div>
          <div className="relative">
            <input
              disabled={hasActiveEngagements}
              className={`${inputClass} ${hasActiveEngagements ? 'opacity-60 cursor-not-allowed bg-neutral-100 dark:bg-charcoal pr-8' : ''}`}
              value={editForm.phone}
              onChange={e => setEditForm((form) => ({ ...form, phone: e.target.value }))}
              placeholder="+63 9XX XXX XXXX"
            />
            {hasActiveEngagements && (
              <div className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-subtle">
                <Lock className="w-3.5 h-3.5" />
              </div>
            )}
          </div>
          {hasActiveEngagements && (
            <p className="text-[10px] text-amber-500/90 font-medium mt-1">
              Locked while jobs are in progress to preserve transaction records.
            </p>
          )}
          {!hasActiveEngagements && (
            <p className={`mt-1 text-[10px] ${labelText}`}>Used for account and service contact, not as a PayMongo payout destination.</p>
          )}
        </div>

        <div>
          <label className={`block text-xs font-bold mb-1 ${labelText}`}>Barangay (Cordova, Cebu)</label>
          <FormSelect
            aria-label="Barangay (Cordova, Cebu)"
            className={inputClass}
            value={editForm.location}
            onChange={e => setEditForm((form) => ({ ...form, location: e.target.value }))}
          >
            <option value="">Select Barangay...</option>
            {CORDOVA_BARANGAYS.map(b => (
              <option key={b} value={b}>{b}</option>
            ))}
          </FormSelect>
        </div>

        <div className="sm:col-span-2">
          <label className={`block text-xs font-bold mb-1 ${labelText}`}>Bio & Service Overview</label>
          <textarea
            className={`${inputClass} resize-none`}
            rows={3}
            value={editForm.bio}
            onChange={e => setEditForm((form) => ({ ...form, bio: e.target.value }))}
            placeholder="Tell service seekers or providers about your background, experience, and services..."
          />
        </div>

        {/* 📸 Profile Photo Upload & Preview */}
        <div className="sm:col-span-2 space-y-3 rounded-2xl border border-[color:var(--workspace-border)] bg-[color:var(--workspace-surface-muted)] p-4">
          <label className={`block text-xs font-bold ${labelText}`}>Profile Picture</label>
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
                  className="workspace-primary-button flex min-h-10 items-center gap-1.5 rounded-xl px-3.5 text-xs font-bold shadow-sm transition-colors disabled:opacity-60"
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

        {/* Social Media Links */}
        <div className="sm:col-span-2 border-t border-[color:var(--workspace-border)] pt-4">
          <h4 className={`mb-3 text-sm font-bold ${headingText}`}>
            Social Media & Web Links
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className={`block text-[11px] font-bold mb-1 ${labelText}`}>Facebook Profile/Page URL</label>
              <input
                className={inputClass}
                value={editForm.facebookUrl || ''}
                onChange={e => setEditForm((form) => ({ ...form, facebookUrl: e.target.value }))}
                placeholder="https://facebook.com/username"
              />
            </div>
            <div>
              <label className={`block text-[11px] font-bold mb-1 ${labelText}`}>Instagram Profile URL</label>
              <input
                className={inputClass}
                value={editForm.instagramUrl || ''}
                onChange={e => setEditForm((form) => ({ ...form, instagramUrl: e.target.value }))}
                placeholder="https://instagram.com/username"
              />
            </div>
            <div>
              <label className={`block text-[11px] font-bold mb-1 ${labelText}`}>Website / Portfolio URL</label>
              <input
                className={inputClass}
                value={editForm.websiteUrl || ''}
                onChange={e => setEditForm((form) => ({ ...form, websiteUrl: e.target.value }))}
                placeholder="https://yourwebsite.com"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-2 border-t border-[color:var(--workspace-border)] pt-4">
        <button
          type="button"
          onClick={() => setShowEdit(false)}
          className="min-h-11 rounded-xl border border-[color:var(--workspace-border)] bg-[color:var(--workspace-surface)] px-4 py-2 text-xs font-bold text-[color:var(--workspace-muted)] transition-colors hover:border-[color:var(--workspace-border-strong)] hover:text-[color:var(--workspace-ink)]"
        >
          Cancel
        </button>
        <button
          onClick={() => handleSaveProfile()}
          disabled={saving}
          className="workspace-primary-button flex min-h-11 items-center gap-1.5 rounded-xl px-5 text-sm font-semibold transition-colors shadow-sm disabled:opacity-60"
        >
          <Save size={14} />
          <span>{saving ? 'Saving...' : 'Save Profile'}</span>
        </button>
      </div>
    </div>
  );
}
