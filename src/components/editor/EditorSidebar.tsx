'use client';

import React, { useState } from 'react';
import { Image as ImageIcon, Files, Search, Settings, HelpCircle, Code2, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ImagePicker } from '@/components/ImagePicker/ImagePicker';

/**
 * Editor Sidebar
 * Narrow vertical toolbar with expandable panels.
 */
export const EditorSidebar: React.FC = () => {
    const [activePanel, setActivePanel] = useState<'files' | 'images' | 'search' | null>(null);

    const togglePanel = (panel: 'files' | 'images' | 'search') => {
        setActivePanel(prev => prev === panel ? null : panel);
    };

    return (
        <div className="flex h-full border-r border-white/5 bg-[#080B14] relative z-[50]">
            {/* Narrow Toolbar */}
            <div className="w-14 flex flex-col items-center py-4 gap-4 border-r border-white/5">
                <ToolbarButton 
                    icon={<Files size={20} />} 
                    active={activePanel === 'files'} 
                    onClick={() => togglePanel('files')} 
                    tooltip="Explorer"
                />
                <ToolbarButton 
                    icon={<ImageIcon size={20} />} 
                    active={activePanel === 'images'} 
                    onClick={() => togglePanel('images')} 
                    tooltip="Images"
                />
                <ToolbarButton 
                    icon={<Search size={20} />} 
                    active={activePanel === 'search'} 
                    onClick={() => togglePanel('search')} 
                    tooltip="Search"
                />
                
                <div className="mt-auto flex flex-col gap-4">
                    <ToolbarButton icon={<Settings size={20} />} onClick={() => {}} tooltip="Settings" />
                    <ToolbarButton icon={<HelpCircle size={20} />} onClick={() => {}} tooltip="Support" />
                </div>
            </div>

            {/* Expandable Panel */}
            <AnimatePresence>
                {activePanel && (
                    <motion.div
                        initial={{ width: 0, opacity: 0 }}
                        animate={{ width: 320, opacity: 1 }}
                        exit={{ width: 0, opacity: 0 }}
                        className="h-full overflow-hidden bg-[#0A0D17] border-r border-white/5"
                    >
                        <div className="w-[320px] h-full">
                            {activePanel === 'images' && <ImagePicker />}
                            {activePanel === 'files' && (
                                <div className="p-4">
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 mb-4">Project Files</h3>
                                    <div className="text-xs text-white/20 italic">File explorer is handled by the main Code Explorer.</div>
                                </div>
                            )}
                            {activePanel === 'search' && (
                                <div className="p-4">
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 mb-4">Global Search</h3>
                                    <div className="text-xs text-white/20 italic">Search through project code...</div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const ToolbarButton = ({ icon, active, onClick, tooltip }: { icon: React.ReactNode, active?: boolean, onClick: () => void, tooltip: string }) => (
    <button 
        onClick={onClick}
        title={tooltip}
        className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all duration-200 group relative ${
            active ? 'bg-orange-500 text-white' : 'text-white/30 hover:text-white/60 hover:bg-white/5'
        }`}
    >
        {icon}
        {!active && <div className="absolute left-1 w-0.5 h-0 bg-orange-500 rounded-full group-hover:h-4 transition-all" />}
    </button>
);
