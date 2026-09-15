import React from 'react';
import { Tray } from '@phosphor-icons/react';

interface CommunityEmptyStateProps {
  icon?: React.ComponentType<{ className?: string }>;
  title: string;
  description?: string;
  isDark?: boolean;
  actionText?: string;
  onAction?: () => void;
}

export default function CommunityEmptyState({
  icon: Icon = Tray,
  title,
  description,
  isDark = false,
  actionText,
  onAction,
}: CommunityEmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center space-y-2.5 rounded-xl border border-dashed p-6 text-center transition-colors ${
        isDark
          ? 'border-white/10 bg-white/[0.03] text-[#aaa59d]'
          : 'border-black/10 bg-[#f9f7f4] text-[#6f6a64]'
      }`}
    >
      <div
        className={`w-10 h-10 rounded-xl flex items-center justify-center ${
          isDark ? 'bg-white/[0.06] text-[#e9a58c]' : 'bg-[#f5ebe6] text-[#c86544]'
        }`}
      >
        <Icon className="w-5 h-5 opacity-80" />
      </div>
      <p className={`text-sm font-semibold ${isDark ? 'text-[#f5f4f2]' : 'text-[#171716]'}`}>
        {title}
      </p>
      {description && (
        <p className="max-w-sm text-xs leading-5">
          {description}
        </p>
      )}
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="mt-1 cursor-pointer rounded-xl bg-[#171716] px-3.5 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-[#292826] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c86544]"
        >
          {actionText}
        </button>
      )}
    </div>
  );
}
