"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface PrefilledQuizData {
  userType: string;
  parentSubType: string | null;
  schoolSubType: string | null;
  grade: string;
  numberOfKids: number;
  selectedSchools: Array<{
    id: string;
    name: string;
    city: string;
    state: string;
    level: string;
  }>;
  kidsInterests: string[];
  isCompleted: boolean;
}

const ButtonPrefilledQuiz = ({ extraStyle }: { extraStyle?: string }) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    console.log("[ButtonPrefilledQuiz] Component mounted");
    return () => {
      console.log("[ButtonPrefilledQuiz] Component unmounted");
    };
  }, []);

  const handleClick = async () => {
    console.log("[ButtonPrefilledQuiz] Button clicked!");
    console.log("[ButtonPrefilledQuiz] Starting prefilled quiz flow...");
    
    // Add immediate visual feedback
    alert("Prefilled Quiz button clicked - check console for logs");
    
    setIsLoading(true);

    try {
      // Fetch a sample school from SchoolDigger API
      console.log("[ButtonPrefilledQuiz] Fetching sample school from SchoolDigger...");
      const schoolResponse = await fetch('/api/schools/search?q=elementary&st=CA&limit=1');
      
      if (!schoolResponse.ok) {
        throw new Error('Failed to fetch school data');
      }

      const schoolData = await schoolResponse.json();
      console.log("[ButtonPrefilledQuiz] School data received:", schoolData);

      let selectedSchool;
      if (schoolData.length > 0) {
        const school = schoolData[0];
        selectedSchool = {
          id: school.schoolid || school.id || 'DEMO_SCHOOL_12345',
          name: school.schoolName || school.name || 'Sample Elementary School',
          city: school.city || 'San Francisco',
          state: school.state || 'CA',
          level: school.level || 'Elementary'
        };
      } else {
        // Fallback school if API fails
        console.log("[ButtonPrefilledQuiz] No schools found, using fallback data");
        selectedSchool = {
          id: 'DEMO_SCHOOL_12345',
          name: 'Lincoln Elementary School',
          city: 'San Francisco',
          state: 'CA',
          level: 'Elementary'
        };
      }

      // Create prefilled quiz data
      const prefilledQuizData: PrefilledQuizData = {
        userType: 'student',
        parentSubType: null, // Not applicable for students
        schoolSubType: null,
        grade: '2nd',
        numberOfKids: 1,
        selectedSchools: [selectedSchool],
        kidsInterests: ['legos', 'star wars'],
        isCompleted: true
      };

      console.log("[ButtonPrefilledQuiz] Prefilled quiz data:", prefilledQuizData);

      // Clear any existing quiz state
      localStorage.removeItem('timeback-quiz-state');
      localStorage.removeItem('timebackGeneratedContent');

      // Save prefilled quiz data to localStorage
      localStorage.setItem('timebackQuizData', JSON.stringify(prefilledQuizData));
      console.log("[ButtonPrefilledQuiz] Quiz data saved to localStorage");

      // Navigate to personalized page
      console.log("[ButtonPrefilledQuiz] Navigating to personalized page...");
      router.push('/personalized');

    } catch (error) {
      console.error("[ButtonPrefilledQuiz] Error during prefilled quiz:", error);
      alert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      // Even if school fetch fails, continue with fallback data
      const fallbackQuizData: PrefilledQuizData = {
        userType: 'student',
        parentSubType: null,
        schoolSubType: null,
        grade: '2nd',
        numberOfKids: 1,
        selectedSchools: [{
          id: 'DEMO_SCHOOL_12345',
          name: 'Lincoln Elementary School',
          city: 'San Francisco',
          state: 'CA',
          level: 'Elementary'
        }],
        kidsInterests: ['legos', 'star wars'],
        isCompleted: true
      };

      localStorage.setItem('timebackQuizData', JSON.stringify(fallbackQuizData));
      router.push('/personalized');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      className={`bg-timeback-primary hover:bg-timeback-primary text-white rounded-xl px-8 py-4 font-semibold font-cal shadow-2xl hover:shadow-2xl transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-timeback-primary w-full max-w-md mx-auto lg:mx-0 ${extraStyle ? extraStyle : ""} ${isLoading ? 'opacity-75 cursor-not-allowed' : ''}`}
      onClick={handleClick}
      disabled={isLoading}
    >
      <span className="inline-flex items-center gap-2">
        {isLoading ? (
          <>
            <svg className="animate-spin h-5 w-5 text-white font-cal" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Loading...</span>
          </>
        ) : (
          <>
            <span>Prefilled Quiz (Test)</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="w-5 h-5"
            >
              <path
                fillRule="evenodd"
                d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z"
                clipRule="evenodd"
              />
            </svg>
          </>
        )}
      </span>
    </button>
  );
};

export default ButtonPrefilledQuiz;