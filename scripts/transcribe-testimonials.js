const fs = require('fs');
const path = require('path');
const { spawn, exec } = require('child_process');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegInstaller = require('@ffmpeg-installer/ffmpeg');

// Set FFmpeg path
ffmpeg.setFfmpegPath(ffmpegInstaller.path);

console.log('🎤 Starting Alpha Testimonial Transcription Process...\n');

const videosDir = path.join(__dirname, '..', 'public', 'videos', 'testimonials');
const transcriptionsDir = path.join(__dirname, '..', 'data', 'transcriptions');
const tempAudioDir = path.join(__dirname, '..', 'temp', 'audio');

// Create directories if they don't exist
[transcriptionsDir, tempAudioDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`📁 Created directory: ${dir}`);
  }
});

// Function to extract audio from video
function extractAudio(videoPath, audioPath) {
  return new Promise((resolve, reject) => {
    console.log(`🎵 Extracting audio from: ${path.basename(videoPath)}`);
    
    ffmpeg(videoPath)
      .output(audioPath)
      .audioCodec('pcm_s16le') // Use PCM 16-bit format for better Whisper compatibility
      .audioFrequency(16000)   // Use 16kHz sampling rate (Whisper's preferred rate)
      .audioChannels(1)        // Convert to mono
      .format('wav')
      .on('end', () => {
        console.log(`✅ Audio extraction complete for: ${path.basename(videoPath)}`);
        resolve();
      })
      .on('error', (err) => {
        console.error(`❌ Audio extraction failed for ${path.basename(videoPath)}:`, err.message);
        reject(err);
      })
      .run();
  });
}

