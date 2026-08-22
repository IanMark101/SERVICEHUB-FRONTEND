"use client";
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
  Mail,
  Sparkles,
} from 'lucide-react';
import { HELP_CATEGORIES } from '../data/categories';

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

interface HelpSidebarProps {
  currentCategorySlug?: string;
}

export default function HelpSidebar({ currentCategorySlug }: HelpSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="w-full lg:w-64 shrink-0 space-y-6">
      {/* Category List Navigation */}
      <div className="rounded-2xl p-4 border shadow-xs bg-white dark:bg-[#22211e] border-slate-200 dark:border-neutral-800/80">
        <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-neutral-500 mb-3 px-2">
          Help Categories
        </h4>

        <nav className="space-y-1">
          {HELP_CATEGORIES.map((cat) => {
            const Icon = ICON_MAP[cat.iconName] || HelpCircle;
            const isActive = currentCategorySlug === cat.slug;

            return (
              <Link
                key={cat.slug}
                href={`/help/${cat.slug}`}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-orange-500 text-white shadow-xs'
                    : 'text-slate-600 dark:text-[#b4b0a9] hover:text-slate-900 dark:hover:text-[#f2efe9] hover:bg-slate-100/70 dark:hover:bg-neutral-800/50'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="truncate">{cat.shortTitle || cat.title}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Municipal Support Card */}
      <div className="rounded-2xl p-4 border space-y-2.5 text-xs bg-orange-50/70 dark:bg-orange-950/20 border-orange-200/80 dark:border-orange-900/30 text-slate-800 dark:text-[#f2efe9]">
        <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400 font-extrabold text-xs">
          <Mail className="w-4 h-4" />
          <span>Still need assistance?</span>
        </div>
        <p className="text-[11px] leading-relaxed text-slate-500 dark:text-neutral-400">
          Have questions about your verification or a pending arbitration case? Contact the Cordova Municipal Administrators.
        </p>
        <a
          href="mailto:admin@servicehub-cordova.local"
          className="inline-block text-[11px] font-bold text-orange-600 dark:text-orange-400 hover:underline"
        >
          admin@servicehub-cordova.local →
        </a>
      </div>
    </aside>
  );
}
