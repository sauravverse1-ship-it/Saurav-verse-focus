import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { motion, useScroll, useTransform, useSpring } from 'motion/react';
import { TiltCard } from './CinematicLayout';
import { Zap, Target, TrendingUp, Sparkles, ChevronDown } from 'lucide-react';
import { playTick } from '../lib/audio';
import { cn } from '../lib/utils';


export const HeroSection: React.FC<{ onExplore: () => void }> = React.memo(({ onExplore }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = React.useState(false);

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
    const cb = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', cb);
    return () => window.removeEventListener('resize', cb);
  }, []);

  useGSAP(() => {
    const tl = gsap.timeline({ delay: 0.3 });
    
    // Background cinematic zoom
    tl.fromTo(bgRef.current, 
      { scale: 1.12 }, 
      { scale: 1, duration: 2.8, ease: "power2.inOut" }
    , 0);

    // Fog layers drift in
    tl.fromTo('.fog-layer', 
      { opacity: 0, scale: 0.8 },
      { opacity: 1, scale: 1, duration: 2, stagger: 0.3, ease: "power2.out" }
    , 0.2);

    // Card rise
    tl.fromTo('.hero-card',
      { y: 80, opacity: 0, rotateX: 12 },
      { y: 0, opacity: 1, rotateX: 0, duration: 1.4, ease: "expo.out" }
    , 0.6);

    // Jittery entrance for title
    tl.fromTo('.char', {
      x: () => (Math.random() - 0.5) * 40,
      y: () => (Math.random() - 0.5) * 40,
      opacity: 0,
    }, {
      x: 0,
      y: 0,
      opacity: 1,
      stagger: { each: 0.015, from: "center" },
      duration: 1.0,
      ease: "rough({ template: expo.out, strength: 1.5, points: 15 })"
    }, 1.2);

    // Subtitle
    tl.fromTo('.hero-subtitle', {
      y: 20, opacity: 0,
    }, {
      y: 0, opacity: 1,
      duration: 0.6, ease: "power2.out"
    }, 1.6);

    tl.fromTo('.hero-btn', {
      y: 30, opacity: 0, scale: 0.9,
    }, {
      y: 0, opacity: 1, scale: 1,
      duration: 0.7, ease: "back.out(1.7)"
    }, 2.0);

    // Parallax
    const moveParallax = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      const x = (e.clientX - innerWidth / 2) / innerWidth;
      const y = (e.clientY - innerHeight / 2) / innerHeight;
      
      gsap.to('.hero-content', { x: x * 20, y: y * 20, duration: 1.5, ease: 'power3.out' });
      gsap.to('.parallax-bg', { x: x * 10, y: y * 10, duration: 2, ease: 'power3.out' });
    };

    window.addEventListener('mousemove', moveParallax);
    return () => window.removeEventListener('mousemove', moveParallax);
  }, { scope: containerRef });

  const titleChars = "DISCIPLINE BUILDS RANK".split("");

  return (
    <div ref={containerRef} className="relative h-screen w-full flex items-center justify-center overflow-hidden bg-[#04040a]">
      {/* Background Layers */}
      <div 
        ref={bgRef}
        className="parallax-bg absolute inset-0 z-0"
      >
        {/* Blood splatter simulation (Red blurred circles) - Optimized */}
        <div className="absolute inset-0 opacity-30 mix-blend-screen isolate transform-gpu pointer-events-none">
          {[...Array(3)].map((_, i) => (
            <div 
              key={i}
              className="absolute bg-red-700/20 blur-[80px] rounded-full will-change-[transform,opacity]"
              style={{
                width: Math.random() * 300 + 150 + 'px',
                height: Math.random() * 300 + 150 + 'px',
                top: Math.random() * 100 + '%',
                left: Math.random() * 100 + '%',
              }}
            />
          ))}
        </div>
        
        {/* Fog Layers - Optimized */}
        <div className={cn("fog-layer absolute top-1/4 left-1/4 w-[50%] h-[50%] bg-orange-600/10 blur-[80px] rounded-full will-change-transform transform-gpu", isMobile && "opacity-40 scale-75")} />
        <div className={cn("fog-layer absolute bottom-1/4 right-1/4 w-[40%] h-[40%] bg-red-600/10 blur-[100px] rounded-full will-change-transform transform-gpu", isMobile && "opacity-40 scale-75")} />
      </div>

      {/* Hero Content */}
      <div className="hero-content relative z-10 flex flex-col items-center gap-12 px-6 text-center w-full max-w-full overflow-hidden">
        <div className="flex flex-col gap-4 w-full">
          <span className="text-orange-500 font-mono text-[10px] md:text-sm uppercase tracking-[0.4em] md:tracking-[0.8em] font-black block animate-jitter opacity-80">
            PUBLIC SAFETY PROTOCOL ACTIVATED
          </span>
          <h1 className="font-display tracking-tighter leading-[0.85] flex flex-wrap justify-center content-center gap-x-2 md:gap-x-4 text-[clamp(44px,12vw,88px)] w-full">
            {"SURVIVAL IS YOUR ONLY MISSION".split(" ").map((word, wordIdx) => (
              <span key={wordIdx} className="whitespace-nowrap inline-flex">
                {word.split("").map((char, charIdx) => (
                  <span key={charIdx} className="char inline-block text-white select-none italic font-black will-change-[transform,opacity]">{char}</span>
                ))}
              </span>
            ))}
          </h1>
        </div>

        <TiltCard intensity={15} className="hero-card max-w-[95vw] md:max-w-lg w-full bg-neutral-900 border border-orange-500/20 p-[28px_20px] md:p-10 rounded-[2rem] md:rounded-[3rem] shadow-[0_24px_64px_rgba(0,0,0,0.8),0_16px_32px_rgba(234,88,12,0.15)] backdrop-blur-2xl">
          <div className="flex flex-col gap-6 text-left relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-orange-500 to-transparent opacity-40 shadow-[0_0_10px_#ea580c]" />
            <div className="w-16 h-16 bg-orange-600/20 rounded-2xl flex items-center justify-center border border-orange-500/30">
              <Zap className="w-8 h-8 text-orange-500 fill-orange-500" />
            </div>
            <div>
              <h2 className="text-3xl font-display font-black tracking-wide uppercase text-white italic">The Grind Contract</h2>
              <p className="hero-subtitle text-white/50 mt-3 leading-relaxed font-mono text-[clamp(14px,4.5vw,18px)]">
                "DEVILS ARE BORN FROM FEAR. SUCCESS IS BORN FROM BLOOD. MAKE A CONTRACT WITH THE GRIND AND DON'T LOOK BACK."
              </p>
            </div>
          </div>
        </TiltCard>

        <button 
          onClick={onExplore}
          onMouseEnter={playTick}
          className="hero-btn group relative w-full md:w-auto flex-col md:flex-row flex items-center justify-center gap-3 px-12 py-6 bg-md-primary text-md-on-primary border-none rounded-[28px] md:rounded-full font-mono font-bold uppercase tracking-[0.3em] text-xs hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 shadow-[0_16px_48px_rgba(0,255,224,0.3)] hover:shadow-[0_24px_64px_rgba(0,255,224,0.5)]"
        >
          <span>Initialize Engine</span>
          <ChevronDown className="hidden md:block absolute -bottom-16 left-1/2 -translate-x-1/2 w-10 h-10 text-md-primary/60 animate-bounce" />
        </button>
      </div>
    </div>
  );
});

