'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSession, signIn } from 'next-auth/react';
import { useQuiz } from '../QuizContext';
import { AuthStepProps } from '@/types/quiz';
import { motion, AnimatePresence } from 'framer-motion';

export default function AuthStep({ onNext, quizData, generatedContent }: AuthStepProps) {
  const { state } = useQuiz();
  const { data: session, status } = useSession();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const timestamp = new Date().toISOString();
  
  // === CRITICAL AUTH PAGE VISIBILITY LOGS - FOR LLM PARSING ===
  console.log(`🚨 [CRITICAL-AUTH-DETECTION] ${timestamp} AUTH STEP REACHED - Analyzing why auth page may not be visible`);
  console.log(`🚨 [CRITICAL-AUTH-DETECTION] ${timestamp} Current authentication status: "${status}"`);
  console.log(`🚨 [CRITICAL-AUTH-DETECTION] ${timestamp} User session exists: ${!!session}`);
  console.log(`🚨 [CRITICAL-AUTH-DETECTION] ${timestamp} User email: ${session?.user?.email || 'NO EMAIL'}`);
  
  if (status === 'authenticated') {
    console.log(`🚨 [CRITICAL-AUTH-DETECTION] ${timestamp} *** USER IS ALREADY SIGNED IN ***`);
    console.log(`🚨 [CRITICAL-AUTH-DETECTION] ${timestamp} *** THIS IS WHY AUTH PAGE WON'T SHOW ***`);
    console.log(`🚨 [CRITICAL-AUTH-DETECTION] ${timestamp} *** COMPONENT WILL AUTO-SAVE AND SKIP TO NEXT STEP ***`);
  } else if (status === 'loading') {
    console.log(`🚨 [CRITICAL-AUTH-DETECTION] ${timestamp} Authentication status is loading - waiting for session check`);
  } else {
    console.log(`🚨 [CRITICAL-AUTH-DETECTION] ${timestamp} *** USER IS NOT SIGNED IN ***`);
    console.log(`🚨 [CRITICAL-AUTH-DETECTION] ${timestamp} *** AUTH PAGE WILL BE DISPLAYED ***`);
  }
  // === END CRITICAL AUTH DETECTION LOGS ===
  
  console.log(`[AuthStep] ${timestamp} Rendering with status:`, status);
  console.log(`[AuthStep] ${timestamp} Quiz data available:`, !!quizData);
  console.log(`[AuthStep] ${timestamp} Generated content available:`, !!generatedContent);

  // Prepare the quiz data from state if not provided via props
  const dataToSave = quizData || {
    userType: state.userType,
    parentSubType: state.parentSubType,
    selectedSchools: state.selectedSchools,
    kidsInterests: state.kidsInterests,
    numberOfKids: state.numberOfKids,
    completedAt: new Date().toISOString()
  };

  console.log(`[AuthStep] ${timestamp} Data to save:`, {
    userType: dataToSave.userType,
    schoolsCount: dataToSave.selectedSchools?.length || 0,
    interestsCount: dataToSave.kidsInterests?.length || 0
  });

  // Save quiz data to database when user is authenticated
  const saveQuizData = useCallback(async () => {
    const saveTimestamp = new Date().toISOString();
    if (status !== 'authenticated' || !session?.user?.email) {
      console.error(`[AuthStep] ${saveTimestamp} Cannot save - user not authenticated`);
      return false;
    }

    setIsSaving(true);
    setSaveError(null);
    
    console.log(`[AuthStep] ${saveTimestamp} Saving quiz data for user:`, session.user.email);

    try {
      const response = await fetch('/api/quiz/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          quizData: dataToSave,
          generatedContent: generatedContent || null
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      console.log(`[AuthStep] ${saveTimestamp} Quiz data saved successfully:`, result);
      
      // Also save to localStorage as backup
      localStorage.setItem('timebackQuizData', JSON.stringify(dataToSave));
      if (generatedContent) {
        localStorage.setItem('timebackGeneratedContent', JSON.stringify(generatedContent));
      }
      
      setIsSaving(false);
      return true;
    } catch (error) {
      console.error(`[AuthStep] ${saveTimestamp} Error saving quiz data:`, error);
      setSaveError(error instanceof Error ? error.message : 'Failed to save your results');
      setIsSaving(false);
      return false;
    }
  }, [status, session, dataToSave, generatedContent]);

  // Handle sign in with Google
  const handleSignIn = async () => {
    setIsSigningIn(true);
    setSaveError(null);
    
    const signInTimestamp = new Date().toISOString();
    
    // === CRITICAL SIGN-IN ACTION LOGS - FOR LLM PARSING ===
    console.log(`🚨 [CRITICAL-SIGNIN] ${signInTimestamp} *** USER CLICKED SIGN IN BUTTON ***`);
    console.log(`🚨 [CRITICAL-SIGNIN] ${signInTimestamp} *** AUTH PAGE WAS VISIBLE AND USER INTERACTED ***`);
    console.log(`🚨 [CRITICAL-SIGNIN] ${signInTimestamp} *** INITIATING GOOGLE AUTHENTICATION ***`);
    // === END CRITICAL SIGN-IN LOGS ===
    
    console.log(`[AuthStep] ${signInTimestamp} Initiating Google sign-in`);

    try {
      // Use signIn with Google provider and redirect back to current page
      await signIn('google', { 
        callbackUrl: window.location.href,
        redirect: false 
      });
      console.log(`🚨 [CRITICAL-SIGNIN] ${signInTimestamp} *** GOOGLE SIGN-IN REQUEST COMPLETED ***`);
    } catch (error) {
      console.error(`🚨 [CRITICAL-SIGNIN] ${signInTimestamp} *** GOOGLE SIGN-IN FAILED ***`, error);
      console.error(`[AuthStep] ${signInTimestamp} Error during sign-in:`, error);
      setSaveError('Failed to sign in. Please try again.');
      setIsSigningIn(false);
    }
  };

  // Handle continuing as guest (skip auth)
  const handleContinueAsGuest = () => {
    const guestTimestamp = new Date().toISOString();
    
    // === CRITICAL GUEST ACTION LOGS - FOR LLM PARSING ===
    console.log(`🚨 [CRITICAL-GUEST] ${guestTimestamp} *** USER CLICKED CONTINUE AS GUEST ***`);
    console.log(`🚨 [CRITICAL-GUEST] ${guestTimestamp} *** AUTH PAGE WAS VISIBLE AND USER CHOSE GUEST MODE ***`);
    console.log(`🚨 [CRITICAL-GUEST] ${guestTimestamp} *** SAVING DATA TO LOCALSTORAGE INSTEAD OF DATABASE ***`);
    // === END CRITICAL GUEST LOGS ===
    
    console.log(`[AuthStep] ${guestTimestamp} User chose to continue as guest`);
    
    // Save to localStorage as fallback
    localStorage.setItem('timebackQuizData', JSON.stringify(dataToSave));
    if (generatedContent) {
      localStorage.setItem('timebackGeneratedContent', JSON.stringify(generatedContent));
    }
    
    console.log(`🚨 [CRITICAL-GUEST] ${guestTimestamp} *** DATA SAVED TO LOCALSTORAGE, PROCEEDING TO RESULTS ***`);
    console.log(`[AuthStep] ${guestTimestamp} Data saved to localStorage, proceeding to results`);
    onNext();
  };

  // Auto-save and proceed when user becomes authenticated
  useEffect(() => {
    if (status === 'authenticated' && session?.user?.email) {
      const authTimestamp = new Date().toISOString();
      
      // === CRITICAL AUTO-SAVE BEHAVIOR LOGS - FOR LLM PARSING ===
      console.log(`🚨 [CRITICAL-AUTO-SAVE] ${authTimestamp} *** AUTHENTICATED USER DETECTED ***`);
      console.log(`🚨 [CRITICAL-AUTO-SAVE] ${authTimestamp} *** AUTOMATICALLY SAVING DATA AND SKIPPING AUTH PAGE ***`);
      console.log(`🚨 [CRITICAL-AUTO-SAVE] ${authTimestamp} *** USER WILL SEE SUCCESS ANIMATION THEN AUTO-PROCEED ***`);
      console.log(`🚨 [CRITICAL-AUTO-SAVE] ${authTimestamp} User: ${session.user.email}`);
      // === END CRITICAL AUTO-SAVE LOGS ===
      
      console.log(`[AuthStep] ${authTimestamp} User authenticated, auto-saving and proceeding`);
      
      saveQuizData().then((success) => {
        if (success) {
          console.log(`🚨 [CRITICAL-AUTO-SAVE] ${authTimestamp} *** DATA SAVE SUCCESSFUL ***`);
          console.log(`🚨 [CRITICAL-AUTO-SAVE] ${authTimestamp} *** SHOWING SUCCESS ANIMATION FOR 2 SECONDS ***`);
          console.log(`[AuthStep] ${authTimestamp} Save successful, proceeding to results`);
          setShowSuccess(true);
          // Show success animation before proceeding
          setTimeout(() => {
            console.log(`🚨 [CRITICAL-AUTO-SAVE] ${authTimestamp} *** AUTO-PROCEEDING TO NEXT STEP NOW ***`);
            onNext();
          }, 2000);
        } else {
          console.log(`🚨 [CRITICAL-AUTO-SAVE] ${authTimestamp} *** DATA SAVE FAILED BUT STILL AUTO-PROCEEDING ***`);
          console.log(`[AuthStep] ${authTimestamp} Save failed, but proceeding anyway`);
          // Even if save fails, continue with localStorage fallback
          setTimeout(() => {
            console.log(`🚨 [CRITICAL-AUTO-SAVE] ${authTimestamp} *** AUTO-PROCEEDING TO NEXT STEP NOW (DESPITE SAVE FAILURE) ***`);
            onNext();
          }, 2000);
        }
      });
    } else {
      const authTimestamp = new Date().toISOString();
      console.log(`🚨 [CRITICAL-AUTO-SAVE] ${authTimestamp} User not authenticated - auth page will be displayed`);
    }
  }, [status, session, onNext, saveQuizData]);

  // Enhanced authenticated state with better design
  if (status === 'authenticated') {
    const renderTimestamp = new Date().toISOString();
    
    // === CRITICAL RENDERING DECISION LOGS - FOR LLM PARSING ===
    console.log(`🚨 [CRITICAL-RENDER] ${renderTimestamp} *** RENDERING SUCCESS/LOADING ANIMATION INSTEAD OF AUTH PAGE ***`);
    console.log(`🚨 [CRITICAL-RENDER] ${renderTimestamp} *** USER IS AUTHENTICATED SO AUTH FORM IS SKIPPED ***`);
    console.log(`🚨 [CRITICAL-RENDER] ${renderTimestamp} Show success: ${showSuccess}`);
    console.log(`🚨 [CRITICAL-RENDER] ${renderTimestamp} Is saving: ${isSaving}`);
    // === END CRITICAL RENDERING LOGS ===
    
    return (
      <div className="text-center space-y-8 font-cal">
        <AnimatePresence mode="wait">
          {showSuccess ? (
            <motion.div
              key="success"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="space-y-6"
            >
              <div className="relative">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <motion.svg 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, duration: 0.3 }}
                    className="w-10 h-10 text-green-600" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </motion.svg>
                </div>
              </div>
              <div className="space-y-3">
                <h2 className="text-3xl font-bold text-timeback-primary font-cal">
                  Results Saved Successfully!
                </h2>
                <p className="text-lg text-timeback-primary font-cal max-w-md mx-auto">
                  Your personalized learning plan is now secured in your account
                </p>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="saving"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="relative">
                <div className="w-20 h-20 bg-timeback-bg rounded-full flex items-center justify-center mx-auto mb-6">
                  <div className="w-10 h-10 border-4 border-timeback-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute inset-0 w-20 h-20 bg-timeback-bg/30 rounded-full mx-auto"
                />
              </div>
              <div className="space-y-3">
                <h2 className="text-3xl font-bold text-timeback-primary font-cal">
                  {isSaving ? 'Saving Your Results...' : 'Welcome Back!'}
                </h2>
                <p className="text-lg text-timeback-primary font-cal max-w-md mx-auto">
                  {isSaving 
                    ? 'Securely saving your personalized learning plan to your account'
                    : 'Preparing your personalized results'
                  }
                </p>
              </div>
              {saveError && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mt-6 p-4 bg-gradient-to-r from-red-50 to-red-100 border-2 border-red-200 rounded-xl max-w-md mx-auto"
                >
                  <p className="text-red-700 font-semibold font-cal">{saveError}</p>
                  <p className="text-red-600 text-sm mt-1 font-cal">Don&apos;t worry - your results are still available!</p>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // === CRITICAL AUTH FORM DISPLAY LOGS - FOR LLM PARSING ===
  const authFormTimestamp = new Date().toISOString();
  console.log(`🚨 [CRITICAL-AUTH-FORM] ${authFormTimestamp} *** AUTH FORM IS BEING RENDERED ***`);
  console.log(`🚨 [CRITICAL-AUTH-FORM] ${authFormTimestamp} *** USER IS NOT AUTHENTICATED - DISPLAYING SIGN-IN OPTIONS ***`);
  console.log(`🚨 [CRITICAL-AUTH-FORM] ${authFormTimestamp} *** THIS IS THE ACTUAL AUTH PAGE THAT USER SHOULD SEE ***`);
  console.log(`🚨 [CRITICAL-AUTH-FORM] ${authFormTimestamp} Status: ${status}, Session: ${!!session}`);
  // === END CRITICAL AUTH FORM DISPLAY LOGS ===

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="text-center space-y-8 font-cal"
    >
      {/* Enhanced Header Section */}
      <div className="space-y-6">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="relative"
        >
          <div className="w-24 h-24 bg-gradient-to-br from-timeback-bg to-timeback-primary/20 rounded-full flex items-center justify-center mx-auto shadow-lg">
            <svg className="w-12 h-12 text-timeback-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0 w-24 h-24 bg-timeback-primary/10 rounded-full mx-auto -z-10"
          />
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="space-y-4"
        >
          <h2 className="text-4xl font-bold text-timeback-primary font-cal leading-tight">
            Your Learning Plan is Ready!
          </h2>
          <p className="text-xl text-timeback-primary font-cal max-w-lg mx-auto leading-relaxed">
            Save your personalized results and access them from anywhere, anytime
          </p>
          <div className="mt-4 p-4 bg-timeback-bg/30 border border-timeback-primary/20 rounded-xl max-w-md mx-auto">
            <p className="text-sm text-timeback-primary font-cal">
              <span className="font-semibold">🔒 Why authentication?</span> To prevent automated abuse and deliver personalized content, 
              we require authentication. Your data is secure and never shared.
            </p>
          </div>
        </motion.div>
      </div>

      {/* Action Buttons Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.5 }}
        className="space-y-4 max-w-md mx-auto"
      >
        {/* Enhanced Google Sign-in Button */}
        <motion.button
          onClick={handleSignIn}
          disabled={isSigningIn}
          whileHover={!isSigningIn ? { scale: 1.02 } : undefined}
          whileTap={!isSigningIn ? { scale: 0.98 } : undefined}
          className={`group w-full bg-white border-2 border-timeback-primary text-timeback-primary px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 flex items-center justify-center space-x-4 font-cal relative overflow-hidden ${
            isSigningIn 
              ? 'opacity-60 cursor-not-allowed' 
              : 'hover:bg-timeback-bg hover:shadow-2xl hover:border-timeback-primary focus:outline-none focus:ring-4 focus:ring-timeback-primary/20'
          }`}
        >
          {!isSigningIn && (
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-timeback-bg/0 via-timeback-bg/10 to-timeback-bg/0"
              initial={{ x: '-100%' }}
              animate={{ x: '100%' }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            />
          )}
          {isSigningIn ? (
            <>
              <div className="w-6 h-6 border-3 border-timeback-primary border-t-transparent rounded-full animate-spin"></div>
              <span>Signing you in...</span>
            </>
          ) : (
            <>
              <div className="w-6 h-6 bg-timeback-primary rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                </svg>
              </div>
              <span className="group-hover:tracking-wide transition-all duration-300">Sign in with Google</span>
              <svg className="w-5 h-5 text-timeback-primary group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </>
          )}
        </motion.button>

        {/* Enhanced Guest Button */}
        <motion.button
          onClick={handleContinueAsGuest}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full bg-transparent border-2 border-timeback-primary/40 text-timeback-primary px-8 py-4 rounded-xl font-semibold text-lg hover:bg-timeback-bg/50 hover:border-timeback-primary transition-all duration-300 font-cal focus:outline-none focus:ring-4 focus:ring-timeback-primary/20"
        >
          Continue as Guest
        </motion.button>
      </motion.div>



      {/* Enhanced Error State */}
      {saveError && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-r from-red-50 to-red-100 border-2 border-red-200 rounded-xl p-6 max-w-md mx-auto"
        >
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.732 15.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-red-700 font-semibold font-cal text-sm">{saveError}</p>
                                <p className="text-red-600 text-xs mt-1 font-cal">Don&apos;t worry - your results are still available!</p>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}