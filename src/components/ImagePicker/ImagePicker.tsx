'use client';

import React, { useState, useEffect } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, RotateCcw, Copy, ExternalLink, Image as ImageIcon, User, Package, Grid } from 'lucide-react';
import { ImageKit } from '@/lib/imageKit';
import { useImage } from '@/hooks/useImage';

/**
 * ImagePicker Component
 * A visual panel for searching and selecting premium images.
 */
export const ImagePicker: React.FC = () => {
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('photos');
  const [seeds, setSeeds] = useState<string[]>(Array.from({ length: 20 }, (_, i) => `seed-${i}`));

  const handleRandomize = () => {
    setSeeds(Array.from({ length: 20 }, () => Math.random().toString(36).substring(7)));
  };

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url);
    // Could add a toast here
  };

  return (
    <div className="flex flex-col h-full bg-[#0B0F19] text-white">
      {/* Header */}
      <div className="p-4 border-b border-white/10 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-widest text-white/50">Image Intelligence</h2>
          <Button variant="ghost" size="icon" onClick={handleRandomize} className="hover:bg-white/5">
            <RotateCcw size={16} />
          </Button>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={16} />
          <Input 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search images..." 
            className="pl-10 bg-white/5 border-white/10 focus:ring-orange-500/50"
          />
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
        <TabsList className="bg-transparent border-b border-white/5 px-2 rounded-none h-12">
          <TabsTrigger value="photos" className="data-[state=active]:bg-white/5 data-[state=active]:text-orange-500 gap-2">
            <ImageIcon size={14} /> Photos
          </TabsTrigger>
          <TabsTrigger value="avatars" className="data-[state=active]:bg-white/5 data-[state=active]:text-orange-500 gap-2">
            <User size={14} /> Avatars
          </TabsTrigger>
          <TabsTrigger value="products" className="data-[state=active]:bg-white/5 data-[state=active]:text-orange-500 gap-2">
            <Package size={14} /> Products
          </TabsTrigger>
          <TabsTrigger value="patterns" className="data-[state=active]:bg-white/5 data-[state=active]:text-orange-500 gap-2">
            <Grid size={14} /> Patterns
          </TabsTrigger>
        </TabsList>

        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar min-h-0">
          <TabsContent value="photos" className="mt-0 outline-none">
            <div className="grid grid-cols-2 gap-3">
              {seeds.map((seed) => {
                const url = ImageKit.getPhoto(300, 200, search ? `${search}-${seed}` : seed);
                return <ImageCard key={seed} url={url} source="Picsum" onCopy={copyToClipboard} />;
              })}
            </div>
          </TabsContent>

          <TabsContent value="avatars" className="mt-0 outline-none space-y-6">
             <AvatarSection title="Pravatar (Real)" type="real" seeds={seeds.slice(0, 10)} onCopy={copyToClipboard} />
             <AvatarSection title="Dicebear (Avataaars)" type="avataaars" seeds={seeds.slice(0, 10)} onCopy={copyToClipboard} />
             <AvatarSection title="Dicebear (Pixel Art)" type="pixel-art" seeds={seeds.slice(0, 10)} onCopy={copyToClipboard} />
             <AvatarSection title="Robohash (Robots)" type="bottts" seeds={seeds.slice(0, 10)} onCopy={copyToClipboard} />
          </TabsContent>

          <TabsContent value="products" className="mt-0 outline-none">
            <div className="grid grid-cols-2 gap-3">
              {['watch', 'shoes', 'fashion', 'furniture', 'food', 'house'].map((cat) => (
                <ImageCard 
                  key={cat} 
                  url={ImageKit.getProduct(cat as any, 300, 300, seeds[0])} 
                  label={cat.toUpperCase()} 
                  source="Lorem Space" 
                  onCopy={copyToClipboard} 
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="patterns" className="mt-0 outline-none space-y-4">
            {ImageKit.getPatterns().map((p) => (
              <div 
                key={p.name}
                onClick={() => copyToClipboard(p.tailwind)}
                className="group relative h-24 rounded-xl border border-white/10 overflow-hidden cursor-pointer hover:border-orange-500/50 transition-all"
              >
                <div className={`absolute inset-0 ${p.className}`} style={{ cssText: p.css } as any} />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="text-xs font-bold uppercase tracking-widest">Copy Tailwind</span>
                </div>
                <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/60 text-[10px] font-bold uppercase">
                  {p.name}
                </div>
              </div>
            ))}
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

interface ImageCardProps {
  url: string;
  source: string;
  label?: string;
  onCopy: (url: string) => void;
}

const ImageCard: React.FC<ImageCardProps> = ({ url, source, label, onCopy }) => {
  return (
    <div 
      onClick={() => onCopy(url)}
      className="group relative aspect-video rounded-lg border border-white/5 overflow-hidden cursor-pointer hover:border-orange-500/50 transition-all bg-white/5"
    >
      <img src={url} alt="Gallery" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" loading="lazy" />
      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
        <Copy size={18} className="text-white" />
      </div>
      <div className="absolute bottom-1 left-1 right-1 flex items-center justify-between text-[8px] font-bold uppercase pointer-events-none">
        <span className="bg-black/60 px-1.5 py-0.5 rounded text-white/50">{source}</span>
        {label && <span className="bg-orange-500 px-1.5 py-0.5 rounded text-white">{label}</span>}
      </div>
    </div>
  );
};

const AvatarSection = ({ title, type, seeds, onCopy }: { title: string, type: any, seeds: string[], onCopy: any }) => (
  <div className="space-y-2">
    <h3 className="text-[10px] font-bold uppercase tracking-widest text-white/30">{title}</h3>
    <div className="flex flex-wrap gap-2">
      {seeds.map((s) => (
        <div 
          key={s}
          onClick={() => onCopy(type === 'bottts' ? ImageKit.getRobot(s) : ImageKit.getAvatar(type, s))}
          className="w-10 h-10 rounded-full border border-white/10 overflow-hidden cursor-pointer hover:border-orange-500/50 transition-all bg-white/5 flex-shrink-0"
        >
          <img 
            src={type === 'bottts' ? ImageKit.getRobot(s) : ImageKit.getAvatar(type, s)} 
            alt="Avatar" 
            className="w-full h-full object-cover" 
            loading="lazy" 
          />
        </div>
      ))}
    </div>
  </div>
);
