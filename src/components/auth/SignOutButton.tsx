'use client';

import { signOut } from 'next-auth/react';
import { useState } from 'react';

interface SignOutButtonProps {
  className?: string;
  children?: React.ReactNode;
}

/**
 * Sign out button component
 */
export function SignOutButton({ className = '', children }: SignOutButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleSignOut = async () => {
    setIsLoading(true);
    try {
      await signOut({ callbackUrl: '/' });
    } catch (error) {
      console.error('Sign out error:', error);
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleSignOut}
      disabled={isLoading}
      className={`
        px-4 py-2 rounded-lg font-medium transition-colors duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
    >
      {isLoading ? 'Signing out...' : children || 'Sign Out'}
    </button>
  );
}
