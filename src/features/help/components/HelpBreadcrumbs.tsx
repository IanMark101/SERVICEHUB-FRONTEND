"use client";
import React from 'react';
import Link from 'next/link';
import { CaretRight } from '@phosphor-icons/react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface HelpBreadcrumbsProps {
  items: BreadcrumbItem[];
}

export default function HelpBreadcrumbs({ items }: HelpBreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumbs" className="mb-6 flex flex-wrap items-center gap-1.5 text-xs text-ink-subtle dark:text-white/48">
      <Link
        href="/help"
        className="font-medium transition-colors hover:text-brand-text focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-focus dark:hover:text-brand-on-dark"
      >
        All Collections
      </Link>

      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <React.Fragment key={index}>
            <CaretRight size={13} className="shrink-0 text-ink-subtle dark:text-white/28" aria-hidden="true" />
            {isLast || !item.href ? (
              <span className="max-w-[280px] truncate font-medium text-ink-secondary dark:text-white/72 sm:max-w-md">
                {item.label}
              </span>
            ) : (
              <Link
                href={item.href}
                className="max-w-[200px] truncate font-medium transition-colors hover:text-brand-text focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-focus dark:hover:text-brand-on-dark"
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
