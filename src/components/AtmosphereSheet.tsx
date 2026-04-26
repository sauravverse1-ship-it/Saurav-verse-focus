import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Music, Disc, Play, Pause, SkipBack, SkipForward, Repeat, Shuffle, Volume2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { AmbientTrack } from '../types'; // I will create types.ts definition, but we can assume it's exported from there
import { playAmbientSound, stopAmbientSound, setMasterVolume } from '../services/audioService';

interface AtmosphereSheetProps {
  isOpen: boolean;
  onClose: () => void;
  tracks: any[]; // will rely on existing type
  activeTrack: any | null;
  onTrackSelect: (track: any) => void;
}

export const AtmosphereSheet: React.FC<AtmosphereSheetProps> = ({ isOpen, onClose, tracks, activeTrack, onTrackSelect }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPlaying, setIsPlaying] = React.useState(!!activeTrack);
  const [volume, setVolume] = React.useState(0.6);

  useEffect(() => {
    setIsPlaying(!!activeTrack);
  }, [activeTrack]);

  useEffect(() => {
    setMasterVolume(volume);
  }, [volume]);

  useEffect(() => {
    if (isOpen && canvasRef.current) {
        // Draw simple waveform animation
        const ctx = canvasRef.current.getContext('2d');
        if (!ctx) return;
        let animationFrame: number;
        const draw = () => {
             ctx.clearRect(0, 0, canvasRef.current!.width, canvasRef.current!.height);
             
             ctx.strokeStyle = '#00E5C8'; // md-primary
             ctx.lineWidth = 2;
             ctx.lineCap = 'round';
             ctx.beginPath();
             
             const width = canvasRef.current!.width;
             const height = canvasRef.current!.height;
             const midY = height / 2;
             
             for(let i = 0; i < width; i++) {
                 // Dynamic amplitude based on playing state
                 const amp = isPlaying ? 15 + Math.sin(Date.now() * 0.005 + i * 0.1) * 10 : 2;
                 const y = midY + Math.sin(i * 0.05 + Date.now() * 0.002) * amp;
                 if (i === 0) ctx.moveTo(i, y);
                 else ctx.lineTo(i, y);
             }
             ctx.stroke();
             animationFrame = requestAnimationFrame(draw);
        };
        draw();
        return () => cancelAnimationFrame(animationFrame);
    }
  }, [isOpen, isPlaying]);

  const togglePlay = () => {
    if (activeTrack) {
        if (isPlaying) {
           stopAmbientSound(activeTrack.id);
           setIsPlaying(false);
        } else {
           playAmbientSound(activeTrack.url || activeTrack.id, activeTrack.id);
           setIsPlaying(true);
        }
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
            onClick={onClose}
          />
          <motion.div 
            initial={{ y: '100%' }}
            animate={{ y: 0, transition: { type: 'spring', stiffness: 300, damping: 30 } }}
            exit={{ y: '100%', transition: { duration: 0.3, ease: 'easeIn' } }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={0.2}
            onDragEnd={(e, info) => { if (info.offset.y > 100) onClose(); }}
            className="fixed bottom-0 left-0 right-0 max-w-lg mx-auto bg-transparent z-[101] max-h-[90vh] flex flex-col"
          >
             <div className="bg-md-surface-2/40 backdrop-blur-3xl border-t border-x border-white/10 rounded-t-[3rem] p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] flex flex-col flex-1 shadow-[0_-24px_64px_rgba(0,0,0,0.6)]">
               <div className="w-full flex justify-center pb-6 shrink-0 cursor-grab active:cursor-grabbing">
                  <div className="w-12 h-1.5 bg-white/20 rounded-full" />
               </div>
               
               <div className="flex justify-between items-center mb-6 shrink-0">
                   <h2 className="text-2xl font-black font-display text-white tracking-tight">Atmosphere</h2>
                   <button onClick={onClose} className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-all"><X className="w-5 h-5 text-white" /></button>
               </div>
               
               {activeTrack && (
                   <div className="mb-6 flex flex-col items-center gap-6 bg-white/5 border border-white/10 p-8 rounded-[3rem] backdrop-blur-xl">
                       <div className="relative w-36 h-36 rounded-full border-4 border-md-primary/20 flex items-center justify-center bg-black/40 overflow-hidden shadow-2xl">
                           <Disc className={cn("w-16 h-16 text-md-primary", isPlaying ? "animate-spin-slow" : "opacity-50")} />
                           <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent pointer-events-none" />
                       </div>
                       
                       <div className="text-center w-full">
                           <p className="text-xl font-black text-white mb-1 truncate tracking-tight">{activeTrack.label}</p>
                           <p className="text-[10px] text-md-primary font-black uppercase tracking-[0.3em]">{activeTrack.category}</p>
                       </div>
                       
                       <div className="w-full h-12 rounded-2xl relative overflow-hidden bg-white/5 mb-2 border border-white/5">
                         <canvas ref={canvasRef} className="w-full h-full opacity-60" width={400} height={48} />
                       </div>

                       <div className="w-full flex items-center justify-center gap-8 mb-2">
                           <button className="text-white/40 hover:text-white transition-colors"><Shuffle className="w-5 h-5" /></button>
                           <button className="text-white hover:text-md-primary transition-colors hover:scale-110 active:scale-90"><SkipBack className="w-7 h-7 fill-current" /></button>
                           <button onClick={togglePlay} className="p-5 bg-md-primary text-md-on-primary rounded-[2rem] hover:scale-105 active:scale-95 transition-all shadow-xl shadow-md-primary/40">
                              {isPlaying ? <Pause className="w-9 h-9 fill-current" /> : <Play className="w-9 h-9 fill-current ml-1" />}
                           </button>
                           <button className="text-white hover:text-md-primary transition-colors hover:scale-110 active:scale-90"><SkipForward className="w-7 h-7 fill-current" /></button>
                           <button className="text-white/40 hover:text-white transition-colors"><Repeat className="w-5 h-5" /></button>
                       </div>

                       <div className="w-full h-1.5 bg-white/10 rounded-full relative overflow-hidden">
                          <motion.div 
                            className="absolute h-full bg-md-primary"
                            animate={{ width: `${volume * 100}%` }}
                          />
                          <input 
                             type="range" 
                             min="0" max="1" step="0.01" 
                             value={volume}
                             onChange={(e) => setVolume(parseFloat(e.target.value))}
                             className="absolute inset-0 opacity-0 cursor-pointer w-full"
                          />
                       </div>
                   </div>
               )}

               <button 
                 onClick={() => {
                     const focusTrack = tracks.find(t => t.id === 'deep-focus' || t.id === 'lofi');
                     if (focusTrack) onTrackSelect(focusTrack);
                 }}
                 className="mb-4 w-full py-5 rounded-[2rem] bg-md-primary text-md-on-primary font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:brightness-110 transition-all shadow-lg shadow-md-primary/20 text-xs"
               >
                 <Music className="w-5 h-5" />
                 Initiate Focus Mix
               </button>

               <div className="flex-1 overflow-y-auto grid grid-cols-2 gap-4 pb-2 pr-1 custom-scrollbar">
                   {tracks.map(track => (
                       <button 
                         key={track.id}
                         onClick={() => onTrackSelect(track)}
                         className={cn("p-5 rounded-[2.5rem] border transition-all flex flex-col items-center gap-4 group", 
                           activeTrack?.id === track.id ? "bg-md-primary-container/20 border-md-primary shadow-lg" : "bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/20"
                         )}
                       >
                           <div className={cn("p-4 rounded-2xl transition-all", activeTrack?.id === track.id ? "bg-md-primary text-md-on-primary scale-110" : "bg-white/10 text-white/60 group-hover:bg-white/20 group-hover:text-white")}>
                             <Music className="w-6 h-6" />
                           </div>
                           <span className={cn("text-[10px] font-black uppercase tracking-widest text-center", activeTrack?.id === track.id ? "text-md-primary" : "text-white/60")}>{track.label}</span>
                       </button>
                   ))}
               </div>
             </div>
           </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
