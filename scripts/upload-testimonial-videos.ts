import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  console.error('Please ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Paths configuration
const videosDir = path.join(process.cwd(), 'public/videos/testimonials');
const transcriptionsDir = path.join(process.cwd(), 'data/testimonial-copy');
const consolidatedTranscriptionsPath = path.join(transcriptionsDir, '_consolidated_testimonials.json');

interface TranscriptionData {
  fileName: string;
  originalTranscription: string;
  error?: string;
  timestamp: string;
}

interface ConsolidatedData {
  processedAt: string;
  summary: {
    totalTranscriptions: number;
    totalApiCalls: number;
    successfulGenerations: number;
    failedGenerations: number;
  };
  testimonials: any[];
  allResults: TranscriptionData[];
}

// Helper function to get video metadata using ffprobe
async function getVideoMetadata(videoPath: string) {
  try {
    const command = `ffprobe -v quiet -print_format json -show_format -show_streams "${videoPath}"`;
    const { stdout } = await execAsync(command);
    const metadata = JSON.parse(stdout);
    
    const videoStream = metadata.streams.find((stream: any) => stream.codec_type === 'video');
    const format = metadata.format;
    
    return {
      duration: parseFloat(format.duration) || 0,
      fileSize: parseInt(format.size) || 0,
      width: videoStream?.width || 0,
      height: videoStream?.height || 0,
      bitRate: parseInt(format.bit_rate) || 0
    };
  } catch (error) {
    console.warn(`⚠️  Could not get metadata for ${path.basename(videoPath)}:`, error);
    return {
      duration: 0,
      fileSize: 0,
      width: 1920,
      height: 1080,
      bitRate: 0
    };
  }
}

// Generate thumbnail from video using ffmpeg
async function generateThumbnail(videoPath: string, outputPath: string): Promise<boolean> {
  try {
    const command = `ffmpeg -i "${videoPath}" -ss 00:00:02 -vframes 1 -q:v 2 -f image2 "${outputPath}" -y`;
    await execAsync(command);
    return fs.existsSync(outputPath);
  } catch (error) {
    console.warn(`⚠️  Could not generate thumbnail for ${path.basename(videoPath)}:`, error);
    return false;
  }
}

// Upload file to Supabase Storage
async function uploadToStorage(filePath: string, storagePath: string, bucket: string = 'testimonials'): Promise<string | null> {
  try {
    console.log(`📤 Uploading ${path.basename(filePath)} to ${bucket}/${storagePath}`);
    
    const fileBuffer = fs.readFileSync(filePath);
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(storagePath, fileBuffer, {
        cacheControl: '3600',
        upsert: true
      });

    if (error) {
      console.error(`❌ Upload failed for ${storagePath}:`, error);
      return null;
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(storagePath);

    console.log(`✅ Uploaded successfully: ${urlData.publicUrl}`);
    return urlData.publicUrl;
  } catch (error) {
    console.error(`❌ Upload error for ${storagePath}:`, error);
    return null;
  }
}

// Extract student info from transcription
function extractStudentInfo(transcription: string, fileName: string) {
  console.log(`🧠 Extracting student info from: ${fileName}`);
  console.log(`📝 Transcription: ${transcription.substring(0, 100)}...`);
  
  // Extract name patterns
  const nameMatches = transcription.match(/my name is (\w+)/i) || 
                     transcription.match(/I'm (\w+)/i) ||
                     transcription.match(/Hi,?\s*(\w+)/i);
  
  // Extract age patterns  
  const ageMatches = transcription.match(/I'm (\d+) years? old/i) ||
                    transcription.match(/(\d+) years? old/i);
  
  // Extract grade patterns
  const gradeMatches = transcription.match(/I'm in (\w+\d*)/i) ||
                      transcription.match(/(\w+) grade/i) ||
                      transcription.match(/I'm an? (L\d+)/i);

  const studentName = nameMatches ? nameMatches[1] : null;
  const studentAge = ageMatches ? parseInt(ageMatches[1]) : null;
  const studentGrade = gradeMatches ? gradeMatches[1] : null;

  console.log(`👤 Extracted info - Name: ${studentName}, Age: ${studentAge}, Grade: ${studentGrade}`);
  
  return { studentName, studentAge, studentGrade };
}

// Generate title from transcription and student info
function generateTitle(transcription: string, studentName: string | null, fileName: string): string {
  console.log(`📝 Generating title for: ${fileName}`);
  
  // Key themes and phrases to look for
  const themes = {
    'learning pace': /learn.*own pace|own pace/i,
    'growth': /(\d+(\.\d+)?)\s*x|times|grew|faster/i,
    'independence': /independent|no teacher|apps/i,
    'challenge': /challenge|harder/i,
    'focus': /focus|laser focused/i,
    'freedom': /freedom/i,
    'currency': /currency|motivat/i,
    'coding': /code|hello world/i,
    'reading': /reading/i,
    'math': /math/i,
    'bored': /bored|never get bored/i,
    'tools': /tools/i
  };

  // Extract key theme
  let primaryTheme = 'Learning at Alpha School';
  for (const [theme, pattern] of Object.entries(themes)) {
    if (pattern.test(transcription)) {
      switch (theme) {
        case 'learning pace':
          primaryTheme = 'Learning at My Own Pace';
          break;
        case 'growth':
          const growthMatch = transcription.match(/(\d+(\.\d+)?)\s*x/i);
          if (growthMatch) {
            primaryTheme = `Learning ${growthMatch[1]}x Faster`;
          } else {
            primaryTheme = 'Accelerated Learning';
          }
          break;
        case 'independence':
          primaryTheme = 'Independent Learning Journey';
          break;
        case 'freedom':
          primaryTheme = 'Freedom to Learn';
          break;
        case 'currency':
          primaryTheme = 'Motivated by Alpha Currency';
          break;
        case 'coding':
          primaryTheme = 'Learning to Code at Alpha';
          break;
        case 'focus':
          primaryTheme = 'Staying Laser Focused';
          break;
        default:
          primaryTheme = 'Alpha School Experience';
      }
      break;
    }
  }

  const title = studentName ? `${studentName}: ${primaryTheme}` : primaryTheme;
  console.log(`✅ Generated title: "${title}"`);
  return title;
}

// Create storage bucket if it doesn't exist
async function ensureStorageBucket(bucketName: string = 'testimonials') {
  try {
    console.log(`🪣 Checking if bucket '${bucketName}' exists...`);
    
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error('❌ Error listing buckets:', listError);
      return false;
    }

    const bucketExists = buckets?.some(bucket => bucket.name === bucketName);
    
    if (!bucketExists) {
      console.log(`📦 Creating bucket '${bucketName}'...`);
      const { error: createError } = await supabase.storage.createBucket(bucketName, {
        public: true,
        allowedMimeTypes: ['video/mp4', 'image/jpeg', 'image/png'],
        fileSizeLimit: 1024 * 1024 * 500 // 500MB limit
      });

      if (createError) {
        console.error('❌ Error creating bucket:', createError);
        return false;
      }
      
      console.log('✅ Bucket created successfully');
    } else {
      console.log('✅ Bucket already exists');
    }
    
    return true;
  } catch (error) {
    console.error('❌ Error with bucket operations:', error);
    return false;
  }
}

// Main processing function
async function processTestimonialVideos() {
  try {
    console.log('🎬 Starting testimonial video processing...\n');
    
    // Ensure storage bucket exists
    const bucketReady = await ensureStorageBucket('testimonials');
    if (!bucketReady) {
      console.error('❌ Failed to set up storage bucket');
      process.exit(1);
    }

    // Load transcription data
    console.log('📖 Loading transcription data...');
    if (!fs.existsSync(consolidatedTranscriptionsPath)) {
      console.error(`❌ Transcription file not found: ${consolidatedTranscriptionsPath}`);
      process.exit(1);
    }

    const transcriptionData: ConsolidatedData = JSON.parse(
      fs.readFileSync(consolidatedTranscriptionsPath, 'utf8')
    );
    
    console.log(`✅ Loaded ${transcriptionData.allResults.length} transcriptions\n`);

    // Get all video files
    const videoFiles = fs.readdirSync(videosDir)
      .filter(file => file.endsWith('.mp4'))
      .sort();

    console.log(`📹 Found ${videoFiles.length} video files to process\n`);

    const results = [];
    const tempThumbnailsDir = path.join(process.cwd(), 'temp-thumbnails');
    
    // Create temp directory for thumbnails
    if (!fs.existsSync(tempThumbnailsDir)) {
      fs.mkdirSync(tempThumbnailsDir, { recursive: true });
    }

    for (let i = 0; i < videoFiles.length; i++) {
      const videoFile = videoFiles[i];
      const videoPath = path.join(videosDir, videoFile);
      
      console.log(`\n🎬 Processing ${i + 1}/${videoFiles.length}: ${videoFile}`);
      console.log(`⏱️  Estimated time remaining: ${Math.round((videoFiles.length - i - 1) * 3)} minutes`);

      try {
        // Find corresponding transcription
        const baseName = videoFile.replace('.mp4', '');
        const transcription = transcriptionData.allResults.find(
          t => t.fileName.includes(baseName) || baseName.includes(t.fileName.replace('.json', ''))
        );

        if (!transcription) {
          console.warn(`⚠️  No transcription found for ${videoFile}, skipping...`);
          continue;
        }

        console.log(`📝 Found transcription: ${transcription.originalTranscription.substring(0, 80)}...`);

        // Get video metadata
        console.log(`📊 Getting video metadata...`);
        const metadata = await getVideoMetadata(videoPath);
        console.log(`📊 Video metadata: ${Math.round(metadata.duration)}s, ${metadata.width}x${metadata.height}, ${Math.round(metadata.fileSize / 1024 / 1024)}MB`);

        // Generate thumbnail
        const thumbnailName = `${baseName}_thumbnail.jpg`;
        const thumbnailPath = path.join(tempThumbnailsDir, thumbnailName);
        console.log(`🖼️  Generating thumbnail...`);
        const thumbnailGenerated = await generateThumbnail(videoPath, thumbnailPath);

        // Upload video to storage
        const videoStoragePath = `videos/${videoFile}`;
        const videoUrl = await uploadToStorage(videoPath, videoStoragePath, 'testimonials');
        
        if (!videoUrl) {
          console.error(`❌ Failed to upload video: ${videoFile}`);
          continue;
        }

        // Upload thumbnail if generated
        let thumbnailUrl = null;
        if (thumbnailGenerated) {
          const thumbnailStoragePath = `thumbnails/${thumbnailName}`;
          thumbnailUrl = await uploadToStorage(thumbnailPath, thumbnailStoragePath, 'testimonials');
          
          // Clean up temp thumbnail
          fs.unlinkSync(thumbnailPath);
        }

        // Extract student information
        const { studentName, studentAge, studentGrade } = extractStudentInfo(
          transcription.originalTranscription, 
          videoFile
        );

        // Generate title
        const title = generateTitle(transcription.originalTranscription, studentName, videoFile);

        // Prepare testimonial data
        const testimonialData = {
          title,
          description: transcription.originalTranscription.length > 100 
            ? transcription.originalTranscription.substring(0, 97) + '...'
            : transcription.originalTranscription,
          student_name: studentName,
          student_age: studentAge,
          student_grade: studentGrade,
          video_url: videoUrl,
          thumbnail_url: thumbnailUrl,
          local_video_path: videoPath,
          transcription: transcription.originalTranscription,
          marketing_copy: null as any, // Can be generated later
          duration_seconds: Math.round(metadata.duration),
          file_size_bytes: metadata.fileSize,
          video_width: metadata.width,
          video_height: metadata.height,
          tags: [] as string[], // Can be populated later with AI
          featured: true, // Mark all as featured initially
          display_order: i + 1,
          view_count: 0
        };

        console.log(`💾 Inserting testimonial into database...`);
        console.log(`📋 Testimonial data:`, {
          title: testimonialData.title,
          student_name: testimonialData.student_name,
          student_age: testimonialData.student_age,
          student_grade: testimonialData.student_grade,
          duration_seconds: testimonialData.duration_seconds,
          file_size_mb: Math.round(testimonialData.file_size_bytes / 1024 / 1024)
        });

        // Insert into database
        const { data: insertData, error: insertError } = await supabase
          .from('testimonials')
          .insert(testimonialData)
          .select()
          .single();

        if (insertError) {
          console.error(`❌ Database insert failed for ${videoFile}:`, insertError);
          continue;
        }

        console.log(`✅ Successfully processed: ${videoFile}`);
        console.log(`🆔 Database ID: ${insertData.id}`);
        
        results.push({
          videoFile,
          testimonialId: insertData.id,
          title: testimonialData.title,
          studentName: testimonialData.student_name,
          videoUrl: videoUrl,
          thumbnailUrl: thumbnailUrl
        });

        // Brief pause between videos
        if (i < videoFiles.length - 1) {
          console.log(`⏳ Brief pause before next video...`);
          await new Promise(resolve => setTimeout(resolve, 2000));
        }

      } catch (error) {
        console.error(`❌ Error processing ${videoFile}:`, error);
        continue;
      }
    }

    // Clean up temp directory
    if (fs.existsSync(tempThumbnailsDir)) {
      fs.rmSync(tempThumbnailsDir, { recursive: true, force: true });
    }

    // Generate summary report
    console.log('\n📊 PROCESSING COMPLETE');
    console.log('======================');
    console.log(`✅ Successfully processed: ${results.length} videos`);
    console.log(`❌ Failed: ${videoFiles.length - results.length} videos`);
    
    if (results.length > 0) {
      console.log('\n📋 PROCESSED TESTIMONIALS:');
      results.forEach((result, index) => {
        console.log(`${index + 1}. ${result.title}`);
        console.log(`   Student: ${result.studentName || 'Unknown'}`);
        console.log(`   Video: ${result.videoUrl}`);
        console.log(`   Thumbnail: ${result.thumbnailUrl || 'None'}`);
        console.log('');
      });
    }

    console.log('🎉 Testimonial video processing completed successfully!');
    
  } catch (error) {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  }
}

// Check dependencies
async function checkDependencies() {
  console.log('🔍 Checking dependencies...');
  
  try {
    await execAsync('ffmpeg -version');
    console.log('✅ FFmpeg is available');
  } catch {
    console.error('❌ FFmpeg is not installed. Please install it first:');
    console.error('   macOS: brew install ffmpeg');
    console.error('   Ubuntu: sudo apt install ffmpeg');
    console.error('   Windows: Download from https://ffmpeg.org/');
    return false;
  }

  try {
    await execAsync('ffprobe -version');
    console.log('✅ FFprobe is available');
  } catch {
    console.error('❌ FFprobe is not installed. Please install FFmpeg package.');
    return false;
  }

  return true;
}

// Main execution
async function main() {
  try {
    const depsReady = await checkDependencies();
    
    if (!depsReady) {
      console.log('\n⚠️  Dependencies missing. Please install them first.');
      process.exit(1);
    }

    await processTestimonialVideos();
    
  } catch (error) {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

export default processTestimonialVideos;