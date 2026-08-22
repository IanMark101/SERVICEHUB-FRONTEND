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
  const IconComponent = ICON_MAP[category.iconName] || HelpCircle;

  return (
    <Link
      href={`/help/${category.slug}`}
      className="group p-6 rounded-2xl border transition-all duration-200 flex flex-col justify-between hover:border-orange-500/60 hover:-translate-y-0.5 bg-white dark:bg-[#1a1916] border-slate-200 dark:border-neutral-800/80 hover:bg-slate-50/50 dark:hover:bg-[#201f1c] text-slate-800 dark:text-neutral-200 shadow-xs hover:shadow-md"
    >
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-slate-100 dark:bg-neutral-800 text-slate-700 dark:text-neutral-300 group-hover:bg-orange-500/10 group-hover:text-orange-500 transition-colors">
            <IconComponent className="w-5 h-5" />
          </div>
          {articleCount !== undefined && (
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-neutral-800 text-slate-500 dark:text-neutral-400">
              {articleCount} {articleCount === 1 ? 'guide' : 'guides'}
            </span>
          )}
        </div>

        <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
          {category.title}
        </h3>
        <p className="text-xs sm:text-sm leading-relaxed text-slate-500 dark:text-neutral-400 mt-2 line-clamp-3">
          {category.description}
        </p>
      </div>

      <div className="mt-6 pt-4 border-t border-slate-100 dark:border-neutral-800/60 flex items-center justify-between text-xs font-bold text-orange-600 dark:text-orange-400">
        <span>Explore collection</span>
        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
      </div>
    </Link>
  );
}
