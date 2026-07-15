"use client";
import React from 'react';
import { Edit3, X, Save } from 'lucide-react';

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
    occupation: string;
    languages: string;
    availability: string;
  };
  setEditForm: React.Dispatch<React.SetStateAction<any>>;
  setShowEdit: (v: boolean) => void;
  handleSaveProfile: () => Promise<void>;
  saving: boolean;
  isDark: boolean;
  cardBg: string;
  labelText: string;
  headingText: string;
  inputClass: string;
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
}: ProfileEditFormProps) {
  return (
    <div className={`${cardBg} rounded-[24px] p-6 border shadow-md space-y-4`}>
      <div className="flex items-center justify-between border-b pb-3 dark:border-neutral-800">
        <h3 className={`font-extrabold text-sm uppercase tracking-wider flex items-center gap-2 ${headingText}`}>
          <Edit3 size={16} className="text-orange-500" /> Edit Profile Information
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
          <label className={`block text-xs font-bold mb-1 ${labelText}`}>Phone Number</label>
          <input
            className={inputClass}
            value={editForm.phone}
            onChange={e => setEditForm((f: any) => ({ ...f, phone: e.target.value }))}
            placeholder="+63 9XX XXX XXXX"
          />
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

        <div className="sm:col-span-2">
          <label className={`block text-xs font-bold mb-1 ${labelText}`}>Avatar Image URL</label>
          <input
            className={inputClass}
            value={editForm.avatarUrl}
            onChange={e => setEditForm((f: any) => ({ ...f, avatarUrl: e.target.value }))}
            placeholder="https://images.unsplash.com/..."
          />
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
          onClick={handleSaveProfile}
          disabled={saving}
          className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 disabled:opacity-60 transition-all"
        >
          <Save size={14} />
          <span>{saving ? 'Saving...' : 'Save Profile'}</span>
        </button>
      </div>
    </div>
  );
}
