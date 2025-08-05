'use client';

import React, { useState, useEffect } from 'react';
import { ShareableJourneySection } from '@/types/quiz';

interface ShareJourneyButtonProps {
  viewedComponents: Array<{
    mainSectionId: string;
    componentId: string;
  }>;
  className?: string;
}

export default function ShareJourneyButton({ viewedComponents, className = '' }: ShareJourneyButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copying' | 'copied'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [hasExistingShare, setHasExistingShare] = useState(false);

  // Check if user already has a shareable journey
  useEffect(() => {
    const checkExistingShare = async () => {
      try {
        const response = await fetch('/api/share/journey');
        if (response.ok) {
          const data = await response.json();
          if (data.data?.hasShareableJourney && data.data?.shareUrl) {
            setShareUrl(data.data.shareUrl);
            setHasExistingShare(true);
            console.log('[ShareJourneyButton] Found existing share URL:', data.data.shareUrl);
          }
        }
      } catch (err) {
        console.error('[ShareJourneyButton] Error checking existing share:', err);
      }
    };

    checkExistingShare();
  }, []);

  const handleGenerateShare = async () => {
    const timestamp = new Date().toISOString();
    console.log(`[ShareJourneyButton] ${timestamp} Generating shareable journey`);
    
    setIsGenerating(true);
    setError(null);
    
    try {
      // Transform viewed components to shareable journey sections
      const viewedSections: ShareableJourneySection[] = viewedComponents.map(component => ({
        sectionId: component.mainSectionId,
        componentId: component.componentId,
        timestamp: new Date() // Will be set by backend
      }));

      console.log(`[ShareJourneyButton] ${timestamp} Sending sections:`, viewedSections);

      const response = await fetch('/api/share/journey', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ viewedSections })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create shareable journey');
      }

      console.log(`[ShareJourneyButton] ${timestamp} Share URL created:`, data.data.shareUrl);
      setShareUrl(data.data.shareUrl);
      setHasExistingShare(true);
      
      // Automatically copy to clipboard after generation
      await handleCopyLink(data.data.shareUrl);
      
    } catch (err) {
      console.error(`[ShareJourneyButton] ${timestamp} Error:`, err);
      setError(err instanceof Error ? err.message : 'Failed to create share link');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyLink = async (url?: string) => {
    const linkToCopy = url || shareUrl;
    if (!linkToCopy) return;

    setCopyStatus('copying');
    
    try {
      await navigator.clipboard.writeText(linkToCopy);
      console.log('[ShareJourneyButton] Copied to clipboard:', linkToCopy);
      setCopyStatus('copied');
      
      // Reset copy status after 2 seconds
      setTimeout(() => {
        setCopyStatus('idle');
      }, 2000);
    } catch (err) {
      console.error('[ShareJourneyButton] Failed to copy:', err);
      setError('Failed to copy link to clipboard');
      setCopyStatus('idle');
    }
  };

  // Don't show button if no components have been viewed
  if (viewedComponents.length === 0) {
    return null;
  }

  return (
    <div className={`${className}`}>
      {!shareUrl ? (
        <button
          onClick={handleGenerateShare}
          disabled={isGenerating}
          className="bg-timeback-primary text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-opacity-90 transition-all duration-200 shadow-2xl hover:shadow-2xl transform hover:scale-105 font-cal disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isGenerating ? (
            <span className="flex items-center">
              <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></span>
              Creating Share Link...
            </span>
          ) : (
            '🔗 Share Your Journey'
          )}
        </button>
      ) : (
        <div className="space-y-4">
          <button
            onClick={() => handleCopyLink()}
            className="bg-timeback-primary text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-opacity-90 transition-all duration-200 shadow-2xl hover:shadow-2xl transform hover:scale-105 font-cal w-full"
          >
            {copyStatus === 'copying' ? (
              '📋 Copying...'
            ) : copyStatus === 'copied' ? (
              '✅ Link Copied!'
            ) : (
              '📋 Copy Share Link'
            )}
          </button>
          
          <div className="bg-timeback-bg rounded-xl p-4">
            <p className="font-cal text-timeback-primary text-sm mb-2">Your shareable link:</p>
            <p className="font-cal text-timeback-primary text-xs break-all bg-white rounded-lg p-3 border border-timeback-primary">
              {shareUrl}
            </p>
          </div>

          {hasExistingShare && (
            <button
              onClick={handleGenerateShare}
              disabled={isGenerating}
              className="text-timeback-primary underline font-cal text-sm hover:text-opacity-80 transition-colors"
            >
              Update with current journey
            </button>
          )}
        </div>
      )}

      {error && (
        <div className="mt-4 bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="font-cal text-red-600 text-sm">{error}</p>
        </div>
      )}
    </div>
  );
}