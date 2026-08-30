import React from 'react';
import { Calendar, ArrowRight, Layers, Shield, Lock, Sparkles } from 'lucide-react';
import { CommunityUpdateItem } from '../types/community.types';

interface CommunityUpdateCardProps {
  item: CommunityUpdateItem;
  isDark?: boolean;
  onAction?: (link: string) => void;
}

export default function CommunityUpdateCard({
  item,
  isDark = false,
  onAction,
}: CommunityUpdateCardProps) {
  const getCategoryIcon = (cat: CommunityUpdateItem['category']) => {
    switch (cat) {
      case 'milestone':
        return Layers;
      case 'security':
        return Lock;
      case 'guide':
        return Shield;
      default:
        return Sparkles;
    }
  };

  const getBadgeStyle = (cat: CommunityUpdateItem['category']) => {
    switch (cat) {
      case 'milestone':
        return isDark
          ? 'bg-emerald-950/30 border-emerald-800/40 text-emerald-400'
          : 'bg-emerald-50 border-emerald-200 text-emerald-700';
      case 'security':
        return isDark
          ? 'bg-blue-950/30 border-blue-800/40 text-blue-400'
          : 'bg-blue-50 border-blue-200 text-blue-700';
      case 'guide':
        return isDark
          ? 'bg-purple-950/30 border-purple-800/40 text-purple-400'
          : 'bg-purple-50 border-purple-200 text-purple-700';
      default:
        return isDark
          ? 'bg-orange-950/30 border-orange-800/40 text-orange-400'
          : 'bg-orange-50 border-orange-200 text-orange-600';
    }
  };

  const Icon = getCategoryIcon(item.category);
  const badgeClass = getBadgeStyle(item.category);

  return (
    <div
      className={`rounded-2xl p-5 border flex flex-col justify-between shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 ${
        isDark
          ? 'bg-[#22211e] border-neutral-800/80 text-[#f2efe9]'
          : 'bg-white border-slate-200 text-slate-900'
      }`}
    >
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className={`text-[9px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border flex items-center space-x-1 ${badgeClass}`}>
            <Icon className="w-3 h-3 mr-1" />
            <span>{item.badgeLabel}</span>
          </span>

          {item.isLiveMilestone && item.eventDate && (
            <span className={`text-[9px] font-bold flex items-center ${isDark ? 'text-[#b4b0a9]' : 'text-slate-400'}`}>
              <Calendar className="w-3 h-3 mr-1" />
              {new Date(item.eventDate).toLocaleDateString('en-PH', {
                month: 'short',
                day: 'numeric',
              })}
            </span>
          )}
        </div>

        <h3 className="font-extrabold text-xs leading-snug tracking-tight">
          {item.title}
        </h3>

        <p className={`text-[11px] font-medium leading-relaxed ${isDark ? 'text-[#b4b0a9]' : 'text-slate-600'}`}>
          {item.summary}
        </p>
      </div>

      {item.actionText && item.actionLink && (
        <div className="pt-4 border-t mt-4 border-dashed border-neutral-700/30 dark:border-neutral-800/80">
          <button
            onClick={() => onAction && onAction(item.actionLink!)}
            className={`w-full py-2 px-3 rounded-xl font-bold text-[10px] flex items-center justify-center space-x-1.5 transition-all cursor-pointer ${
              isDark
                ? 'bg-[#191919] hover:bg-neutral-800 text-[#f2efe9] border border-neutral-800'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200'
            }`}
          >
            <span>{item.actionText}</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      )}
    </div>
  );
}
