"use client";
import React from 'react';
import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';
import { useApp } from '@/context/AppContext';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface HelpBreadcrumbsProps {
  items: BreadcrumbItem[];
}

export default function HelpBreadcrumbs({ items }: HelpBreadcrumbsProps) {
  const { isDark } = useApp();

  return (
    <nav aria-label="Breadcrumbs" className="flex items-center flex-wrap gap-1.5 text-xs text-slate-500 dark:text-neutral-400 select-none">
      <Link
        href="/help"
        className="flex items-center gap-1 hover:text-orange-500 transition-colors font-semibold"
      >
        <Home className="w-3.5 h-3.5" />
        <span>Help Center</span>
      </Link>

      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <React.Fragment key={index}>
            <ChevronRight className="w-3.5 h-3.5 text-slate-300 dark:text-neutral-600 shrink-0" />
            {isLast || !item.href ? (
              <span className={`font-bold truncate max-w-[240px] sm:max-w-md ${
                isDark ? 'text-[#f2efe9]' : 'text-slate-900'
              }`}>
                {item.label}
              </span>
            ) : (
              <Link
                href={item.href}
                className="hover:text-orange-500 transition-colors font-semibold truncate max-w-[180px]"
              >
                {item.label}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}
