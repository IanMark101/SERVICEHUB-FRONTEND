"use client";
import React from 'react';
import Link from 'next/link';
import { HelpCircle } from 'lucide-react';

interface ContextualHelpButtonProps {
  href: string;
  label?: string;
  tooltip?: string;
  variant?: 'icon' | 'badge' | 'text';
  className?: string;
}

export default function ContextualHelpButton({
  href,
  label = 'Learn more',
  tooltip,
  variant = 'icon',
  className = '',
}: ContextualHelpButtonProps) {
  if (variant === 'badge') {
    return (
      <Link
        href={href}
        title={tooltip || label}
        className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border border-orange-500/20 bg-orange-500/10 text-orange-600 dark:text-orange-400 hover:bg-orange-500/20 transition-colors cursor-pointer ${className}`}
      >
        <HelpCircle className="w-3 h-3" />
        <span>{label}</span>
      </Link>
    );
  }

  if (variant === 'text') {
    return (
      <Link
        href={href}
        title={tooltip || label}
        className={`inline-flex items-center gap-1 text-xs font-semibold text-orange-600 dark:text-orange-400 hover:underline cursor-pointer ${className}`}
      >
        <HelpCircle className="w-3.5 h-3.5" />
        <span>{label}</span>
      </Link>
    );
  }

  return (
    <Link
      href={href}
      title={tooltip || label}
      className={`inline-flex items-center justify-center p-1 rounded-full text-slate-400 hover:text-orange-500 dark:text-neutral-500 dark:hover:text-orange-400 transition-colors cursor-pointer ${className}`}
    >
      <HelpCircle className="w-3.5 h-3.5" />
    </Link>
  );
}
