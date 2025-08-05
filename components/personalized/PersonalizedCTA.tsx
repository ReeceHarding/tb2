'use client';

import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';

interface QuizData {
  userType: string;
  parentSubType: string;
  selectedSchools: Array<{
    id: string;
    name: string;
    city: string;
    state: string;
    level: string;
  }>;
  // learningGoals: string[]; - removed
  kidsInterests: string[];
  numberOfKids: number;
}

interface PersonalizedCTAProps {
  quizData: QuizData;
  onLearnMore: (section: string) => void;
}

interface ChatMessage {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

export default function PersonalizedCTA({ quizData, onLearnMore }: PersonalizedCTAProps) {
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [showChat, setShowChat] = useState(false);

  console.log('[PersonalizedCTA] Rendering Q&A chatbot section');

  // Predefined quick questions based on the quiz data
  const getQuickQuestions = () => {
    const baseQuestions = [
      "How much does TimeBack cost?",
      "How is this different from traditional school?",
      "What if my child is struggling academically?",
      "How do I know if this is right for my child?"
    ];

    // Add contextual questions based on quiz data
    if (quizData.parentSubType === 'I want to homeschool') {
      baseQuestions.unshift("What support do I get as a homeschooling parent?");
    } else if (quizData.parentSubType === 'I want after school tutoring') {
      baseQuestions.unshift("How does this work with my child's current school?");
    } else if (quizData.parentSubType === 'I want to go to a TimeBack school') {
      baseQuestions.unshift("Are there TimeBack schools in my area?");
    }

    return baseQuestions.slice(0, 4); // Keep only 4 questions for clean layout
  };

  const handleQuickQuestion = async (question: string) => {
    console.log('[PersonalizedCTA] Handling quick question:', question);
    
    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: question,
      timestamp: new Date()
    };
    
    setChatMessages(prev => [...prev, userMessage]);
    setIsChatLoading(true);
    setShowChat(true);
    
    try {
      const response = await fetch('/api/ai/chat-tutor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: question,
          interests: quizData.kidsInterests,
          context: {
            parentType: quizData.parentSubType,
            school: quizData.selectedSchools[0]?.name,
            // learningGoals: quizData.learningGoals, - removed
            numberOfKids: quizData.numberOfKids
          }
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        const aiMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          type: 'ai',
          content: data.response,
          timestamp: new Date()
        };
        setChatMessages(prev => [...prev, aiMessage]);
      } else {
        throw new Error(data.error || 'Failed to get AI response');
      }
    } catch (error) {
      console.error('[PersonalizedCTA] Error with question:', error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: 'I apologize, but I encountered an error. Please try asking your question again.',
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isChatLoading) return;
    
    const userQuestion = chatInput.trim();
    setChatInput('');
    
    await handleQuickQuestion(userQuestion);
  };

