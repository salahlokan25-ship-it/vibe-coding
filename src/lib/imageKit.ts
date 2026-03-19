/**
 * ImageKit Utility Library
 * Centralized source for all AI-generated and UI-picked images.
 */

export type ImageCategory = 'watch' | 'shoes' | 'fashion' | 'furniture' | 'food' | 'house';
export type AvatarStyle = 'avataaars' | 'pixel-art' | 'bottts';

export const ImageKit = {
  /**
   * PICSUM PHOTOS
   */
  getPhoto: (w: number = 800, h: number = 600, seed?: string) => {
    const s = seed || Math.random().toString(36).substring(7);
    return `https://picsum.photos/seed/${s}/${w}/${h}`;
  },

  /**
   * AVATARS
   */
  getAvatar: (style: 'real' | AvatarStyle = 'real', seed?: string) => {
    const s = seed || Math.random().toString(36).substring(7);
    if (style === 'real') {
      return `https://i.pravatar.cc/150?u=${s}`;
    }
    return `https://api.dicebear.com/7.x/${style}/svg?seed=${s}`;
  },

  /**
   * ROBOHASH
   */
  getRobot: (seed?: string) => {
    const s = seed || Math.random().toString(36).substring(7);
    return `https://robohash.org/${s}?set=set1`;
  },

  /**
   * LOREM SPACE PRODUCTS
   */
  getProduct: (category: ImageCategory = 'fashion', w: number = 500, h: number = 500, seed?: string) => {
    const s = seed || Math.floor(Math.random() * 1000);
    return `https://api.lorem.space/image/${category}?w=${w}&h=${h}&val=${s}`;
  },

  /**
   * CSS PATTERNS
   * Returns Tailwind + CSS combo for premium patterns
   */
  getPatterns: () => [
    {
       name: 'Blueprint',
       className: 'bg-blue-900',
       css: 'background-image: radial-gradient(rgba(255,255,255,0.1) 1px, transparent 1px); background-size: 20px 20px;',
       tailwind: 'bg-[radial-gradient(rgba(255,255,255,0.1)_1px,transparent_1px)] [background-size:20px_20px] bg-blue-900'
    },
    {
       name: 'Grid',
       className: 'bg-[#020617]',
       css: 'background-image: linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px); background-size: 40px 40px;',
       tailwind: 'bg-[linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] [background-size:40px_40px] bg-slate-950'
    },
    {
       name: 'Dots',
       className: 'bg-white',
       css: 'background-image: radial-gradient(#e5e7eb 1px, transparent 1px); background-size: 16px 16px;',
       tailwind: 'bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] bg-white'
    },
    {
       name: 'Triangles',
       className: 'bg-indigo-600',
       css: 'background-color: #4f46e5; background-image:  linear-gradient(30deg, #4338ca 12%, transparent 12.5%, transparent 87%, #4338ca 87.5%, #4338ca), linear-gradient(150deg, #4338ca 12%, transparent 12.5%, transparent 87%, #4338ca 87.5%, #4338ca), linear-gradient(30deg, #4338ca 12%, transparent 12.5%, transparent 87%, #4338ca 87.5%, #4338ca), linear-gradient(150deg, #4338ca 12%, transparent 12.5%, transparent 87%, #4338ca 87.5%, #4338ca), linear-gradient(60deg, #4338ca77 25%, transparent 25.5%, transparent 75%, #4338ca77 75%, #4338ca77), linear-gradient(60deg, #4338ca77 25%, transparent 25.5%, transparent 75%, #4338ca77 75%, #4338ca77); background-size: 40px 70px; background-position: 0 0, 0 0, 20px 35px, 20px 35px, 0 0, 20px 35px;',
       tailwind: 'bg-indigo-600 pattern-isometric' // Placeholder for custom tailwind
    }
  ],

  /**
   * PROXY HELPER
   */
  getProxyUrl: (url: string) => {
    return `/api/image-proxy?url=${encodeURIComponent(url)}`;
  }
};
