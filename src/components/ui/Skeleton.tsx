import React from 'react';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
  animate?: 'pulse' | 'shimmer' | 'none';
}

export default function Skeleton({
  className = '',
  variant = 'rounded',
  animate = 'pulse',
  ...props
}: SkeletonProps) {
  const variantStyles = {
    text: 'h-4 w-full rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-none',
    rounded: 'rounded-xl',
  };

  const animationStyles = {
    pulse: 'animate-pulse',
    shimmer: 'relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent',
    none: '',
  };

  return (
    <div
      className={`bg-slate-200 dark:bg-neutral-800/80 ${variantStyles[variant]} ${animationStyles[animate]} ${className}`}
      {...props}
    />
  );
}