  return (
    <section className="bg-timeback-primary py-16 lg:py-24 mb-16">
      <div className="text-center text-white px-4 md:px-8 max-w-7xl mx-auto font-cal">
        <h2 className="text-3xl lg:text-5xl font-bold mb-6 font-cal">
          Have Questions? We Have Answers
        </h2>
        <p className="text-xl text-white max-w-3xl mx-auto mb-12 font-cal">
          Get instant answers about TimeBack from our AI assistant, trained on everything about our approach.
        </p>

        {/* Quick Questions */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4 text-white font-cal">Popular Questions:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-4xl mx-auto">
            {getQuickQuestions().map((question, index) => (
              <button
                key={index}
                onClick={() => handleQuickQuestion(question)}
                className="bg-timeback-primary hover:bg-timeback-primary text-white px-4 py-3 rounded-xl text-sm transition-all duration-200 text-left font-cal"
                disabled={isChatLoading}
              >
                {question}
              </button>
            ))}
          </div>
        </div>

        {/* Quick Chat Input - Always Visible */}
        {!showChat && (
          <div className="max-w-2xl mx-auto mb-8">
            <form onSubmit={handleChatSubmit} className="flex gap-3">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ask anything about TimeBack..."
                className="flex-1 px-4 py-3 border border-timeback-primary bg-white bg-opacity-20 backdrop-blur rounded-xl text-white placeholder-timeback-bg focus:ring-2 focus:ring-timeback-bg focus:border-transparent outline-none font-cal"
                disabled={isChatLoading}
              />
              <button
                type="submit"
                disabled={!chatInput.trim() || isChatLoading}
                className="bg-white text-timeback-primary px-6 py-3 rounded-xl font-semibold hover:bg-timeback-bg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-cal"
              >
                Send
              </button>
            </form>
          </div>
        )}

        {/* Chat Interface - ChatGPT Style Layout */}
        {showChat && (
          <div className="max-w-4xl mx-auto bg-white border border-timeback-primary rounded-2xl shadow-2xl mb-8 h-[600px] flex flex-col">
            {/* Chat Header */}
            <div className="flex items-center justify-between p-4 border-b border-timeback-primary bg-timeback-bg rounded-t-2xl">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-timeback-primary rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-white font-cal" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4M11,6V8H13V6H11M11,10V18H13V10H11Z"/>
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-timeback-primary font-cal">TimeBack AI Assistant</h3>
                  <p className="text-sm text-timeback-primary font-cal">Ask me anything about TimeBack</p>
                </div>
              </div>
              <button
                onClick={() => setShowChat(false)}
                className="text-timeback-primary hover:text-timeback-primary transition-colors font-cal"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Chat Messages - Expanded Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-timeback-bg">
              {chatMessages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex gap-3 max-w-[80%] ${message.type === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    {/* Avatar */}
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      message.type === 'user' 
                        ? 'bg-timeback-primary' 
                        : 'bg-timeback-bg'
                    }`}>
                      {message.type === 'user' ? (
                        <svg className="w-4 h-4 text-white font-cal" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,14C16.42,14 20,15.79 20,18V20H4V18C4,15.79 7.58,14 12,14Z"/>
                        </svg>
                      ) : (
                        <svg className="w-4 h-4 text-timeback-primary font-cal" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4M11,6V8H13V6H11M11,10V18H13V10H11Z"/>
                        </svg>
                      )}
                    </div>
                    {/* Message Content */}
                    <div className={`px-4 py-3 rounded-2xl ${
                      message.type === 'user'
                        ? 'bg-timeback-primary text-white'
                        : 'bg-white text-timeback-primary border border-timeback-primary'
                    }`}>
                      {message.type === 'user' ? (
                        <p className="whitespace-pre-wrap">{message.content}</p>
                      ) : (
                        <ReactMarkdown 
                          components={{
                            h1: ({children}) => <h1 className="text-base font-bold mb-2 font-cal">{children}</h1>,
                            h2: ({children}) => <h2 className="text-sm font-semibold mb-2 font-cal">{children}</h2>,
                            h3: ({children}) => <h3 className="text-sm font-semibold mb-1 font-cal">{children}</h3>,
                            p: ({children}) => <p className="leading-relaxed mb-2 last:mb-0">{children}</p>,
                            ul: ({children}) => <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>,
                            ol: ({children}) => <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>,
                            li: ({children}) => <li>{children}</li>,
                            strong: ({children}) => <strong className="font-semibold font-cal">{children}</strong>,
                            em: ({children}) => <em className="italic">{children}</em>,
                            code: ({children}) => <code className="bg-timeback-bg text-timeback-primary px-1 py-0.5 rounded text-xs font-mono font-cal">{children}</code>,
                            blockquote: ({children}) => <blockquote className="border-l-2 border-timeback-primary pl-2 my-2">{children}</blockquote>,
                          }}
                        >
                          {message.content}
                        </ReactMarkdown>
                      )}
                      <p className={`text-xs mt-2 ${
                        message.type === 'user' ? 'text-timeback-primary' : 'text-timeback-primary'
                      }`}>
                        {message.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              
              {isChatLoading && (
                <div className="flex justify-start">
                  <div className="flex gap-3 max-w-[80%]">
                    <div className="w-8 h-8 bg-timeback-bg rounded-full flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 text-timeback-primary font-cal" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4M11,6V8H13V6H11M11,10V18H13V10H11Z"/>
                      </svg>
                    </div>
                    <div className="bg-white border border-timeback-primary rounded-2xl px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-timeback-bg rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-timeback-bg rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                          <div className="w-2 h-2 bg-timeback-bg rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                        </div>
                        <span className="text-timeback-primary text-sm font-cal">TimeBack AI is thinking...</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Chat Input - Bottom Position (ChatGPT Style) */}
            <div className="border-t border-timeback-primary p-4 bg-white rounded-b-2xl">
              <form onSubmit={handleChatSubmit} className="flex gap-3">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Ask anything about TimeBack..."
                  className="flex-1 px-4 py-3 border border-timeback-primary rounded-xl focus:ring-2 focus:ring-timeback-primary focus:border-transparent outline-none"
                  disabled={isChatLoading}
                />
                <button
                  type="submit"
                  disabled={!chatInput.trim() || isChatLoading}
                  className="bg-timeback-primary text-white px-6 py-3 rounded-xl font-semibold hover:bg-timeback-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2 font-cal"
                >
                  {isChatLoading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  )}
                  Send
                </button>
              </form>
            </div>
          </div>
        )}


      </div>
    </section>
  );
}