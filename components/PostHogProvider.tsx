'use client';

import posthog from 'posthog-js'
import { PostHogProvider as PostHogProviderBase } from 'posthog-js/react'
import { useEffect, type ReactNode } from 'react'

export function PostHogProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_POSTHOG_KEY) {
      posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
        api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com',
        loaded: (posthog) => {
          if (process.env.NODE_ENV === 'development') posthog.debug()
        },
      })
    }
  }, [])

  return <PostHogProviderBase client={posthog}>{children}</PostHogProviderBase>
}