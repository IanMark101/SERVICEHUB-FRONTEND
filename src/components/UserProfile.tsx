"use client";
import React from 'react';
import { Info } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { UserSession } from './LoginSignup';

export default function UserProfile({ targetUser }: { targetUser: UserSession }) {
  const { isDark } = useApp();

  const roleAccents = {
    seeker: {
      text: 'text-orange-500 dark:text-orange-400',
      border: 'border-orange-500/20',
      bgLight: 'bg-orange-500/5',
    },
    provider: {
      text: 'text-emerald-500 dark:text-emerald-400',
      border: 'border-emerald-500/20',
      bgLight: 'bg-emerald-500/5',
    },
    admin: {
      text: 'text-blue-500 dark:text-blue-400',
      border: 'border-blue-500/20',
      bgLight: 'bg-blue-500/5',
    }
  };

  const accent = roleAccents[targetUser.role];

  return (
    <div className={`rounded-[24px] p-6 sm:p-8 border shadow-sm transition-colors duration-200 ${isDark ? 'bg-[#22211e] border-neutral-800/80 text-[#f2efe9]' : 'bg-white border-slate-200 text-slate-955'
      }`}>
      <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
        <img
          src={targetUser.avatarUrl}
          alt="Avatar"
          className={`w-24 h-24 rounded-full object-cover border-4 ${targetUser.role === 'seeker'
              ? 'border-orange-500'
              : targetUser.role === 'admin'
                ? 'border-blue-500'
                : 'border-emerald-500'
            }`}
        />
        <div className="text-center sm:text-left flex-1 min-w-0">
          <h2 className="text-2xl font-bold truncate">{targetUser.firstName} {targetUser.lastName}</h2>
          <p className={`text-xs mt-1 uppercase tracking-wider font-semibold ${isDark ? 'text-[#b4b0a9]' : 'text-slate-400'}`}>
            Role: <span className={accent.text}>{targetUser.role}</span>
          </p>
          <p className={`text-sm mt-3 leading-relaxed max-w-xl ${isDark ? 'text-[#b4b0a9]' : 'text-slate-600'}`}>{targetUser.bio}</p>
          <div className="mt-4 flex flex-wrap gap-2 justify-center sm:justify-start">
            <span className={`px-2.5 py-1 text-xs font-semibold rounded-lg border ${isDark ? 'bg-[#1c1b18] border-neutral-800/80 text-[#b4b0a9]' : 'bg-[#faf8f5] border-slate-200 text-slate-500'
              }`}>
              {targetUser.phone}
            </span>
            <span className={`px-2.5 py-1 text-xs font-semibold rounded-lg border ${isDark ? 'bg-[#1c1b18] border-neutral-800/80 text-[#b4b0a9]' : 'bg-[#faf8f5] border-slate-200 text-slate-500'
              }`}>
              {targetUser.email}
            </span>
          </div>
        </div>
      </div>

      <div className={`mt-8 border-t pt-6 ${isDark ? 'border-neutral-800/85' : 'border-slate-100'}`}>
        <div className={`p-4 rounded-xl ${accent.bgLight} border ${accent.border} text-sm flex items-start space-x-3`}>
          <Info className={`w-5 h-5 flex-shrink-0 ${accent.text}`} />
          <div>
            <h4 className="font-semibold">Profile Details</h4>
            <p className={`text-xs mt-1 ${isDark ? 'text-[#b4b0a9]' : 'text-slate-500'}`}>
              Full provider reviews, trust ratings, and service histories will be dynamic in Phase 5.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
