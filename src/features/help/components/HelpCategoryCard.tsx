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
  ArrowRight,
  HelpCircle,
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
      className={`group rounded-[24px] p-6 border shadow-xs transition-all duration-300 flex flex-col justify-between hover:shadow-lg hover:scale-[1.015] ${
        isDark
          ? 'bg-[#22211e] border-neutral-800/80 hover:border-neutral-700 text-[#f2efe9]'
          : 'bg-white border-slate-200 hover:border-slate-300 text-slate-900 shadow-sm'
      }`}
    >
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center transition-transform duration-300 group-hover:scale-110 shadow-xs ${category.color}`}>
            <IconComponent className="w-6 h-6" />
          </div>
          {articleCount !== undefined && (
            <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-neutral-100 dark:bg-neutral-800 text-slate-500 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-700/60">
              {articleCount} {articleCount === 1 ? 'Article' : 'Articles'}
            </span>
          )}
        </div>

        <h3 className="text-base font-extrabold tracking-tight group-hover:text-orange-500 transition-colors">
          {category.title}
        </h3>
        <p className="text-xs leading-relaxed text-slate-500 dark:text-neutral-400 mt-2 line-clamp-2">
          {category.description}
        </p>
      </div>

      <div className="mt-5 pt-3 border-t border-slate-100 dark:border-neutral-800/80 flex items-center justify-between text-xs font-bold text-orange-600 dark:text-orange-400">
        <span>Explore topics</span>
        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
      </div>
    </Link>
  );
}
