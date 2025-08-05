'use client';

import React, { useState } from 'react';
import { smoothScrollTo } from '@/libs/ui-animations';

interface CustomQuestionSectionProps {
  quizData: any;
  viewedComponents: Array<{
    mainSectionId: string;
    componentName: string;
    timestamp: number;
  }>;
}

interface GeneratedResponse {
  header: string;
  main_heading: string;
  description: string;
  key_points: Array<{
    label: string;
    description: string;
  }>;
  next_options: string[];
}

export default function CustomQuestionSection({ quizData, viewedComponents }: CustomQuestionSectionProps) {
  const [question, setQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [generatedResponse, setGeneratedResponse] = useState<GeneratedResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!question.trim()) return;

    setIsLoading(true);
    setError(null);

    // Smooth scroll to the loading state
    setTimeout(() => {
      const element = document.getElementById('custom-question-response');
      if (element) {
        smoothScrollTo(element);
      }
    }, 100);

    try {
      const response = await fetch('/api/ai/custom-question', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question,
          quizData,
          viewedComponentsSummary: viewedComponents.map(vc => vc.componentName).join(', '),
          currentUser: {
            name: quizData.userType || 'Parent',
            student_grade: quizData.grade || 'K-12',
            interest_subjects: quizData.kidsInterests?.join(', ') || 'General learning',
            main_concerns: 'Understanding TimeBack educational approach',
            school_name: quizData.selectedSchools?.[0]?.name || 'Local school',
            school_city: quizData.selectedSchools?.[0]?.city || '',
            school_state: quizData.selectedSchools?.[0]?.state || ''
          }
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate response');
      }

      const data = await response.json();
      setGeneratedResponse(data);
      
      // After content loads, smooth scroll to show the full response
      setTimeout(() => {
        const responseElement = document.getElementById('custom-question-full-response');
        if (responseElement) {
          smoothScrollTo(responseElement);
        }
      }, 300);

    } catch (err) {
      console.error('Error generating response:', err);
      setError('Unable to generate a response. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFollowUpQuestion = (followUpQuestion: string) => {
    setQuestion(followUpQuestion);
    setGeneratedResponse(null);
    // Smooth scroll back to the input
    const inputSection = document.getElementById('custom-question-input');
    if (inputSection) {
      smoothScrollTo(inputSection);
    }
  };

  return (
    <section className="max-w-7xl mx-auto py-16 px-6 lg:px-12">
      {/* Input Section */}
      <div id="custom-question-input" className="bg-gradient-to-br from-timeback-bg to-white rounded-xl p-8 border border-timeback-primary mb-8">
        <h2 className="text-3xl font-bold text-timeback-primary font-cal mb-4">
          Have a Specific Question?
        </h2>
        <p className="text-lg text-timeback-primary opacity-75 font-cal mb-6">
          Ask anything about TimeBack and get a personalized answer based on your child&apos;s needs.
        </p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Type your question here... (e.g., 'How will TimeBack help my child who struggles with math?' or 'What makes TimeBack different from online homeschooling?')"
              className="w-full p-4 border-2 border-timeback-primary rounded-xl resize-none h-32 text-timeback-primary placeholder-timeback-primary placeholder-opacity-50 focus:outline-none focus:ring-2 focus:ring-timeback-primary focus:border-transparent font-cal"
              disabled={isLoading}
            />
          </div>
          
          <button
            type="submit"
            disabled={isLoading || !question.trim()}
            className={`
              bg-timeback-primary text-white px-8 py-4 rounded-xl font-bold text-lg 
              transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 font-cal
              ${isLoading || !question.trim() ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            {isLoading ? 'Generating Response...' : 'Get Personalized Answer'}
          </button>
        </form>
      </div>

      {/* Response Section */}
      <div id="custom-question-response">
        {/* Loading State */}
        {isLoading && (
          <div className="bg-white rounded-xl p-8 border border-timeback-primary shadow-lg">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-timeback-primary border-t-transparent"></div>
              <span className="ml-4 text-lg text-timeback-primary font-cal">
                Creating your personalized response...
              </span>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6">
            <p className="text-red-600 font-cal">{error}</p>
          </div>
        )}

        {/* Generated Response */}
        {generatedResponse && !isLoading && (
          <div id="custom-question-full-response" className="space-y-8 animate-fadeIn">
            {/* Main Response Card */}
            <div className="bg-white rounded-xl shadow-lg border border-timeback-primary overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-timeback-primary to-timeback-primary p-4">
                <p className="text-white font-bold text-sm uppercase tracking-wider font-cal">
                  {generatedResponse.header}
                </p>
              </div>

              {/* Content */}
              <div className="p-8">
                <h3 className="text-3xl font-bold text-timeback-primary mb-4 font-cal">
                  {generatedResponse.main_heading}
                </h3>
                
                <p className="text-lg text-timeback-primary opacity-75 mb-8 font-cal">
                  {generatedResponse.description}
                </p>

                {/* Key Points */}
                <div className="space-y-6">
                  {generatedResponse.key_points.map((point, index) => (
                    <div key={index} className="flex gap-4">
                      <div className="flex-shrink-0 w-10 h-10 bg-timeback-bg rounded-xl flex items-center justify-center">
                        <span className="text-timeback-primary font-bold font-cal">
                          {index + 1}
                        </span>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-timeback-primary mb-2 font-cal">
                          {point.label}
                        </h4>
                        <p className="text-timeback-primary opacity-75 font-cal">
                          {point.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Follow-up Questions */}
            <div className="bg-gradient-to-br from-timeback-bg to-white rounded-xl p-6 border border-timeback-primary">
              <h4 className="text-xl font-bold text-timeback-primary mb-4 font-cal">
                Explore More:
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {generatedResponse.next_options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleFollowUpQuestion(option)}
                    className="p-4 bg-white border-2 border-timeback-primary rounded-xl text-timeback-primary hover:bg-timeback-bg transition-all duration-200 text-left font-cal"
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            {/* Progress Indicator */}
            <div className="text-center">
              <div className="inline-flex items-center gap-2 bg-white border border-timeback-primary rounded-full px-6 py-3">
                <div className="w-3 h-3 bg-timeback-primary rounded-full"></div>
                <span className="text-timeback-primary font-bold text-sm font-cal">
                  Custom insight added to your personalized report
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}