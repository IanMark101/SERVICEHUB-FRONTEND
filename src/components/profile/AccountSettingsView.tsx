"use client";
import React, { useState } from 'react';
import { useUserProfileState } from './useUserProfileState';
import {
  User,
  Lock,
  Bell,
  Sun,
  Moon,
  Trash2,
  Check,
  ShieldAlert,
} from 'lucide-react';
import { UserSession } from '../auth/LoginContainer';

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
  } = useUserProfileState({ targetUser: user, isOwnProfile: true });

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleting, setDeleting] = useState(false);

  const handleDeleteAccount = () => {
    setDeleting(true);
    setTimeout(() => {
      alert('Account deletion request submitted to ServiceHub Administrators.');
      setDeleting(false);
      setShowDeleteModal(false);
    }, 1000);
  };

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
          <User size={17} className="text-emerald-500" /> Account Identity
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
              <span className="px-2.5 py-2 rounded-xl text-[11px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center gap-1 flex-shrink-0">
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

      {/* Password Security Card */}
      <div className={`${cardBg} rounded-[24px] p-6 border space-y-4`}>
        <h3 className={`font-black text-sm uppercase tracking-wider flex items-center gap-2 ${headingText}`}>
          <Lock size={17} className="text-emerald-500" /> Password & Security
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
            className="px-4 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-all shadow-sm active:scale-95 disabled:opacity-50"
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
    </div>
  );
}
