'use client';

import React, { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';

// Quiz step types
export type UserType = 'parents' | 'schools' | 'entrepreneur' | 'government' | 'philanthropist' | 'developer' | 'student';
export type ParentSubType = 'timeback-school' | 'homeschool' | 'tutoring';
export type SchoolSubType = 'private' | 'public';

// Grade type - K through 12th grade
export type Grade = 'K' | '1st' | '2nd' | '3rd' | '4th' | '5th' | '6th' | '7th' | '8th' | '9th' | '10th' | '11th' | '12th';

// State interface
export interface QuizState {
  currentStep: number;
  userType: UserType | null;
  parentSubType: ParentSubType | null;
  schoolSubType: SchoolSubType | null;
  grade: Grade | null;
  numberOfKids: number;
  selectedSchools: Array<{
    id: string;
    name: string;
    city: string;
    state: string;
    level: string;
  }>;
  // learningGoals removed - no longer needed
  kidsInterests: string[];
  isLoading: boolean;
  isCompleted: boolean;
}

// Action types
export type QuizAction =
  | { type: 'SET_STEP'; step: number }
  | { type: 'SET_USER_TYPE'; userType: UserType }
  | { type: 'SET_PARENT_SUB_TYPE'; subType: ParentSubType }
  | { type: 'SET_SCHOOL_SUB_TYPE'; subType: SchoolSubType }
  | { type: 'SET_GRADE'; grade: Grade }
  | { type: 'SET_NUMBER_OF_KIDS'; count: number }
  | { type: 'ADD_SCHOOL'; school: QuizState['selectedSchools'][0] }
  | { type: 'REMOVE_SCHOOL'; schoolId: string }
  // | { type: 'SET_LEARNING_GOALS'; goals: string[] } - removed
  | { type: 'SET_KIDS_INTERESTS'; interests: string[] }
  | { type: 'SET_LOADING'; loading: boolean }
  | { type: 'COMPLETE_QUIZ' }
  | { type: 'RESET_QUIZ' }
  | { type: 'LOAD_FROM_STORAGE'; state: Partial<QuizState> };

// Initial state
const initialState: QuizState = {
  currentStep: 0, // 0 = intro, 1-6 = quiz steps (includes separate grade selection step)
  userType: null,
  parentSubType: null,
  schoolSubType: null,
  grade: null,
  numberOfKids: 1, // Default to 1 child (no longer user-configurable)
  selectedSchools: [],
  // learningGoals: [], - removed
  kidsInterests: [],
  isLoading: false,
  isCompleted: false,
};

// Quiz reducer with comprehensive logging
function quizReducer(state: QuizState, action: QuizAction): QuizState {
  const timestamp = new Date().toISOString();
  const oldState = { ...state };
  
  console.log(`[QuizReducer] ${timestamp} Action:`, action.type);
  console.log(`[QuizReducer] ${timestamp} Current state snapshot:`, {
    currentStep: state.currentStep,
    userType: state.userType,
    parentSubType: state.parentSubType,
    schoolSubType: state.schoolSubType,
    grade: state.grade,
    selectedSchools: state.selectedSchools.length,
    // learningGoals: state.learningGoals.length, - removed
    kidsInterests: state.kidsInterests.length,
    isLoading: state.isLoading,
    isCompleted: state.isCompleted
  });
  
  let newState: QuizState;
  
  switch (action.type) {
    case 'SET_STEP':
      console.log(`[QuizReducer] ${timestamp} Moving from step ${state.currentStep} to step:`, action.step);
      if (action.step === state.currentStep) {
        console.warn(`[QuizReducer] ${timestamp} WARNING: Attempting to set same step ${action.step} - possible infinite loop`);
      }
      newState = { ...state, currentStep: action.step };
      break;
      
    case 'SET_USER_TYPE':
      console.log(`[QuizReducer] ${timestamp} Setting user type from "${state.userType}" to:`, action.userType);
      console.log(`[QuizReducer] ${timestamp} Resetting sub-types due to user type change`);
      newState = { 
        ...state, 
        userType: action.userType,
        // Reset sub-types when user type changes
        parentSubType: null,
        schoolSubType: null
      };
      break;
      
    case 'SET_PARENT_SUB_TYPE':
      console.log(`[QuizReducer] ${timestamp} Setting parent sub-type from "${state.parentSubType}" to:`, action.subType);
      newState = { ...state, parentSubType: action.subType };
      break;
      
    case 'SET_SCHOOL_SUB_TYPE':
      console.log(`[QuizReducer] ${timestamp} Setting school sub-type from "${state.schoolSubType}" to:`, action.subType);
      newState = { ...state, schoolSubType: action.subType };
      break;
      
    case 'SET_GRADE':
      console.log(`[QuizReducer] ${timestamp} Setting grade from "${state.grade}" to:`, action.grade);
      newState = { ...state, grade: action.grade };
      break;
      
    case 'SET_NUMBER_OF_KIDS':
      console.log(`[QuizReducer] ${timestamp} Setting number of students from ${state.numberOfKids} to:`, Math.max(1, action.count));
      newState = { ...state, numberOfKids: Math.max(1, action.count) };
      break;
      
    case 'ADD_SCHOOL': {
      console.log(`[QuizReducer] ${timestamp} Adding school:`, action.school.name);
      const schoolExists = state.selectedSchools.some(school => school.id === action.school.id);
      if (schoolExists) {
        console.log(`[QuizReducer] ${timestamp} School already selected, skipping addition`);
        newState = state;
      } else {
        console.log(`[QuizReducer] ${timestamp} School added successfully, new total: ${state.selectedSchools.length + 1}`);
        newState = { 
          ...state, 
          selectedSchools: [...state.selectedSchools, action.school] 
        };
      }
      break;
    }
      
    case 'REMOVE_SCHOOL': {
      console.log(`[QuizReducer] ${timestamp} Removing school:`, action.schoolId);
      const originalCount = state.selectedSchools.length;
      newState = { 
        ...state, 
        selectedSchools: state.selectedSchools.filter(school => school.id !== action.schoolId) 
      };
      console.log(`[QuizReducer] ${timestamp} Schools count changed from ${originalCount} to ${newState.selectedSchools.length}`);
      break;
    }
      
    // case 'SET_LEARNING_GOALS': - removed
      // console.log(`[QuizReducer] ${timestamp} Setting learning goals from ${state.learningGoals.length} to ${action.goals.length} goals:`, action.goals);
      // newState = { ...state, learningGoals: action.goals };
      // break;
      
    case 'SET_KIDS_INTERESTS':
      console.log(`[QuizReducer] ${timestamp} Setting kids interests from ${state.kidsInterests.length} to ${action.interests.length} interests:`, action.interests);
      newState = { ...state, kidsInterests: action.interests };
      break;
      
    case 'SET_LOADING':
      console.log(`[QuizReducer] ${timestamp} Setting loading state from ${state.isLoading} to:`, action.loading);
      newState = { ...state, isLoading: action.loading };
      break;
      
    case 'COMPLETE_QUIZ':
      console.log(`[QuizReducer] ${timestamp} Quiz completed! Final state:`, {
        currentStep: state.currentStep,
        userType: state.userType,
        parentSubType: state.parentSubType,
        schoolSubType: state.schoolSubType,
        selectedSchools: state.selectedSchools.length,
        // learningGoals: state.learningGoals.length, - removed
        kidsInterests: state.kidsInterests.length
      });
      newState = { ...state, isCompleted: true, isLoading: false };
      break;
      
    case 'RESET_QUIZ':
      console.log(`[QuizReducer] ${timestamp} Resetting quiz to initial state`);
      newState = initialState;
      break;
      
    case 'LOAD_FROM_STORAGE':
      console.log(`[QuizReducer] ${timestamp} Loading state from storage:`, action.state);
      newState = { ...state, ...action.state };
      break;
      
    default:
      console.warn(`[QuizReducer] ${timestamp} Unknown action type:`, (action as any).type);
      newState = state;
      break;
  }
  
  // Log state changes
  const stateChanged = JSON.stringify(oldState) !== JSON.stringify(newState);
  if (stateChanged) {
    console.log(`[QuizReducer] ${timestamp} State changed:`, {
      action: action.type,
      before: {
        currentStep: oldState.currentStep,
        userType: oldState.userType,
        parentSubType: oldState.parentSubType,
        schoolSubType: oldState.schoolSubType,
        selectedSchools: oldState.selectedSchools.length,
        // learningGoals: oldState.learningGoals.length, - removed
        kidsInterests: oldState.kidsInterests.length,
        isLoading: oldState.isLoading,
        isCompleted: oldState.isCompleted
      },
      after: {
        currentStep: newState.currentStep,
        userType: newState.userType,
        parentSubType: newState.parentSubType,
        schoolSubType: newState.schoolSubType,
        selectedSchools: newState.selectedSchools.length,
        // learningGoals: newState.learningGoals.length, - removed
        kidsInterests: newState.kidsInterests.length,
        isLoading: newState.isLoading,
        isCompleted: newState.isCompleted
      }
    });
  } else {
    console.log(`[QuizReducer] ${timestamp} No state change for action:`, action.type);
  }
  
  return newState;
}

// Context creation
const QuizContext = createContext<{
  state: QuizState;
  dispatch: React.Dispatch<QuizAction>;
} | null>(null);

// Storage key for persistence
const QUIZ_STORAGE_KEY = 'timeback-quiz-state';

// Context provider with persistence
export function QuizProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(quizReducer, initialState);
  const renderCount = React.useRef(0);
  
  renderCount.current += 1;
  const timestamp = new Date().toISOString();
  
  console.log(`[QuizProvider] ${timestamp} Render #${renderCount.current} with state:`, {
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

  // Async localStorage operations for better performance
  const asyncLoadState = React.useCallback(async () => {
    const loadTimestamp = new Date().toISOString();
    console.log(`[QuizProvider] ${loadTimestamp} Starting async quiz state loading from localStorage`);
    
    try {
      // Use requestIdleCallback for non-blocking localStorage access
      const loadFromStorage = () => new Promise<string | null>((resolve) => {
        if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
          requestIdleCallback(() => {
            try {
              const saved = localStorage.getItem(QUIZ_STORAGE_KEY);
              resolve(saved);
            } catch (error) {
              console.error(`[QuizProvider] ${loadTimestamp} Error reading localStorage:`, error);
              resolve(null);
            }
          });
        } else {
          // Fallback for browsers without requestIdleCallback
          setTimeout(() => {
            try {
              const saved = localStorage.getItem(QUIZ_STORAGE_KEY);
              resolve(saved);
            } catch (error) {
              console.error(`[QuizProvider] ${loadTimestamp} Error reading localStorage:`, error);
              resolve(null);
            }
          }, 0);
        }
      });

      const saved = await loadFromStorage();
      
      if (saved) {
        try {
          const parsedState = JSON.parse(saved);
          console.log(`[QuizProvider] ${loadTimestamp} Found saved state:`, parsedState);
          console.log(`[QuizProvider] ${loadTimestamp} Dispatching LOAD_FROM_STORAGE action`);
          dispatch({ type: 'LOAD_FROM_STORAGE', state: parsedState });
        } catch (parseError) {
          console.error(`[QuizProvider] ${loadTimestamp} Error parsing saved state:`, parseError);
          // Clear corrupted data
          localStorage.removeItem(QUIZ_STORAGE_KEY);
        }
      } else {
        console.log(`[QuizProvider] ${loadTimestamp} No saved state found in localStorage`);
      }
    } catch (error) {
      console.error(`[QuizProvider] ${loadTimestamp} Error loading saved state:`, error);
    }
  }, []);

  // Load state from localStorage on mount with async optimization
  useEffect(() => {
    asyncLoadState();
  }, [asyncLoadState]);

  // Async localStorage save operations with throttling for better performance
  const asyncSaveState = React.useCallback(async (stateToSave: QuizState) => {
    const saveTimestamp = new Date().toISOString();
    console.log(`[QuizProvider] ${saveTimestamp} Async saving quiz state to localStorage:`, {
      currentStep: stateToSave.currentStep,
      userType: stateToSave.userType,
      parentSubType: stateToSave.parentSubType,
      selectedSchools: stateToSave.selectedSchools.length,
      totalStateSize: JSON.stringify(stateToSave).length
    });
    
    try {
      // Use requestIdleCallback for non-blocking localStorage writes
      const saveToStorage = () => new Promise<void>((resolve) => {
        if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
          requestIdleCallback(() => {
            try {
              localStorage.setItem(QUIZ_STORAGE_KEY, JSON.stringify(stateToSave));
              console.log(`[QuizProvider] ${saveTimestamp} Successfully saved quiz state to localStorage`);
              resolve();
            } catch (error) {
              console.error(`[QuizProvider] ${saveTimestamp} Error saving to localStorage:`, error);
              resolve();
            }
          });
        } else {
          // Fallback for browsers without requestIdleCallback
          setTimeout(() => {
            try {
              localStorage.setItem(QUIZ_STORAGE_KEY, JSON.stringify(stateToSave));
              console.log(`[QuizProvider] ${saveTimestamp} Successfully saved quiz state to localStorage (fallback)`);
              resolve();
            } catch (error) {
              console.error(`[QuizProvider] ${saveTimestamp} Error saving to localStorage:`, error);
              resolve();
            }
          }, 0);
        }
      });

      await saveToStorage();
    } catch (error) {
      console.error(`[QuizProvider] ${saveTimestamp} Error in async save operation:`, error);
    }
  }, []);

  // Throttled state saving to prevent excessive localStorage writes
  const throttleRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (throttleRef.current) {
      clearTimeout(throttleRef.current);
    }
    
    // Throttle saves to once every 300ms for better performance
    throttleRef.current = setTimeout(() => {
      asyncSaveState(state);
    }, 300);
    
    return () => {
      if (throttleRef.current) {
        clearTimeout(throttleRef.current);
      }
    };
  }, [state, asyncSaveState]);

  return (
    <QuizContext.Provider value={{ state, dispatch }}>
      {children}
    </QuizContext.Provider>
  );
}

