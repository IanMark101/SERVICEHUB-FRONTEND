"use client";
import React, { useRef, useState } from 'react';
import { Edit3, X, Save, Camera, Upload, Trash2, Image as ImageIcon, Lock } from 'lucide-react';
import { uploadAvatarToCloudinary } from '../../lib/imageUtils';

const CORDOVA_BARANGAYS = [
  "Alegria", "Bangbang", "Buagsong", "Catarman", "Cogon",
  "Dapitan", "Day-as", "Gabi", "Ibabao-Estancia", "Pilipog",
  "Poblacion", "San Miguel",
];

interface ProfileEditFormProps {
  editForm: {
    name: string;
    bio: string;
    phone: string;
    location: string;
    avatarUrl: string;
    facebookUrl?: string;
    instagramUrl?: string;
    websiteUrl?: string;
    occupation: string;
    languages: string;
    availability: string;
  };
  setEditForm: React.Dispatch<React.SetStateAction<any>>;
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
  isDark,
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
  const saveBtnBg = isProvider ? 'bg-emerald-600 hover:bg-emerald-700' : isAdmin ? 'bg-blue-600 hover:bg-blue-700' : 'bg-orange-600 hover:bg-orange-700';

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
      setEditForm((f: any) => ({ ...f, avatarUrl: cdnUrl }));
    } catch (err: any) {
      setUploadError(err.message || 'Failed to process and upload image');
    } finally {
      setProcessingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className={`${cardBg} rounded-[24px] p-6 border shadow-md space-y-4`}>
      <div className="flex items-center justify-between border-b pb-3 dark:border-neutral-800">
        <h3 className={`font-extrabold text-sm uppercase tracking-wider flex items-center gap-2 ${headingText}`}>
          <Edit3 size={16} className={accentColor} /> Edit Profile Information
        </h3>
        <X size={18} className="cursor-pointer text-slate-400 hover:text-slate-600" onClick={() => setShowEdit(false)} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className={`block text-xs font-bold mb-1 ${labelText}`}>Full Name</label>
          <input
            className={inputClass}
            value={editForm.name}
            onChange={e => setEditForm((f: any) => ({ ...f, name: e.target.value }))}
            placeholder="First and last name"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className={`block text-xs font-bold ${labelText}`}>Phone Number (GCash Account)</label>
            {hasActiveEngagements && (
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded-full border border-amber-500/20">
                <Lock className="w-2.5 h-2.5" /> Locked: Active Job
              </span>
            )}
          </div>
          <div className="relative">
            <input
              disabled={hasActiveEngagements}
              className={`${inputClass} ${hasActiveEngagements ? 'opacity-60 cursor-not-allowed bg-neutral-100 dark:bg-neutral-900 pr-8' : ''}`}
              value={editForm.phone}
              onChange={e => setEditForm((f: any) => ({ ...f, phone: e.target.value }))}
              placeholder="+63 9XX XXX XXXX"
            />
            {hasActiveEngagements && (
              <div className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400">
                <Lock className="w-3.5 h-3.5" />
              </div>
            )}
          </div>
          {hasActiveEngagements && (
            <p className="text-[10px] text-amber-500/90 font-medium mt-1">
              🔒 Locked while jobs are in progress to safeguard your payout address.
            </p>
          )}
        </div>

        <div>
          <label className={`block text-xs font-bold mb-1 ${labelText}`}>Barangay (Cordova, Cebu)</label>
          <select
            className={inputClass}
            value={editForm.location}
            onChange={e => setEditForm((f: any) => ({ ...f, location: e.target.value }))}
          >
            <option value="">Select Barangay...</option>
            {CORDOVA_BARANGAYS.map(b => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-2">
          <label className={`block text-xs font-bold mb-1 ${labelText}`}>Bio & Service Overview</label>
          <textarea
            className={`${inputClass} resize-none`}
            rows={3}
            value={editForm.bio}
            onChange={e => setEditForm((f: any) => ({ ...f, bio: e.target.value }))}
            placeholder="Tell clients or providers about your background, experience, and services..."
          />
        </div>

        {/* 📸 Profile Photo Upload & Preview */}
        <div className="sm:col-span-2 p-4 rounded-2xl border dark:border-neutral-800 bg-slate-50/50 dark:bg-[#1c1b18]/40 space-y-3">
          <label className={`block text-xs font-bold ${labelText}`}>Profile Picture</label>
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
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold ${saveBtnBg} text-white flex items-center gap-1.5 shadow-sm transition-all active:scale-95 cursor-pointer disabled:opacity-60`}
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

        {/* Social Media Links */}
        <div className="sm:col-span-2 pt-2 border-t dark:border-neutral-800">
          <h4 className={`text-xs font-black uppercase tracking-wider mb-3 ${headingText}`}>
            Social Media & Web Links
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className={`block text-[11px] font-bold mb-1 ${labelText}`}>Facebook Profile/Page URL</label>
              <input
                className={inputClass}
                value={editForm.facebookUrl || ''}
                onChange={e => setEditForm((f: any) => ({ ...f, facebookUrl: e.target.value }))}
                placeholder="https://facebook.com/username"
              />
            </div>
            <div>
              <label className={`block text-[11px] font-bold mb-1 ${labelText}`}>Instagram Profile URL</label>
              <input
                className={inputClass}
                value={editForm.instagramUrl || ''}
                onChange={e => setEditForm((f: any) => ({ ...f, instagramUrl: e.target.value }))}
                placeholder="https://instagram.com/username"
              />
            </div>
            <div>
              <label className={`block text-[11px] font-bold mb-1 ${labelText}`}>Website / Portfolio URL</label>
              <input
                className={inputClass}
                value={editForm.websiteUrl || ''}
                onChange={e => setEditForm((f: any) => ({ ...f, websiteUrl: e.target.value }))}
                placeholder="https://yourwebsite.com"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-3 border-t dark:border-neutral-800">
        <button
          onClick={() => setShowEdit(false)}
          className={`px-4 py-2 rounded-xl text-xs font-bold border ${isDark ? 'border-neutral-800 text-[#b4b0a9]' : 'border-slate-200 text-slate-600'}`}
        >
          Cancel
        </button>
        <button
          onClick={() => handleSaveProfile()}
          disabled={saving}
          className={`px-5 py-2 rounded-xl text-xs font-bold ${saveBtnBg} text-white flex items-center gap-1.5 disabled:opacity-60 transition-all shadow-sm active:scale-95`}
        >
          <Save size={14} />
          <span>{saving ? 'Saving...' : 'Save Profile'}</span>
        </button>
      </div>
    </div>
  );
}
