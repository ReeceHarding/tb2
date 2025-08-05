'use client';

import React from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AuthPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // If already authenticated, redirect to personalized page
  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      console.log('[AuthPage] User already authenticated, redirecting to personalized page');
      router.push('/personalized');
    }
  }, [status, session, router]);

  const handleGoogleSignIn = async () => {
    console.log('[AuthPage] Starting Google sign-in');
    try {
      await signIn('google', { 
        callbackUrl: '/personalized',
        redirect: true 
      });
    } catch (error) {
      console.error('[AuthPage] Error during sign-in:', error);
    }
  };

  if (status === 'loading') {
    return (
      <div className="h-screen overflow-hidden bg-gradient-to-br from-timeback-bg to-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-timeback-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="h-screen overflow-hidden bg-gradient-to-br from-timeback-bg to-white flex flex-col">
      <div className="max-w-5xl mx-auto px-6 sm:px-8 lg:px-12 py-8 lg:py-16 flex-1 overflow-y-auto">
        <div className="h-full flex items-center justify-center">
          <div className="w-full">
            <div className="flex flex-col items-center justify-center min-h-[70vh] text-center max-w-5xl mx-auto px-4 relative font-cal">
              {/* Animated background blobs */}
              <div className="absolute inset-0 -z-10 opacity-5">
                <div className="absolute top-0 -left-4 w-72 h-72 bg-timeback-bg rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
                <div className="absolute top-0 -right-4 w-72 h-72 bg-timeback-bg rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
                <div className="absolute -bottom-8 left-20 w-72 h-72 bg-timeback-bg rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
              </div>

              <div className="mb-16 space-y-8">
                <div className="inline-flex items-center px-4 py-2 bg-timeback-bg border border-timeback-primary rounded-full mb-6">
                  <span className="flex h-2 w-2 rounded-full bg-timeback-primary mr-2"></span>
                  <span className="text-sm font-medium text-timeback-primary font-cal">AI-Powered Educational Innovation</span>
                </div>

                <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold leading-tight font-cal">
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-timeback-primary to-timeback-primary font-cal">
                    The World&apos;s First
                  </span>
                  <br />
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-timeback-primary to-timeback-primary font-cal">
                    Self-Tailoring Website
                  </span>
                </h1>

                <div className="space-y-4 max-w-3xl mx-auto">
                  <p className="text-xl sm:text-2xl text-timeback-primary font-medium leading-relaxed font-cal">
                    Experience education that adapts to you
                  </p>
                  <p className="text-lg sm:text-xl text-timeback-primary leading-relaxed font-cal">
                    Just like TimeBack creates personalized learning questions tailored to each child&apos;s interests and level, 
                    we&apos;ll generate a website experience customized specifically for you.
                  </p>
                </div>

                {/* Security explanation */}
                <div className="mt-12 p-6 bg-white/50 backdrop-blur-sm rounded-xl border border-timeback-primary max-w-2xl mx-auto">
                  <h2 className="text-2xl font-bold text-timeback-primary mb-3 font-cal">
                    Why Sign In?
                  </h2>
                  <p className="text-lg text-timeback-primary font-cal">
                    Our AI generates personalized content just for you, which requires computational resources. 
                    To protect against malicious actors and ensure everyone gets a great experience, 
                    we ask you to sign in with Google.
                  </p>
                </div>
              </div>

              {/* Google Sign In Button */}
              <div className="relative">
                <button
                  onClick={handleGoogleSignIn}
                  className="group relative inline-flex items-center justify-center px-10 py-5 text-lg font-semibold bg-white hover:bg-gray-50 text-timeback-primary border-2 border-timeback-primary rounded-xl shadow-2xl hover:shadow-2xl transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-timeback-bg font-cal"
                >
                  {/* Google Icon */}
                  <svg className="w-6 h-6 mr-3" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  <span>Continue with Google</span>
                  <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </button>
              </div>

              <p className="mt-4 text-sm text-timeback-primary opacity-75 font-cal">
                Your information is secure and used only to personalize your experience
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}