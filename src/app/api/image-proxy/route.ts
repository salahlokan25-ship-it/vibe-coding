import { NextRequest, NextResponse } from 'next/server';

/**
 * Image Proxy Route
 * Bypasses CORS issues for external image sources.
 * Caches images for 1 hour.
 */

const WHITELISTED_DOMAINS = [
  'picsum.photos',
  'i.pravatar.cc',
  'api.dicebear.com',
  'robohash.org',
  'api.lorem.space',
  'images.unsplash.com'
];

const cache = new Map<string, { data: Buffer; contentType: string; expiry: number }>();

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const imageUrl = searchParams.get('url');

  if (!imageUrl) {
    return NextResponse.json({ error: 'Missing URL parameter' }, { status: 400 });
  }

  try {
    const decodedUrl = decodeURIComponent(imageUrl);
    const urlObj = new URL(decodedUrl);

    if (!WHITELISTED_DOMAINS.some(domain => urlObj.hostname.includes(domain))) {
      return NextResponse.json({ error: 'Domain not whitelisted' }, { status: 403 });
    }

    // Check cache
    const cached = cache.get(decodedUrl);
    if (cached && cached.expiry > Date.now()) {
      return new NextResponse(new Uint8Array(cached.data), {
        headers: {
          'Content-Type': cached.contentType,
          'Cache-Control': 'public, max-age=3600',
        },
      });
    }

    const response = await fetch(decodedUrl);
    if (!response.ok) throw new Error('Failed to fetch image');

    const contentType = response.headers.get('Content-Type') || 'image/jpeg';
    const arrayBuffer = await response.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    // Update cache
    cache.set(decodedUrl, {
      data: Buffer.from(arrayBuffer),
      contentType,
      expiry: Date.now() + 3600000, // 1 hour
    });

    return new NextResponse(uint8Array, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (err: any) {
    console.error('[Image Proxy] Error:', err.message);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
