'use client';

import React, { useCallback } from 'react';
import { motion } from 'framer-motion';
import { useQuiz, quizHelpers } from './QuizContext';
import QuizProgress from './QuizProgress';
import dynamic from 'next/dynamic';

// Lazy load quiz step components for better performance
const QuizIntro = dynamic(() => import('./steps/QuizIntro'), { ssr: false });
const UserTypeStep = dynamic(() => import('./steps/UserTypeStep'), { ssr: false });
const ParentSubTypeStep = dynamic(() => import('./steps/ParentSubTypeStep'), { ssr: false });
const GradeSelectionStep = dynamic(() => import('./steps/GradeSelectionStep'), { ssr: false });
const SchoolSearchStep = dynamic(() => import('./steps/SchoolSearchStep'), { ssr: false });
const InterestsStep = dynamic(() => import('./steps/InterestsStep'), { ssr: false });
const AuthStep = dynamic(() => import('./steps/AuthStep'), { ssr: false });



export default function QuizFlow() {
  const { state, dispatch } = useQuiz();
  const canProceed = quizHelpers.canProceedToNextStep(state);
  
  // Transition state management for downward scroll effect
  const [isTransitioning, setIsTransitioning] = React.useState(false);
  const [nextStepNumber, setNextStepNumber] = React.useState<number | null>(null);
  const [transitionPhase, setTransitionPhase] = React.useState<'idle' | 'fadeOut' | 'scroll' | 'fadeIn'>('idle');
  
  const renderCount = React.useRef(0);
  renderCount.current += 1;
  const timestamp = new Date().toISOString();

  console.log(`[QuizFlow] ${timestamp} Transition State - isTransitioning: ${isTransitioning}, nextStep: ${nextStepNumber}, phase: ${transitionPhase}`);

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
          // On Interests, prefetch Auth (skipping loading)
          import('./steps/AuthStep');
          console.log(`[QuizFlow] ${prefetchTimestamp} Prefetched AuthStep (skipping loading screen)`);
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

  // Enhanced scroll functions for downward navigation
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

  // Enhanced nextStep function with downward scroll transition
  const nextStep = React.useCallback(() => {
    const navTimestamp = new Date().toISOString();
    const currentState = stateRef.current;
    const canProceedNow = quizHelpers.canProceedToNextStep(currentState);

    console.log(`[QuizFlow] ${navTimestamp} nextStep() FUNCTION CALLED - Downward Scroll Transition`);
    console.log(`[QuizFlow] ${navTimestamp} Function closure captures - canProceed: ${canProceedNow}, currentStep: ${currentState.currentStep}, userType: ${currentState.userType}`);
    console.log(`[QuizFlow] ${navTimestamp} Current transition state: isTransitioning=${isTransitioning}, phase=${transitionPhase}`);
    console.log(`[QuizFlow] ${navTimestamp} Full state in closure:`, {
      currentStep: currentState.currentStep,
      userType: currentState.userType,
      parentSubType: currentState.parentSubType,
      schoolSubType: currentState.schoolSubType,
      selectedSchools: currentState.selectedSchools.length,
      kidsInterests: currentState.kidsInterests.length
    });

    // Prevent multiple transitions
    if (isTransitioning) {
      console.log(`[QuizFlow] ${navTimestamp} Already transitioning - ignoring nextStep call`);
      return;
    }

    if (!canProceedNow) {
      console.log(`[QuizFlow] ${navTimestamp} BLOCKING NAVIGATION - validation failed`);
      console.log(`[QuizFlow] ${navTimestamp} Validation details:`, {
        step: currentState.currentStep,
        userType: currentState.userType,
        parentSubType: currentState.parentSubType,
        schoolSubType: currentState.schoolSubType,
        selectedSchools: currentState.selectedSchools.length,
        kidsInterests: currentState.kidsInterests.length
      });
      return;
    }

    const nextStepNum = getNextStep(currentState.currentStep);
    console.log(`[QuizFlow] ${navTimestamp} PROCEEDING - Planning transition from step ${currentState.currentStep} to step: ${nextStepNum}`);
    
    // === CRITICAL STEP NAVIGATION LOGS - FOR LLM PARSING ===
    if (nextStepNum === 6) {
      console.log(`🚨 [CRITICAL-NAVIGATION] ${navTimestamp} *** NAVIGATING TO AUTHSTEP (STEP 6 - LOADING REMOVED) ***`);
      console.log(`🚨 [CRITICAL-NAVIGATION] ${navTimestamp} *** USER SHOULD NOW SEE AUTH PAGE ***`);
    }
    
    if (currentState.currentStep === 5 && nextStepNum === 6) {
      console.log(`🚨 [CRITICAL-NAVIGATION] ${navTimestamp} *** TRANSITIONING FROM INTERESTS DIRECTLY TO AUTH (NO LOADING) ***`);
    }
    // === END CRITICAL NAVIGATION LOGS ===

    if (nextStepNum > quizHelpers.getTotalSteps()) {
      // Quiz complete - user went past AuthStep, now redirect to personalized page
      console.log(`🚨 [CRITICAL-COMPLETION] ${navTimestamp} *** QUIZ COMPLETE - USER WENT PAST AUTHSTEP ***`);
      console.log(`🚨 [CRITICAL-COMPLETION] ${navTimestamp} *** THIS MEANS AUTH WAS HANDLED (SIGNED IN) ***`);
      console.log(`[QuizFlow] ${navTimestamp} QUIZ COMPLETE! User authenticated`);
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
      // Start the downward scroll transition
      console.log(`[QuizFlow] ${navTimestamp} Starting downward scroll transition to step ${nextStepNum}`);
      setIsTransitioning(true);
      setNextStepNumber(nextStepNum);
      setTransitionPhase('fadeOut');
      
      // Instant transition - no delays needed
      setTimeout(() => {
        console.log(`[QuizFlow] ${navTimestamp} Instant transition to step ${nextStepNum}`);
        dispatch({ type: 'SET_STEP', step: nextStepNum });
        setIsTransitioning(false);
        setNextStepNumber(null);
        setTransitionPhase('idle');
      }, 50);
    }
  }, [stateRef, dispatch, getNextStep, isTransitioning, transitionPhase]); // Include all dependencies

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

  // Helper function to render any step component by step number
  const renderStepComponent = (stepNumber: number, isNextStep: boolean = false) => {
    const compTimestamp = new Date().toISOString();
    console.log(`[QuizFlow] ${compTimestamp} Rendering step component for step: ${stepNumber}, isNextStep: ${isNextStep}`);
    
    // For next step components, we use a different callback to prevent double navigation
    const stepNextCallback = isNextStep ? () => {
      console.log(`[QuizFlow] ${compTimestamp} Next step component clicked - ignoring (transition in progress)`);
    } : nextStep;
    
    const stepPrevCallback = isNextStep ? () => {
      console.log(`[QuizFlow] ${compTimestamp} Next step component prev clicked - ignoring (transition in progress)`);
    } : prevStep;
    
    switch (stepNumber) {
      case 0:
        console.log(`[QuizFlow] ${compTimestamp} Rendering QuizIntro with callbacks`);
        return <QuizIntro onNext={stepNextCallback} />;
      case 1:
        console.log(`[QuizFlow] ${compTimestamp} Rendering UserTypeStep with callbacks`);
        return <UserTypeStep onNext={stepNextCallback} onPrev={stepPrevCallback} />;
      case 2:
        console.log(`[QuizFlow] ${compTimestamp} Rendering ParentSubTypeStep with callbacks`);
        return <ParentSubTypeStep onNext={stepNextCallback} onPrev={stepPrevCallback} />;
      case 3:
        console.log(`[QuizFlow] ${compTimestamp} Rendering GradeSelectionStep with callbacks`);
        return <GradeSelectionStep onNext={stepNextCallback} onPrev={stepPrevCallback} />;
      case 4:
        console.log(`[QuizFlow] ${compTimestamp} Rendering SchoolSearchStep with callbacks`);
        return <SchoolSearchStep onNext={stepNextCallback} onPrev={stepPrevCallback} />;
      case 5:
        console.log(`[QuizFlow] ${compTimestamp} Rendering InterestsStep with callbacks`);
        return <InterestsStep onNext={stepNextCallback} onPrev={stepPrevCallback} />;
      case 6:
        console.log(`🚨 [CRITICAL-QUIZ-FLOW] ${compTimestamp} *** AUTHSTEP REACHED - STEP 6 (LOADING REMOVED) ***`);
        console.log(`[QuizFlow] ${compTimestamp} Rendering AuthStep with callbacks`);
        return <AuthStep onNext={stepNextCallback} onPrev={stepPrevCallback} />;
      default:
        console.error(`[QuizFlow] ${compTimestamp} UNKNOWN STEP ERROR:`, stepNumber);
        return (
          <div className="text-center py-8 font-cal">
            <p className="text-timeback-primary font-cal">Error: Unknown quiz step {stepNumber}</p>
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

  // Legacy getCurrentStepComponent removed - now using renderTransitionComponents

  // Enhanced rendering logic for downward scroll transitions
  const renderTransitionComponents = () => {
    const renderTimestamp = new Date().toISOString();
    console.log(`[QuizFlow] ${renderTimestamp} Rendering transition components - Phase: ${transitionPhase}, isTransitioning: ${isTransitioning}`);
    
    if (!isTransitioning || transitionPhase === 'idle') {
      // Normal single component rendering
      console.log(`[QuizFlow] ${renderTimestamp} Normal rendering - single component for step ${state.currentStep}`);
      return renderStepComponent(state.currentStep, false);
    }
    
    // During transition, render both current and next components vertically
    console.log(`[QuizFlow] ${renderTimestamp} Transition rendering - current step: ${state.currentStep}, next step: ${nextStepNumber}`);
    
    // Enhanced animation timing for smoother transitions
    const currentOpacity = transitionPhase === 'fadeOut' ? 0.2 : (transitionPhase === 'scroll' ? 0.05 : 1);
    const nextOpacity = transitionPhase === 'fadeIn' ? 1 : (transitionPhase === 'scroll' ? 0.3 : 0.05);
    
    // Scale and blur effects for professional feel
    const currentScale = transitionPhase === 'fadeOut' ? 0.98 : (transitionPhase === 'scroll' ? 0.95 : 1);
    const nextScale = transitionPhase === 'fadeIn' ? 1 : (transitionPhase === 'scroll' ? 0.98 : 0.95);
    
    const currentBlur = transitionPhase === 'fadeOut' ? 'blur(2px)' : (transitionPhase === 'scroll' ? 'blur(4px)' : 'blur(0px)');
    const nextBlur = transitionPhase === 'fadeIn' ? 'blur(0px)' : (transitionPhase === 'scroll' ? 'blur(2px)' : 'blur(4px)');
    
    return (
      <div className="space-y-12">
        {/* Current step component with enhanced fade out animation */}
        <div 
          className="transition-all duration-300 ease-out"
          style={{ 
            opacity: currentOpacity,
            transform: `scale(${currentScale})`,
            filter: currentBlur
          }}
        >
                        <div className="backdrop-blur-md bg-white/10 rounded-3xl shadow-2xl border-2 border-timeback-primary p-8 lg:p-12">
            {renderStepComponent(state.currentStep, false)}
          </div>
        </div>
        
        {/* Next step component with enhanced fade in animation */}
        {nextStepNumber !== null && (
          <div 
            id="next-step-component"
            className="transition-all duration-400 ease-in-out"
            style={{ 
              opacity: nextOpacity,
              transform: `scale(${nextScale}) translateY(${transitionPhase === 'scroll' ? '-20px' : '0px'})`,
              filter: nextBlur
            }}
          >
            <div className="bg-white rounded-3xl shadow-2xl border-2 border-timeback-primary p-8 lg:p-12 relative">
              {/* Subtle glow effect for the next step */}
              <div className="absolute inset-0 bg-timeback-bg rounded-3xl opacity-10 pointer-events-none"></div>
              <div className="relative z-10">
                {renderStepComponent(nextStepNumber, true)}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Enhanced transition animations now handled directly in renderTransitionComponents
  // with CSS transitions for smoother downward scroll effect

  return (
    <div className="h-screen overflow-hidden bg-gradient-to-br from-timeback-bg to-white flex flex-col">
      {/* Enhanced Professional Header with Progress */}
      {state.currentStep > 0 && (
        <motion.div 
                          className="sticky top-0 z-20 bg-timeback-bg/98 backdrop-blur-md border-b-2 border-timeback-primary shadow-2xl"
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
          <div className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-12 py-3">
            <div className="flex items-center justify-between mb-2">
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

      {/* Main Content Area with Enhanced Downward Scroll Transitions */}
      <div className="max-w-5xl mx-auto px-6 sm:px-8 lg:px-12 py-8 lg:py-16 flex-1 overflow-y-auto">
        <div className="h-full flex items-center justify-center">
          
          {/* Enhanced Step Components with Downward Scroll Animation */}
          <div className="w-full">
            {renderTransitionComponents()}
          </div>
          
        </div>
      </div>
    </div>
  );
}