export const StorySection: React.FC<{ onExplore: () => void }> = React.memo(({ onExplore }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  return (
    <div ref={containerRef} className="relative bg-[#04040a] perspective-2000">
      {/* Panel 1: Your Day */}
      <section className="panel min-h-screen w-full flex items-center justify-center px-6 py-20 bg-neutral-900 overflow-hidden perspective-[2000px]">
        <ScrollAnimatedRow progress={smoothProgress} index={0}>
          <div className="flex-1 flex flex-col gap-6 md:gap-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-orange-600/20 flex items-center justify-center border border-orange-500/30">
                <Target className="w-6 h-6 text-orange-500" />
              </div>
              <span className="font-mono text-orange-500 uppercase tracking-[0.4em] text-xs font-bold">Contract Alpha</span>
            </div>
            <h3 className="text-5xl md:text-8xl font-display font-black tracking-tight text-white leading-[0.9] italic">MASTER THE<br /><span className="text-orange-500">REFLEXES.</span></h3>
            <p className="text-xl md:text-2xl text-white/40 leading-relaxed font-mono italic max-w-md uppercase tracking-tight">
              "DON'T JUST DO IT. SLAUGHTER THE DAY. EVERY SECOND IS A CHOICE."
            </p>
          </div>
          <div className="flex-1 w-full max-w-sm md:max-w-none mx-auto">
            <TiltCard intensity={20}>
              <div className="bg-neutral-800 p-8 md:p-12 rounded-[2rem] aspect-square flex items-center justify-center shadow-[0_24px_64px_rgba(0,0,0,0.8)] border border-white/5 relative overflow-hidden group">
                  <div className="absolute inset-0 bg-orange-500/10 opacity-40 blur-3xl rounded-full" />
                  <div className="w-full h-full border border-orange-500/20 rounded-[1.5rem] relative overflow-hidden backdrop-blur-md bg-black/40 p-6 flex flex-col gap-4">
                     <div className="flex gap-2">
                        <div className="h-4 w-4 bg-orange-600 rounded-full" />
                        <div className="h-4 w-4 bg-orange-600/20 rounded-full" />
                        <div className="h-4 w-4 bg-orange-600/20 rounded-full" />
                     </div>
                     <div className="space-y-4 pt-4">
                        <div className="h-4 w-full bg-orange-500/10 rounded-full" />
                        <div className="h-4 w-2/3 bg-orange-500/10 rounded-full" />
                        <div className="h-24 w-full bg-orange-500/5 rounded-2xl" />
                     </div>
                  </div>
              </div>
            </TiltCard>
          </div>
        </ScrollAnimatedRow>
      </section>

      {/* Panel 2: Focus */}
      <section className="panel min-h-screen w-full flex items-center justify-center px-6 py-20 bg-black overflow-hidden perspective-[2000px]">
        <ScrollAnimatedRow progress={smoothProgress} index={1} reverse>
          <div className="flex-1 flex flex-col gap-6 md:gap-8 text-right items-end">
            <div className="flex items-center gap-4">
              <span className="font-mono text-red-500 uppercase tracking-[0.4em] text-xs font-bold">Contract Beta</span>
              <div className="w-12 h-12 rounded-2xl bg-red-600/20 flex items-center justify-center border border-red-500/30">
                <TrendingUp className="w-6 h-6 text-red-500" />
              </div>
            </div>
            <h3 className="text-5xl md:text-8xl font-display font-black tracking-tight text-white leading-[0.9] text-right italic">TOTAL<br /><span className="text-red-600">EXCISION.</span></h3>
            <p className="text-xl md:text-2xl text-white/40 leading-relaxed font-mono italic max-w-md text-right uppercase tracking-tight">
              "DISTRACTION IS A FIEND. RIP IT OUT. BLOOD ON THE CANVAS."
            </p>
          </div>
          <div className="flex-1 w-full max-w-sm md:max-w-none mx-auto">
            <TiltCard intensity={20}>
              <div className="bg-neutral-800 p-8 md:p-12 rounded-[3rem] aspect-square flex items-center justify-center shadow-[0_24px_64px_rgba(0,0,0,0.8)] relative group border border-white/5 overflow-hidden">
                  <div className="absolute inset-0 bg-red-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-[80px]" />
                  <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-red-600/50 to-transparent animate-slash" />
                  <div className="w-48 h-48 md:w-64 md:h-64 rounded-full border-[2px] border-white/10 flex items-center justify-center relative md:scale-110 shadow-[0_0_50px_rgba(220,38,38,0.1)] bg-black/40 backdrop-blur-xl">
                    <div className="absolute inset-0 border-[6px] border-red-600 rounded-full shadow-[0_0_20px_rgba(220,38,38,0.3)]" />
                    <span className="text-5xl md:text-7xl font-display font-black text-white italic tracking-widest text-[#dc2626]">25:00</span>
                  </div>
              </div>
            </TiltCard>
          </div>
        </ScrollAnimatedRow>
      </section>

      {/* Panel 3: Growth */}
      <section className="panel graph-section min-h-screen w-full flex items-center justify-center px-6 py-20 pb-32 bg-neutral-900 border-t border-white/5 overflow-hidden perspective-[2000px]">
         <ScrollAnimatedRow progress={smoothProgress} index={2}>
          <div className="panel-content max-w-6xl w-full flex flex-col gap-8 md:gap-12 pt-12 md:pt-0">
              <div className="text-center flex flex-col items-center gap-4">
                 <span className="font-mono text-yellow-500 uppercase tracking-[0.4em] text-xs font-bold">Segment Gamma</span>
                 <h3 className="text-4xl sm:text-5xl md:text-8xl font-display font-black tracking-tight text-white italic">INFINITE SLAUGHTER.</h3>
              </div>
              <div className="w-full bg-black/40 p-6 md:p-12 rounded-[2rem] border border-white/5 h-[200px] sm:h-[300px] md:h-[400px] shadow-2xl relative overflow-hidden backdrop-blur-3xl">
                 <div className="absolute bottom-0 left-0 w-full h-[60%] bg-gradient-to-t from-orange-600/15 to-transparent pointer-events-none" />
                 <svg className="w-full h-full relative z-10" viewBox="0 0 1000 300" preserveAspectRatio="none">
                    <path 
                      className="graph-line"
                      d="M 50 250 Q 250 230 400 150 T 650 100 T 950 40"
                      fill="none"
                      stroke="#ea580c"
                      strokeWidth="8"
                      strokeLinecap="round"
                      style={{ filter: "drop-shadow(0 0 15px rgba(234,88,12,0.5))" }}
                    />
                    {[50, 400, 650, 950].map((x, i) => (
                      <circle key={i} cx={x} cy={i === 0 ? 250 : i === 1 ? 150 : i === 2 ? 100 : 40} r="10" className="fill-orange-500" />
                    ))}
                 </svg>
              </div>
              
              <div className="flex justify-center mt-4 md:mt-8 pb-12 md:pb-0 z-50 relative">
                 <button 
                  onClick={onExplore}
                  onMouseEnter={playTick}
                  className="w-full md:w-auto px-16 py-8 bg-orange-600 text-white border-none rounded-full font-display font-black hover:scale-[1.05] active:scale-[0.95] transition-all duration-300 uppercase tracking-[0.1em] text-2xl md:text-3xl shadow-[0_16px_64px_rgba(234,88,12,0.4)] hover:shadow-[0_24px_80px_rgba(234,88,12,0.6)] italic"
                 >
                   INITIATE EXTERMINATION
                 </button>
              </div>
           </div>
         </ScrollAnimatedRow>
      </section>
    </div>
  );
});

