'use client';

import React, { useState } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';



export default function AuthPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isEmailAuth, setIsEmailAuth] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [isSignUpMode, setIsSignUpMode] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // If already authenticated, redirect to personalized page
  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      console.log('[AuthPage] User already authenticated, redirecting to personalized page');
      router.push('/personalized');
    }
  }, [status, session, router]);

  const handleGoogleAuth = async () => {
    console.log(`[AuthPage] Starting Google ${isSignUpMode ? 'sign-up' : 'sign-in'}`);
    setIsSigningIn(true);
    setError(null);
    
    try {
      const result = await signIn('google', { 
        callbackUrl: '/personalized',
        redirect: true 
      });
      
      if (result?.error) {
        console.error('[AuthPage] Google auth error:', result.error);
        setError(`Unable to ${isSignUpMode ? 'sign up' : 'sign in'}. Please try again.`);
        setIsSigningIn(false);
      }
    } catch (error) {
      console.error('[AuthPage] Error during Google auth:', error);
      setError('An unexpected error occurred. Please try again.');
      setIsSigningIn(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log(`[AuthPage] Starting email/password ${isSignUpMode ? 'sign-up' : 'sign-in'}`);
    setIsEmailAuth(true);
    setError(null);

    // Validation for sign-up mode
    if (isSignUpMode && password !== confirmPassword) {
      setError('Passwords do not match. Please try again.');
      setIsEmailAuth(false);
      return;
    }

    if (isSignUpMode && password.length < 8) {
      setError('Password must be at least 8 characters long.');
      setIsEmailAuth(false);
      return;
    }
    
    try {
      if (isSignUpMode) {
        // For sign-up, we'll use the credentials provider which should handle registration
        const result = await signIn('credentials', {
          email,
          password,
          isSignUp: 'true',
          callbackUrl: '/personalized',
          redirect: false
        });
        
        if (result?.error) {
          console.error('[AuthPage] Email sign-up error:', result.error);
          setError(result.error.includes('exists') ? 'An account with this email already exists. Try signing in instead.' : 'Unable to create account. Please try again.');
          setIsEmailAuth(false);
        } else if (result?.ok) {
          router.push('/personalized');
        }
      } else {
        // For sign-in
        const result = await signIn('credentials', {
          email,
          password,
          callbackUrl: '/personalized',
          redirect: false
        });
        
        if (result?.error) {
          console.error('[AuthPage] Email sign-in error:', result.error);
          setError('Invalid email or password. Please try again.');
          setIsEmailAuth(false);
        } else if (result?.ok) {
          router.push('/personalized');
        }
      }
    } catch (error) {
      console.error(`[AuthPage] Error during email ${isSignUpMode ? 'sign-up' : 'sign-in'}:`, error);
      setError('An unexpected error occurred. Please try again.');
      setIsEmailAuth(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-timeback-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="w-full max-w-md mx-auto px-4">
        <div className="space-y-8">
          {/* Logo/Brand */}
          <div className="text-center">
            <h1 className="text-3xl font-bold text-timeback-primary font-cal">
              TimeBack
            </h1>
            <p className="mt-2 text-base text-timeback-primary/70 font-cal">
              {isSignUpMode ? 'Create your account' : 'Sign in to continue'}
            </p>
          </div>

          {/* Security & Personalization Message */}
          <div className="text-center bg-timeback-bg/5 border border-timeback-primary/10 rounded-xl p-4">
            <div className="flex items-center justify-center mb-2">
              <svg className="w-5 h-5 text-timeback-primary mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <h3 className="text-sm font-bold text-timeback-primary font-cal">Secure AI-Powered Learning</h3>
            </div>
            <p className="text-xs text-timeback-primary/70 font-cal leading-relaxed">
              Your account enables our AI to create personalized learning experiences tailored specifically to your child's needs, interests, and learning style. Secure authentication ensures only trusted users access our educational content and protects your family's learning journey.
            </p>
          </div>

          {/* Error message */}
          {error && (
            <div className="bg-timeback-bg/10 border border-timeback-primary/20 rounded-xl p-4">
              <p className="text-sm text-timeback-primary font-cal">{error}</p>
            </div>
          )}

          {/* Email/Password Form */}
          {showEmailForm ? (
            <form onSubmit={handleEmailAuth} className="space-y-4">
              <div>
                <label htmlFor="email" className="sr-only">
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-timeback-primary/30 rounded-xl shadow-sm placeholder-timeback-primary/50 text-timeback-primary bg-white focus:outline-none focus:ring-2 focus:ring-timeback-primary focus:border-timeback-primary font-cal"
                  placeholder="Email address"
                />
              </div>
              
              <div>
                <label htmlFor="password" className="sr-only">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete={isSignUpMode ? "new-password" : "current-password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-timeback-primary/30 rounded-xl shadow-sm placeholder-timeback-primary/50 text-timeback-primary bg-white focus:outline-none focus:ring-2 focus:ring-timeback-primary focus:border-timeback-primary font-cal"
                  placeholder={isSignUpMode ? "Create password (8+ characters)" : "Password"}
                />
              </div>

              {isSignUpMode && (
                <div>
                  <label htmlFor="confirmPassword" className="sr-only">
                    Confirm Password
                  </label>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-3 border border-timeback-primary/30 rounded-xl shadow-sm placeholder-timeback-primary/50 text-timeback-primary bg-white focus:outline-none focus:ring-2 focus:ring-timeback-primary focus:border-timeback-primary font-cal"
                    placeholder="Confirm password"
                  />
                </div>
              )}

              <div className="space-y-3">
                <button
                  type="submit"
                  disabled={isEmailAuth}
                  className="w-full flex items-center justify-center px-4 py-3 bg-timeback-primary text-white rounded-xl shadow-sm text-base font-medium hover:bg-timeback-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-timeback-primary transition-colors disabled:opacity-60 disabled:cursor-not-allowed font-cal"
                >
                  {isEmailAuth ? (
                    <>
                      <div className="w-5 h-5 mr-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      {isSignUpMode ? 'Creating account...' : 'Signing in...'}
                    </>
                  ) : (
                    isSignUpMode ? 'Create Account' : 'Sign In'
                  )}
                </button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-timeback-primary/20"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-timeback-primary/60 font-cal">Or continue with</span>
                  </div>
                </div>

            <button
                  type="button"
                  onClick={handleGoogleAuth}
              disabled={isSigningIn}
              className="w-full flex items-center justify-center px-4 py-3 border border-timeback-primary/30 rounded-xl shadow-sm text-base font-medium text-timeback-primary bg-white hover:bg-timeback-bg/5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-timeback-primary transition-colors disabled:opacity-60 disabled:cursor-not-allowed font-cal"
                  aria-label={`${isSignUpMode ? 'Sign up' : 'Sign in'} with Google`}
            >
              {isSigningIn ? (
                <>
                  <div className="w-5 h-5 mr-3 border-2 border-timeback-primary border-t-transparent rounded-full animate-spin"></div>
                      {isSignUpMode ? 'Creating account...' : 'Signing in...'}
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  Continue with Google
                </>
              )}
            </button>

                <div className="text-center space-y-2">
                  <button
                    type="button"
                    onClick={() => setIsSignUpMode(!isSignUpMode)}
                    className="text-sm text-timeback-primary/60 hover:text-timeback-primary font-cal underline"
                  >
                    {isSignUpMode ? 'Already have an account? Sign in' : 'Need an account? Sign up'}
                  </button>
                  <div>
                    <button
                      type="button"
                      onClick={() => setShowEmailForm(false)}
                      className="text-sm text-timeback-primary/60 hover:text-timeback-primary font-cal underline"
                    >
                      Back to options
                    </button>
                </div>
                </div>
              </div>
            </form>
                    ) : (
            /* Initial sign-up/sign-in options */
            <div className="space-y-4">
              <button
                onClick={handleGoogleAuth}
                disabled={isSigningIn}
                className="w-full flex items-center justify-center px-4 py-3 border border-timeback-primary/30 rounded-xl shadow-sm text-base font-medium text-timeback-primary bg-white hover:bg-timeback-bg/5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-timeback-primary transition-colors disabled:opacity-60 disabled:cursor-not-allowed font-cal"
                aria-label={`${isSignUpMode ? 'Sign up' : 'Sign in'} with Google`}
              >
                {isSigningIn ? (
                  <>
                    <div className="w-5 h-5 mr-3 border-2 border-timeback-primary border-t-transparent rounded-full animate-spin"></div>
                    {isSignUpMode ? 'Creating account...' : 'Signing in...'}
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                    Continue with Google
                  </>
                )}
              </button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-timeback-primary/20"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-timeback-primary/60 font-cal">Or</span>
                </div>
              </div>

              <button
                onClick={() => setShowEmailForm(true)}
                className="w-full flex items-center justify-center px-4 py-3 bg-timeback-primary text-white rounded-xl shadow-sm text-base font-medium hover:bg-timeback-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-timeback-primary transition-colors font-cal"
              >
                {isSignUpMode ? 'Sign up with Email' : 'Sign in with Email'}
              </button>

              <div className="text-center">
                <button
                  onClick={() => setIsSignUpMode(!isSignUpMode)}
                  className="text-sm text-timeback-primary/60 hover:text-timeback-primary font-cal underline"
                >
                  {isSignUpMode ? 'Already have an account? Sign in' : 'Need an account? Sign up'}
                </button>
              </div>
            </div>
          )}

          <p className="text-center text-xs text-timeback-primary/60 font-cal">
            By {isSignUpMode ? 'creating an account' : 'signing in'}, you agree to our Terms of Service and Privacy Policy
          </p>
          </div>
      </div>
    </div>
  );
}