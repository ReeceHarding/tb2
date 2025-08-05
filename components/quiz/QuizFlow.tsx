'use client';

import React, { useCallback, Suspense } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { useQuiz, quizHelpers } from './QuizContext';
import QuizProgress from './QuizProgress';
import dynamic from 'next/dynamic';

// Lazy load quiz step components for better performance
const QuizIntro = dynamic(() => import('./steps/QuizIntro'), {
  loading: () => <StepLoadingSpinner />,
  ssr: false
});

const UserTypeStep = dynamic(() => import('./steps/UserTypeStep'), {
  loading: () => <StepLoadingSpinner />,
  ssr: false
});

const ParentSubTypeStep = dynamic(() => import('./steps/ParentSubTypeStep'), {
  loading: () => <StepLoadingSpinner />,
  ssr: false
});

const GradeSelectionStep = dynamic(() => import('./steps/GradeSelectionStep'), {
  loading: () => <StepLoadingSpinner />,
  ssr: false
});

const SchoolSearchStep = dynamic(() => import('./steps/SchoolSearchStep'), {
  loading: () => <StepLoadingSpinner />,
  ssr: false
});

const InterestsStep = dynamic(() => import('./steps/InterestsStep'), {
  loading: () => <StepLoadingSpinner />,
  ssr: false
});

const LoadingStep = dynamic(() => import('./steps/LoadingStep'), {
  loading: () => <StepLoadingSpinner />,
  ssr: false
});

const AuthStep = dynamic(() => import('./steps/AuthStep'), {
  loading: () => <StepLoadingSpinner />,
  ssr: false
});

// Optimized loading spinner for step transitions
function StepLoadingSpinner() {
  const timestamp = new Date().toISOString();
  console.log(`[QuizFlow] ${timestamp} Step component loading...`);
  
  return (
    <div className="flex items-center justify-center py-12">
      <div className="text-center font-cal">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-timeback-primary mx-auto mb-4"></div>
        <p className="text-timeback-primary">Loading step...</p>
      </div>
    </div>
  );
}

