'use client';

import React from 'react';
import { SectionSchema } from '@/libs/section-schemas';
import dynamic from 'next/dynamic';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

// Custom typewriter hook for LLM-like animation
const useTypewriter = (text: string, speed = 25, startDelay = 0) => {
  const [displayText, setDisplayText] = React.useState('');
  const [isComplete, setIsComplete] = React.useState(false);

  React.useEffect(() => {
    if (!text) {
      setDisplayText('');
      setIsComplete(true);
      return;
    }

    setDisplayText('');
    setIsComplete(false);
    
    const timer = setTimeout(() => {
      let currentIndex = 0;
      
      const typeInterval = setInterval(() => {
        if (currentIndex <= text.length) {
          setDisplayText(text.slice(0, currentIndex));
          currentIndex++;
        } else {
          setIsComplete(true);
          clearInterval(typeInterval);
        }
      }, speed);

      return () => clearInterval(typeInterval);
    }, startDelay);

    return () => clearTimeout(timer);
  }, [text, speed, startDelay]);

  return { displayText, isComplete };
};

// Hook for multiple questions with staggered animations
const useQuestionTypewriter = (questions: string[], speed = 25, baseDelay = 0) => {
  const questionAnimations = questions.map((question, index) => 
    useTypewriter(question, speed, baseDelay + (index * 600)) // 600ms between each question
  );

  return questionAnimations;
};

// Dynamic imports for chart components
const Chart = dynamic(() => import('react-chartjs-2').then(mod => mod.Chart), { ssr: false });
const Bar = dynamic(() => import('react-chartjs-2').then(mod => mod.Bar), { ssr: false });
const Line = dynamic(() => import('react-chartjs-2').then(mod => mod.Line), { ssr: false });
const Doughnut = dynamic(() => import('react-chartjs-2').then(mod => mod.Doughnut), { ssr: false });

interface AIContentRendererProps {
  sectionId: string;
  schema: SectionSchema;
  content: any;
  isLoading?: boolean;
  error?: string;
}

export default function AIContentRenderer({
  sectionId,
  schema,
  content,
  isLoading = false,
  error
}: AIContentRendererProps) {
  console.log(`[AIContentRenderer] Rendering section: ${sectionId}`, { content, isLoading, error });
  
  // Loading state
  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-2xl p-8 border-2 border-timeback-primary animate-pulse">
        <div className="h-8 bg-timeback-bg/30 rounded-xl w-3/4 mb-4"></div>
        <div className="h-4 bg-timeback-bg/20 rounded-xl w-full mb-3"></div>
        <div className="h-4 bg-timeback-bg/20 rounded-xl w-5/6 mb-3"></div>
        <div className="h-4 bg-timeback-bg/20 rounded-xl w-4/6"></div>
      </div>
    );
  }
  
  // Error state
  if (error) {
    return (
      <div className="bg-red-50 rounded-2xl shadow-2xl p-8 border-2 border-red-500">
        <h3 className="text-xl font-bold text-red-700 mb-2 font-cal">Error Loading Content</h3>
        <p className="text-red-600 font-cal">{error}</p>
      </div>
    );
  }
  
  // No content state
  if (!content) {
    return (
      <div className="bg-white rounded-2xl shadow-2xl p-8 border-2 border-timeback-primary">
        <p className="text-timeback-primary font-cal">No content available for this section.</p>
      </div>
    );
  }
  
  // Render based on component type
  switch (schema.componentType) {
    case 'text':
      return renderTextComponent(content, schema);
    case 'chart':
      return renderChartComponent(content, schema);
    case 'list':
      return renderListComponent(content, schema);
    case 'mixed':
      return renderMixedComponent(content, schema);
    default:
      return renderDefaultComponent(content, schema);
  }
}

