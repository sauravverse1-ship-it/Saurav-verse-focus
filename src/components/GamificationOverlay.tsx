import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RANKS } from '../lib/gamification';
import { Achievement } from '../types';
import { Sparkles, Award, Star, Flame, Trophy } from 'lucide-react';
import { cn } from '../lib/utils';
import gsap from 'gsap';

// --- Confetti Engine ---
export const launchConfetti = (options: any = {}) => {
  const {
    origin = { x: 0.5, y: 0.5 },
    count = 80,
    colors = ['#00ffe0', '#7b5fe8', '#d4a843', '#ff4060', '#ffffff'],
    spread = 70,
    scalar = 1.0
  } = options;

  const canvas = document.getElementById('confetti-canvas') as HTMLCanvasElement;
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const pieces: any[] = [];
  for (let i = 0; i < count; i++) {
    pieces.push({
      x: origin.x * canvas.width,
      y: origin.y * canvas.height,
      vx: (Math.random() - 0.5) * spread * scalar,
      vy: (Math.random() * -18 - 5) * scalar,
      rot: Math.random() * 360,
      rotV: (Math.random() - 0.5) * 12,
      w: (Math.random() * 8 + 4) * scalar,
      h: (Math.random() * 4 + 2) * scalar,
      color: colors[Math.floor(Math.random() * colors.length)],
      opacity: 1,
      shape: Math.random() > 0.5 ? 'rect' : 'circle'
    });
  }

  const gravity = 0.4;
  const friction = 0.98;

  function update() {
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let active = false;

    pieces.forEach(p => {
      p.vx *= friction;
      p.vy += gravity;
      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.rotV;
      p.opacity -= 0.005;

      if (p.opacity > 0) {
        active = true;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rot * Math.PI) / 180);
        ctx.globalAlpha = p.opacity;
        ctx.fillStyle = p.color;
        if (p.shape === 'circle') {
          ctx.beginPath();
          ctx.arc(0, 0, p.w / 2, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        }
        ctx.restore();
      }
    });

    if (active) requestAnimationFrame(update);
  }

  update();
};

export const ConfettiCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        canvasRef.current.width = window.innerWidth;
        canvasRef.current.height = window.innerHeight;
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return <canvas id="confetti-canvas" ref={canvasRef} className="fixed inset-0 z-[10000] pointer-events-none" />;
};

// --- Ticking Number ---
export const TickingNumber = ({ value, duration = 1 }: { value: number; duration?: number }) => {
  const [displayValue, setDisplayValue] = useState(value);
  const prevValue = useRef(value);

  useEffect(() => {
    if (prevValue.current !== value) {
      gsap.to({ val: prevValue.current }, {
        val: value,
        duration: 1.0,
        onUpdate: function() {
          setDisplayValue(Math.round(this.targets()[0].val));
        },
        ease: "easeOut"
      });
      prevValue.current = value;
    }
  }, [value, duration]);

  return <span>{displayValue.toLocaleString()}</span>;
};

