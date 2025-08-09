"use client";

import { useState, useEffect, useCallback } from "react";
import { formatSchoolSummary, getSchoolMetrics, formatTestScoreDisplay, type SchoolAutocompleteMatch, type SchoolDetail, type SchoolData } from "../lib/schooldigger";
import { getComponentSchema, type ComponentSchema } from "../schemas/component-schemas";

// Preset test data
const PRESET_DATA = {
  users: [
    {
      name: "Sarah",
      firstName: "Sarah",
      grade: "3rd",
      concerns: "My child is struggling with math and falling behind",
      school: "Lincoln Elementary",
      previousAnswers: ["Child struggles with homework", "Spends 3 hours on assignments", "Gets frustrated easily"]
    },
    {
      name: "Michael",
      firstName: "Michael", 
      grade: "7th",
      concerns: "School is boring and not challenging enough",
      school: "Washington Middle School",
      previousAnswers: ["Child finishes work quickly", "Asks for harder problems", "Loses interest in class"]
    },
    {
      name: "Emma",
      firstName: "Emma",
      grade: "5th",
      concerns: "No time for sports or hobbies due to homework",
      school: "Roosevelt Elementary",
      previousAnswers: ["6 hours school + 2 hours homework", "Quit soccer team", "Always tired"]
    }
  ],
  questions: [
    "Child's school challenges?",
    "Daily school hours?",
    "More time for?",
    "Biggest education concern?",
    "Child's school feelings?"
  ],
  componentTypes: ["Hero", "Problem", "Testimonials3", "FAQ", "CTA", "FeaturesListicle", "WithWithout"]
};