export default function QuizFlow() {
  const { state, dispatch } = useQuiz();
  const canProceed = quizHelpers.canProceedToNextStep(state);
  
  const renderCount = React.useRef(0);
  renderCount.current += 1;
  const timestamp = new Date().toISOString();

  // Keep a mutable ref to always access the latest state inside callbacks to avoid stale closures
  const stateRef = React.useRef(state);
  React.useEffect(() => {
    const updateTimestamp = new Date().toISOString();
    console.log(`[QuizFlow] ${updateTimestamp} StateRef updated from:`, {
      old: {
        currentStep: stateRef.current?.currentStep,
        userType: stateRef.current?.userType,
        parentSubType: stateRef.current?.parentSubType
      },
      new: {
        currentStep: state.currentStep,
        userType: state.userType,
        parentSubType: state.parentSubType
      }
    });
    stateRef.current = state;
  }, [state]);

  // Intelligent prefetching of next step components
  React.useEffect(() => {
    const prefetchTimestamp = new Date().toISOString();
    console.log(`[QuizFlow] ${prefetchTimestamp} Prefetching next step components for improved performance`);
    
    // Prefetch the next probable step(s) based on current state
    const prefetchNextSteps = async () => {
      try {
        const currentStep = state.currentStep;
        
        // Determine what steps to prefetch based on current state
        if (currentStep === 0) {
          // On intro, prefetch UserTypeStep
          import('./steps/UserTypeStep');
          console.log(`[QuizFlow] ${prefetchTimestamp} Prefetched UserTypeStep`);
        } else if (currentStep === 1) {
          // On UserType, prefetch conditional next steps
          if (state.userType === 'parents') {
            import('./steps/ParentSubTypeStep');
            console.log(`[QuizFlow] ${prefetchTimestamp} Prefetched ParentSubTypeStep for parents`);
          } else if (state.userType) {
            import('./steps/GradeSelectionStep');
            console.log(`[QuizFlow] ${prefetchTimestamp} Prefetched GradeSelectionStep for non-parents`);
          }
        } else if (currentStep === 2) {
          // On ParentSubType, prefetch GradeSelection
          import('./steps/GradeSelectionStep');
          console.log(`[QuizFlow] ${prefetchTimestamp} Prefetched GradeSelectionStep`);
        } else if (currentStep === 3) {
          // On GradeSelection, prefetch SchoolSearch
          import('./steps/SchoolSearchStep');
          console.log(`[QuizFlow] ${prefetchTimestamp} Prefetched SchoolSearchStep`);
        } else if (currentStep === 4) {
          // On SchoolSearch, prefetch Interests
          import('./steps/InterestsStep');
          console.log(`[QuizFlow] ${prefetchTimestamp} Prefetched InterestsStep`);
        } else if (currentStep === 5) {
          // On Interests, prefetch Loading
          import('./steps/LoadingStep');
          console.log(`[QuizFlow] ${prefetchTimestamp} Prefetched LoadingStep`);
        } else if (currentStep === 6) {
          // On Loading, prefetch Auth
          import('./steps/AuthStep');
          console.log(`[QuizFlow] ${prefetchTimestamp} Prefetched AuthStep`);
        }
        
        // Also prefetch common components that are likely to be needed
        if (currentStep <= 2) {
          // Early steps - prefetch school search related components
          setTimeout(() => {
            import('./steps/SchoolSearchStep');
            console.log(`[QuizFlow] ${prefetchTimestamp} Background prefetched SchoolSearchStep`);
          }, 2000);
        }
        
      } catch (error) {
        console.warn(`[QuizFlow] ${prefetchTimestamp} Prefetch error (non-critical):`, error);
      }
    };

    prefetchNextSteps();
  }, [state.currentStep, state.userType]);

  console.log(`[QuizFlow] ${timestamp} Render #${renderCount.current} - Step: ${state.currentStep}, Can proceed: ${canProceed}`);
  console.log(`[QuizFlow] ${timestamp} Full state snapshot:`, {
    currentStep: state.currentStep,
    userType: state.userType,
    parentSubType: state.parentSubType,
    schoolSubType: state.schoolSubType,
    selectedSchools: state.selectedSchools.length,
    // learningGoals: state.learningGoals.length, - removed
    kidsInterests: state.kidsInterests.length,
    isLoading: state.isLoading,
    isCompleted: state.isCompleted
  });

  // Auto-scroll function for smooth navigation
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  // Smart navigation that handles conditional ParentSubTypeStep and skips KidsCountStep
  const getNextStep = useCallback((currentStep: number): number => {
    // Special logic for step transitions
    if (currentStep === 1) { // After UserTypeStep
      if (state.userType === 'parents') {
        return 2; // Go to ParentSubTypeStep
      } else {
        return 3; // Skip ParentSubTypeStep, go to GradeSelectionStep
      }
    }
    if (currentStep === 2) { // After ParentSubTypeStep
      return 3; // Go to GradeSelectionStep
    }
    if (currentStep === 3) { // After GradeSelectionStep
      return 4; // Go to SchoolSearchStep
    }
    
    return currentStep + 1; // Normal progression for all other steps
  }, [state.userType]);

  const getPrevStep = useCallback((currentStep: number): number => {
    // Special logic for backwards navigation
    if (currentStep === 4) { // From SchoolSearchStep
      return 3; // Go back to GradeSelectionStep
    }
    if (currentStep === 3) { // From GradeSelectionStep
      if (state.userType === 'parents') {
        return 2; // Go back to ParentSubTypeStep
      } else {
        return 1; // Skip ParentSubTypeStep, go back to UserTypeStep
      }
    }
    
    return currentStep - 1; // Normal backwards progression
  }, [state.userType]);

  // Navigation functions with validation and auto-scroll
  const nextStep = React.useCallback(() => {
    const navTimestamp = new Date().toISOString();
    const currentState = stateRef.current;
    const canProceedNow = quizHelpers.canProceedToNextStep(currentState);

    console.log(`[QuizFlow] ${navTimestamp} nextStep() FUNCTION CALLED`);
    console.log(`[QuizFlow] ${navTimestamp} Function closure captures - canProceed: ${canProceedNow}, currentStep: ${currentState.currentStep}, userType: ${currentState.userType}`);
    console.log(`[QuizFlow] ${navTimestamp} Full state in closure:`, {
      currentStep: currentState.currentStep,
      userType: currentState.userType,
      parentSubType: currentState.parentSubType,
      schoolSubType: currentState.schoolSubType,
      selectedSchools: currentState.selectedSchools.length,
      // learningGoals: currentState.learningGoals.length, - removed
      kidsInterests: currentState.kidsInterests.length
    });

    if (!canProceedNow) {
      console.log(`[QuizFlow] ${navTimestamp} BLOCKING NAVIGATION - validation failed`);
      console.log(`[QuizFlow] ${navTimestamp} Validation details:`, {
        step: currentState.currentStep,
        userType: currentState.userType,
        parentSubType: currentState.parentSubType,
        schoolSubType: currentState.schoolSubType,
        selectedSchools: currentState.selectedSchools.length,
        // learningGoals: currentState.learningGoals.length, - removed
        kidsInterests: currentState.kidsInterests.length
      });
      return;
    }

    const nextStepNumber = getNextStep(currentState.currentStep);
    console.log(`[QuizFlow] ${navTimestamp} PROCEEDING - Moving from step ${currentState.currentStep} to step: ${nextStepNumber}`);
    
    // === CRITICAL STEP NAVIGATION LOGS - FOR LLM PARSING ===
    if (nextStepNumber === 7) {
      console.log(`🚨 [CRITICAL-NAVIGATION] ${navTimestamp} *** NAVIGATING TO AUTHSTEP (STEP 7) ***`);
      console.log(`🚨 [CRITICAL-NAVIGATION] ${navTimestamp} *** USER SHOULD NOW SEE AUTH PAGE ***`);
    }
    
    if (currentState.currentStep === 6 && nextStepNumber === 7) {
      console.log(`🚨 [CRITICAL-NAVIGATION] ${navTimestamp} *** TRANSITIONING FROM LOADING TO AUTH ***`);
    }
    // === END CRITICAL NAVIGATION LOGS ===

    if (nextStepNumber > quizHelpers.getTotalSteps()) {
      // Quiz complete - user went past AuthStep, now redirect to personalized page
      console.log(`🚨 [CRITICAL-COMPLETION] ${navTimestamp} *** QUIZ COMPLETE - USER WENT PAST AUTHSTEP ***`);
      console.log(`🚨 [CRITICAL-COMPLETION] ${navTimestamp} *** THIS MEANS AUTH WAS HANDLED (SIGNED IN OR GUEST) ***`);
      console.log(`[QuizFlow] ${navTimestamp} QUIZ COMPLETE! User authenticated or chose guest mode`);
      console.log(`[QuizFlow] ${navTimestamp} Dispatching COMPLETE_QUIZ action`);
      dispatch({ type: 'COMPLETE_QUIZ' });

      // Save state to localStorage for potential future use
      const savedState = { ...currentState, isCompleted: true, isLoading: false };
      localStorage.setItem('timeback-quiz-state', JSON.stringify(savedState));
      console.log(`[QuizFlow] ${navTimestamp} Quiz state saved to localStorage - quiz completed`);

      // Redirect to personalized page
      console.log(`🚨 [CRITICAL-COMPLETION] ${navTimestamp} *** REDIRECTING TO PERSONALIZED PAGE ***`);
      console.log(`[QuizFlow] ${navTimestamp} Redirecting to personalized page`);
      window.location.href = '/personalized';
    } else {
      console.log(`[QuizFlow] ${navTimestamp} Dispatching SET_STEP to step: ${nextStepNumber}`);
      dispatch({ type: 'SET_STEP', step: nextStepNumber });
      // Auto-scroll to top after step change
      setTimeout(() => {
        console.log(`[QuizFlow] ${navTimestamp} Auto-scrolling to top after step change`);
        scrollToTop();
      }, 100); // Small delay to ensure DOM update
    }
  }, [stateRef, dispatch, getNextStep]); // Include all dependencies

  const prevStep = React.useCallback(() => {
    const navTimestamp = new Date().toISOString();
    const currentState = stateRef.current;
    
    console.log(`[QuizFlow] ${navTimestamp} prevStep() FUNCTION CALLED`);
    console.log(`[QuizFlow] ${navTimestamp} Current step: ${currentState.currentStep}`);
    
    if (currentState.currentStep > 0) {
      const prevStepNumber = getPrevStep(currentState.currentStep);
      console.log(`[QuizFlow] ${navTimestamp} Moving backwards from step ${currentState.currentStep} to step: ${prevStepNumber}`);
      console.log(`[QuizFlow] ${navTimestamp} Dispatching SET_STEP to previous step: ${prevStepNumber}`);
      dispatch({ type: 'SET_STEP', step: prevStepNumber });
      // Auto-scroll to top after step change
      setTimeout(() => {
        console.log(`[QuizFlow] ${navTimestamp} Auto-scrolling to top after backwards navigation`);
        scrollToTop();
      }, 100); // Small delay to ensure DOM update
    } else {
      console.log(`[QuizFlow] ${navTimestamp} Cannot go backwards - already at step 0`);
    }
  }, [stateRef, dispatch, getPrevStep]);

  // Get current step component
  const getCurrentStepComponent = () => {
    const compTimestamp = new Date().toISOString();
    console.log(`[QuizFlow] ${compTimestamp} Getting component for step: ${state.currentStep}`);
    console.log(`[QuizFlow] ${compTimestamp} Creating component with nextStep callback created at render #${renderCount.current}`);
    
    switch (state.currentStep) {
      case 0:
        console.log(`[QuizFlow] ${compTimestamp} Rendering QuizIntro with nextStep callback`);
        return <QuizIntro onNext={nextStep} />;
      case 1:
        console.log(`[QuizFlow] ${compTimestamp} Rendering UserTypeStep with nextStep callback (auto-advance)`);
        return <UserTypeStep onNext={nextStep} onPrev={prevStep} />;
      case 2:
        console.log(`[QuizFlow] ${compTimestamp} Rendering ParentSubTypeStep with nextStep callback (auto-advance)`);
        // ParentSubTypeStep is only shown for parents
        return <ParentSubTypeStep onNext={nextStep} onPrev={prevStep} />;
      case 3:
        console.log(`[QuizFlow] ${compTimestamp} Rendering GradeSelectionStep with nextStep callback (auto-advance)`);
        return <GradeSelectionStep onNext={nextStep} onPrev={prevStep} />;
      case 4:
        console.log(`[QuizFlow] ${compTimestamp} Rendering SchoolSearchStep with nextStep callback (auto-advance)`);
        return <SchoolSearchStep onNext={nextStep} onPrev={prevStep} />;
      // case 5: - removed LearningGoalsStep
        // console.log(`[QuizFlow] ${compTimestamp} Rendering LearningGoalsStep with nextStep/prevStep callbacks`);
        // return <LearningGoalsStep onNext={nextStep} onPrev={prevStep} />;
      case 5:
        console.log(`[QuizFlow] ${compTimestamp} Rendering InterestsStep (auto-advance)`);
        return <InterestsStep onNext={nextStep} onPrev={prevStep} />;
      case 6:
        console.log(`[QuizFlow] ${compTimestamp} Rendering LoadingStep with nextStep callback`);
        return <LoadingStep onNext={nextStep} onPrev={prevStep} />;
      case 7:
        console.log(`🚨 [CRITICAL-QUIZ-FLOW] ${compTimestamp} *** AUTHSTEP REACHED - STEP 7 ***`);
        console.log(`🚨 [CRITICAL-QUIZ-FLOW] ${compTimestamp} *** THIS IS THE FINAL STEP BEFORE COMPLETION ***`);
        console.log(`🚨 [CRITICAL-QUIZ-FLOW] ${compTimestamp} *** AUTHSTEP SHOULD NOW BE VISIBLE ***`);
        console.log(`[QuizFlow] ${compTimestamp} Rendering AuthStep with nextStep/prevStep callbacks`);
        return <AuthStep onNext={nextStep} onPrev={prevStep} />;
      default:
        console.error(`[QuizFlow] ${compTimestamp} UNKNOWN STEP ERROR:`, state.currentStep);
        return (
          <div className="text-center py-8 font-cal">
            <p className="text-timeback-primary font-cal">Error: Unknown quiz step</p>
            <button 
              onClick={() => {
                console.log(`[QuizFlow] ${compTimestamp} Resetting quiz due to unknown step error`);
                dispatch({ type: 'RESET_QUIZ' });
              }}
              className="btn btn-primary mt-4"
            >
              Restart Quiz
            </button>
          </div>
        );
    }
  };

  // Enhanced step transition animation variants for professional feel
  const stepVariants: Variants = {
    initial: { 
      opacity: 0, 
      x: 60, 
      scale: 0.98,
      filter: 'blur(4px)'
    },
    animate: { 
      opacity: 1, 
      x: 0, 
      scale: 1,
      filter: 'blur(0px)',
      transition: {
        duration: 0.5,
        ease: "easeOut", // Use predefined easing for better compatibility
        opacity: { duration: 0.3 },
        filter: { duration: 0.2 }
      }
    },
    exit: { 
      opacity: 0, 
      x: -60, 
      scale: 0.98,
      filter: 'blur(4px)',
      transition: {
        duration: 0.3,
        ease: "easeIn" // Slightly faster exit with professional easing
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-timeback-bg to-white">
      {/* Enhanced Professional Header with Progress */}
      {state.currentStep > 0 && (
        <motion.div 
          className="sticky top-0 z-20 bg-white/98 backdrop-blur-md border-b-2 border-timeback-primary shadow-2xl"
          initial={{ opacity: 0, y: -30, filter: 'blur(8px)' }}
          animate={{ 
            opacity: 1, 
            y: 0, 
            filter: 'blur(0px)',
            transition: {
              duration: 0.4,
              ease: "easeOut",
              opacity: { duration: 0.2 },
              filter: { duration: 0.3 }
            }
          }}
        >
          <div className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-12 py-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-timeback-primary rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-lg font-cal">T</span>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-timeback-primary font-cal">TimeBack Quiz</h1>
                  <p className="text-sm text-timeback-primary opacity-75 font-cal">Personalized Learning Assessment</p>
                </div>
              </div>
              <div className="text-right font-cal">
                <p className="text-sm text-timeback-primary font-cal">Step {state.currentStep} of {quizHelpers.getTotalSteps()}</p>
              </div>
            </div>
            <QuizProgress 
              currentStep={state.currentStep}
              totalSteps={quizHelpers.getTotalSteps()}
            />
          </div>
        </motion.div>
      )}

      {/* Main Content Area with Improved Spacing */}
      <div className="max-w-5xl mx-auto px-6 sm:px-8 lg:px-12 py-8 lg:py-16">
        <div className="min-h-[calc(100vh-200px)] flex items-center justify-center">
          
          {/* Step Component with Enhanced Animation and Better Container */}
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={state.currentStep}
              variants={stepVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="w-full"
            >
              <div className="bg-white rounded-3xl shadow-2xl border-2 border-timeback-primary p-8 lg:p-12">
                <Suspense fallback={<StepLoadingSpinner />}>
                  {getCurrentStepComponent()}
                </Suspense>
              </div>
            </motion.div>
          </AnimatePresence>
          
        </div>
      </div>
    </div>
  );
}