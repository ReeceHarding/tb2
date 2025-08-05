/**
 * Component schemas for AI-generated content
 * These define the JSON structure that Claude should generate for each component
 */

export interface HeroSchema {
  title: string; // Main headline with dynamic content like grade level
  subtitle: string; // Supporting paragraph text
  badge?: string; // Optional badge text (e.g., "Limited spots available")
  showButton?: boolean; // Whether to show the CTA button (default: true)
  testimonialText?: string; // Optional override for testimonial section
}

export interface ProblemSchema {
  headline: string; // Main problem statement
  subheadline: string; // Supporting explanation
  steps: Array<{
    icon: string; // Heroicon name (e.g. 'BookOpenIcon')
    text: string; // Step description
  }>; // Should have exactly 3 steps
}

export interface Testimonials3Schema {
  headline: string; // Section title
  subheadline: string; // Section description
  testimonials: Array<{
    name: string;
    role: string; // e.g., "Parent of 3rd grader"
    text: string; // The testimonial content
    imageUrl?: string; // Optional profile image
  }>; // Should have exactly 3 testimonials
}

export interface FAQSchema {
  headline: string; // Section title (e.g., "Your Questions Answered")
  tagline?: string; // Optional tagline above headline
  subheadline?: string; // Optional description below headline
  questions: Array<{
    question: string;
    answer: string; // Plain text answer (will be converted to JSX)
  }>; // Can have any number of Q&As
}

export interface CTASchema {
  badge?: string; // Optional live indicator text
  headline: string; // Main CTA headline (can include line breaks)
  description: string; // Supporting paragraph
  buttonText?: string; // Override default button text
  disclaimer?: string; // Small text below button
}

export interface FeaturesListicleSchema {
  headline: string; // Section title
  features: Array<{
    name: string; // Feature title
    items: string[]; // List of benefits (4-5 items)
    highlight: string; // Final highlighted item
    icon?: 'lightning' | 'sparkle' | 'star' | 'heart' | 'chart' | 'smile'; // Icon type
  }>; // Should have exactly 6 features
}

export interface WithWithoutSchema {
  headline: string; // Section title
  without: {
    title: string; // Left column title
    items: string[]; // Pain points (6 items)
  };
  with: {
    title: string; // Right column title
    items: string[]; // Solutions (6 items, should correspond to without items)
  };
}

// Type for all component schemas
export type ComponentSchema = 
  | { type: 'Hero'; data: HeroSchema }
  | { type: 'Problem'; data: ProblemSchema }
  | { type: 'Testimonials3'; data: Testimonials3Schema }
  | { type: 'FAQ'; data: FAQSchema }
  | { type: 'CTA'; data: CTASchema }
  | { type: 'FeaturesListicle'; data: FeaturesListicleSchema }
  | { type: 'WithWithout'; data: WithWithoutSchema };

// Schema for AI to use when selecting components
export const COMPONENT_SELECTION_PROMPT = `
Available components:
1. Hero - Opening section with main value proposition
2. Problem - Agitates the pain points with 3-step progression
3. Testimonials3 - Shows 3 parent testimonials
4. FAQ - Answers common questions and objections
5. CTA - Strong call-to-action with urgency
6. FeaturesListicle - Interactive list of 6 key features
7. WithWithout - Side-by-side comparison of old vs new way

Select the most appropriate component based on:
- User's current stage in conversation
- Their main concerns
- What would be most persuasive next
`;

// Helper function to get schema for a component type
export function getComponentSchema(componentType: string): string {
  const validComponentTypes = [
    'Hero', 'Problem', 'Testimonials3', 'FAQ', 'CTA', 'FeaturesListicle', 'WithWithout'
  ];

  if (!validComponentTypes.includes(componentType)) {
    throw new Error(`Unknown component type: ${componentType}`);
  }

  // Return a simplified version for the AI prompt
  return JSON.stringify({
    type: componentType,
    schema: getSchemaStructure(componentType)
  }, null, 2);
}

// Get simplified schema structure for AI
function getSchemaStructure(componentType: string): any {
  switch (componentType) {
    case 'Hero':
      return {
        title: "string - Main headline with child's grade and school name",
        subtitle: "string - Supporting text with specific benefits",
        badge: "string - Optional badge text",
        showButton: "boolean - Whether to show CTA button",
      };
    
    case 'Problem':
      return {
        headline: "string - Main problem statement",
        subheadline: "string - Supporting explanation",
        steps: [
          { icon: "string", text: "string" },
          { icon: "string", text: "string" },
          { icon: "string", text: "string" }
        ]
      };
    
    case 'Testimonials3':
      return {
        headline: "string - Section title",
        subheadline: "string - Section description",
        testimonials: [
          { name: "string", role: "string", text: "string" },
          { name: "string", role: "string", text: "string" },
          { name: "string", role: "string", text: "string" }
        ]
      };
    
    case 'FAQ':
      return {
        headline: "string - Section title",
        questions: [
          { question: "string", answer: "string" },
          // ... more Q&As as needed
        ]
      };
    
    case 'CTA':
      return {
        badge: "string - Optional urgency indicator",
        headline: "string - Main CTA headline",
        description: "string - Supporting paragraph",
        disclaimer: "string - Small text below button"
      };
    
    case 'FeaturesListicle':
      return {
        headline: "string - Section title",
        features: [
          {
            name: "string - Feature title",
            items: ["string", "string", "string", "string"],
            highlight: "string - Final highlighted benefit",
            icon: "lightning | sparkle | star | heart | chart | smile"
          },
          // ... exactly 6 features total
        ]
      };
    
    case 'WithWithout':
      return {
        headline: "string - Section title",
        without: {
          title: "string - Left column title",
          items: ["string", "string", "string", "string", "string", "string"]
        },
        with: {
          title: "string - Right column title",
          items: ["string", "string", "string", "string", "string", "string"]
        }
      };
    
    default:
      return {};
  }
}