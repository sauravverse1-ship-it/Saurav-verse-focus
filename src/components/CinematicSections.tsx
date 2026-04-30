import React from 'react';
import { motion } from 'motion/react';
import { Play } from 'lucide-react';
import { playWhoosh } from '../lib/audio';

export const HeroSection: React.FC<{ onExplore: () => void }> = React.memo(({ onExplore }) => {
  return (
    <div className="relative h-[100dvh] w-full flex flex-col items-center justify-center bg-[#05050a] overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-600/5 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-600/5 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="relative z-10 flex flex-col items-center gap-8 max-w-4xl px-6 text-center"
      >
        <div className="space-y-4">
          <span className="block text-orange-500 font-mono text-[10px] uppercase tracking-[0.6em] font-black">
            System Online
          </span>
          <h1 className="text-6xl md:text-8xl font-display font-black text-white italic tracking-tighter">
            QUANTUM <span className="text-transparent stroke-orange-500" style={{ WebkitTextStroke: '1px border-orange-500', color: '#f97316' }}>FOCUS</span>
          </h1>
        </div>

        <button 
          onClick={() => { playWhoosh(); onExplore(); }}
          className="group relative px-12 py-5 bg-white text-black rounded-full font-display font-black uppercase tracking-[0.2em] transform transition-all hover:scale-105 active:scale-95 shadow-[0_10px_40px_-10px_rgba(255,255,255,0.4)]"
        >
          <span className="relative flex items-center gap-2">
            ENTER <Play className="w-4 h-4 fill-current" />
          </span>
        </button>
      </motion.div>
    </div>
  );
});
