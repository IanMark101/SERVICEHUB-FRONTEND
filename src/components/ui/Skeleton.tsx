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
    pulse: 'workspace-skeleton--pulse',
    shimmer: 'workspace-skeleton--shimmer',
    none: '',
  };

  return (
    <div
      className={`workspace-skeleton ${variantStyles[variant]} ${animationStyles[animate]} ${className}`}
      aria-hidden="true"
      {...props}
    />
  );
}
