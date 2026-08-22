"use client";
import React from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
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
    <nav aria-label="Breadcrumbs" className="flex items-center flex-wrap gap-1.5 text-xs text-slate-500 dark:text-neutral-400 select-none mb-6">
      <Link
        href="/help"
        className="hover:text-orange-600 dark:hover:text-orange-400 transition-colors font-medium"
      >
        All Collections
      </Link>

      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <React.Fragment key={index}>
            <ChevronRight className="w-3 h-3 text-slate-400 dark:text-neutral-600 shrink-0" />
            {isLast || !item.href ? (
              <span className={`font-medium truncate max-w-[280px] sm:max-w-md ${
                isDark ? 'text-neutral-300' : 'text-slate-700'
              }`}>
                {item.label}
              </span>
            ) : (
              <Link
                href={item.href}
                className="hover:text-orange-600 dark:hover:text-orange-400 transition-colors font-medium truncate max-w-[200px]"
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
