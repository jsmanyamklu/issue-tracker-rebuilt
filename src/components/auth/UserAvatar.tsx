'use client';

import { useSession } from 'next-auth/react';
import Image from 'next/image';

interface UserAvatarProps {
  className?: string;
  size?: number;
}

/**
 * User avatar component - displays current user's avatar
 */
export function UserAvatar({ className = '', size = 40 }: UserAvatarProps) {
  const { data: session } = useSession();

  if (!session?.user) {
    return null;
  }

  const initials = session.user.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || '?';

  return (
    <div
      className={`relative rounded-full overflow-hidden bg-primary-500 flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      {session.user.image ? (
        <Image
          src={session.user.image}
          alt={session.user.name || 'User'}
          width={size}
          height={size}
          className="object-cover"
        />
      ) : (
        <span className="text-white font-semibold" style={{ fontSize: size / 2.5 }}>
          {initials}
        </span>
      )}
    </div>
  );
}