// --- Legend Text (Chromatic Aberration) ---
export const LegendText = ({ text, className }: { text: string; className?: string }) => {
  return (
    <div className={cn("relative inline-block", className)}>
      <motion.span 
        animate={{ x: [-1, 1, -1], y: [1, -1, 1] }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        className="absolute inset-0 text-red-500 mix-blend-screen opacity-70 blur-[1px]"
      >
        {text}
      </motion.span>
      <motion.span 
        animate={{ x: [1, -1, 1], y: [-1, 1, -1] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
        className="absolute inset-0 text-blue-500 mix-blend-screen opacity-70 blur-[1px]"
      >
        {text}
      </motion.span>
      <span className="relative z-10 text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">
        {text}
      </span>
    </div>
  );
};

// --- Particle Burst ---
const ParticleBurst = ({ color }: { color: string }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const count = 80;
    
    for (let i = 0; i < count; i++) {
        const piece = document.createElement('div');
        piece.style.position = 'absolute';
        piece.style.width = Math.random() * 6 + 2 + 'px';
        piece.style.height = piece.style.width;
        piece.style.background = color === 'animated' ? `hsl(${Math.random() * 360}, 70%, 60%)` : color;
        piece.style.borderRadius = '50%';
        containerRef.current.appendChild(piece);
        
        const angle = Math.random() * Math.PI * 2;
        const dist = 80 + Math.random() * 220;
        
        gsap.to(piece, {
            x: Math.cos(angle) * dist,
            y: Math.sin(angle) * dist,
            opacity: 0,
            scale: 0,
            duration: 1.2 + Math.random() * 0.8,
            ease: "power2",
            onComplete: () => piece.remove()
        });
    }
  }, [color]);

  return <div ref={containerRef} className="absolute inset-0 flex items-center justify-center pointer-events-none" />;
};

// --- XP Label ---
export const XPLabel = ({ xp, x, y, bonus, multiplier }: { xp: number; x: number; y: number; bonus?: string; multiplier?: number }) => (
  <motion.div
    initial={{ y: 0, opacity: 1, scale: 0.8, filter: 'blur(4px)' }}
    animate={{ y: -80, opacity: 0, scale: 1.2, filter: 'blur(0px)' }}
    transition={{ duration: 1.4, ease: "easeOut" }}
    style={{ left: x, top: y }}
    className="fixed pointer-events-none z-[10000] flex flex-col items-center"
  >
    <div className="flex items-center gap-2">
        <span className="text-md-primary font-mono font-black text-2xl drop-shadow-[0_0_20px_var(--md-primary)]">
            +{xp} XP
        </span>
        {multiplier && (
            <motion.span 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="bg-amber-400 text-[#000] text-[12px] px-2 py-0.5 rounded-full font-black shadow-[0_0_15px_rgba(251,191,36,0.5)]"
            >
                x{multiplier.toFixed(1)}
            </motion.span>
        )}
    </div>
    {bonus && (
        <motion.span 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-amber-400 font-mono font-bold text-sm uppercase tracking-widest mt-1 bg-black/40 px-3 py-1 rounded-full border border-amber-400/30 backdrop-blur-sm"
        >
            {bonus}
        </motion.span>
    )}
  </motion.div>
);

// --- Rank Up Ceremony ---
export const RankUpCeremony = ({ oldRank, newRank, onComplete }: { oldRank: string; newRank: string; onComplete: () => void }) => {
  const rank = RANKS.find(r => r.name === newRank) || RANKS[0];
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // Sound logic
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const playNote = (freq: number, time: number) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.frequency.value = freq;
          gain.gain.setValueAtTime(0, time);
          gain.gain.linearRampToValueAtTime(0.2, time + 0.1);
          gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.5);
          osc.start(time);
          osc.stop(time + 0.5);
      };
      [440, 554, 659, 880].forEach((f, i) => playNote(f, ctx.currentTime + i * 0.12));
    } catch(e) {}

    // Confetti
    launchConfetti({ count: 120, spread: 90 });
  }, []);

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-xl cursor-pointer overflow-hidden"
      onClick={onComplete}
    >
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0.7, 0] }}
        transition={{ duration: 0.4 }}
        className="absolute inset-0 z-0" 
        style={{ backgroundColor: rank.color === 'animated' ? '#7b5fe8' : rank.color }} 
      />

      <div className="relative z-10 flex flex-col items-center text-center px-6">
        <ParticleBurst color={rank.color} />
        
        <motion.div
          initial={{ scale: 0, rotate: -180, filter: 'blur(20px)' }}
          animate={{ scale: 1, rotate: 0, filter: 'blur(0px)' }}
          transition={{ type: "spring", damping: 14, stiffness: 100, duration: 1.0 }}
          className={cn(
            "w-56 h-56 rounded-full flex items-center justify-center mb-8 relative",
            rank.id === 'legend' ? 'legend-badge-container' : ''
          )}
          style={{ 
            border: rank.id === 'legend' ? 'none' : `4px solid ${rank.color}`, 
            boxShadow: rank.id === 'legend' ? 'none' : `0 0 80px ${rank.color}40`,
          }}
        >
          {rank.id === 'legend' && <div className="absolute inset-0 rounded-full legend-conic-border" />}
          <span className={cn(
            "text-9xl",
            rank.id === 'legend' ? 'animate-bounce-slow text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.8)]' : ''
          )}>
            {rank.icon}
          </span>
          <motion.div 
            animate={{ scale: [1, 2, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ duration: 0.6, repeat: Infinity, repeatDelay: 1 }}
            className="absolute -inset-4 rounded-full border-4"
            style={{ borderColor: rank.color === 'animated' ? '#ffffff' : rank.color }}
          />
        </motion.div>

        <motion.div
          initial={{ y: 40, opacity: 0, filter: 'blur(12px)' }}
          animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
          transition={{ delay: 0.8, duration: 0.6 }}
        >
          <span className="font-mono text-sm uppercase tracking-[0.6em] opacity-60 mb-2 block">
            Rank Up
          </span>
          <h2
            className={cn(
              "text-7xl md:text-9xl font-display uppercase mb-4 tracking-tighter"
            )}
            style={rank.id !== 'legend' ? { color: rank.color } : {}}
          >
            {rank.id === 'legend' ? <LegendText text={rank.name} /> : rank.name}
          </h2>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.6 }}
          className="italic opacity-90 max-w-md text-xl font-medium"
        >
          "{rank.quote}"
        </motion.p>
      </div>
    </motion.div>
  );
};