const ScrollAnimatedRow: React.FC<{ 
  children: React.ReactNode, 
  progress: any, 
  index: number,
  reverse?: boolean 
}> = ({ children, progress, index, reverse }) => {
  const start = index * 0.3;
  const end = (index + 1) * 0.3;
  
  const opacity = useTransform(progress, [start, start + 0.1, end - 0.1, end], [0, 1, 1, 0]);
  const scale = useTransform(progress, [start, start + 0.1, end], [0.8, 1, 1.15]);
  const rotateX = useTransform(progress, [start, start + 0.15, end], [30, 0, -30]);
  const rotateY = useTransform(progress, [start, start + 0.15, end], [reverse ? -15 : 15, 0, reverse ? 15 : -15]);
  const y = useTransform(progress, [start, start + 0.15, end], [150, 0, -150]);
  const z = useTransform(progress, [start, start + 0.1, end], [-500, 0, 200]);

  return (
    <motion.div 
      style={{ opacity, scale, rotateX, rotateY, y, z, transformStyle: 'preserve-3d' }}
      className={cn(
        "max-w-6xl w-full flex flex-col gap-12 md:gap-20 items-center transform-gpu",
        reverse ? "md:flex-row-reverse" : "md:flex-row"
      )}
    >
      {children}
    </motion.div>
  );
};
