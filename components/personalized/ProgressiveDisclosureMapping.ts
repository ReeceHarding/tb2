// Progressive Disclosure Mapping for Personalized Page
// Maps parent-focused questions to relevant components and sub-sections

import React from 'react';
import AfternoonActivities from './AfternoonActivities';
import TimeBackVsCompetitors from './TimeBackVsCompetitors';
import SpeedComparison from './SpeedComparison';
import PersonalizedSubjectExamples from './PersonalizedSubjectExamples';
import KnowledgeDispersionChart from './KnowledgeDispersionChart';
import LearningScienceSection from './LearningScienceSection';
import HowWeGetResults from './HowWeGetResults';
import ImmediateDataShock from './ImmediateDataShock';
import MechanismSection from './MechanismSection';
import CompletionTimeData from './CompletionTimeData';
import StudentJourneyCarousel from './StudentJourneyCarousel';

export interface SectionMapping {
  id: string;
  title: string;
  description: string;
  components: Array<{
    component: React.ComponentType<any>;
    name: string;
    props?: any;
  }>;
  subButtons: Array<{
    id: string;
    text: string;
    targetComponents: string[];
  }>;
}

export interface MainSection {
  id: string;
  buttonText: string;
  description: string;
  sections: SectionMapping[];
}

export const PROGRESSIVE_DISCLOSURE_MAPPING: MainSection[] = [
  {
    id: 'what-is-timeback',
    buttonText: 'What is TimeBack?',
    description: 'Learn about TimeBack\'s revolutionary approach to education',
    sections: [
      {
        id: 'timeback-overview',
        title: 'What makes TimeBack different?',
        description: 'The core philosophy and approach behind TimeBack',
        components: [
          { component: TimeBackVsCompetitors, name: 'TimeBackVsCompetitors' },
          { component: LearningScienceSection, name: 'LearningScienceSection' }
        ],
        subButtons: [
          {
            id: 'core-philosophy',
            text: 'What is the core philosophy?',
            targetComponents: ['LearningScienceSection']
          },
          {
            id: 'vs-traditional',
            text: 'How is it different from traditional school?',
            targetComponents: ['TimeBackVsCompetitors']
          }
        ]
      }
    ]
  },
  {
    id: 'how-it-works',
    buttonText: 'How does it work?',
    description: 'Understand the mechanics behind TimeBack\'s success',
    sections: [
      {
        id: 'learning-mechanism',
        title: 'How does the learning process work?',
        description: 'The step-by-step process of TimeBack learning',
        components: [
          { component: MechanismSection, name: 'MechanismSection' },
          { component: HowWeGetResults, name: 'HowWeGetResults' }
        ],
        subButtons: [
          {
            id: 'daily-process',
            text: 'What does a typical day look like?',
            targetComponents: ['MechanismSection']
          },
          {
            id: 'personalization-process',
            text: 'How is it personalized for each child?',
            targetComponents: ['HowWeGetResults']
          }
        ]
      }
    ]
  },
  {
    id: 'data-proof',
    buttonText: 'Show me your data',
    description: 'Hard evidence and research backing TimeBack\'s approach',
    sections: [
      {
        id: 'test-scores',
        title: 'Show me the test scores',
        description: 'Standardized test results from TimeBack students',
        components: [
          { component: ImmediateDataShock, name: 'ImmediateDataShock' },
          { component: CompletionTimeData, name: 'CompletionTimeData' }
        ],
        subButtons: [
          {
            id: 'map-results',
            text: 'What are the MAP test results?',
            targetComponents: ['ImmediateDataShock']
          },
          {
            id: 'grade-improvements',
            text: 'How much do grades improve?',
            targetComponents: ['CompletionTimeData']
          }
        ]
      },
      {
        id: 'completion-times',
        title: 'How fast do kids actually finish?',
        description: 'Measured completion times across all grade levels',
        components: [
          { component: SpeedComparison, name: 'SpeedComparison' },
          { component: CompletionTimeData, name: 'CompletionTimeData' }
        ],
        subButtons: [
          {
            id: 'subject-breakdown',
            text: 'Show me the breakdown by subject',
            targetComponents: ['CompletionTimeData']
          },
          {
            id: 'grade-analysis',
            text: 'How does it vary by grade level?',
            targetComponents: ['SpeedComparison']
          }
        ]
      },
      {
        id: 'research-backing',
        title: 'What\'s the research behind this?',
        description: 'Scientific studies and educational research supporting our methods',
        components: [
          { component: LearningScienceSection, name: 'LearningScienceSection' },
          { component: MechanismSection, name: 'MechanismSection' }
        ],
        subButtons: [
          {
            id: 'peer-reviewed',
            text: 'What peer-reviewed studies support this?',
            targetComponents: ['LearningScienceSection']
          },
          {
            id: 'methodology',
            text: 'How do you measure effectiveness?',
            targetComponents: ['MechanismSection']
          }
        ]
      }
    ]
  },
  {
    id: 'example-question',
    buttonText: 'Show me an example question tailored to my kid',
    description: 'See how AI personalizes content for your child\'s interests',
    sections: [
      {
        id: 'personalized-examples',
        title: 'How are questions customized for my child?',
        description: 'Examples of personalized content based on your child\'s interests',
        components: [
          { component: PersonalizedSubjectExamples, name: 'PersonalizedSubjectExamples' },
          { component: HowWeGetResults, name: 'HowWeGetResults' }
        ],
        subButtons: [
          {
            id: 'interest-integration',
            text: 'How do you integrate their interests?',
            targetComponents: ['PersonalizedSubjectExamples']
          },
          {
            id: 'content-creation',
            text: 'How do you create personalized content?',
            targetComponents: ['HowWeGetResults']
          }
        ]
      }
    ]
  },
  {
    id: 'find-school',
    buttonText: 'Find a school near me',
    description: 'Locate TimeBack schools and programs in your area',
    sections: [
      {
        id: 'school-locator',
        title: 'What options are available near me?',
        description: 'TimeBack schools and programs in your geographic area',
        components: [
          { component: StudentJourneyCarousel, name: 'StudentJourneyCarousel' },
          { component: TimeBackVsCompetitors, name: 'TimeBackVsCompetitors' }
        ],
        subButtons: [
          {
            id: 'local-schools',
            text: 'Show me schools in my area',
            targetComponents: ['StudentJourneyCarousel']
          },
          {
            id: 'program-options',
            text: 'What program options are available?',
            targetComponents: ['TimeBackVsCompetitors']
          }
        ]
      }
    ]
  },
  {
    id: 'time-freedom',
    buttonText: 'What will my kid do with the extra 6 hours they gain in their day?',
    description: 'Discover how your child will spend their newly freed time pursuing passions and interests',
    sections: [
      {
        id: 'daily-schedule',
        title: 'What does a typical day look like?',
        description: 'See the dramatic difference between traditional school and TimeBack schedules',
        components: [
          { component: AfternoonActivities, name: 'AfternoonActivities' },
          { component: SpeedComparison, name: 'SpeedComparison' }
        ],
        subButtons: [
          {
            id: 'morning-routine',
            text: 'How does the morning learning work?',
            targetComponents: ['SpeedComparison']
          },
          {
            id: 'afternoon-freedom',
            text: 'What activities will my child pursue?',
            targetComponents: ['AfternoonActivities']
          }
        ]
      },
      {
        id: 'interest-pursuit',
        title: 'How do kids spend those 6+ extra hours?',
        description: 'Real examples of how students use their time freedom',
        components: [
          { component: AfternoonActivities, name: 'AfternoonActivitiesExpanded' },
          { component: PersonalizedSubjectExamples, name: 'PersonalizedSubjectExamples' }
        ],
        subButtons: [
          {
            id: 'passion-projects',
            text: 'What kind of passion projects do kids create?',
            targetComponents: ['AfternoonActivitiesExpanded']
          },
          {
            id: 'interest-integration',
            text: 'How do interests connect to academic learning?',
            targetComponents: ['PersonalizedSubjectExamples']
          }
        ]
      },
      {
        id: 'happiness-wellbeing',
        title: 'Will my child actually be happier?',
        description: 'The emotional and psychological benefits of time freedom',
        components: [
          { component: AfternoonActivities, name: 'AfternoonActivities' },
          { component: TimeBackVsCompetitors, name: 'TimeBackVsCompetitors' }
        ],
        subButtons: [
          {
            id: 'stress-reduction',
            text: 'How does this reduce academic stress?',
            targetComponents: ['TimeBackVsCompetitors']
          },
          {
            id: 'social-development',
            text: 'Will my child still develop socially?',
            targetComponents: ['AfternoonActivities']
          }
        ]
      }
    ]
  }
];

// Helper function to get component by name
export const getComponentByName = (name: string) => {
  const componentMap: { [key: string]: React.ComponentType<any> } = {
    'AfternoonActivities': AfternoonActivities,
    'TimeBackVsCompetitors': TimeBackVsCompetitors,
    'SpeedComparison': SpeedComparison,
    'PersonalizedSubjectExamples': PersonalizedSubjectExamples,
    'KnowledgeDispersionChart': KnowledgeDispersionChart,
    'LearningScienceSection': LearningScienceSection,
    'HowWeGetResults': HowWeGetResults,
    'ImmediateDataShock': ImmediateDataShock,
    'MechanismSection': MechanismSection,
    'CompletionTimeData': CompletionTimeData,
    'StudentJourneyCarousel': StudentJourneyCarousel
  };
  
  return componentMap[name];
};