// --- Achievement Unlock ---
export const AchievementUnlock = ({ achievement, onComplete }: { achievement: Achievement; onComplete: () => void }) => {
  useEffect(() => {
    // Achievement sound
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const playNote = (freq: number, time: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.setType('triangle');
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0, time);
        gain.gain.linearRampToValueAtTime(0.1, time + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.3);
        osc.start(time);
        osc.stop(time + 0.3);
      };
      [660, 880, 1320].forEach((f, i) => playNote(f, ctx.currentTime + i * 0.08));
    } catch(e) {}

    const timer = setTimeout(onComplete, 5000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div
      initial={{ x: 400, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 400, opacity: 0 }}
      className="fixed bottom-24 right-6 z-[9999] w-80 glass p-5 rounded-[2rem] flex items-center gap-4 border border-white/10 shadow-2xl"
    >
      <motion.div 
        initial={{ scale: 0 }}
        animate={{ scale: [0, 1.3, 1] }}
        transition={{ duration: 0.6, ease: "backOut" }}
        className="w-14 h-14 bg-md-primary/20 rounded-2xl flex items-center justify-center text-3xl shadow-inner"
      >
        {achievement.icon}
      </motion.div>
      <div className="flex-1">
        <h4 className="font-display text-lg text-white leading-tight">{achievement.name}</h4>
        <p className="text-[11px] opacity-70 leading-tight mt-0.5">{achievement.description}</p>
        <div className="mt-2 inline-block bg-md-primary/20 text-md-primary text-[10px] px-3 py-1 rounded-full font-black tracking-wider border border-md-primary/30">
          +{achievement.xpReward} XP
        </div>
      </div>
      <motion.div
        initial={{ width: "100%" }}
        animate={{ width: "0%" }}
        transition={{ duration: 5, ease: "linear" }}
        className="absolute bottom-0 left-0 h-1 bg-md-primary rounded-full"
      />
    </motion.div>
  );
};

// --- Combo Display ---
export const ComboDisplay = ({ combo }: { combo: { multiplier: number, count: number, lastTime: number } }) => {
  const [timeLeft, setTimeLeft] = useState(1);
  
  useEffect(() => {
    const update = () => {
      const elapsed = Date.now() - combo.lastTime;
      const progress = Math.max(0, 1 - elapsed / 60000);
      setTimeLeft(progress);
      if (progress > 0) requestAnimationFrame(update);
    };
    update();
  }, [combo]);

  const comboColor = 
    combo.multiplier >= 5 ? 'var(--rank-champion)' : 
    combo.multiplier >= 4 ? 'var(--rank-master)' : 
    combo.multiplier >= 3 ? 'var(--rank-elite)' : 
    'var(--rank-disciplined)';

  return (
    <AnimatePresence>
      {combo.multiplier > 1 && (
        <motion.div
          initial={{ y: -50, opacity: 0, scale: 0.8 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: -50, opacity: 0, scale: 0.8 }}
          whileHover={{ scale: 1.05 }}
          className="fixed top-24 right-6 z-[500] glass px-6 py-3 rounded-full border-2 flex flex-col items-center gap-1 shadow-2xl overflow-hidden"
          style={{ borderColor: comboColor }}
        >
          <motion.div 
            key={combo.multiplier}
            initial={{ scale: 1.35 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", damping: 10 }}
            className="flex items-center gap-3"
          >
            <span className="font-display text-3xl text-white tracking-tighter">COMBO ×{combo.multiplier}</span>
            <div className="w-3 h-3 rounded-full animate-pulse" style={{ background: comboColor }} />
          </motion.div>
          {/* Decay Bar */}
          <div className="w-full h-1 bg-white/10 rounded-full mt-1 overflow-hidden">
            <motion.div 
              className="h-full"
              style={{ 
                width: `${timeLeft * 100}%`,
                background: comboColor
              }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
