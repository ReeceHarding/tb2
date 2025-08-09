// Schema definitions for all content section types
// These schemas define the structure for AI generation and data requirements

export interface SectionSchema {
  id: string;
  name: string;
  description: string;
  requiredData: string[];
  optionalData: string[];
  outputStructure: any;
  aiPromptTemplate: string;
  componentType: 'text' | 'chart' | 'list' | 'mixed';
  isInteractive?: boolean; // For sections that require user input before content generation
}

export const SECTION_SCHEMAS: Record<string, SectionSchema> = {
  'school-performance': {
    id: 'school-performance',
    name: 'School Performance Metrics',
    description: 'Displays academic performance comparisons and growth metrics',
    requiredData: ['studentGrade', 'selectedSchools', 'academicGoals'],
    optionalData: ['currentPerformance', 'learningStyle', 'subjects'],
    outputStructure: {
      title: 'string',
      subtitle: 'string',
      introduction: 'string',
      performanceData: {
        currentLevel: 'number',
        targetLevel: 'number',
        nationalAverage: 'number',
        schoolAverage: 'number'
      },
      growthMetrics: [
        {
          subject: 'string',
          currentScore: 'number',
          projectedScore: 'number',
          growthRate: 'string'
        }
      ],
      keyInsights: ['string'],
      recommendations: ['string']
    },
    aiPromptTemplate: `Generate school performance content for a {{studentGrade}} grade student. 
Focus on {{selectedSchools}} performance data and {{academicGoals}}.
Create compelling performance comparisons and growth projections.`,
    componentType: 'chart'
  },
  
  'learning-schedule': {
    id: 'learning-schedule',
    name: 'Personalized Learning Schedule',
    description: 'Creates optimized daily and weekly learning schedules',
    requiredData: ['studentGrade', 'subjects', 'timePreference'],
    optionalData: ['extracurriculars', 'learningPace', 'breaks'],
    outputStructure: {
      title: 'string',
      subtitle: 'string',
      overview: 'string',
      dailySchedule: [
        {
          time: 'string',
          activity: 'string',
          duration: 'string',
          type: 'string' // 'academic' | 'break' | 'enrichment'
        }
      ],
      weeklyHighlights: {
        monday: ['string'],
        tuesday: ['string'],
        wednesday: ['string'],
        thursday: ['string'],
        friday: ['string']
      },
      adaptiveTips: ['string'],
      parentGuidance: 'string'
    },
    aiPromptTemplate: `Create a personalized learning schedule for a {{studentGrade}} student.
Include {{subjects}} with preference for {{timePreference}} learning.
Balance academic time with breaks and enrichment activities.`,
    componentType: 'mixed'
  },
  
  'personalized-daily-timeline': {
    id: 'personalized-daily-timeline',
    name: 'Your Liberated Daily Timeline',
    description: 'Creates a personalized daily schedule showing the liberated life possible with TimeBack education, customized to student interests',
    requiredData: ['kidsInterests', 'studentGrade', 'userType'],
    optionalData: ['selectedSchools', 'parentSubType', 'numberOfKids'],
    outputStructure: {
      title: 'string',
      subtitle: 'string',
      badge: 'string',
      timeSlots: [
        {
          time: 'string',
          activity: 'string',
          description: 'string',
          slotType: 'string', // 'morning' | 'learning' | 'completed' | 'interest' | 'social' | 'evening'
          isHighlight: 'boolean'
        }
      ],
      totalFreeHours: 'string',
      freeTimeMessage: 'string',
      personalizedInterestActivity: {
        mainInterest: 'string',
        afternoonActivity: 'string',
        eveningActivity: 'string'
      }
    },
    aiPromptTemplate: `Create a personalized daily timeline for a {{studentGrade}} student showing "The Liberated Life" with TimeBack education.
    Highlight how completing school by 11:00 AM frees up 8+ hours daily.
    Customize afternoon (2:30 PM) and evening (8:00 PM) activities based on {{kidsInterests}}.
    Show specific activities for interests like {{kidsInterests}} while maintaining the core TimeBack schedule structure.
    Include Reading Excellence Academy as a key afternoon component.
    Emphasize the freedom and time available for pursuing passions.`,
    componentType: 'mixed'
  },
  
  'closest-schools': {
    id: 'closest-schools',
    name: 'School Locations Near You',
    description: 'Shows TimeBack schools and educational options nearby',
    requiredData: ['userLocation', 'studentGrade'],
    optionalData: ['preferredDistance', 'schoolType', 'specialPrograms'],
    outputStructure: {
      title: 'string',
      locationContext: 'string',
      schools: [
        {
          name: 'string',
          distance: 'string',
          address: 'string',
          grades: 'string',
          highlights: ['string'],
          uniqueFeatures: 'string',
          contactInfo: {
            phone: 'string',
            email: 'string',
            website: 'string'
          }
        }
      ],
      comparisonInsights: 'string',
      nextSteps: ['string']
    },
    aiPromptTemplate: `Generate content about TimeBack schools near {{userLocation}}.
Focus on options for {{studentGrade}} grade level.
Highlight unique features and benefits of each location.`,
    componentType: 'list'
  },
  
  'ai-experience': {
    id: 'ai-experience',
    name: 'AI-Powered Learning Experience',
    description: 'Interactive AI tutoring and learning demonstration',
    requiredData: ['studentGrade', 'subject', 'learningGoal'],
    optionalData: ['currentChallenge', 'preferredStyle', 'timeAvailable'],
    outputStructure: {
      title: 'string',
      introduction: 'string',
      interactiveDemo: {
        question: 'string',
        explanation: 'string',
        visualAid: 'string',
        nextSteps: ['string']
      },
      benefits: [
        {
          feature: 'string',
          description: 'string',
          impact: 'string'
        }
      ],
      sampleCurriculum: ['string'],
      parentInsights: 'string'
    },
    aiPromptTemplate: `Create an AI learning experience demo for {{studentGrade}} grade {{subject}}.
Address the learning goal: {{learningGoal}}.
Show how AI personalizes and accelerates learning.`,
    componentType: 'mixed'
  },
  
  'custom-question': {
    id: 'custom-question',
    name: 'Personalized Q&A',
    description: 'Answers specific questions about TimeBack education',
    requiredData: ['question', 'userContext'],
    optionalData: ['previousQuestions', 'specificConcerns'],
    outputStructure: {
      question: 'string',
      answer: {
        summary: 'string',
        detailedExplanation: 'string',
        keyPoints: ['string'],
        examples: ['string'],
        relatedResources: ['string']
      },
      followUpQuestions: ['string'],
      actionItems: ['string']
    },
    aiPromptTemplate: `Answer this question: "{{question}}"
Context: {{userContext}}
Provide comprehensive, personalized response addressing specific concerns.`,
    componentType: 'text',
    isInteractive: true
  },
  
  'student-success-stories': {
    id: 'student-success-stories',
    name: 'Student Success Stories',
    description: 'Showcases relevant student achievements and testimonials',
    requiredData: ['studentGrade', 'interests'],
    optionalData: ['goals', 'challenges', 'location'],
    outputStructure: {
      title: 'string',
      introduction: 'string',
      stories: [
        {
          studentProfile: {
            name: 'string',
            grade: 'string',
            school: 'string',
            background: 'string'
          },
          journey: 'string',
          achievements: ['string'],
          quote: 'string',
          parentTestimonial: 'string',
          keyTakeaway: 'string'
        }
      ],
      commonThemes: ['string'],
      inspiration: 'string'
    },
    aiPromptTemplate: `Generate relevant success stories for {{studentGrade}} grade students interested in {{interests}}.
Show diverse examples of student achievement and growth.
Make it relatable and inspiring for parents.`,
    componentType: 'mixed'
  },
  
  'cost-value-analysis': {
    id: 'cost-value-analysis',
    name: 'Investment & Value Analysis',
    description: 'Breaks down costs and ROI of TimeBack education',
    requiredData: ['familySize', 'currentEducationCost'],
    optionalData: ['financialGoals', 'timeHorizon', 'priorities'],
    outputStructure: {
      title: 'string',
      overview: 'string',
      costBreakdown: {
        tuition: 'number',
        materials: 'number',
        technology: 'number',
        total: 'number',
        comparisonToTraditional: 'string'
      },
      valueProposition: [
        {
          benefit: 'string',
          monetaryValue: 'string',
          timeValue: 'string',
          longTermImpact: 'string'
        }
      ],
      roi: {
        immediate: ['string'],
        shortTerm: ['string'],
        longTerm: ['string']
      },
      financialOptions: ['string'],
      conclusion: 'string'
    },
    aiPromptTemplate: `Create a value analysis for {{familySize}} children.
Current education cost: {{currentEducationCost}}.
Show clear ROI and value proposition of TimeBack education.`,
    componentType: 'mixed'
  },
  
  'parent-time-savings': {
    id: 'parent-time-savings',
    name: 'Parent Time & Lifestyle Benefits',
    description: 'Shows how TimeBack gives parents their time back',
    requiredData: ['parentSchedule', 'currentChallenges'],
    optionalData: ['workSchedule', 'familyActivities', 'goals'],
    outputStructure: {
      title: 'string',
      tagline: 'string',
      currentSituation: {
        dailyStress: ['string'],
        timeSpent: {
          homework: 'string',
          driving: 'string',
          coordination: 'string',
          total: 'string'
        }
      },
      withTimeBack: {
        morningRoutine: 'string',
        afternoonFreedom: 'string',
        eveningPeace: 'string',
        weekendBonus: 'string'
      },
      lifestyleImprovements: [
        {
          area: 'string',
          before: 'string',
          after: 'string',
          impact: 'string'
        }
      ],
      testimonials: ['string'],
      callToAction: 'string'
    },
    aiPromptTemplate: `Show how TimeBack solves {{currentChallenges}} for parents.
Current schedule: {{parentSchedule}}.
Paint a picture of life with 6+ hours saved daily.`,
    componentType: 'text'
  }
};

