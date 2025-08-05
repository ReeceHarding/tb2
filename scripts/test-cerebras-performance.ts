import { cerebras } from '../libs/cerebras';
import { startOptimisticGeneration, getCachedContent } from '../libs/optimisticContentGeneration';

// Load environment variables
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

// Test utilities
const log = (message: string, data?: any) => {
  const timestamp = new Date().toISOString();
  console.log(`[Test] ${timestamp} ${message}`, data || '');
};

// Test 1: Basic Cerebras API Test
const testCerebrasBasic = async () => {
  log('=== Test 1: Basic Cerebras API Test ===');
  
  const startTime = Date.now();
  
  try {
    const response = await cerebras.generateContent({
      prompt: 'Generate a simple greeting for a student interested in robotics.',
      maxTokens: 100,
      temperature: 0.7
    });
    
    const endTime = Date.now();
    
    log('Success!', {
      provider: response.provider,
      latencyMs: response.latencyMs,
      totalTimeMs: endTime - startTime,
      contentLength: response.content.length,
      tokenCount: response.tokenCount
    });
    
    log('Response:', response.content.substring(0, 100) + '...');
    
    // Check if response time is under 100ms (for Cerebras)
    if (response.provider === 'cerebras' && response.latencyMs < 100) {
      log('✅ Sub-100ms response achieved!');
    } else {
      log('⚠️ Response time above 100ms');
    }
    
    return response;
  } catch (error) {
    log('Error in basic test:', error);
    throw error;
  }
};

// Test 2: Fallback Chain Test
const testFallbackChain = async () => {
  log('\n=== Test 2: Fallback Chain Test ===');
  
  // Temporarily set a bad API key to force fallback
  const originalKey = process.env.CEREBRAS_API_KEY;
  process.env.CEREBRAS_API_KEY = 'invalid-key-to-force-fallback';
  
  try {
    const response = await cerebras.generateContent({
      prompt: 'Generate a test response to verify fallback chain.',
      maxTokens: 50
    });
    
    log('Fallback successful!', {
      provider: response.provider,
      latencyMs: response.latencyMs
    });
    
    if (response.provider !== 'cerebras') {
      log('✅ Fallback chain working correctly');
    } else {
      log('❌ Fallback chain did not trigger');
    }
    
    return response;
  } catch (error) {
    log('Error in fallback test:', error);
    throw error;
  } finally {
    // Restore original key
    process.env.CEREBRAS_API_KEY = originalKey;
  }
};

// Test 3: Optimistic Content Generation Performance
const testOptimisticGeneration = async () => {
  log('\n=== Test 3: Optimistic Content Generation Test ===');
  
  const quizData = {
    userType: 'parent',
    parentSubType: 'looking_for_school',
    selectedSchools: [{
      id: 'test-school',
      name: 'Test High School',
      city: 'Austin',
      state: 'TX',
      level: 'high'
    }],
    kidsInterests: ['robotics', 'programming', 'video games'],
    numberOfKids: 1
  };
  
  const startTime = Date.now();
  
  // Start optimistic generation
  await startOptimisticGeneration(quizData);
  
  // Poll for completion
  let attempts = 0;
  const maxAttempts = 60; // 30 seconds max
  
  while (attempts < maxAttempts) {
    const cache = getCachedContent();
    
    if (cache?.generationStatus) {
      const completed = Object.values(cache.generationStatus).filter(s => s === 'completed').length;
      const total = Object.keys(cache.generationStatus).length;
      
      log(`Progress: ${completed}/${total} sections completed`);
      
      if (cache.completionTime) {
        const totalTime = cache.completionTime - cache.startTime;
        log('✅ All content generated!', {
          totalTimeMs: totalTime,
          sectionsGenerated: total
        });
        
        // Check individual section times
        const avgTimePerSection = totalTime / total;
        log(`Average time per section: ${avgTimePerSection}ms`);
        
        if (avgTimePerSection < 1000) {
          log('✅ Excellent performance - under 1s per section');
        }
        
        break;
      }
    }
    
    await new Promise(resolve => setTimeout(resolve, 500));
    attempts++;
  }
  
  if (attempts >= maxAttempts) {
    log('❌ Timeout waiting for content generation');
  }
};

// Test 4: Concurrent Request Performance
const testConcurrentRequests = async () => {
  log('\n=== Test 4: Concurrent Request Performance Test ===');
  
  const prompts = [
    'Generate a math problem about robotics',
    'Create a science question about programming',
    'Write an English prompt about video games',
    'Develop a history question about technology',
    'Design a physics problem about motion'
  ];
  
  const startTime = Date.now();
  
  try {
    // Send all requests concurrently
    const promises = prompts.map(prompt => 
      cerebras.generateContent({
        prompt,
        maxTokens: 200,
        temperature: 0.7
      })
    );
    
    const responses = await Promise.all(promises);
    const endTime = Date.now();
    
    log('All concurrent requests completed!', {
      totalTimeMs: endTime - startTime,
      requestCount: responses.length
    });
    
    // Analyze response times
    const latencies = responses.map(r => r.latencyMs);
    const avgLatency = latencies.reduce((a, b) => a + b, 0) / latencies.length;
    const maxLatency = Math.max(...latencies);
    const minLatency = Math.min(...latencies);
    
    log('Latency analysis:', {
      avgLatencyMs: avgLatency.toFixed(2),
      maxLatencyMs: maxLatency,
      minLatencyMs: minLatency,
      providers: responses.map(r => r.provider)
    });
    
    if (avgLatency < 500) {
      log('✅ Excellent concurrent performance');
    } else if (avgLatency < 1000) {
      log('✅ Good concurrent performance');
    } else {
      log('⚠️ Concurrent performance could be improved');
    }
    
  } catch (error) {
    log('Error in concurrent test:', error);
    throw error;
  }
};

// Test 5: Error Recovery Test
const testErrorRecovery = async () => {
  log('\n=== Test 5: Error Recovery Test ===');
  
  // Test with intentionally problematic prompts
  const problematicPrompts = [
    '', // Empty prompt
    'a'.repeat(10000), // Very long prompt
    '{"invalid": json}', // Malformed content
  ];
  
  for (const prompt of problematicPrompts) {
    try {
      const response = await cerebras.generateContent({
        prompt: prompt || 'Generate a fallback response',
        maxTokens: 50
      });
      
      log(`Handled problematic prompt successfully`, {
        promptLength: prompt.length,
        provider: response.provider
      });
    } catch (error) {
      log(`Error handling test case:`, {
        promptLength: prompt.length,
        error: error.message
      });
    }
  }
};

// Main test runner
const runAllTests = async () => {
  log('Starting Cerebras Performance Test Suite\n');
  
  try {
    // Run tests sequentially
    await testCerebrasBasic();
    await testFallbackChain();
    await testOptimisticGeneration();
    await testConcurrentRequests();
    await testErrorRecovery();
    
    log('\n✅ All tests completed!');
  } catch (error) {
    log('\n❌ Test suite failed:', error);
    process.exit(1);
  }
};

// Run tests
runAllTests();