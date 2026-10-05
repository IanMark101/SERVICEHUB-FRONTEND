"use client";

import Image from 'next/image';
import { useState, type CSSProperties } from 'react';

type UserAvatarProps = {
  src?: string | null;
  name?: string | null;
  alt?: string;
  size?: number;
  role?: 'seeker' | 'provider' | 'admin' | 'neutral';
  shape?: 'circle' | 'soft';
  className?: string;
};

function getInitials(name: string) {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return 'SH';
  return `${words[0]?.[0] || ''}${words.length > 1 ? words.at(-1)?.[0] || '' : ''}`.toUpperCase();
}

export default function UserAvatar({
  src,
  name = 'ServiceHub member',
  alt = '',
  size = 40,
  role = 'neutral',
  shape = 'circle',
  className = '',
}: UserAvatarProps) {
  const [failedSrc, setFailedSrc] = useState('');
  const cleanSrc = src?.trim() || '';
  const displayName = name?.trim() || 'ServiceHub member';
  const showImage = Boolean(cleanSrc) && cleanSrc !== failedSrc;

  return (
    <span
      className={`user-avatar user-avatar--${role} user-avatar--${shape} ${className}`}
      style={{ '--avatar-size': `${size}px` } as CSSProperties}
      role={!showImage ? 'img' : undefined}
      aria-label={!showImage ? (alt || `${displayName} avatar`) : undefined}
    >
      {showImage ? (
        <Image
          unoptimized
          width={size}
          height={size}
          src={cleanSrc}
          alt={alt}
          className="user-avatar__image"
          onError={() => setFailedSrc(cleanSrc)}
        />
      ) : (
        <span className="user-avatar__initials" aria-hidden="true">{getInitials(displayName)}</span>
      )}
    </span>
  );
}
