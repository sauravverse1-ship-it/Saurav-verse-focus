import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Play, 
  Pause, 
  SkipForward, 
  Volume2, 
  VolumeX, 
  Radio as RadioIcon, 
  Music, 
  Zap, 
  Moon, 
  Flame, 
  Coffee,
  Waves
} from 'lucide-react';
import { cn } from '../lib/utils';

// Types for our radio stations
type Station = 'lofi' | 'jazz' | 'focus' | 'anime' | 'chainsaw';

interface StationConfig {
  name: string;
  bpm: number;
  icon: any;
  color: string;
  description: string;
}

const STATIONS: Record<Station, StationConfig> = {
  lofi: { name: 'Lo-Fi Study', bpm: 80, icon: Coffee, color: '#06b6d4', description: 'Classic chill beats for deep reading.' },
  jazz: { name: 'Midnight Jazz', bpm: 60, icon: Moon, color: '#a855f7', description: 'Slower, darker chords for late nights.' },
  focus: { name: 'Focus Beats', bpm: 120, icon: Zap, color: '#eab308', description: 'Faster energy for intense solving.' },
  anime: { name: 'Anime OST', bpm: 90, icon: Music, color: '#ec4899', description: 'Bright, emotional pentatonic scales.' },
  chainsaw: { name: 'Chainsaw Mode', bpm: 140, icon: Flame, color: '#ef4444', description: 'Industrial noise + crushing beats.' }
};

