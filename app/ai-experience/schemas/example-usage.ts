/**
 * Example of how the schemas will be used
 * This file demonstrates the expected JSON structure from Claude
 */

import type { ComponentSchema } from './component-schemas';

// Example 1: Hero component for a parent with a 3rd grader
// const heroExample: ComponentSchema = {
//   type: 'Hero',
//   data: {
//     title: "What if your 3rd grader at Lincoln Elementary could master 4th grade math by spring?",
//     subtitle: "Join hundreds of families who've discovered that 2 hours of personalized AI tutoring beats 6 hours of classroom busywork. Your child scores in the 45th percentile now—imagine them in the 95th by June.",
//     badge: "Only 12 spots left for January cohort",
//     showButton: true
//   }
// };

// Example 2: Problem component addressing homework struggles
// const problemExample: ComponentSchema = {
//   type: 'Problem',
//   data: {
//     headline: "You watch Emma struggle with 3 hours of homework every night",
//     subheadline: "She's bright and curious, but the one-size-fits-all classroom is failing her. While other kids play outside, she's stuck at the kitchen table, tears in her eyes.",
//     steps: [
//       { icon: "BookOpenIcon", text: "3 hours homework after 6 hours school" },
//       { icon: "FaceSmileIcon", text: "Falling further behind each week" },
//       { icon: "HeartIcon", text: "Childhood slipping away" }
//     ]
//   }
// };

// Example 3: FAQ addressing specific concerns
// const faqExample: ComponentSchema = {
//   type: 'FAQ',
//   data: {
//     headline: "Your concerns about online learning, answered",
//     questions: [
//       {
//         question: "How can AI replace a real teacher?",
//         answer: "It doesn't replace teachers—it replaces lectures. Your child gets 1:1 tutoring that adapts instantly to their level. Human guides provide mentorship and emotional support. It's the best of both worlds."
//       },
//       {
//         question: "What about screen time?",
//         answer: "Just 2 hours of focused learning beats 6 hours of passive classroom time. Plus, your child finishes by lunch and spends afternoons outdoors, with friends, pursuing passions—not more homework."
//       },
//       {
//         question: "Is this proven to work?",
//         answer: "Our students average in the 99th percentile on MAP tests. These are the same standardized tests used by traditional schools. The data is clear: personalized learning works."
//       }
//     ]
//   }
// };

// This is what Claude will generate based on user context
export type AIGeneratedContent = ComponentSchema;
