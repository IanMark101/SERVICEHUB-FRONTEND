"use client";
import React from 'react';
import Link from 'next/link';
import {
  Compass,
  ShieldCheck,
  Award,
  Briefcase,
  CalendarCheck,
  Inbox,
  Hourglass,
  MessageSquare,
  DollarSign,
  Star,
  Bell,
  TrendingUp,
  AlertTriangle,
  HelpCircle,
  ArrowRight,
} from 'lucide-react';
import { HelpCategory } from '../types/help.types';
import { useApp } from '@/context/AppContext';

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Compass,
  ShieldCheck,
  Award,
  Briefcase,
  CalendarCheck,
  Inbox,
  Hourglass,
  MessageSquare,
  DollarSign,
  Star,
  Bell,
  TrendingUp,
  AlertTriangle,
};

interface HelpCategoryCardProps {
  category: HelpCategory;
  articleCount?: number;
}

export default function HelpCategoryCard({ category, articleCount }: HelpCategoryCardProps) {
  const { isDark } = useApp();
  const IconComponent = ICON_MAP[category.iconName] || HelpCircle;

  return (
    <Link
      href={`/help/${category.slug}`}
      className={`group p-5 rounded-2xl border transition-all duration-200 flex flex-col justify-between hover:border-orange-500/60 ${
        isDark
          ? 'bg-[#1e1d1a] border-neutral-800/80 hover:bg-[#23221e] text-neutral-200'
          : 'bg-white border-slate-200 hover:bg-slate-50/50 text-slate-800 shadow-xs'
      }`}
    >
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-slate-100 dark:bg-neutral-800 text-slate-700 dark:text-neutral-300 group-hover:text-orange-500 transition-colors">
            <IconComponent className="w-4 h-4" />
          </div>
          {articleCount !== undefined && (
            <span className="text-[11px] font-medium text-slate-400 dark:text-neutral-500">
              {articleCount} {articleCount === 1 ? 'article' : 'articles'}
            </span>
          )}
        </div>

        <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
          {category.title}
        </h3>
        <p className="text-xs leading-relaxed text-slate-500 dark:text-neutral-400 mt-1.5 line-clamp-2">
          {category.description}
        </p>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-neutral-800/60 flex items-center justify-between text-xs font-semibold text-orange-600 dark:text-orange-400">
        <span>View collection</span>
        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
      </div>
    </Link>
  );
}