// Custom hook for using quiz context
export function useQuiz() {
  const context = useContext(QuizContext);
  if (!context) {
    throw new Error('useQuiz must be used within a QuizProvider');
  }
  return context;
}

// Helper functions for common operations
export const quizHelpers = {
  canProceedToNextStep: (state: QuizState): boolean => {
    const timestamp = new Date().toISOString();
    console.log(`[QuizHelpers] ${timestamp} Checking if can proceed from step:`, state.currentStep);
    console.log(`[QuizHelpers] ${timestamp} Current state for validation:`, {
      currentStep: state.currentStep,
      userType: state.userType,
      parentSubType: state.parentSubType,
      schoolSubType: state.schoolSubType,
      selectedSchools: state.selectedSchools.length,
      // learningGoals: state.learningGoals.length, - removed
      kidsInterests: state.kidsInterests.length
    });
    
    let canProceed = false;
    let reason = '';
    
    switch (state.currentStep) {
      case 0: // Intro step
        canProceed = true;
        reason = 'Intro step always allows proceeding';
        break;
      case 1: { // User type selection
        const hasUserType = !!state.userType;
        const hasSubType = state.userType === 'schools' ? !!state.schoolSubType : true;
        canProceed = hasUserType && hasSubType;
        reason = `UserType: ${hasUserType ? state.userType : 'missing'}, SubType required for schools: ${state.userType === 'schools' ? (hasSubType ? state.schoolSubType : 'missing') : 'not required'}`;
        break;
      }
      case 2: // Parent sub-type selection (for parents user type only)
        if (state.userType === 'parents') {
          const hasParentSubType = !!state.parentSubType;
          canProceed = hasParentSubType;
          reason = `ParentSubType: ${hasParentSubType ? state.parentSubType : 'missing'}`;
        } else {
          canProceed = true;
          reason = 'Not required (non-parent user)';
        }
        break;
      case 3: // Grade selection step
        canProceed = !!state.grade;
        reason = `Grade: ${state.grade || 'missing'}`;
        break;
      case 4: // School search step
        canProceed = state.selectedSchools.length > 0;
        reason = `Selected schools: ${state.selectedSchools.length}`;
        break;
      // case 5: // Learning goals step - removed
        // canProceed = state.learningGoals.length > 0;
        // reason = `Learning goals: ${state.learningGoals.length}`;
        // break;
      case 5: // Kids interests step (was case 6)
        canProceed = state.kidsInterests.length > 0;
        reason = `Kids interests: ${state.kidsInterests.length}`;
        break;
      case 6: // Loading step - always allow proceeding once reached
        canProceed = true;
        reason = 'Loading step completed';
        break;
      case 7: // Auth step - always allow proceeding once reached
        canProceed = true;
        reason = 'Auth step completed';
        break;
      default:
        canProceed = false;
        reason = `Unknown step: ${state.currentStep}`;
        break;
    }
    
    console.log(`[QuizHelpers] ${timestamp} Can proceed: ${canProceed}, Reason: ${reason}`);
    return canProceed;
  },

  getStepTitle: (step: number): string => {
    const titles = [
      'Welcome to TimeBack',
      '', // Removed tell us about yourself header
      '', // Removed choose your path header
      '', // Removed school information header
      // 'Learning goals', - removed
      '', // Removed student interests header
      ''
    ];
    return titles[step] || '';
  },

  getStepDescription: (step: number): string => {
    const descriptions = [
      `Let's create a personalized experience just for you`,
      '', // Removed tell us about yourself description
      '', // Removed choose your path description
      '', // Removed school information description
      // 'What are you hoping to achieve?', - removed
      '', // Removed student interests description
      ''
    ];
    return descriptions[step] || '';
  },

  getTotalSteps: (): number => 6, // Excluding intro step, removed LoadingStep, includes AuthStep

  getProgressPercentage: (currentStep: number): number => {
    if (currentStep === 0) return 0; // Intro step
    return Math.round((currentStep / quizHelpers.getTotalSteps()) * 100);
  }
};