import React from 'react';
import { LucideIcon, Inbox } from 'lucide-react';

interface CommunityEmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  isDark?: boolean;
  actionText?: string;
  onAction?: () => void;
}

export default function CommunityEmptyState({
  icon: Icon = Inbox,
  title,
  description,
  isDark = false,
  actionText,
  onAction,
}: CommunityEmptyStateProps) {
  return (
    <div
      className={`rounded-2xl border p-6 text-center flex flex-col items-center justify-center space-y-2.5 transition-colors ${
        isDark
          ? 'bg-[#191919]/60 border-neutral-800/80 text-[#b4b0a9]'
          : 'bg-slate-50/70 border-slate-200/80 text-slate-500'
      }`}
    >
      <div
        className={`w-10 h-10 rounded-xl flex items-center justify-center ${
          isDark ? 'bg-neutral-800 text-neutral-400' : 'bg-slate-200/70 text-slate-400'
        }`}
      >
        <Icon className="w-5 h-5 opacity-80" />
      </div>
      <p className={`text-xs font-bold ${isDark ? 'text-[#f2efe9]' : 'text-slate-700'}`}>
        {title}
      </p>
      {description && (
        <p className="text-[11px] font-medium max-w-sm leading-relaxed opacity-80">
          {description}
        </p>
      )}
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="mt-1 px-3.5 py-1.5 rounded-xl font-extrabold text-[10px] bg-orange-600 hover:bg-orange-700 text-white transition-all active:scale-95 cursor-pointer shadow-sm"
        >
          {actionText}
        </button>
      )}
    </div>
  );
}
