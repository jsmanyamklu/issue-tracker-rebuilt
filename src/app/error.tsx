'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/Button';

/**
 * Global Error Page
 * Catches errors in the application and displays a user-friendly message
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to console (client-side)
    console.error('Application error:', {
      message: error.message,
      stack: error.stack,
      digest: error.digest,
    });
  }, [error]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-lg w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
            <svg
              className="w-8 h-8 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Something went wrong</h1>
          <p className="text-gray-600">
            We apologize for the inconvenience. The error has been logged and we'll look into it.
          </p>
        </div>

        {process.env.NODE_ENV === 'development' && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <h3 className="text-sm font-semibold text-red-800 mb-2">Error Details:</h3>
            <p className="text-sm text-red-700 font-mono mb-2">{error.message}</p>
            {error.digest && (
              <p className="text-xs text-red-600">Error ID: {error.digest}</p>
            )}
          </div>
        )}

        <div className="flex gap-3">
          <Button onClick={() => reset()} className="flex-1">
            Try Again
          </Button>
          <Button
            variant="secondary"
            onClick={() => (window.location.href = '/')}
            className="flex-1"
          >
            Go Home
          </Button>
        </div>
      </div>
    </div>
  );
}
