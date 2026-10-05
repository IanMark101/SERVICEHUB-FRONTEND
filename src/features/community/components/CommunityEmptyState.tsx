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
      className={`flex flex-col items-start gap-2 rounded-xl border border-dashed p-4 text-left transition-colors ${
        isDark
          ? 'border-white/10 bg-white/[0.03] text-ink-muted'
          : 'border-black/10 bg-[#f9f7f4] text-ink-muted'
      }`}
    >
      <div
        className={`flex size-9 items-center justify-center rounded-lg ${
          isDark ? 'bg-white/[0.06] text-[#e9a58c]' : 'bg-[#f5ebe6] text-[#c86544]'
        }`}
      >
        <Icon className="size-[18px] opacity-80" />
      </div>
      <p className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-ink'}`}>
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
