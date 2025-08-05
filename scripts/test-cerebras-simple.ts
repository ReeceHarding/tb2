#!/usr/bin/env npx tsx
// Simple Cerebras API test with detailed error logging

import dotenv from 'dotenv';
import fetch from 'node-fetch';

// Load environment variables
dotenv.config({ path: '.env.local' });

const CEREBRAS_API_KEY = process.env.CEREBRAS_API_KEY;
const CEREBRAS_BASE_URL = 'https://api.cerebras.ai/v1';

console.log('[Test] Testing Cerebras API with key:', CEREBRAS_API_KEY?.substring(0, 20) + '...');
console.log('[Test] Using base URL:', CEREBRAS_BASE_URL);

// Available models based on recent documentation:
const models = [
  'qwen-3-coder-480b',              // Coding model
  'qwen-3-235b-a22b-instruct-2507', // Latest Qwen3 235B
  'qwen-3-32b',                     // Smaller 32B model
  'llama-3.3-70b-instruct',         // Llama 3.3 70B
  'llama-3.1-8b-instruct'           // Llama 3.1 8B
];

async function testModel(model: string) {
  console.log(`\n[Test] Testing model: ${model}`);
  
  const headers = {
    'Authorization': `Bearer ${CEREBRAS_API_KEY}`,
    'Content-Type': 'application/json'
  };

  const body = JSON.stringify({
    model: model,
    messages: [
      {
        role: 'user',
        content: 'Say hello in one word.'
      }
    ],
    max_tokens: 10,
    temperature: 0.7
  });

  try {
    const response = await fetch(`${CEREBRAS_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: headers,
      body: body
    });

    console.log('[Test] Response status:', response.status);
    console.log('[Test] Response headers:', Object.fromEntries(response.headers.entries()));

    const text = await response.text();
    console.log('[Test] Response body:', text);

    if (response.ok) {
      const data = JSON.parse(text);
      console.log('[Test] ✅ SUCCESS! Response:', data.choices?.[0]?.message?.content);
    } else {
      console.log('[Test] ❌ Error response');
    }
  } catch (error) {
    console.log('[Test] ❌ Request failed:', error);
  }
}

async function main() {
  console.log('[Test] Starting Cerebras API tests...\n');

  // Test each model
  for (const model of models) {
    await testModel(model);
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log('\n[Test] All tests completed.');
}

main();