// Render text-based content
function renderTextComponent(content: any, schema: SectionSchema) {
  return (
    <div className="bg-white rounded-2xl shadow-2xl p-8 border-2 border-timeback-primary">
      {content.title && (
        <h2 className="text-3xl font-bold text-timeback-primary mb-3 font-cal">
          {content.title}
        </h2>
      )}
      
      {content.subtitle && (
        <h3 className="text-xl text-timeback-primary mb-6 font-cal">
          {content.subtitle}
        </h3>
      )}
      
      {content.introduction && (
        <p className="text-lg text-timeback-primary mb-6 font-cal">
          {content.introduction}
        </p>
      )}
      
      {content.overview && (
        <div className="mb-6">
          <p className="text-lg text-timeback-primary font-cal">{content.overview}</p>
        </div>
      )}
      
      {/* Handle custom question responses */}
      {content.answer && (
        <div className="space-y-6">
          {content.question && (
            <div className="bg-timeback-bg/20 rounded-xl p-4 mb-4">
              <p className="text-lg font-bold text-timeback-primary font-cal">
                Your Question: {content.question}
              </p>
            </div>
          )}
          
          {content.answer.summary && (
            <div className="mb-4">
              <h4 className="text-xl font-bold text-timeback-primary mb-2 font-cal">Summary</h4>
              <p className="text-lg text-timeback-primary font-cal">{content.answer.summary}</p>
            </div>
          )}
          
          {content.answer.detailedExplanation && (
            <div className="mb-4">
              <h4 className="text-xl font-bold text-timeback-primary mb-2 font-cal">Detailed Explanation</h4>
              <p className="text-timeback-primary font-cal whitespace-pre-wrap">
                {content.answer.detailedExplanation}
              </p>
            </div>
          )}
          
          {content.answer.keyPoints && content.answer.keyPoints.length > 0 && (
            <div className="mb-4">
              <h4 className="text-xl font-bold text-timeback-primary mb-2 font-cal">Key Points</h4>
              <ul className="list-disc list-inside space-y-2">
                {content.answer.keyPoints.map((point: string, idx: number) => (
                  <li key={idx} className="text-timeback-primary font-cal">{point}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
      
      {/* Handle parent time savings content */}
      {content.currentSituation && (
        <div className="mb-6">
          <h4 className="text-xl font-bold text-timeback-primary mb-3 font-cal">Current Situation</h4>
          {content.currentSituation.dailyStress && (
            <div className="mb-4">
              <p className="font-bold text-timeback-primary font-cal">Daily Stressors:</p>
              <ul className="list-disc list-inside space-y-1">
                {content.currentSituation.dailyStress.map((stress: string, idx: number) => (
                  <li key={idx} className="text-timeback-primary font-cal">{stress}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
      
      {content.withTimeBack && (
        <div className="mb-6 bg-timeback-bg/10 rounded-xl p-6">
          <h4 className="text-xl font-bold text-timeback-primary mb-3 font-cal">Life with TimeBack</h4>
          {Object.entries(content.withTimeBack).map(([key, value]) => (
            <div key={key} className="mb-3">
              <p className="font-bold text-timeback-primary font-cal capitalize">
                {key.replace(/([A-Z])/g, ' $1').trim()}:
              </p>
              <p className="text-timeback-primary font-cal">{value as string}</p>
            </div>
          ))}
        </div>
      )}
      
      {content.callToAction && (
        <div className="mt-8 p-6 bg-timeback-primary text-white rounded-xl">
          <p className="text-lg font-bold font-cal text-center">{content.callToAction}</p>
        </div>
      )}
    </div>
  );
}

// Render chart-based content
function renderChartComponent(content: any, schema: SectionSchema) {
  const chartData = prepareChartData(content);
  
  return (
    <div className="bg-white rounded-2xl shadow-2xl p-8 border-2 border-timeback-primary">
      {content.title && (
        <h2 className="text-3xl font-bold text-timeback-primary mb-3 font-cal">
          {content.title}
        </h2>
      )}
      
      {content.subtitle && (
        <h3 className="text-xl text-timeback-primary mb-6 font-cal">
          {content.subtitle}
        </h3>
      )}
      
      {content.introduction && (
        <p className="text-lg text-timeback-primary mb-6 font-cal">
          {content.introduction}
        </p>
      )}
      
      {/* Performance metrics chart */}
      {content.performanceData && (
        <div className="mb-8">
          <Bar 
            data={{
              labels: ['Current', 'Target', 'National Avg', 'School Avg'],
              datasets: [{
                label: 'Performance Score',
                data: [
                  content.performanceData.currentLevel,
                  content.performanceData.targetLevel,
                  content.performanceData.nationalAverage,
                  content.performanceData.schoolAverage
                ],
                backgroundColor: [
                  'rgba(15, 51, 187, 0.8)',
                  'rgba(26, 190, 255, 0.8)',
                  'rgba(156, 163, 175, 0.8)',
                  'rgba(34, 197, 94, 0.8)'
                ],
                borderColor: [
                  'rgba(15, 51, 187, 1)',
                  'rgba(26, 190, 255, 1)',
                  'rgba(156, 163, 175, 1)',
                  'rgba(34, 197, 94, 1)'
                ],
                borderWidth: 2
              }]
            }}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  display: false
                },
                title: {
                  display: true,
                  text: 'Performance Comparison',
                  font: {
                    size: 18,
                    family: 'Cal Sans'
                  }
                }
              },
              scales: {
                y: {
                  beginAtZero: true,
                  max: 100
                }
              }
            }}
          />
        </div>
      )}
      
      {/* Growth metrics */}
      {content.growthMetrics && content.growthMetrics.length > 0 && (
        <div className="mb-6">
          <h4 className="text-xl font-bold text-timeback-primary mb-4 font-cal">Subject Growth Projections</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {content.growthMetrics.map((metric: any, idx: number) => (
              <div key={idx} className="bg-timeback-bg/10 rounded-xl p-4">
                <h5 className="font-bold text-timeback-primary font-cal">{metric.subject}</h5>
                <div className="flex justify-between mt-2">
                  <span className="text-timeback-primary font-cal">Current: {metric.currentScore}%</span>
                  <span className="text-timeback-primary font-cal">Projected: {metric.projectedScore}%</span>
                </div>
                <div className="mt-2 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-timeback-primary h-2 rounded-full transition-all duration-500"
                    style={{ width: `${metric.projectedScore}%` }}
                  ></div>
                </div>
                <p className="text-sm text-timeback-primary mt-1 font-cal">Growth Rate: {metric.growthRate}</p>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Key insights */}
      {content.keyInsights && content.keyInsights.length > 0 && (
        <div className="mb-6">
          <h4 className="text-xl font-bold text-timeback-primary mb-3 font-cal">Key Insights</h4>
          <ul className="space-y-2">
            {content.keyInsights.map((insight: string, idx: number) => (
              <li key={idx} className="flex items-start">
                <span className="text-timeback-primary mr-2">•</span>
                <span className="text-timeback-primary font-cal">{insight}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {/* Recommendations */}
      {content.recommendations && content.recommendations.length > 0 && (
        <div className="bg-timeback-bg/10 rounded-xl p-6">
          <h4 className="text-xl font-bold text-timeback-primary mb-3 font-cal">Recommendations</h4>
          <ul className="space-y-2">
            {content.recommendations.map((rec: string, idx: number) => (
              <li key={idx} className="flex items-start">
                <span className="text-timeback-primary mr-2">✓</span>
                <span className="text-timeback-primary font-cal">{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// Render list-based content
function renderListComponent(content: any, schema: SectionSchema) {
  return (
    <div className="bg-white rounded-2xl shadow-2xl p-8 border-2 border-timeback-primary">
      {content.title && (
        <h2 className="text-3xl font-bold text-timeback-primary mb-3 font-cal">
          {content.title}
        </h2>
      )}
      
      {content.locationContext && (
        <p className="text-lg text-timeback-primary mb-6 font-cal">
          {content.locationContext}
        </p>
      )}
      
      {/* Schools list */}
      {content.schools && content.schools.length > 0 && (
        <div className="space-y-6">
          {content.schools.map((school: any, idx: number) => (
            <div key={idx} className="bg-timeback-bg/10 rounded-xl p-6 hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-xl font-bold text-timeback-primary font-cal">{school.name}</h3>
                <span className="bg-timeback-primary text-white px-3 py-1 rounded-full text-sm font-cal">
                  {school.distance}
                </span>
              </div>
              
              <p className="text-timeback-primary mb-2 font-cal">{school.address}</p>
              <p className="text-timeback-primary mb-3 font-cal">Grades: {school.grades}</p>
              
              {school.highlights && school.highlights.length > 0 && (
                <div className="mb-3">
                  <p className="font-bold text-timeback-primary mb-1 font-cal">Highlights:</p>
                  <ul className="list-disc list-inside space-y-1">
                    {school.highlights.map((highlight: string, hidx: number) => (
                      <li key={hidx} className="text-timeback-primary font-cal">{highlight}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {school.uniqueFeatures && (
                <p className="text-timeback-primary mb-3 font-cal">
                  <span className="font-bold">Unique Features:</span> {school.uniqueFeatures}
                </p>
              )}
              
              {school.contactInfo && (
                <div className="mt-4 pt-4 border-t border-timeback-primary/20">
                  <p className="text-timeback-primary font-cal">
                    <span className="font-bold">Phone:</span> {school.contactInfo.phone}
                  </p>
                  {school.contactInfo.email && (
                    <p className="text-timeback-primary font-cal">
                      <span className="font-bold">Email:</span> {school.contactInfo.email}
                    </p>
                  )}
                  {school.contactInfo.website && (
                    <p className="text-timeback-primary font-cal">
                      <span className="font-bold">Website:</span>{' '}
                      <a 
                        href={school.contactInfo.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="underline hover:text-timeback-primary/80"
                      >
                        {school.contactInfo.website}
                      </a>
                    </p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      
      {content.comparisonInsights && (
        <div className="mt-6 p-6 bg-timeback-bg/10 rounded-xl">
          <h4 className="text-xl font-bold text-timeback-primary mb-2 font-cal">Insights</h4>
          <p className="text-timeback-primary font-cal">{content.comparisonInsights}</p>
        </div>
      )}
      
      {content.nextSteps && content.nextSteps.length > 0 && (
        <div className="mt-6">
          <h4 className="text-xl font-bold text-timeback-primary mb-3 font-cal">Next Steps</h4>
          <ol className="list-decimal list-inside space-y-2">
            {content.nextSteps.map((step: string, idx: number) => (
              <li key={idx} className="text-timeback-primary font-cal">{step}</li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}

// Render mixed content (combination of text, lists, and potentially charts)
function renderMixedComponent(content: any, schema: SectionSchema) {
  // Typewriter animations for follow-up questions
  const followUpQuestionsText = useTypewriter("You might also want to know:", 30, 0);
  const questionAnimations = useQuestionTypewriter(
    content?.followUpQuestions || [], 
    25, 
    300 // Start after heading loads
  );
  
  return (
    <div className="bg-white rounded-2xl shadow-2xl p-8 border-2 border-timeback-primary">
      {content.title && (
        <h2 className="text-3xl font-bold text-timeback-primary mb-3 font-cal">
          {content.title}
        </h2>
      )}
      
      {content.subtitle && (
        <h3 className="text-xl text-timeback-primary mb-6 font-cal">
          {content.subtitle}
        </h3>
      )}
      
      {content.overview && (
        <p className="text-lg text-timeback-primary mb-6 font-cal">
          {content.overview}
        </p>
      )}
      
      {content.introduction && (
        <p className="text-lg text-timeback-primary mb-6 font-cal">
          {content.introduction}
        </p>
      )}
      
      {/* Daily schedule - legacy format */}
      {content.dailySchedule && content.dailySchedule.length > 0 && (
        <div className="mb-8">
          <h4 className="text-xl font-bold text-timeback-primary mb-4 font-cal">Daily Schedule</h4>
          <div className="space-y-3">
            {content.dailySchedule.map((item: any, idx: number) => (
              <div 
                key={idx} 
                className={`flex items-center p-4 rounded-xl ${
                  item.type === 'academic' ? 'bg-timeback-bg/20' :
                  item.type === 'break' ? 'bg-green-100' :
                  'bg-purple-100'
                }`}
              >
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-timeback-primary font-cal">{item.time}</span>
                    <span className="text-sm text-timeback-primary font-cal">{item.duration}</span>
                  </div>
                  <p className="text-timeback-primary mt-1 font-cal">{item.activity}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Personalized daily timeline - new format */}
      {content.timeSlots && content.timeSlots.length > 0 && (
        <div className="mb-8">
          <div className="backdrop-blur-md bg-gradient-to-b from-timeback-bg/20 to-timeback-bg/10 rounded-3xl p-6 lg:p-8 border border-timeback-primary/30 shadow-lg">
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 bg-timeback-bg text-timeback-primary px-4 py-2 rounded-full text-sm font-semibold mb-3">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                </svg>
                {content.badge || 'TIMEBACK STUDENT'}
              </div>
              <h4 className="text-xl font-cal font-bold text-timeback-primary">
                {content.title || 'The Liberated Life'}
              </h4>
            </div>

            <div className="space-y-3">
              {content.timeSlots.map((slot: any, index: number) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="text-sm font-cal font-bold text-timeback-primary w-16 flex-shrink-0 pt-1">
                    {slot.time}
                  </div>
                  <div className={`flex-1 rounded-xl p-3 ${
                    slot.slotType === 'completed' 
                      ? 'bg-timeback-primary text-white' 
                      : slot.slotType === 'learning'
                      ? 'bg-timeback-bg/50 border-2 border-timeback-primary/30'
                      : slot.slotType === 'interest'
                      ? 'bg-timeback-bg/40 border-2 border-timeback-primary/50 shadow-md'
                      : 'bg-timeback-bg/30'
                  }`}>
                    <div className={`font-cal font-semibold text-sm ${
                      slot.slotType === 'completed' ? 'text-white' : 'text-timeback-primary'
                    }`}>
                      {slot.activity}
                    </div>
                    <div className={`text-xs leading-relaxed ${
                      slot.slotType === 'completed' ? 'text-white/90' : 'text-timeback-primary/80'
                    }`}>
                      {slot.description}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 text-center bg-timeback-bg/30 rounded-2xl p-6">
              <div className="text-3xl lg:text-4xl font-cal font-bold text-timeback-primary mb-1">
                {content.totalFreeHours || '8+ Hours'} for Life
              </div>
              <div className="text-timeback-primary/80 font-medium">Every. Single. Day.</div>
            </div>
          </div>
        </div>
      )}
      
      {/* Student success stories */}
      {content.stories && content.stories.length > 0 && (
        <div className="space-y-6">
          {content.stories.map((story: any, idx: number) => (
            <div key={idx} className="bg-timeback-bg/10 rounded-xl p-6">
              <div className="mb-4">
                <h4 className="text-xl font-bold text-timeback-primary font-cal">
                  {story.studentProfile.name}
                </h4>
                <p className="text-timeback-primary font-cal">
                  {story.studentProfile.grade} • {story.studentProfile.school}
                </p>
              </div>
              
              <p className="text-timeback-primary mb-4 font-cal italic">
                &quot;{story.quote}&quot;
              </p>
              
              <p className="text-timeback-primary mb-4 font-cal">
                {story.journey}
              </p>
              
              {story.achievements && story.achievements.length > 0 && (
                <div className="mb-4">
                  <p className="font-bold text-timeback-primary mb-2 font-cal">Achievements:</p>
                  <ul className="list-disc list-inside space-y-1">
                    {story.achievements.map((achievement: string, aidx: number) => (
                      <li key={aidx} className="text-timeback-primary font-cal">{achievement}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {story.parentTestimonial && (
                <div className="mt-4 pt-4 border-t border-timeback-primary/20">
                  <p className="text-timeback-primary font-cal italic">
                    Parent: &quot;{story.parentTestimonial}&quot;
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      
      {/* Cost breakdown */}
      {content.costBreakdown && (
        <div className="mb-6 bg-timeback-bg/10 rounded-xl p-6">
          <h4 className="text-xl font-bold text-timeback-primary mb-4 font-cal">Investment Breakdown</h4>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-timeback-primary font-cal">Tuition:</span>
              <span className="font-bold text-timeback-primary font-cal">${content.costBreakdown.tuition}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-timeback-primary font-cal">Materials:</span>
              <span className="font-bold text-timeback-primary font-cal">${content.costBreakdown.materials}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-timeback-primary font-cal">Technology:</span>
              <span className="font-bold text-timeback-primary font-cal">${content.costBreakdown.technology}</span>
            </div>
            <div className="flex justify-between pt-3 border-t border-timeback-primary/20">
              <span className="font-bold text-timeback-primary font-cal">Total Monthly:</span>
              <span className="font-bold text-xl text-timeback-primary font-cal">${content.costBreakdown.total}</span>
            </div>
            {content.costBreakdown.comparisonToTraditional && (
              <p className="text-sm text-timeback-primary mt-3 font-cal">
                {content.costBreakdown.comparisonToTraditional}
              </p>
            )}
          </div>
        </div>
      )}
      
      {/* Generic benefits/features list */}
      {content.benefits && content.benefits.length > 0 && (
        <div className="mb-6">
          <h4 className="text-xl font-bold text-timeback-primary mb-4 font-cal">Benefits</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {content.benefits.map((benefit: any, idx: number) => (
              <div key={idx} className="bg-timeback-bg/10 rounded-xl p-4">
                <h5 className="font-bold text-timeback-primary mb-2 font-cal">{benefit.feature}</h5>
                <p className="text-timeback-primary mb-2 font-cal">{benefit.description}</p>
                {benefit.impact && (
                  <p className="text-sm text-timeback-primary font-cal italic">Impact: {benefit.impact}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Action items */}
      {content.actionItems && content.actionItems.length > 0 && (
        <div className="mt-6 p-6 bg-timeback-primary text-white rounded-xl">
          <h4 className="text-xl font-bold mb-3 font-cal">Action Items</h4>
          <ul className="space-y-2">
            {content.actionItems.map((item: string, idx: number) => (
              <li key={idx} className="flex items-start">
                <span className="mr-2">→</span>
                <span className="font-cal">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {/* Follow-up questions */}
      {content.followUpQuestions && content.followUpQuestions.length > 0 && (
        <div className="mt-6">
          <h4 className="text-xl font-bold text-timeback-primary mb-3 font-cal">{followUpQuestionsText.displayText}</h4>
          <div className="space-y-2">
            {content.followUpQuestions.map((question: string, idx: number) => (
              <button
                key={idx}
                className="w-full text-left p-4 bg-timeback-bg/10 rounded-xl hover:bg-timeback-bg/20 transition-colors"
              >
                <span className="text-timeback-primary font-cal">{questionAnimations[idx]?.displayText || ''}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Default renderer for unknown component types
function renderDefaultComponent(content: any, schema: SectionSchema) {
  return (
    <div className="bg-white rounded-2xl shadow-2xl p-8 border-2 border-timeback-primary">
      <h3 className="text-xl font-bold text-timeback-primary mb-4 font-cal">
        {schema.name}
      </h3>
      <pre className="bg-gray-100 p-4 rounded-xl overflow-auto text-sm">
        {JSON.stringify(content, null, 2)}
      </pre>
    </div>
  );
}

// Helper function to prepare chart data
function prepareChartData(content: any) {
  // This is a placeholder - would need actual data transformation logic
  return {
    labels: [] as string[],
    datasets: [] as any[]
  };
}