export default function TestPage() {
  // UI State
  const [activeTab, setActiveTab] = useState<'input' | 'preview' | 'debug'>('input');
  
  // Input State
  const [selectedPreset, setSelectedPreset] = useState(0);
  const [customQuestion, setCustomQuestion] = useState(PRESET_DATA.questions[0]);
  const [schoolQuery, setSchoolQuery] = useState("");
  const [schoolResults, setSchoolResults] = useState<(SchoolAutocompleteMatch | SchoolData)[]>([]);
  const [selectedSchool, setSelectedSchool] = useState<SchoolDetail | SchoolData | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [useOptimizedSearch, setUseOptimizedSearch] = useState(true);
  const [selectedComponent, setSelectedComponent] = useState(PRESET_DATA.componentTypes[0]);
  const [autoSelectComponent, setAutoSelectComponent] = useState(true);
  
  // Output State
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<ComponentSchema | null>(null);
  const [streamedContent, setStreamedContent] = useState("");
  const [debugInfo, setDebugInfo] = useState<{
    fullPrompt: string;
    selectedComponent: string;
    rawResponse: string;
    error?: string;
  } | null>(null);

  // Enhanced school search with optimized API
  const searchForSchools = useCallback(async (query: string) => {
    if (query.length < 2) {
      setSchoolResults([]);
      setSearchLoading(false);
      return;
    }
    
    setSearchLoading(true);
    
    try {
      console.log('[Test Page] Searching for schools (optimized):', query);
      const searchParams = new URLSearchParams({
        q: query,
        limit: '10',
        optimized: useOptimizedSearch.toString()
      });
      
      const response = await fetch(`/api/schools/search?${searchParams}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to search schools');
      }
      
      console.log('[Test Page] Search results:', data.schoolMatches?.length, 'schools', `(${data.searchType})`);
      setSchoolResults(data.schoolMatches || []);
    } catch (error) {
      console.error('[Test Page] School search error:', error);
      setSchoolResults([]);
    } finally {
      setSearchLoading(false);
    }
  }, [useOptimizedSearch]);

  // Debounced school search
  useEffect(() => {
    const timer = setTimeout(() => {
      searchForSchools(schoolQuery);
    }, 1000); // 1 second debounce to prevent API rate limiting
    
    return () => clearTimeout(timer);
  }, [schoolQuery, searchForSchools]);

  // Enhanced school selection with optimized details
  const selectSchool = async (school: SchoolAutocompleteMatch | SchoolData) => {
    try {
      // Handle both legacy and optimized school types
      const schoolId = 'schoolid' in school ? school.schoolid : school.id;
      const schoolName = 'schoolName' in school ? school.schoolName : school.name;
      
      console.log('[Test Page] Getting details for school:', schoolName);
      
      const searchParams = new URLSearchParams({
        optimized: useOptimizedSearch.toString()
      });
      
      const response = await fetch(`/api/schools/${schoolId}?${searchParams}`);
      const details = await response.json();
      
      if (!response.ok) {
        throw new Error(details.error || 'Failed to get school details');
      }
      
      console.log('[Test Page] School details received:', details.detailsType || 'legacy');
      setSelectedSchool(details);
      setSchoolQuery(schoolName);
      setSchoolResults([]);
    } catch (error) {
      console.error('[Test Page] Error getting school details:', error);
    }
  };

  // Generate content
  const generateContent = async () => {
    const preset = PRESET_DATA.users[selectedPreset];
    
    if (!selectedSchool) {
      alert("Please select a school first");
      return;
    }
    
    setIsGenerating(true);
    setStreamedContent("");
    setGeneratedContent(null);
    setDebugInfo(null);
    setActiveTab('preview');
    
    try {
      // Build the full prompt
      const systemPrompt = await fetch('/data/system_prompt.md').then(r => r.text());
      const whitepaper = await fetch('/data/timeback-whitepaper.md').then(r => r.text());
      
      // Get school metrics
      const schoolMetrics = getSchoolMetrics(selectedSchool);
      
      // Build context
      const context = {
        whitepaper: whitepaper, // Full whitepaper content
        testimonials: JSON.stringify([
          { name: "Sarah Chen", role: "Parent of 3rd grader", text: "My daughter went from 45th to 92nd percentile in 6 months!" },
          { name: "Michael Rodriguez", role: "Parent of 7th grader", text: "2 years behind in reading, caught up in 6 months with AI tutor." },
          { name: "Emma Thompson", role: "Parent of 5th grader", text: "Completed 2 grade levels in one year, still has time for violin!" }
        ]),
        school_data: JSON.stringify({
          name: 'schoolName' in selectedSchool ? selectedSchool.schoolName : selectedSchool.name,
          level: 'schoolLevel' in selectedSchool ? selectedSchool.schoolLevel : selectedSchool.level,
          grades: 'lowGrade' in selectedSchool ? `${selectedSchool.lowGrade}-${selectedSchool.highGrade}` : selectedSchool.grades,
          city: 'address' in selectedSchool ? 
            (typeof selectedSchool.address === 'object' ? selectedSchool.address.city : '') : 
            ('city' in selectedSchool ? selectedSchool.city : ''),
          state: 'address' in selectedSchool ? 
            (typeof selectedSchool.address === 'object' ? selectedSchool.address.state : '') : 
            ('state' in selectedSchool ? selectedSchool.state : ''),
          metrics: schoolMetrics
        })
      };
      
      // Determine component type
      let componentType = selectedComponent;
      if (autoSelectComponent) {
        // Simple logic to pick component based on question
        if (customQuestion.toLowerCase().includes('challenge') || customQuestion.toLowerCase().includes('struggle')) {
          componentType = 'Problem';
        } else if (customQuestion.toLowerCase().includes('concern')) {
          componentType = 'FAQ';
        } else if (customQuestion.toLowerCase().includes('time')) {
          componentType = 'WithWithout';
        } else {
          componentType = 'Hero';
        }
      }
      
      // Get component schema
      const schema = getComponentSchema(componentType);
      
      // Build the full prompt
      const fullPrompt = systemPrompt
        .replace('{{USER_FIRST_NAME}}', preset.firstName)
        .replace('{{STUDENT_GRADE_LEVEL}}', preset.grade)
        .replace('{{PARENT_CONCERNS}}', preset.concerns)
        .replace('{{SCHOOL_NAME}}', 'schoolName' in selectedSchool ? selectedSchool.schoolName : selectedSchool.name)
        .replace('{{PREVIOUS_ANSWERS}}', JSON.stringify(preset.previousAnswers))
        .replace('{{WHITE_PAPER_CONTENT}}', context.whitepaper)
        .replace('{{STATIC_TESTIMONIALS}}', context.testimonials)
        .replace('{{SCHOOLDIGGER_API_RESPONSE}}', context.school_data)
        .replace('{{SELECTED_COMPONENT_TYPE}}', componentType)
        .replace('{{COMPONENT_SCHEMA}}', schema);
      
      // Store debug info
      setDebugInfo({
        fullPrompt,
        selectedComponent: componentType,
        rawResponse: ""
      });
      
      // Call the API
      console.log('[Test Page] Calling AI API with component type:', componentType);
      const response = await fetch('/api/ai/generate-component', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: fullPrompt,
          componentType,
          userContext: {
            question: customQuestion,
            ...preset
          }
        })
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      // Handle streaming response
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let accumulatedContent = "";
      
      while (reader) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value);
        accumulatedContent += chunk;
        setStreamedContent(accumulatedContent);
        
        // Try to parse accumulated content
        try {
          const parsed = JSON.parse(accumulatedContent);
          setGeneratedContent({
            type: componentType as any,
            data: parsed
          });
        } catch {
          // Not valid JSON yet, keep accumulating
        }
      }
      
      // Update debug info with response
      setDebugInfo(prev => prev ? {
        ...prev,
        rawResponse: accumulatedContent
      } : null);
      
    } catch (error) {
      console.error('[Test Page] Generation error:', error);
      setDebugInfo(prev => prev ? {
        ...prev,
        error: error instanceof Error ? error.message : 'Unknown error'
      } : null);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-base-100">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 font-cal">AI Component Generation Test</h1>
        
        {/* Tabs */}
        <div className="tabs tabs-boxed mb-8">
          <a 
            className={`tab ${activeTab === 'input' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('input')}
          >
            Input Configuration
          </a>
          <a 
            className={`tab ${activeTab === 'preview' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('preview')}
          >
            Component Preview
          </a>
          <a 
            className={`tab ${activeTab === 'debug' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('debug')}
          >
            Debug Info
          </a>
        </div>

        {/* Input Tab */}
        {activeTab === 'input' && (
          <div className="space-y-6">
            {/* Preset User Selection */}
            <div className="card bg-base-200 p-6">
              <h2 className="text-xl font-semibold mb-4 font-cal">1. Select Test User</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {PRESET_DATA.users.map((user, idx) => (
                  <label key={idx} className="cursor-pointer">
                    <input
                      type="radio"
                      name="preset"
                      className="radio radio-primary"
                      checked={selectedPreset === idx}
                      onChange={() => setSelectedPreset(idx)}
                    />
                    <span className="ml-2">
                      {user.name} ({user.grade} grade) - {user.concerns}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Enhanced School Search */}
            <div className="card bg-base-200 p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold font-cal">2. Select School</h2>
                <div className="form-control">
                  <label className="label cursor-pointer">
                    <span className="label-text mr-2">Optimized Search</span>
                    <input
                      type="checkbox"
                      className="toggle toggle-primary"
                      checked={useOptimizedSearch}
                      onChange={(e) => setUseOptimizedSearch(e.target.checked)}
                    />
                  </label>
                </div>
              </div>
              
              <div className="form-control">
                <div className="relative">
                  <input
                    type="text"
                    placeholder={useOptimizedSearch ? "Search schools with enhanced data..." : "Search for a school..."}
                    className="input input-bordered w-full"
                    value={schoolQuery}
                    onChange={(e) => setSchoolQuery(e.target.value)}
                  />
                  {searchLoading && (
                    <span className="loading loading-spinner loading-sm absolute right-3 top-1/2 transform -translate-y-1/2"></span>
                  )}
                </div>
                
                {/* Enhanced school search results */}
                {schoolResults.length > 0 && (
                  <div className="mt-2 bg-base-100 rounded-xl shadow-2xl max-h-72 overflow-y-auto">
                    {schoolResults.map((school) => {
                      // Handle both legacy and optimized school types
                      const schoolId = 'schoolid' in school ? school.schoolid : school.id;
                      const schoolName = 'schoolName' in school ? school.schoolName : school.name;
                      const isOptimized = 'testScores' in school && school.testScores;
                      
                      return (
                        <div
                          key={schoolId}
                          className="p-4 hover:bg-base-200 cursor-pointer border-b transition-colors"
                          onClick={() => selectSchool(school)}
                        >
                          <div className="font-semibold text-primary font-cal">{schoolName}</div>
                          <div className="text-sm opacity-70 mb-1 font-cal">
                            {school.city}, {school.state}
                            {'grades' in school ? ` • Grades ${school.grades}` : ` • Grades ${'lowGrade' in school ? school.lowGrade : 'K'}-${'highGrade' in school ? school.highGrade : '12'}`}
                            {' • '}
                            {'level' in school ? school.level : ('schoolLevel' in school ? school.schoolLevel : 'K-12')}
                            {(('rankStars' in school && school.rankStars) || ('rating' in school && school.rating)) && 
                              ` • ${('rating' in school ? school.rating : school.rankStars)} stars`}
                          </div>
                          
                          {/* Enhanced test score display for optimized results */}
                          {isOptimized && useOptimizedSearch && (
                            <div className="text-xs text-success font-medium font-cal">
                              {formatTestScoreDisplay(school as SchoolData)}
                            </div>
                          )}
                          
                          {/* Source indicator */}
                          {'searchSource' in school && (
                            <div className="text-xs opacity-50 mt-1 font-cal">
                              Source: {school.searchSource} • Score: {school.relevanceScore}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
                
                {/* Enhanced selected school details */}
                {selectedSchool && (
                  <div className="mt-4 p-4 bg-base-300 rounded-xl">
                    <h3 className="font-semibold mb-2 font-cal">Selected School:</h3>
                    <p className="mb-2">{formatSchoolSummary(selectedSchool)}</p>
                    
                    {/* Enhanced test score display for optimized school details */}
                    {useOptimizedSearch && 'testScores' in selectedSchool && (
                      <div className="mt-3 p-3 bg-base-100 rounded">
                        <h4 className="font-medium text-sm mb-2 font-cal">Test Scores:</h4>
                        <p className="text-sm text-success font-cal">
                          {formatTestScoreDisplay(selectedSchool as SchoolData)}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Question Input */}
            <div className="card bg-base-200 p-6">
              <h2 className="text-xl font-semibold mb-4 font-cal">3. User Question</h2>
              <select
                className="select select-bordered w-full mb-4"
                value={customQuestion}
                onChange={(e) => setCustomQuestion(e.target.value)}
              >
                {PRESET_DATA.questions.map((q, idx) => (
                  <option key={idx} value={q}>{q}</option>
                ))}
              </select>
              <textarea
                className="textarea textarea-bordered w-full"
                rows={3}
                value={customQuestion}
                onChange={(e) => setCustomQuestion(e.target.value)}
                placeholder="Or type a custom question..."
              />
            </div>

            {/* Component Selection */}
            <div className="card bg-base-200 p-6">
              <h2 className="text-xl font-semibold mb-4 font-cal">4. Component Type</h2>
              <label className="cursor-pointer label">
                <span className="label-text">Let AI choose component automatically</span>
                <input
                  type="checkbox"
                  className="checkbox checkbox-primary"
                  checked={autoSelectComponent}
                  onChange={(e) => setAutoSelectComponent(e.target.checked)}
                />
              </label>
              
              {!autoSelectComponent && (
                <select
                  className="select select-bordered w-full mt-4"
                  value={selectedComponent}
                  onChange={(e) => setSelectedComponent(e.target.value)}
                >
                  {PRESET_DATA.componentTypes.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              )}
            </div>

            {/* Generate Button */}
            <button
              className="btn btn-primary btn-lg w-full"
              onClick={generateContent}
              disabled={isGenerating || !selectedSchool}
            >
              {isGenerating ? (
                <>
                  <span className="loading loading-spinner"></span>
                  Generating...
                </>
              ) : (
                'Generate Component'
              )}
            </button>
          </div>
        )}

        {/* Preview Tab */}
        {activeTab === 'preview' && (
          <div className="space-y-6">
            {isGenerating && (
              <div className="alert alert-info">
                <span className="loading loading-spinner"></span>
                <span>Streaming content from Claude...</span>
              </div>
            )}
            
            {streamedContent && (
              <div className="card bg-base-200 p-6">
                <h2 className="text-xl font-semibold mb-4 font-cal">Raw Streamed Content</h2>
                <pre className="whitespace-pre-wrap bg-base-300 p-4 rounded-xl overflow-auto max-h-96">
                  {streamedContent}
                </pre>
              </div>
            )}
            
            {generatedContent && (
              <div className="card bg-base-200 p-6">
                <h2 className="text-xl font-semibold mb-4 font-cal">Rendered Component: {generatedContent.type}</h2>
                <div className="divider"></div>
                <div className="bg-base-100 p-8 rounded-xl">
                  {/* This is where the dynamic component would render */}
                  <div className="text-center text-timeback-primary font-cal">
                    <p className="mb-4">Component preview will render here</p>
                    <p className="text-sm font-cal">Component Type: {generatedContent.type}</p>
                    <details className="mt-4">
                      <summary className="cursor-pointer text-primary font-cal">View Generated Data</summary>
                      <pre className="text-left mt-4 p-4 bg-base-200 rounded overflow-auto font-cal">
                        {JSON.stringify(generatedContent.data, null, 2)}
                      </pre>
                    </details>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Debug Tab */}
        {activeTab === 'debug' && debugInfo && (
          <div className="space-y-6">
            <div className="card bg-base-200 p-6">
              <h2 className="text-xl font-semibold mb-4 font-cal">Debug Information</h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2 font-cal">Selected Component:</h3>
                  <p className="font-mono bg-base-300 p-2 rounded font-cal">{debugInfo.selectedComponent}</p>
                </div>
                
                {debugInfo.error && (
                  <div className="alert alert-error">
                    <span>Error: {debugInfo.error}</span>
                  </div>
                )}
                
                <div>
                  <h3 className="font-semibold mb-2 font-cal">Full Prompt Sent to Claude:</h3>
                  <pre className="whitespace-pre-wrap bg-base-300 p-4 rounded-xl overflow-auto max-h-96 text-xs font-cal">
                    {debugInfo.fullPrompt}
                  </pre>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2 font-cal">Raw Response:</h3>
                  <pre className="whitespace-pre-wrap bg-base-300 p-4 rounded-xl overflow-auto max-h-96">
                    {debugInfo.rawResponse}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
