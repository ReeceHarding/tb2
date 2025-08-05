// Quiz-related TypeScript interfaces for type safety across components and API endpoints

export type UserType = 'parents' | 'schools' | 'entrepreneur' | 'government' | 'philanthropist' | 'developer' | 'student';
export type ParentSubType = 'timeback-school' | 'homeschool' | 'tutoring';
export type SchoolSubType = 'private' | 'public';
export type Grade = 'K' | '1st' | '2nd' | '3rd' | '4th' | '5th' | '6th' | '7th' | '8th' | '9th' | '10th' | '11th' | '12th';

// School data structure
export interface School {
  id: string;
  name: string;
  city: string;
  state: string;
  level: string;
}

// Main quiz data interface
export interface QuizData {
  userType: UserType | null;
  parentSubType: ParentSubType | null;
  schoolSubType: SchoolSubType | null;
  grade: Grade | null;
  numberOfKids: number;
  selectedSchools: School[];
  kidsInterests: string[];
  completedAt?: string | Date;
}

// Generated content from AI
export interface GeneratedContent {
  afternoonActivities?: any;
  subjectExamples?: any;
  howWeGetResults?: any;
  learningScience?: any;
  dataShock?: any;
  followUpQuestions?: any;
  allCompleted: boolean;
  hasErrors: boolean;
  generatedAt?: string | Date;
}

// API request/response interfaces
export interface QuizSaveRequest {
  quizData: QuizData;
  generatedContent?: GeneratedContent | null;
}

export interface QuizSaveResponse {
  success: boolean;
  message?: string;
  data?: {
    userId: string;
    quizCompleted: boolean;
    hasGeneratedContent: boolean;
    savedAt: string;
  };
  error?: string;
  details?: Array<{
    field: string;
    message: string;
  }>;
}

export interface QuizRetrieveResponse {
  success: boolean;
  data?: {
    quizData: QuizData | null;
    generatedContent: GeneratedContent | null;
    hasCompletedQuiz: boolean;
  };
  error?: string;
  message?: string;
}

// User model interface (subset relevant to quiz)
export interface UserQuizData {
  quizData?: QuizData;
  generatedContent?: GeneratedContent;
}

// Quiz state interface (from QuizContext)
export interface QuizState {
  currentStep: number;
  userType: UserType | null;
  parentSubType: ParentSubType | null;
  schoolSubType: SchoolSubType | null;
  grade: Grade | null;
  numberOfKids: number;
  selectedSchools: School[];
  kidsInterests: string[];
  isLoading: boolean;
  isCompleted: boolean;
}

// Component prop interfaces
export interface AuthStepProps {
  onNext: () => void;
  onPrev: () => void;
  quizData?: QuizData;
  generatedContent?: GeneratedContent;
}

export interface LoadingStepProps {
  onNext?: () => void;
  onPrev?: () => void;
}

// Shareable journey interfaces
export interface ShareableJourneySection {
  sectionId: string;
  componentId: string;
  timestamp: Date;
}

export interface ShareableJourney {
  shareId: string;
  isPublic: boolean;
  viewedSections: ShareableJourneySection[];
  createdAt: Date;
  lastUpdatedAt: Date;
  viewCount: number;
}

export interface ShareableJourneyResponse {
  success: boolean;
  data?: {
    shareId: string;
    shareUrl: string;
    quizData: QuizData;
    generatedContent: GeneratedContent;
    viewedSections: ShareableJourneySection[];
    createdAt: Date;
    parentName?: string;
  };
  error?: string;
}

// Quiz action types
export type QuizAction =
  | { type: 'SET_STEP'; step: number }
  | { type: 'SET_USER_TYPE'; userType: UserType }
  | { type: 'SET_PARENT_SUB_TYPE'; subType: ParentSubType }
  | { type: 'SET_SCHOOL_SUB_TYPE'; subType: SchoolSubType }
  | { type: 'SET_GRADE'; grade: Grade }
  | { type: 'SET_NUMBER_OF_KIDS'; count: number }
  | { type: 'ADD_SCHOOL'; school: School }
  | { type: 'REMOVE_SCHOOL'; schoolId: string }
  | { type: 'SET_KIDS_INTERESTS'; interests: string[] }
  | { type: 'SET_LOADING'; loading: boolean }
  | { type: 'COMPLETE_QUIZ' }
  | { type: 'RESET_QUIZ' }
  | { type: 'LOAD_FROM_STORAGE'; state: Partial<QuizState> };