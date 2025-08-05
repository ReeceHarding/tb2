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
  const [isMinimized, setIsMinimized] = useState(false);

  // Check if user already has a shareable journey
  useEffect(() => {
    // Only run on client-side
    if (typeof window === 'undefined') return;
    
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

    // Only run on client-side
    if (typeof window === 'undefined' || !navigator.clipboard) {
      console.warn('[ShareJourneyButton] Clipboard API not available');
      return;
    }

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
      {/* Header with minimize/expand toggle */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-cal text-timeback-primary font-semibold text-sm">Share Journey</h3>
        <button
          onClick={() => setIsMinimized(!isMinimized)}
          className="text-timeback-primary hover:text-opacity-80 transition-colors p-1"
          aria-label={isMinimized ? "Expand share options" : "Minimize share options"}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {isMinimized ? (
              // Expand icon (plus)
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            ) : (
              // Minimize icon (minus)
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
            )}
          </svg>
        </button>
      </div>

      {/* Content - hidden when minimized */}
      {!isMinimized && (
        <>
          {!shareUrl ? (
            <button
              onClick={handleGenerateShare}
              disabled={isGenerating}
              className="bg-timeback-primary text-white px-6 py-3 rounded-xl font-bold text-base hover:bg-opacity-90 transition-all duration-200 shadow-2xl hover:shadow-2xl transform hover:scale-105 font-cal disabled:opacity-50 disabled:cursor-not-allowed w-full"
            >
              {isGenerating ? (
                <span className="flex items-center justify-center font-cal">
                  <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                  Creating...
                </span>
              ) : (
                <span className="font-cal">Share Your Journey</span>
              )}
            </button>
          ) : (
            <div className="space-y-3">
              <button
                onClick={() => handleCopyLink()}
                className="bg-timeback-primary text-white px-6 py-3 rounded-xl font-bold text-base hover:bg-opacity-90 transition-all duration-200 shadow-2xl hover:shadow-2xl transform hover:scale-105 font-cal w-full"
              >
                {copyStatus === 'copying' ? (
                  <span className="font-cal">Copying...</span>
                ) : copyStatus === 'copied' ? (
                  <span className="font-cal flex items-center justify-center">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Copied!
                  </span>
                ) : (
                  <span className="font-cal">Copy Link</span>
                )}
              </button>
              
              <div className="backdrop-blur-md bg-white/20 border border-timeback-primary rounded-xl p-3 shadow-lg">
                <p className="font-cal text-timeback-primary text-xs mb-2 font-semibold">Share this link:</p>
                <div className="backdrop-blur-sm bg-white/90 rounded-xl p-2 border border-timeback-primary shadow-xl">
                  <p className="font-cal text-timeback-primary text-xs break-all font-mono">
                    {shareUrl}
                  </p>
                </div>
              </div>

              {hasExistingShare && (
                <button
                  onClick={handleGenerateShare}
                  disabled={isGenerating}
                  className="text-timeback-primary underline font-cal text-xs hover:text-opacity-80 transition-colors w-full text-center"
                >
                  Update with current journey
                </button>
              )}
            </div>
          )}

          {error && (
            <div className="mt-3 backdrop-blur-md bg-white/20 border border-timeback-primary rounded-xl p-3 shadow-lg">
              <p className="font-cal text-timeback-primary text-xs font-semibold">{error}</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}