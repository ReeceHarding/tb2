'use client';

import React, { useEffect, useRef } from 'react';
import { usePostHog } from 'posthog-js/react';

interface TrackedSectionProps {
  sectionName: string;
  children: React.ReactNode;
  className?: string;
  additionalData?: Record<string, any>;
}

export default function TrackedSection({ 
  sectionName, 
  children, 
  className = '',
  additionalData = {}
}: TrackedSectionProps) {
  const posthog = usePostHog();
  const sectionRef = useRef<HTMLDivElement>(null);
  const hasTrackedRef = useRef(false);

  useEffect(() => {
    if (!sectionRef.current || !posthog || hasTrackedRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasTrackedRef.current) {
            // Track section view
            console.log(`[TrackedSection] User viewed section: ${sectionName}`);
            posthog.capture('section_viewed', {
              section_name: sectionName,
              timestamp: new Date().toISOString(),
              ...additionalData
            });
            hasTrackedRef.current = true;
          }
        });
      },
      {
        threshold: 0.5 // Track when 50% of section is visible
      }
    );

    observer.observe(sectionRef.current);

    return () => {
      observer.disconnect();
    };
  }, [posthog, sectionName, additionalData]);

  return (
    <div ref={sectionRef} className={className}>
      {children}
    </div>
  );
}