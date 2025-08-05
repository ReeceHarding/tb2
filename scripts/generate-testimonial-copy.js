const fs = require('fs');
const path = require('path');

// Load environment variables from .env.local
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

console.log('📝 Starting Alpha Testimonial Copy Generation...\n');

const transcriptionsDir = path.join(__dirname, '..', 'data', 'transcriptions');
const outputDir = path.join(__dirname, '..', 'data', 'testimonial-copy');

// Create output directory if it doesn't exist
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
  console.log(`📁 Created output directory: ${outputDir}`);
}

// Function to call Claude via direct Anthropic API for copy generation
async function generateTestimonialCopy(transcription, fileName) {
  try {
    console.log(`🤖 Generating marketing copy for: ${fileName}`);

    // Check Anthropic API key
    const anthropicApiKey = process.env.ANTHROPIC_API_KEY;

    if (!anthropicApiKey) {
      throw new Error('ANTHROPIC_API_KEY environment variable is required');
    }

    console.log('🔑 Using Anthropic API key for direct Claude access');

    const prompt = `<transcription>
${transcription}
</transcription>

You are a professional marketing copywriter specializing in educational testimonials. Analyze this Alpha School student video testimonial transcription and generate polished marketing copy.

Extract and create:

1. **SPEAKER INFO**: Name, age, grade level (if mentioned)
2. **CLEAN QUOTE**: A powerful, grammatically correct quote (15-30 words) that captures the essence
3. **EXTENDED QUOTE**: A longer testimonial quote (30-60 words) for detailed sections
4. **KEY ACHIEVEMENTS**: Specific learning gains mentioned (e.g., "2.8x growth", "learned 4x faster")
5. **THEMES**: Main benefits highlighted (personalized learning, independence, engagement, etc.)
6. **MARKETING TAGS**: 3-5 relevant tags for categorization
7. **EMOTIONAL TONE**: The feeling conveyed (excited, confident, proud, etc.)

Format your response as JSON:
{
  "speakerInfo": {
    "name": "extracted or 'Student'",
    "age": "number or null", 
    "grade": "grade level or null",
    "schoolLevel": "elementary/middle/high or null"
  },
  "quotes": {
    "short": "15-30 word impactful quote",
    "extended": "30-60 word detailed testimonial"
  },
  "achievements": [
    "specific learning gains mentioned"
  ],
  "themes": [
    "main benefits highlighted"
  ],
  "marketingTags": [
    "relevant categorization tags"
  ],
  "emotionalTone": "primary emotion conveyed",
  "marketingCopy": {
    "headline": "compelling headline for this testimonial",
    "description": "2-3 sentence marketing description"
  }
}

Focus on accuracy to the original content while making it professionally presentable. Correct minor speech errors but preserve authentic voice and meaning.`;

    // Make direct API call to Anthropic Claude
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': anthropicApiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1500,
        temperature: 0.3,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Anthropic API error: ${response.status} - ${errorText}`);
    }

    const responseData = await response.json();
    const generatedContent = responseData.content[0].text;
    
    console.log(`✅ Copy generated for: ${fileName}`);
    
    // Parse JSON response
    let parsedCopy;
    try {
      parsedCopy = JSON.parse(generatedContent);
    } catch (parseError) {
      console.warn(`⚠️  JSON parsing failed for ${fileName}, saving raw content`);
      parsedCopy = {
        rawContent: generatedContent,
        parseError: parseError.message
      };
    }

    return {
      fileName: fileName,
      originalTranscription: transcription,
      generatedCopy: parsedCopy,
      timestamp: new Date().toISOString(),
      apiResponse: {
        service: 'anthropic-direct',
        model: 'claude-3-5-sonnet-20241022',
        usage: responseData.usage || null
      }
    };

  } catch (error) {
    console.error(`❌ Copy generation failed for ${fileName}:`, error.message);
    return {
      fileName: fileName,
      originalTranscription: transcription,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

// Function to process all transcriptions
async function processAllTranscriptions() {
  try {
    // Get all transcription files (excluding summary)
    const transcriptionFiles = fs.readdirSync(transcriptionsDir)
      .filter(file => file.endsWith('.json') && !file.startsWith('_'))
      .sort();

    console.log(`📚 Found ${transcriptionFiles.length} transcription files to process\n`);

    const results = [];
    let totalApiCalls = 0;
    let successfulGenerations = 0;

    for (let i = 0; i < transcriptionFiles.length; i++) {
      const transcriptionFile = transcriptionFiles[i];
      const transcriptionPath = path.join(transcriptionsDir, transcriptionFile);
      const outputFileName = transcriptionFile.replace('.json', '_marketing_copy.json');
      const outputPath = path.join(outputDir, outputFileName);

      console.log(`\n📄 Processing ${i + 1}/${transcriptionFiles.length}: ${transcriptionFile}`);

      try {
        // Check if copy already exists
        if (fs.existsSync(outputPath)) {
          console.log(`⏭️  Marketing copy already exists for: ${transcriptionFile}, skipping...`);
          const existingCopy = JSON.parse(fs.readFileSync(outputPath, 'utf8'));
          results.push(existingCopy);
          continue;
        }

        // Read transcription file
        const transcriptionData = JSON.parse(fs.readFileSync(transcriptionPath, 'utf8'));
        
        if (transcriptionData.error) {
          console.log(`⏭️  Skipping ${transcriptionFile} due to transcription error`);
          continue;
        }

        const transcriptionText = transcriptionData.transcription;
        
        if (!transcriptionText || transcriptionText.trim().length < 10) {
          console.log(`⏭️  Skipping ${transcriptionFile} due to insufficient transcription content`);
          continue;
        }

        console.log(`📊 Transcription length: ${transcriptionText.length} characters`);
        console.log(`🎯 Sample text: "${transcriptionText.substring(0, 100)}..."`);

        // Generate marketing copy
        totalApiCalls++;
        const copyResult = await generateTestimonialCopy(transcriptionText, transcriptionFile);

        if (!copyResult.error) {
          successfulGenerations++;
        }

        // Save result
        fs.writeFileSync(outputPath, JSON.stringify(copyResult, null, 2));
        console.log(`💾 Saved marketing copy to: ${outputFileName}`);

        results.push(copyResult);

        // Add delay between API calls to respect rate limits
        if (i < transcriptionFiles.length - 1) {
          console.log(`⏳ Brief pause to respect API rate limits...`);
          await new Promise(resolve => setTimeout(resolve, 2000));
        }

      } catch (error) {
        console.error(`❌ Error processing ${transcriptionFile}:`, error.message);
        
        const errorResult = {
          fileName: transcriptionFile,
          error: error.message,
          timestamp: new Date().toISOString()
        };
        
        const outputPath = path.join(outputDir, transcriptionFile.replace('.json', '_marketing_copy.json'));
        fs.writeFileSync(outputPath, JSON.stringify(errorResult, null, 2));
        results.push(errorResult);
      }
    }

    // Generate consolidated marketing copy file
    const consolidatedCopy = {
      processedAt: new Date().toISOString(),
      summary: {
        totalTranscriptions: transcriptionFiles.length,
        totalApiCalls: totalApiCalls,
        successfulGenerations: successfulGenerations,
        failedGenerations: totalApiCalls - successfulGenerations
      },
      testimonials: results
        .filter(r => !r.error && r.generatedCopy && !r.generatedCopy.parseError)
        .map(r => ({
          fileName: r.fileName,
          speakerInfo: r.generatedCopy.speakerInfo || {},
          quotes: r.generatedCopy.quotes || {},
          achievements: r.generatedCopy.achievements || [],
          themes: r.generatedCopy.themes || [],
          marketingTags: r.generatedCopy.marketingTags || [],
          emotionalTone: r.generatedCopy.emotionalTone || '',
          marketingCopy: r.generatedCopy.marketingCopy || {}
        })),
      allResults: results
    };

    const consolidatedPath = path.join(outputDir, '_consolidated_testimonials.json');
    fs.writeFileSync(consolidatedPath, JSON.stringify(consolidatedCopy, null, 2));

    console.log('\n🎉 TESTIMONIAL COPY GENERATION COMPLETE!');
    console.log(`📊 Summary:`);
    console.log(`   • Total transcriptions processed: ${transcriptionFiles.length}`);
    console.log(`   • API calls made: ${totalApiCalls}`);
    console.log(`   • Successful generations: ${successfulGenerations}`);
    console.log(`   • Failed generations: ${totalApiCalls - successfulGenerations}`);
    console.log(`   • Marketing copy saved to: ${outputDir}`);
    console.log(`   • Consolidated file: _consolidated_testimonials.json`);

    return consolidatedCopy;

  } catch (error) {
    console.error('❌ Fatal error in copy generation process:', error);
    throw error;
  }
}

// Main execution
async function main() {
  try {
    // Check if AWS credentials are available in environment
    console.log('🔍 Checking environment variables...');
    console.log('   AWS_ACCESS_KEY_ID:', process.env.AWS_ACCESS_KEY_ID ? 'Found' : 'Missing');
    console.log('   AWS_SECRET_ACCESS_KEY:', process.env.AWS_SECRET_ACCESS_KEY ? 'Found' : 'Missing');
    console.log('   AWS_REGION:', process.env.AWS_REGION || 'us-east-1 (default)');

    if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
      console.error('❌ AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY environment variables are required');
      console.log('   Please add your AWS credentials to .env.local file');
      process.exit(1);
    }

    console.log('✅ AWS credentials found in environment');
    console.log('🔧 Starting testimonial copy generation via AWS Bedrock Claude Sonnet 4...\n');

    await processAllTranscriptions();
    
  } catch (error) {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { processAllTranscriptions };