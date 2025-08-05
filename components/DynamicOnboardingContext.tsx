'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useSession } from 'next-auth/react';

// Types for the data we collect dynamically
export interface DynamicUserData {
  // Basic info
  isAuthenticated: boolean;
  name?: string;
  email?: string;
  
  // Quiz-related data
  userType?: string;
  parentSubType?: string;
  grade?: string;
  school?: {
    id: string;
    name: string;
    city: string;
    state: string;
    level: string;
  };
  kidsInterests?: string[];
  
  // Tracking what sections have been viewed
  viewedSections: Set<string>;
  
  // Generated content cache
  generatedContent?: {
    [key: string]: any;
  };
}

interface DynamicOnboardingContextType {
  userData: DynamicUserData;
  updateUserData: (data: Partial<DynamicUserData>) => void;
  hasRequiredData: (requirements: string[]) => boolean;
  markSectionViewed: (sectionId: string) => void;
  saveToDatabase: () => Promise<void>;
}

const DynamicOnboardingContext = createContext<DynamicOnboardingContextType | undefined>(undefined);

export function DynamicOnboardingProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const [shouldSaveToDb, setShouldSaveToDb] = useState(false);
  const [userData, setUserData] = useState<DynamicUserData>({
    isAuthenticated: false,
    viewedSections: new Set(),
  });

  // Load data from localStorage on mount
  useEffect(() => {
    const loadStoredData = () => {
      console.log('[DynamicOnboarding] Loading stored data from localStorage');
      
      try {
        // Load quiz data if exists
        const storedQuizData = localStorage.getItem('timebackQuizData');
        if (storedQuizData) {
          const quizData = JSON.parse(storedQuizData);
          console.log('[DynamicOnboarding] Found stored quiz data:', quizData);
          
          setUserData(prev => ({
            ...prev,
            userType: quizData.userType,
            parentSubType: quizData.parentSubType,
            grade: quizData.selectedSchools?.[0]?.level,
            school: quizData.selectedSchools?.[0],
            kidsInterests: quizData.kidsInterests,
          }));
        }
        
        // Load dynamic onboarding data
        const storedDynamicData = localStorage.getItem('timebackDynamicOnboarding');
        if (storedDynamicData) {
          const dynamicData = JSON.parse(storedDynamicData);
          console.log('[DynamicOnboarding] Found stored dynamic data:', dynamicData);
          
          setUserData(prev => ({
            ...prev,
            ...dynamicData,
            viewedSections: new Set(dynamicData.viewedSections || []),
          }));
        }
      } catch (error) {
        console.error('[DynamicOnboarding] Error loading stored data:', error);
      }
    };
    
    loadStoredData();
  }, []);

  // Update authentication status based on session
  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      console.log('[DynamicOnboarding] User authenticated:', session.user.email);
      setUserData(prev => ({
        ...prev,
        isAuthenticated: true,
        name: session.user.name || prev.name,
        email: session.user.email || prev.email,
      }));
    } else if (status === 'unauthenticated') {
      console.log('[DynamicOnboarding] User not authenticated');
      setUserData(prev => ({
        ...prev,
        isAuthenticated: false,
      }));
    }
  }, [session, status]);

  // Save to localStorage whenever userData changes
  useEffect(() => {
    const dataToStore = {
      ...userData,
      viewedSections: Array.from(userData.viewedSections),
    };
    
    localStorage.setItem('timebackDynamicOnboarding', JSON.stringify(dataToStore));
    console.log('[DynamicOnboarding] Saved to localStorage:', dataToStore);
  }, [userData]);

  const updateUserData = (data: Partial<DynamicUserData>) => {
    console.log('[DynamicOnboarding] Updating user data:', data);
    const newUserData = {
      ...userData,
      ...data,
    };
    setUserData(newUserData);
    
    // Also update the legacy quiz data format for compatibility
    if (data.userType || data.parentSubType || data.grade || data.school || data.kidsInterests) {
      const quizData = {
        userType: data.userType || userData.userType,
        parentSubType: data.parentSubType || userData.parentSubType,
        selectedSchools: data.school ? [data.school] : (userData.school ? [userData.school] : []),
        kidsInterests: data.kidsInterests || userData.kidsInterests || [],
        isCompleted: true,
        completedAt: new Date().toISOString(),
      };
      
      localStorage.setItem('timebackQuizData', JSON.stringify(quizData));
      console.log('[DynamicOnboarding] Updated legacy quiz data:', quizData);
      
      // Trigger database save if authenticated
      if (newUserData.isAuthenticated) {
        setShouldSaveToDb(true);
      }
    }
  };

  const hasRequiredData = (requirements: string[]): boolean => {
    for (const req of requirements) {
      switch (req) {
        case 'auth':
          if (!userData.isAuthenticated) return false;
          break;
        case 'school':
          if (!userData.school) return false;
          break;
        case 'grade':
          if (!userData.grade) return false;
          break;
        case 'interests':
          if (!userData.kidsInterests || userData.kidsInterests.length === 0) return false;
          break;
        case 'userType':
          if (!userData.userType) return false;
          break;
        case 'parentSubType':
          if (userData.userType === 'parents' && !userData.parentSubType) return false;
          break;
      }
    }
    return true;
  };

  const markSectionViewed = (sectionId: string) => {
    console.log('[DynamicOnboarding] Marking section viewed:', sectionId);
    setUserData(prev => {
      const newViewedSections = new Set(prev.viewedSections);
      newViewedSections.add(sectionId);
      return {
        ...prev,
        viewedSections: newViewedSections,
      };
    });
  };

  const saveToDatabase = async () => {
    if (!userData.isAuthenticated) {
      console.log('[DynamicOnboarding] Cannot save to database - user not authenticated');
      return;
    }

    console.log('[DynamicOnboarding] Saving to database...');
    
    try {
      const quizData = {
        userType: userData.userType,
        parentSubType: userData.parentSubType,
        selectedSchools: userData.school ? [userData.school] : [],
        kidsInterests: userData.kidsInterests || [],
        isCompleted: true,
        completedAt: new Date().toISOString(),
      };

      const response = await fetch('/api/quiz/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          quizData,
          generatedContent: userData.generatedContent || null,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save to database');
      }

      console.log('[DynamicOnboarding] Successfully saved to database');
    } catch (error) {
      console.error('[DynamicOnboarding] Error saving to database:', error);
    }
  };

  // Effect to save to database when triggered
  useEffect(() => {
    const performSave = async () => {
      if (shouldSaveToDb && userData.isAuthenticated) {
        console.log('[DynamicOnboarding] Triggered database save');
        await saveToDatabase();
        setShouldSaveToDb(false);
      }
    };
    
    performSave();
  }, [shouldSaveToDb, userData]);

  return (
    <DynamicOnboardingContext.Provider
      value={{
        userData,
        updateUserData,
        hasRequiredData,
        markSectionViewed,
        saveToDatabase,
      }}
    >
      {children}
    </DynamicOnboardingContext.Provider>
  );
}

export function useDynamicOnboarding() {
  const context = useContext(DynamicOnboardingContext);
  if (!context) {
    throw new Error('useDynamicOnboarding must be used within DynamicOnboardingProvider');
  }
  return context;
}