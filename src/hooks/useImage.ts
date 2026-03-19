'use client';

import { useState, useEffect, useCallback } from 'react';

export interface UseImageOptions {
  type: 'photo' | 'avatar' | 'product';
  category?: string;
  width?: number;
  height?: number;
  seed?: string;
}

/**
 * useImage Hook
 * Manages image state, loading, and persistence.
 */
export function useImage(options: UseImageOptions) {
  const { type, category, width = 800, height = 600, seed } = options;
  const [src, setSrc] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const generateUrl = useCallback((currentSeed: string) => {
    switch (type) {
      case 'photo':
        return `https://picsum.photos/seed/${currentSeed}/${width}/${height}`;
      case 'avatar':
        return `https://i.pravatar.cc/150?u=${currentSeed}`;
      case 'product':
        return `https://api.lorem.space/image/${category || 'fashion'}?w=${width}&h=${height}&val=${currentSeed}`;
      default:
        return `https://picsum.photos/seed/${currentSeed}/${width}/${height}`;
    }
  }, [type, category, width, height]);

  useEffect(() => {
    setLoading(true);
    const resolvedSeed = seed || Math.random().toString(36).substring(7);
    const url = generateUrl(resolvedSeed);
    
    // Check localStorage for consistency if seed is provided
    if (seed) {
        const cached = localStorage.getItem(`vibe-image-${seed}`);
        if (cached) {
            setSrc(cached);
            setLoading(false);
            return;
        }
    }

    setSrc(url);
    if (seed) localStorage.setItem(`vibe-image-${seed}`, url);
    setLoading(false);
  }, [generateUrl, seed]);

  const refresh = useCallback(() => {
    setLoading(true);
    const newSeed = Math.random().toString(36).substring(7);
    const url = generateUrl(newSeed);
    setSrc(url);
    setLoading(false);
  }, [generateUrl]);

  return { src, loading, error, refresh };
}
