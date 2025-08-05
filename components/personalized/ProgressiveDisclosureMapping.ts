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
    id: 'time-freedom',
    buttonText: 'What will my kid do with the extra time?',
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
  },
  {
    id: 'time-waste',
    buttonText: 'How much time is my child wasting?',
    description: 'Understand exactly where traditional education wastes your child\'s precious time',
    sections: [
      {
        id: 'waste-breakdown',
        title: 'Where exactly is time being wasted?',
        description: 'Detailed analysis of how traditional schools squander learning time',
        components: [
          { component: KnowledgeDispersionChart, name: 'KnowledgeDispersionChart' },
          { component: ImmediateDataShock, name: 'ImmediateDataShock' }
        ],
        subButtons: [
          {
            id: 'classroom-inefficiency',
            text: 'Why is classroom teaching so inefficient?',
            targetComponents: ['KnowledgeDispersionChart']
          },
          {
            id: 'waiting-time',
            text: 'How much time do kids spend waiting?',
            targetComponents: ['ImmediateDataShock']
          }
        ]
      },
      {
        id: 'school-comparison',
        title: 'How does this compare to my child\'s school?',
        description: 'See how your specific school stacks up against efficient learning',
        components: [
          { component: MechanismSection, name: 'MechanismSection' },
          { component: CompletionTimeData, name: 'CompletionTimeData' }
        ],
        subButtons: [
          {
            id: 'efficiency-metrics',
            text: 'What are the actual efficiency numbers?',
            targetComponents: ['CompletionTimeData']
          },
          {
            id: 'improvement-potential',
            text: 'How much could my child improve?',
            targetComponents: ['MechanismSection']
          }
        ]
      },
      {
        id: 'real-examples',
        title: 'Show me real examples',
        description: 'Concrete examples of time waste and efficiency improvements',
        components: [
          { component: SpeedComparison, name: 'SpeedComparison' },
          { component: CompletionTimeData, name: 'CompletionTimeData' }
        ],
        subButtons: [
          {
            id: 'student-stories',
            text: 'What do real students experience?',
            targetComponents: ['SpeedComparison']
          },
          {
            id: 'before-after',
            text: 'Show me before and after comparisons',
            targetComponents: ['CompletionTimeData']
          }
        ]
      }
    ]
  },
  {
    id: 'ai-personalization',
    buttonText: 'How will the AI help my child?',
    description: 'Discover how AI creates a completely personalized learning experience',
    sections: [
      {
        id: 'ai-understanding',
        title: 'How does AI know what my child needs?',
        description: 'The technology behind personalized learning paths',
        components: [
          { component: HowWeGetResults, name: 'HowWeGetResults' },
          { component: PersonalizedSubjectExamples, name: 'PersonalizedSubjectExamples' }
        ],
        subButtons: [
          {
            id: 'assessment-process',
            text: 'How does the initial assessment work?',
            targetComponents: ['HowWeGetResults']
          },
          {
            id: 'ongoing-adaptation',
            text: 'How does it adapt as my child learns?',
            targetComponents: ['PersonalizedSubjectExamples']
          }
        ]
      },
      {
        id: 'adaptive-learning',
        title: 'What if my child is behind or ahead?',
        description: 'How AI handles different starting points and learning speeds',
        components: [
          { component: KnowledgeDispersionChart, name: 'KnowledgeDispersionChart' },
          { component: MechanismSection, name: 'MechanismSection' }
        ],
        subButtons: [
          {
            id: 'catch-up-process',
            text: 'How do struggling students catch up?',
            targetComponents: ['MechanismSection']
          },
          {
            id: 'acceleration-path',
            text: 'How do advanced students accelerate?',
            targetComponents: ['KnowledgeDispersionChart']
          }
        ]
      },
      {
        id: 'interest-integration',
        title: 'Will it work for my child\'s specific interests?',
        description: 'How AI weaves personal interests into academic content',
        components: [
          { component: PersonalizedSubjectExamples, name: 'PersonalizedSubjectExamples' },
          { component: AfternoonActivities, name: 'AfternoonActivities' }
        ],
        subButtons: [
          {
            id: 'content-customization',
            text: 'How are lessons customized to interests?',
            targetComponents: ['PersonalizedSubjectExamples']
          },
          {
            id: 'passion-connection',
            text: 'How do passions connect to academics?',
            targetComponents: ['AfternoonActivities']
          }
        ]
      }
    ]
  },
  {
    id: 'data-proof',
    buttonText: 'Show me the actual data',
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
    id: 'effectiveness-proof',
    buttonText: 'Will this really work for my kid?',
    description: 'Proof that TimeBack works for students like yours',
    sections: [
      {
        id: 'success-stories',
        title: 'Show me kids like mine who succeeded',
        description: 'Real student success stories and outcomes',
        components: [
          { component: StudentJourneyCarousel, name: 'StudentJourneyCarousel' },
          { component: ImmediateDataShock, name: 'ImmediateDataShock' },
          { component: AfternoonActivities, name: 'AfternoonActivities' }
        ],
        subButtons: [
          {
            id: 'grade-matched-students',
            text: 'Show me students in my child\'s grade',
            targetComponents: ['StudentJourneyCarousel']
          },
          {
            id: 'similar-backgrounds',
            text: 'Find students with similar backgrounds',
            targetComponents: ['ImmediateDataShock']
          },
          {
            id: 'interest-matches',
            text: 'Show me kids with similar interests',
            targetComponents: ['AfternoonActivities']
          }
        ]
      },
      {
        id: 'guarantee-evidence',
        title: 'What guarantees do you offer?',
        description: 'Our confidence in results and what we guarantee',
        components: [
          { component: TimeBackVsCompetitors, name: 'TimeBackVsCompetitors' },
          { component: MechanismSection, name: 'MechanismSection' }
        ],
        subButtons: [
          {
            id: 'money-back',
            text: 'Do you offer money-back guarantees?',
            targetComponents: ['TimeBackVsCompetitors']
          },
          {
            id: 'improvement-timeline',
            text: 'How quickly will I see results?',
            targetComponents: ['MechanismSection']
          }
        ]
      },
      {
        id: 'risk-mitigation',
        title: 'What if it doesn\'t work for my child?',
        description: 'How we handle different learning needs and challenges',
        components: [
          { component: KnowledgeDispersionChart, name: 'KnowledgeDispersionChart' },
          { component: HowWeGetResults, name: 'HowWeGetResults' }
        ],
        subButtons: [
          {
            id: 'learning-differences',
            text: 'How do you handle learning differences?',
            targetComponents: ['KnowledgeDispersionChart']
          },
          {
            id: 'adaptation-process',
            text: 'How do you adapt when something isn\'t working?',
            targetComponents: ['HowWeGetResults']
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