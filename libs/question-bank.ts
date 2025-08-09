/**
 * Centralized Question Bank for TimeBack AI Experience
 * 
 * This file contains all predefined questions used across the TimeBack application,
 * ensuring consistency between follow-up questions and main question buttons.
 */

export interface QuestionItem {
  id: string;
  text: string;
  category: 'main' | 'follow-up' | 'general';
  tags: string[];
  description?: string;
}

/**
 * Main questions that appear as primary interaction buttons
 * These are the core questions parents ask about TimeBack
 */
export const MAIN_QUESTIONS: QuestionItem[] = [
  {
    id: 'what-is-timeback',
    text: 'What is TimeBack?',
    category: 'main',
    tags: ['basics', 'introduction', 'overview'],
    description: 'Learn what TimeBack is and how it works'
  },
  {
    id: 'how-does-it-work',
    text: 'How does it work?',
    category: 'main',
    tags: ['mechanism', 'process', 'ai'],
    description: 'Understand how TimeBack\'s AI-powered learning system works'
  },
  {
    id: 'show-me-your-data',
    text: 'Show me your data',
    category: 'main',
    tags: ['research', 'evidence', 'results'],
    description: 'View TimeBack\'s research data and educational outcomes'
  },
  {
    id: 'learning-speed-data',
    text: 'Learning Speed Data',
    category: 'main',
    tags: ['performance', 'speed', 'metrics'],
    description: 'See how fast students complete different subjects'
  },
  {
    id: 'student-success-stories',
    text: 'Student Success Stories',
    category: 'main',
    tags: ['testimonials', 'case-studies', 'outcomes'],
    description: 'View success stories from students in your grade level'
  },
  {
    id: 'example-tailored-question',
    text: 'Example Tailored Question',
    category: 'main',
    tags: ['personalization', 'examples', 'ai'],
    description: 'See a personalized example question for your child'
  },
  {
    id: 'extra-hours-activities',
    text: 'Extra Hours Activities',
    category: 'main',
    tags: ['activities', 'time', 'enrichment'],
    description: 'Learn what your child can do with their extra time'
  },
  {
    id: 'find-nearby-schools',
    text: 'Find Nearby Schools',
    category: 'main',
    tags: ['schools', 'location', 'enrollment'],
    description: 'Find TimeBack schools in your area'
  },
  {
    id: 'school-report-cards',
    text: 'School Report Cards',
    category: 'main',
    tags: ['schools', 'performance', 'comparison'],
    description: 'View detailed school comparison report cards'
  }
];

/**
 * Follow-up questions that appear after main interactions
 * These help users dig deeper into topics they're exploring
 */
export const FOLLOW_UP_QUESTIONS: QuestionItem[] = [
  {
    id: 'show-me-evidence',
    text: 'Show me the evidence',
    category: 'follow-up',
    tags: ['research', 'evidence', 'proof'],
    description: 'Request specific evidence and research backing claims'
  },
  {
    id: 'write-this-simpler',
    text: 'Write this simpler',
    category: 'follow-up',
    tags: ['simplify', 'clarity', 'explanation'],
    description: 'Request a simpler, more accessible explanation'
  },
  {
    id: 'try-different-approach',
    text: 'Try a different approach',
    category: 'follow-up',
    tags: ['alternative', 'perspective', 'approach'],
    description: 'Explore alternative explanations or approaches'
  }
];

/**
 * General questions used across different components
 * These are additional questions that may appear in various contexts
 */
export const GENERAL_QUESTIONS: QuestionItem[] = [
  {
    id: 'how-much-cost',
    text: 'How much does it cost?',
    category: 'general',
    tags: ['pricing', 'cost', 'tuition'],
    description: 'Learn about TimeBack pricing and tuition'
  },
  {
    id: 'when-can-start',
    text: 'When can my child start?',
    category: 'general',
    tags: ['enrollment', 'timeline', 'start'],
    description: 'Find out when enrollment opens and start dates'
  },
  {
    id: 'is-accredited',
    text: 'Is TimeBack accredited?',
    category: 'general',
    tags: ['accreditation', 'credentials', 'recognition'],
    description: 'Learn about TimeBack\'s accreditation status'
  },
  {
    id: 'how-2-hour-learning',
    text: 'How does the 2-hour learning work?',
    category: 'general',
    tags: ['schedule', 'time', 'efficiency'],
    description: 'Understand the 2-hour daily learning schedule'
  }
];

/**
 * All questions combined for easy access
 */
export const ALL_QUESTIONS: QuestionItem[] = [
  ...MAIN_QUESTIONS,
  ...FOLLOW_UP_QUESTIONS,
  ...GENERAL_QUESTIONS
];

/**
 * Helper functions for working with the question bank
 */
export class QuestionBank {
  /**
   * Get questions by category
   */
  static getQuestionsByCategory(category: QuestionItem['category']): QuestionItem[] {
    return ALL_QUESTIONS.filter(q => q.category === category);
  }

  /**
   * Get questions by tags
   */
  static getQuestionsByTags(tags: string[]): QuestionItem[] {
    return ALL_QUESTIONS.filter(q => 
      tags.some(tag => q.tags.includes(tag))
    );
  }

  /**
   * Get question by ID
   */
  static getQuestionById(id: string): QuestionItem | undefined {
    return ALL_QUESTIONS.find(q => q.id === id);
  }

  /**
   * Get question text by ID
   */
  static getQuestionTextById(id: string): string | undefined {
    return this.getQuestionById(id)?.text;
  }

  /**
   * Get random questions from a category, excluding specified ones
   */
  static getRandomQuestions(
    category: QuestionItem['category'],
    count: number,
    exclude: string[] = []
  ): QuestionItem[] {
    const availableQuestions = this.getQuestionsByCategory(category)
      .filter(q => !exclude.includes(q.text));
    
    // Shuffle and take the requested count
    const shuffled = [...availableQuestions].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  }

  /**
   * Get all question texts as a simple array (for backward compatibility)
   */
  static getQuestionTexts(category?: QuestionItem['category']): string[] {
    const questions = category 
      ? this.getQuestionsByCategory(category)
      : ALL_QUESTIONS;
    return questions.map(q => q.text);
  }

  /**
   * Filter questions to avoid duplicates based on already clicked questions
   */
  static getAvailableQuestions(
    category: QuestionItem['category'],
    clickedQuestions: string[] = []
  ): QuestionItem[] {
    return this.getQuestionsByCategory(category)
      .filter(q => !clickedQuestions.includes(q.text));
  }
}

/**
 * Export question arrays for direct use (backward compatibility)
 */
export const mainQuestionTexts = QuestionBank.getQuestionTexts('main');
export const followUpQuestionTexts = QuestionBank.getQuestionTexts('follow-up');
export const generalQuestionTexts = QuestionBank.getQuestionTexts('general');
export const allQuestionTexts = QuestionBank.getQuestionTexts();
