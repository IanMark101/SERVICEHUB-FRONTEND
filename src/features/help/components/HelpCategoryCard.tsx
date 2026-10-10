"use client";
import React from 'react';
import Link from 'next/link';
import {
  ArrowRight, Bell, Briefcase, CalendarCheck, ChatCenteredText, Compass,
  CurrencyDollar, Hourglass, Medal, Question, ShieldCheck, Star, Tray,
  TrendUp, Warning,
} from '@phosphor-icons/react';
import { HelpCategory } from '../types/help.types';

const ICON_MAP: Record<string, React.ComponentType<{ className?: string; size?: number; weight?: 'regular' | 'bold' }>> = {
  Compass,
  ShieldCheck,
  Award: Medal,
  Briefcase,
  CalendarCheck,
  Inbox: Tray,
  Hourglass,
  MessageSquare: ChatCenteredText,
  DollarSign: CurrencyDollar,
  Star,
  Bell,
  TrendingUp: TrendUp,
  AlertTriangle: Warning,
};

interface HelpCategoryCardProps {
  category: HelpCategory;
  articleCount?: number;
}

export default function HelpCategoryCard({ category, articleCount }: HelpCategoryCardProps) {
  const IconComponent = ICON_MAP[category.iconName] || Question;

  return (
    <Link
      href={`/help/${category.slug}`}
      className="group grid grid-cols-[2.5rem_minmax(0,1fr)_auto] items-center gap-3 border-b border-black/8 py-4 text-ink transition-colors last:border-b-0 hover:text-brand-text focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-focus dark:border-white/10 dark:text-white"
    >
      <span className="grid size-10 place-items-center rounded-xl bg-[#f5f4f2] text-brand-text transition-colors group-hover:bg-orange-100 dark:bg-charcoal dark:text-brand-on-dark">
        <IconComponent size={19} weight="regular" aria-hidden="true" />
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-semibold leading-5 tracking-[-0.015em]">
          {category.title}
        </span>
        <span className="mt-1 block text-xs leading-5 text-ink-muted dark:text-white/58">
          {category.description}
        </span>
      </span>
      <span className="flex items-center gap-2 pl-2 text-[11px] font-medium text-ink-subtle dark:text-white/48">
        {articleCount !== undefined && <span className="hidden sm:inline">{articleCount} {articleCount === 1 ? 'guide' : 'guides'}</span>}
        <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
      </span>
    </Link>
  );
}
