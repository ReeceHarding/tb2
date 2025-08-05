'use client';

import React, { useState, useEffect } from 'react';
import { Play, X } from 'lucide-react';
import { supabase } from '@/libs/supabase';

interface Video {
  platform_id: string;
  platform: string;
  author_username: string;
  description: string;
  videos: { publicUrl: string }[];
}

export default function VideoTestimonials() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      // Fetch content items with video media
      const { data: contentData, error: contentError } = await supabase
        .from('content')
        .select(`
          platform_id,
          platform,
          author_username,
          description
        `)
        .eq('platform', 'instagram')
        .limit(6);

      if (contentError) throw contentError;

      // For each content item, get the video URL from media table
      const videosWithUrls = await Promise.all(
        (contentData || []).map(async (content) => {
          const { data: mediaData } = await supabase
            .from('media')
            .select('storage_url')
            .eq('content_id', content.platform_id)
            .eq('media_type', 'video')
            .single();

          return {
            ...content,
            videos: mediaData?.storage_url ? [{ publicUrl: mediaData.storage_url }] : []
          };
        })
      );

      // Filter out items without videos
      const validVideos = videosWithUrls.filter(v => v.videos.length > 0);
      setVideos(validVideos);
    } catch (error) {
      console.error('[VideoTestimonials] Error fetching videos:', error);
      // Use fallback videos if fetch fails
      setVideos([
        {
          platform_id: '1',
          platform: 'demo',
          author_username: 'sarah_chen',
          description: 'My daughter went from struggling in math to being 2 years ahead!',
          videos: [{ publicUrl: '/videos/testimonial-1.mp4' }]
        },
        {
          platform_id: '2',
          platform: 'demo',
          author_username: 'michael_jones',
          description: 'TimeBack transformed our homeschool experience completely.',
          videos: [{ publicUrl: '/videos/testimonial-2.mp4' }]
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-timeback-bg rounded-xl animate-pulse aspect-video" />
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {videos.map((video) => (
          <div
            key={video.platform_id}
            className="relative group cursor-pointer rounded-xl overflow-hidden shadow-2xl hover:shadow-2xl transition-shadow"
            onClick={() => setSelectedVideo(video)}
          >
            <div className="aspect-video bg-timeback-bg relative">
              {/* Video Thumbnail */}
              <video
                src={video.videos[0]?.publicUrl}
                className="w-full h-full object-cover"
                muted
              />
              
              {/* Play Overlay */}
              <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center group-hover:bg-opacity-30 transition-opacity">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
                  <Play className="w-8 h-8 text-timeback-primary ml-1 font-cal" />
                </div>
              </div>
            </div>
            

          </div>
        ))}
      </div>

      {/* Video Modal */}
      {selectedVideo && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedVideo(null)}
        >
          <div
            className="relative max-w-4xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <video
              src={selectedVideo.videos[0]?.publicUrl}
              controls
              autoPlay
              className="w-full rounded-xl"
            />
            <button
              onClick={() => setSelectedVideo(null)}
                              className="absolute top-4 right-4 text-white hover:text-timeback-primary font-cal"
            >
              <X className="w-8 h-8" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}