export const QuantumRadio: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeStation, setActiveStation] = useState<Station>('lofi');
  const [volume, setVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);

  const activeStationRef = useRef<Station>(activeStation);

  useEffect(() => {
    activeStationRef.current = activeStation;
    if (isPlaying) {
      stopAudio();
      startAudio();
    }
  }, [activeStation]);

  // Audio Engine Refs
  const audioCtxRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const vinylCrackleNodeRef = useRef<AudioBufferSourceNode | null>(null);
  const oscillatorRefs = useRef<OscillatorNode[]>([]);
  const timeoutRefs = useRef<NodeJS.Timeout[]>([]);
  
  const visualizerRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);

  // Initialize Audio Engine
  const initAudio = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      masterGainRef.current = audioCtxRef.current.createGain();
      analyserRef.current = audioCtxRef.current.createAnalyser();
      masterGainRef.current.connect(analyserRef.current);
      analyserRef.current.connect(audioCtxRef.current.destination);
      
      // Initial Volume
      masterGainRef.current.gain.value = volume;
    }
  };

  const createVinylCrackle = () => {
    if (!audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
    const bufferSize = 2 * ctx.sampleRate;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = buffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      // Pink noise-ish for crackle
      output[i] = (Math.random() * 2 - 1) * 0.01;
      // Add random pops
      if (Math.random() > 0.9998) output[i] += (Math.random() * 0.5);
    }
    
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    const crackleGain = ctx.createGain();
    crackleGain.gain.value = 0.05;
    source.connect(crackleGain);
    crackleGain.connect(masterGainRef.current!);
    source.start();
    vinylCrackleNodeRef.current = source;
  };

  const playNote = (freq: number, type: OscillatorType, length: number, gainValue: number = 0.1) => {
    if (!audioCtxRef.current || !masterGainRef.current) return;
    const ctx = audioCtxRef.current;
    
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    
    g.gain.setValueAtTime(0, ctx.currentTime);
    g.gain.linearRampToValueAtTime(gainValue, ctx.currentTime + 0.1);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + length);
    
    osc.connect(g);
    g.connect(masterGainRef.current);
    
    osc.start();
    osc.stop(ctx.currentTime + length);
    
    oscillatorRefs.current.push(osc);
  };

  const startLoop = () => {
    const station = STATIONS[activeStationRef.current];
    const beatInterval = (60 / station.bpm) * 1000;
    
    const loop = () => {
      const currentStation = activeStationRef.current;
      if (!isPlaying) return;
      
      const ctx = audioCtxRef.current;
      if (!ctx || !masterGainRef.current) return;

      // --- STATION SPECIFIC LOGIC ---
      switch (currentStation) {
        case 'lofi': {
          // Slow triangle bass
          const bassFreqs = [55, 65.41, 73.42, 82.41]; // A1, C2, D2, E2
          playNote(bassFreqs[Math.floor(Math.random() * bassFreqs.length)], 'triangle', 3, 0.12);
          
          // Soft sine chords
          const chordRoot = 220; // A3
          [1, 1.25, 1.5, 1.875].forEach(int => playNote(chordRoot * int * (Math.random() > 0.7 ? 0.5 : 1), 'sine', 5, 0.015));
          break;
        }
        case 'jazz': {
          // Walking bass (semi-random walk)
          const walkFreqs = [41.2, 43.65, 46.25, 49.0, 51.91, 55.0, 58.27, 61.74];
          playNote(walkFreqs[Math.floor(Math.random() * walkFreqs.length)], 'sine', 1.5, 0.1);
          
          // Complex chords (Major/Minor 9ths)
          const jazzRoot = 174.61; // F3
          [1, 1.2, 1.5, 1.8, 2.25].forEach(int => playNote(jazzRoot * int, 'sine', 6, 0.01));
          break;
        }
        case 'focus': {
          // Pulse bass
          playNote(55, 'sawtooth', 0.5, 0.08);
          // Pulsing chords
          [1, 1.5, 2].forEach(int => playNote(220 * int, 'sine', 1, 0.02));
          break;
        }
        case 'anime': {
          // Pentatonic melody bursts
          const penta = [1, 1.125, 1.25, 1.5, 1.667];
          const melodyNote = 440 * penta[Math.floor(Math.random() * penta.length)];
          playNote(melodyNote, 'sine', 0.5, 0.05);
          playNote(melodyNote * 2, 'sine', 0.2, 0.02);
          
          // Light triangle bass
          playNote(110, 'triangle', 2, 0.05);
          break;
        }
        case 'chainsaw': {
          // Heavy industrial distorted bass
          const root = 40 + Math.random() * 10;
          playNote(root, 'square', 1, 0.15);
          playNote(root * 1.5, 'sawtooth', 0.5, 0.08);
          
          // Noise bursts
          const noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * 0.2, ctx.sampleRate);
          const data = noiseBuffer.getChannelData(0);
          for(let i=0; i<data.length; i++) data[i] = (Math.random() * 2 - 1) * 0.1;
          const noiseSource = ctx.createBufferSource();
          noiseSource.buffer = noiseBuffer;
          const noiseGain = ctx.createGain();
          noiseGain.gain.setValueAtTime(0.05, ctx.currentTime);
          noiseGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
          noiseSource.connect(noiseGain);
          noiseGain.connect(masterGainRef.current);
          noiseSource.start();
          break;
        }
      }

      // --- COMMON PERCUSSION ---
      const playHat = (gain = 0.008) => {
        if (!audioCtxRef.current) return;
        const c = audioCtxRef.current;
        const noiseNode = c.createBufferSource();
        const buffer = c.createBuffer(1, c.sampleRate * 0.05, c.sampleRate);
        const d = buffer.getChannelData(0);
        for(let i=0; i<d.length; i++) d[i] = Math.random() * 2 - 1;
        noiseNode.buffer = buffer;
        const filter = c.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.value = 8000 + (Math.random() * 2000);
        const hatGain = c.createGain();
        hatGain.gain.setValueAtTime(gain, c.currentTime);
        hatGain.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + 0.04);
        noiseNode.connect(filter);
        filter.connect(hatGain);
        hatGain.connect(masterGainRef.current!);
        noiseNode.start();
      };
      
      // Swing logic for lofi/jazz
      const isSwing = activeStation === 'lofi' || activeStation === 'jazz';
      const intervals = isSwing ? [0, 400, 800, 1200] : [0, 300, 600, 900];
      
      intervals.forEach(ms => {
        const timeout = setTimeout(() => playHat(activeStation === 'chainsaw' ? 0.02 : 0.008), ms);
        timeoutRefs.current.push(timeout);
      });

      const nextLoop = setTimeout(loop, beatInterval * 2);
      timeoutRefs.current.push(nextLoop);
    };

    loop();
  };

  const startAudio = () => {
    initAudio();
    if (audioCtxRef.current?.state === 'suspended') {
      audioCtxRef.current.resume();
    }
    
    setIsPlaying(true);
    createVinylCrackle();
    startLoop();
    startVisualizer();
  };

  const stopAudio = () => {
    setIsPlaying(false);
    if (vinylCrackleNodeRef.current) {
      vinylCrackleNodeRef.current.stop();
      vinylCrackleNodeRef.current = null;
    }
    timeoutRefs.current.forEach(clearTimeout);
    timeoutRefs.current = [];
    oscillatorRefs.current.forEach(osc => {
      try { osc.stop(); } catch(e) {}
    });
    oscillatorRefs.current = [];
  };

  const startVisualizer = () => {
    if (!analyserRef.current) return;
    
    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    const draw = () => {
      if (!visualizerRef.current || !analyserRef.current) return;
      
      const canvas = visualizerRef.current;
      const ctx = canvas.getContext('2d')!;
      analyserRef.current.getByteFrequencyData(dataArray);
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const barWidth = (canvas.width / bufferLength) * 2.5;
      let x = 0;
      
      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * canvas.height;
        ctx.fillStyle = STATIONS[activeStation].color + (Math.floor((dataArray[i]/255) * 100).toString(16).padStart(2,'0'));
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
        x += barWidth + 1;
      }
      
      animationRef.current = requestAnimationFrame(draw);
    };
    
    draw();
  };

  useEffect(() => {
    if (masterGainRef.current) {
      masterGainRef.current.gain.value = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  useEffect(() => {
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      if (audioCtxRef.current) audioCtxRef.current.close();
    };
  }, []);

  return (
    <div className="glass-card bg-black p-8 md:p-12 rounded-[3.5rem] border-white/5 relative overflow-hidden group">
      {/* Background Glow */}
      <div 
        className="absolute inset-0 opacity-10 transition-colors duration-1000"
        style={{ backgroundImage: `radial-gradient(circle at center, ${STATIONS[activeStation].color} 0%, transparent 70%)` }}
      />
      
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
         
         {/* Left: Vinyl & Visualizer */}
         <div className="flex flex-col items-center gap-8">
            <div className="relative">
               {/* Vinyl Record */}
               <motion.div 
                 animate={{ rotate: isPlaying ? 360 : 0 }}
                 transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                 className="w-64 h-64 md:w-80 md:h-80 rounded-full bg-[#111] shadow-[0_0_50px_rgba(0,0,0,0.5)] border-4 border-white/5 flex items-center justify-center relative overflow-hidden"
               >
                  <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'repeating-radial-gradient(circle, transparent 0, transparent 4px, #000 5px)' }} />
                  <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-white flex items-center justify-center relative z-10 shadow-inner group-hover:scale-105 transition-transform duration-700">
                     <span className="text-4xl">{STATIONS[activeStation].icon && React.createElement(STATIONS[activeStation].icon, { className: "w-12 h-12", style: { color: STATIONS[activeStation].color } })}</span>
                  </div>
               </motion.div>
               {/* Tone Arm */}
               <motion.div 
                 animate={{ rotate: isPlaying ? 15 : 0 }}
                 className="absolute top-0 right-0 w-2 h-40 bg-zinc-700 origin-top rounded-full shadow-lg transform -translate-x-12 translate-y-4"
               >
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-8 bg-zinc-600 rounded-md" />
               </motion.div>
            </div>

            {/* Canvas Visualizer */}
            <div className="w-full h-12 bg-white/5 rounded-full overflow-hidden border border-white/5">
               <canvas ref={visualizerRef} width={400} height={48} className="w-full h-full" />
            </div>
         </div>

         {/* Right: Controls & Stations */}
         <div className="space-y-10">
            <div className="space-y-4">
               <div className="flex items-center gap-3">
                  <div className="px-3 py-1 bg-md-primary/10 text-md-primary rounded-full text-[8px] font-black uppercase tracking-widest border border-md-primary/20">
                     QUANTUM RADIO v2.0
                  </div>
                  {isPlaying && (
                    <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 2 }} className="text-[8px] font-mono text-md-primary uppercase tracking-widest">
                       LIVE STREAMING BITS
                    </motion.div>
                  )}
               </div>
               <h2 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter text-white">
                  {STATIONS[activeStation].name}
               </h2>
               <p className="text-white/40 text-sm font-serif italic max-w-sm">
                  {STATIONS[activeStation].description}
               </p>
            </div>

            {/* Playback Controls */}
            <div className="flex items-center gap-6">
               <button 
                 onClick={isPlaying ? stopAudio : startAudio}
                 className={cn(
                   "w-20 h-20 rounded-full flex items-center justify-center transition-all active:scale-95 shadow-2xl",
                   isPlaying ? "bg-white text-black" : "bg-md-primary text-md-on-primary"
                 )}
                 style={!isPlaying ? { backgroundColor: STATIONS[activeStation].color } : {}}
               >
                  {isPlaying ? <Pause className="w-8 h-8 fill-current" /> : <Play className="w-8 h-8 fill-current ml-1" />}
               </button>
               <button className="p-4 rounded-full bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-all">
                  <SkipForward className="w-6 h-6" />
               </button>
               
               <div className="flex items-center gap-4 bg-white/5 px-6 py-4 rounded-3xl border border-white/5">
                  <button onClick={() => setIsMuted(!isMuted)}>
                     {isMuted ? <VolumeX className="w-4 h-4 text-white/40" /> : <Volume2 className="w-4 h-4 text-white/60" />}
                  </button>
                  <input 
                    type="range" 
                    min="0" 
                    max="1" 
                    step="0.01"
                    value={volume}
                    onChange={(e) => setVolume(parseFloat(e.target.value))}
                    className="accent-md-primary w-24 opacity-60 hover:opacity-100 transition-opacity"
                  />
               </div>
            </div>

            {/* Station Selector */}
            <div className="space-y-4">
               <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20">Frequency Spectrum</label>
               <div className="flex flex-wrap gap-2">
                  {(Object.keys(STATIONS) as Station[]).map((s) => (
                    <button 
                      key={s}
                      onClick={() => setActiveStation(s)}
                      className={cn(
                        "px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all",
                        activeStation === s 
                          ? "bg-white text-black shadow-lg" 
                          : "bg-white/5 text-white/40 border border-white/5 hover:bg-white/10"
                      )}
                    >
                       {STATIONS[s].name.replace('Lo-Fi ', '')}
                    </button>
                  ))}
               </div>
            </div>

            <div className="pt-6 border-t border-white/5 flex items-center justify-between">
               <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-md-primary animate-pulse" />
                  <span className="text-[10px] font-mono text-white/20 uppercase tracking-widest">BPM: {STATIONS[activeStation].bpm}</span>
               </div>
               <div className="text-[10px] font-black uppercase tracking-widest text-white/10 italic">
                  PROCEDURAL HARMONICS ENABLED
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};
