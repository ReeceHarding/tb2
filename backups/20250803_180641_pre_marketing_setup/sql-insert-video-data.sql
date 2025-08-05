-- =====================================================
-- Video Gallery Data Population
-- Run this SQL in your Supabase SQL Editor
-- =====================================================

-- First, insert video categories
INSERT INTO video_categories (name, description, color) VALUES
('All Content', 'All educational videos and content', '#3B82F6'),
('Instagram', 'Educational content from Instagram', '#E1306C'),
('Twitter', 'Educational content from Twitter/X', '#1DA1F2'),
('Student Success', 'Student testimonials and success stories', '#10B981');

-- Get the category IDs for the video inserts (you'll see these after running the above)
-- Now insert sample videos with proper category references

-- First, add the missing is_featured column if it doesn't exist
ALTER TABLE videos ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;

INSERT INTO videos (title, description, thumbnail_url, video_url, platform, platform_id, category_id, view_count, duration, published_at, is_featured) VALUES

-- Student Success Stories
('Sarah Chen - 40% Time Reduction in Math', 
 'Sarah shares how TimeBack helped her reduce study time by 40% while improving her math grades from C+ to A-.', 
 '/images/testimonials/sarah-chen-video.jpg', 
 '/demo-video.mp4', 
 'testimonial', 
 'sarah-chen-math', 
 (SELECT id FROM video_categories WHERE name = 'Student Success'), 
 1247, 
 180, 
 NOW() - INTERVAL '7 days',
 true),

('David Kim - From Struggling to Top 10%', 
 'David tells his transformation story from struggling student to top 10% of his class using TimeBack.', 
 '/images/testimonials/david-kim-video.jpg', 
 '/demo-video.mp4', 
 'testimonial', 
 'david-kim-transformation', 
 (SELECT id FROM video_categories WHERE name = 'Student Success'), 
 1156, 
 210, 
 NOW() - INTERVAL '10 days',
 true),

-- Educational Content
('Learning Science: How TimeBack Works', 
 'Understanding the cognitive science principles behind TimeBack learning methodology and why it works.', 
 '/images/testimonials/priya-patel-video.jpg', 
 '/demo-video.mp4', 
 'educational', 
 'learning-science-explained', 
 (SELECT id FROM video_categories WHERE name = 'All Content'), 
 892, 
 240, 
 NOW() - INTERVAL '14 days',
 true),

('The Science of Spaced Repetition', 
 'Deep dive into how spaced repetition works and why it is so effective for long-term learning.', 
 '/images/testimonials/thomas-brown-results.jpg', 
 '/demo-video.mp4', 
 'educational', 
 'spaced-repetition-science', 
 (SELECT id FROM video_categories WHERE name = 'All Content'), 
 934, 
 300, 
 NOW() - INTERVAL '12 days',
 true),

-- Instagram Content
('Instagram: Study Tips for Better Results', 
 'Quick study tips shared on Instagram that help students optimize their learning sessions.', 
 '/images/testimonials/maria-garcia-video.jpg', 
 '/demo-video.mp4', 
 'instagram', 
 'study-tips-instagram', 
 (SELECT id FROM video_categories WHERE name = 'Instagram'), 
 634, 
 90, 
 NOW() - INTERVAL '5 days',
 true),

('Instagram: Quick Memory Techniques', 
 'Fast memory techniques that help students remember information better, shared on Instagram.', 
 '/images/testimonials/amanda-lee-results.jpg', 
 '/demo-video.mp4', 
 'instagram', 
 'memory-techniques', 
 (SELECT id FROM video_categories WHERE name = 'Instagram'), 
 723, 
 75, 
 NOW() - INTERVAL '2 days',
 true),

-- Twitter Content
('Twitter Thread: Common Study Mistakes', 
 'A viral Twitter thread about the most common study mistakes students make and how to avoid them.', 
 '/images/testimonials/nicole-smith-video.jpg', 
 '/demo-video.mp4', 
 'twitter', 
 'study-mistakes-thread', 
 (SELECT id FROM video_categories WHERE name = 'Twitter'), 
 445, 
 150, 
 NOW() - INTERVAL '3 days',
 true),

('Twitter: Productivity Hacks for Students', 
 'Evidence-based productivity hacks shared on Twitter that help students manage their time better.', 
 '/images/testimonials/lisa-martinez-results.jpg', 
 '/demo-video.mp4', 
 'twitter', 
 'productivity-hacks', 
 (SELECT id FROM video_categories WHERE name = 'Twitter'), 
 567, 
 120, 
 NOW() - INTERVAL '1 day',
 true);

-- Verify the data was inserted
SELECT 'Categories:' as type, count(*) as count FROM video_categories
UNION ALL
SELECT 'Videos:' as type, count(*) as count FROM videos;

-- Show a sample of what was created
SELECT 
  v.title,
  v.view_count,
  v.duration,
  vc.name as category,
  v.published_at
FROM videos v
JOIN video_categories vc ON v.category_id = vc.id
ORDER BY v.published_at DESC;