// Helper function to get required data fields for a section
export function getRequiredDataForSection(sectionId: string): string[] {
  const schema = SECTION_SCHEMAS[sectionId];
  return schema ? schema.requiredData : [];
}

// Helper function to check if all required data is available
export function hasRequiredData(sectionId: string, availableData: Record<string, any>): boolean {
  const required = getRequiredDataForSection(sectionId);
  return required.every(field => availableData[field] !== undefined && availableData[field] !== null);
}

// Helper function to get missing data fields
export function getMissingData(sectionId: string, availableData: Record<string, any>): string[] {
  const required = getRequiredDataForSection(sectionId);
  return required.filter(field => availableData[field] === undefined || availableData[field] === null);
}

// Helper function to generate prompt from template
export function generatePromptFromSchema(
  sectionId: string, 
  data: Record<string, any>
): string {
  const schema = SECTION_SCHEMAS[sectionId];
  if (!schema) return '';
  
  let prompt = schema.aiPromptTemplate;
  
  // Replace placeholders with actual data
  Object.entries(data).forEach(([key, value]) => {
    const placeholder = `{{${key}}}`;
    if (prompt.includes(placeholder)) {
      prompt = prompt.replace(new RegExp(placeholder, 'g'), String(value));
    }
  });
  
  return prompt;
}

// Helper function to validate output against schema
export function validateOutput(sectionId: string, output: any): boolean {
  const schema = SECTION_SCHEMAS[sectionId];
  if (!schema) return false;
  
  // Basic validation - check if output matches expected structure
  // This is simplified - in production you'd want more robust validation
  try {
    const expectedKeys = Object.keys(schema.outputStructure);
    const outputKeys = Object.keys(output);
    
    return expectedKeys.every(key => outputKeys.includes(key));
  } catch {
    return false;
  }
}