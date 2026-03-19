/**
 * Image Prompt Injector
 * This content is appended to all AI code generation requests to ensure
 * they use our high-fidelity, royalty-free image infrastructure.
 */

export const IMAGE_INJECTION_PROMPT = `
=== IMAGE ARCHITECTURE RULES (NON-NEGOTIABLE) ===
You MUST use these specific external image sources for all <img> tags and background-images. 
DO NOT use placeholders or generic URLs.

1. PHOTOS (Marketing/Hero/Backgrounds):
   Source: Picsum Photos
   Pattern: https://picsum.photos/seed/[keyword]/[width]/[height]
   Example: <img src="https://picsum.photos/seed/startup/1200/800" />

2. AVATARS (Users/Team/Testimonials):
   - Real People: https://i.pravatar.cc/150?u=[unique_id]
   - Professional Icons: https://api.dicebear.com/7.x/avataaars/svg?seed=[name]
   - Tech/Playful: https://api.dicebear.com/7.x/pixel-art/svg?seed=[id]
   - Robots: https://robohash.org/[id]?set=set1

3. PRODUCTS (E-commerce/Catalog):
   Source: Lorem Space
   Categories: watch, shoes, fashion, furniture, food, house
   Pattern: https://api.lorem.space/image/[category]?w=[w]&h=[h]&val=[id]
   Example: <img src="https://api.lorem.space/image/watch?w=500&h=500&val=12" />

4. FALLBACK LOGIC:
   Always include an onError handler in React components:
   <img 
     src={imageSrc} 
     onError={(e) => { e.currentTarget.src = 'https://picsum.photos/seed/error/800/600'; }} 
   />

5. IMAGE PROXY (CORS Protection):
   If an image fails to load or requires CORS, prefix with: /api/image-proxy?url=[encoded_url]
=== END IMAGE RULES ===
`;
