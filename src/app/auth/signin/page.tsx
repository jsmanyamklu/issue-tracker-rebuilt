import { SignInButton } from '@/components/auth/SignInButton';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';

/**
 * Sign in page
 * Shows OAuth provider buttons for Google and GitHub
 */
export default async function SignInPage() {
  const session = await getSession();

  // Redirect to dashboard if already signed in
  if (session?.user) {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome Back
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Sign in to your TaskForge account
            </p>
          </div>

          {/* Sign in buttons */}
          <div className="space-y-3">
            <SignInButton provider="google" className="w-full" />
            <SignInButton provider="github" className="w-full" />
          </div>

          {/* Footer */}
          <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-300">
            By signing in, you agree to our Terms of Service and Privacy Policy
          </div>
        </div>
      </div>
    </div>
  );
}