// Function to transcribe audio using Whisper CLI
async function transcribeAudio(audioPath, videoFileName) {
  try {
    console.log(`🎯 Transcribing audio: ${path.basename(audioPath)}`);
    
    const outputPath = audioPath.replace('.wav', '_transcription.json');
    
    // Use command line Whisper with JSON output
    const whisperCommand = `whisper "${audioPath}" --model base --language en --output_format json --output_dir "${path.dirname(outputPath)}"`;
    
    const result = await new Promise((resolve, reject) => {
      exec(whisperCommand, { maxBuffer: 1024 * 1024 * 10 }, (error, stdout, stderr) => {
        if (error) {
          console.error(`❌ Whisper command failed: ${error.message}`);
          reject(error);
        } else {
          console.log(`✅ Whisper output: ${stdout}`);
          if (stderr) {
            console.log(`⚠️ Whisper stderr: ${stderr}`);
          }
          resolve({ stdout, stderr });
        }
      });
    });
    
    // Read the generated JSON file
    const baseFileName = path.basename(audioPath, '.wav');
    const expectedJsonPath = path.join(path.dirname(outputPath), `${baseFileName}.json`);
    
    let transcript = null;
    if (fs.existsSync(expectedJsonPath)) {
      const jsonContent = fs.readFileSync(expectedJsonPath, 'utf8');
      transcript = JSON.parse(jsonContent);
      
      // Clean up the temporary JSON file
      fs.unlinkSync(expectedJsonPath);
    } else {
      throw new Error(`Expected transcription file not found: ${expectedJsonPath}`);
    }
    
    console.log(`✅ Transcription complete for: ${videoFileName}`);
    
    // Extract just the text from the transcript
    const transcriptionText = transcript.text || '';

    return {
      fileName: videoFileName,
      transcription: transcriptionText.trim(),
      fullTranscript: transcript,
      timestamp: new Date().toISOString(),
      duration: transcript.duration || null
    };
    
  } catch (error) {
    console.error(`❌ Transcription failed for ${videoFileName}:`, error.message);
    return {
      fileName: videoFileName,
      transcription: '',
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

// Function to get video metadata
function getVideoMetadata(videoPath) {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(videoPath, (err, metadata) => {
      if (err) {
        console.error(`❌ Failed to get metadata for ${path.basename(videoPath)}:`, err.message);
        reject(err);
      } else {
        const duration = metadata.format.duration;
        const fileSize = metadata.format.size;
        const videoStream = metadata.streams.find(stream => stream.codec_type === 'video');
        
        resolve({
          duration: Math.round(duration),
          fileSize: fileSize,
          width: videoStream?.width || null,
          height: videoStream?.height || null,
          bitrate: metadata.format.bit_rate || null
        });
      }
    });
  });
}

// Main transcription function
async function processAllVideos() {
  try {
    // Get all video files
    const videoFiles = fs.readdirSync(videosDir)
      .filter(file => file.endsWith('.mp4'))
      .sort();

    console.log(`📹 Found ${videoFiles.length} video files to process\n`);

    const results = [];

    for (let i = 0; i < videoFiles.length; i++) {
      const videoFile = videoFiles[i];
      const videoPath = path.join(videosDir, videoFile);
      const audioFileName = videoFile.replace('.mp4', '.wav');
      const audioPath = path.join(tempAudioDir, audioFileName);
      const transcriptionFileName = videoFile.replace('.mp4', '.json');
      const transcriptionPath = path.join(transcriptionsDir, transcriptionFileName);

      console.log(`\n📝 Processing ${i + 1}/${videoFiles.length}: ${videoFile}`);
      console.log(`⏱️  Estimated time remaining: ${Math.round((videoFiles.length - i - 1) * 2)} minutes`);

      try {
        // Check if transcription already exists
        if (fs.existsSync(transcriptionPath)) {
          console.log(`⏭️  Transcription already exists for: ${videoFile}, skipping...`);
          const existingTranscription = JSON.parse(fs.readFileSync(transcriptionPath, 'utf8'));
          results.push(existingTranscription);
          continue;
        }

        // Get video metadata
        console.log(`📊 Getting metadata for: ${videoFile}`);
        const metadata = await getVideoMetadata(videoPath);
        
        // Extract audio
        await extractAudio(videoPath, audioPath);

        // Transcribe audio
        const transcriptionResult = await transcribeAudio(audioPath, videoFile);
        
        // Add metadata to result
        const fullResult = {
          ...transcriptionResult,
          metadata: metadata
        };

        // Save transcription to file
        fs.writeFileSync(transcriptionPath, JSON.stringify(fullResult, null, 2));
        console.log(`💾 Saved transcription to: ${transcriptionFileName}`);

        results.push(fullResult);

        // Clean up temporary audio file
        if (fs.existsSync(audioPath)) {
          fs.unlinkSync(audioPath);
          console.log(`🗑️  Cleaned up temporary audio file`);
        }

        // Add small delay between videos to prevent overloading
        if (i < videoFiles.length - 1) {
          console.log(`⏳ Brief pause before next video...`);
          await new Promise(resolve => setTimeout(resolve, 2000));
        }

      } catch (error) {
        console.error(`❌ Error processing ${videoFile}:`, error.message);
        
        // Still save partial result with error info
        const errorResult = {
          fileName: videoFile,
          transcription: '',
          error: error.message,
          timestamp: new Date().toISOString()
        };
        
        fs.writeFileSync(transcriptionPath, JSON.stringify(errorResult, null, 2));
        results.push(errorResult);
      }
    }

    // Save summary file
    const summaryPath = path.join(transcriptionsDir, '_transcription_summary.json');
    const summary = {
      processedAt: new Date().toISOString(),
      totalVideos: videoFiles.length,
      successfulTranscriptions: results.filter(r => !r.error).length,
      failedTranscriptions: results.filter(r => r.error).length,
      results: results
    };

    fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));
    
    console.log('\n🎉 TRANSCRIPTION PROCESS COMPLETE!');
    console.log(`📊 Summary:`);
    console.log(`   • Total videos: ${summary.totalVideos}`);
    console.log(`   • Successful: ${summary.successfulTranscriptions}`);
    console.log(`   • Failed: ${summary.failedTranscriptions}`);
    console.log(`   • Results saved to: ${transcriptionsDir}`);
    
    // Clean up temp directory
    if (fs.existsSync(tempAudioDir)) {
      const tempFiles = fs.readdirSync(tempAudioDir);
      tempFiles.forEach(file => {
        fs.unlinkSync(path.join(tempAudioDir, file));
      });
      fs.rmdirSync(tempAudioDir);
      console.log(`🧹 Cleaned up temporary directory`);
    }

    return summary;

  } catch (error) {
    console.error('❌ Fatal error in transcription process:', error);
    throw error;
  }
}

// Check if Whisper is available
async function checkWhisperAvailability() {
  try {
    console.log('🔍 Checking Whisper availability...');
    
    // Test Whisper CLI availability
    const result = await new Promise((resolve, reject) => {
      exec('whisper --help', (error, stdout, stderr) => {
        if (error) {
          reject(error);
        } else {
          resolve({ stdout, stderr });
        }
      });
    });
    
    console.log('✅ Whisper CLI is available and working!');
    return true;
    
  } catch (error) {
    console.error('❌ Whisper CLI test failed:', error.message);
    console.log('\n📋 Whisper CLI not found. It should have been installed via Homebrew.');
    console.log('   If you see this error, try:');
    console.log('   brew install openai-whisper');
    return false;
  }
}

// Main execution
async function main() {
  try {
    const whisperAvailable = await checkWhisperAvailability();
    
    if (!whisperAvailable) {
      console.log('\n⚠️  Whisper is not available. Please install it first.');
      process.exit(1);
    }

    await processAllVideos();
    
  } catch (error) {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { processAllVideos, checkWhisperAvailability };