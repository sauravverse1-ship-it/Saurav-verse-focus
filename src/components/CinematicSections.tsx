import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { motion } from 'motion/react';
import { TiltCard } from './CinematicLayout';
import { Zap, Target, TrendingUp, Sparkles, ChevronDown } from 'lucide-react';
import { playTick } from '../lib/audio';
import { cn } from '../lib/utils';

gsap.registerPlugin(ScrollTrigger);

export const HeroSection: React.FC<{ onExplore: () => void }> = ({ onExplore }) => {
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
      { scale: 1, duration: 2.8, ease: "power2.out" }
    , 0);

    // Fog layers drift in
    tl.fromTo('.fog-layer', 
      { opacity: 0, scale: 0.8 },
      { opacity: 1, scale: 1, duration: 2, stagger: 0.3, ease: "power3.out" }
    , 0.2);

    // Card rise
    tl.fromTo('.hero-card',
      { y: 80, opacity: 0, rotateX: 12 },
      { y: 0, opacity: 1, rotateX: 0, duration: 1.4, ease: "expo.out" }
    , 0.6);

    // Split text simulation
    tl.fromTo('.char', {
      y: 40, opacity: 0, rotationX: -90, filter: 'blur(12px)'
    }, {
      y: 0, opacity: 1, rotationX: 0, filter: 'blur(0px)',
      stagger: { each: 0.03, ease: "power2.out" },
      duration: 0.8, ease: "expo.out",
      transformOrigin: "bottom center"
    }, 1.0);

    // Subtitle
    tl.fromTo('.hero-subtitle', {
      y: 20, opacity: 0,
    }, {
      y: 0, opacity: 1,
      duration: 0.6, ease: "power3.out"
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
        {/* CSS Stars */}
        <div className="absolute inset-0 opacity-40">
          {[...Array(isMobile ? 20 : 50)].map((_, i) => (
            <div 
              key={i}
              className="absolute bg-white rounded-full opacity-60"
              style={{
                width: Math.random() * 2 + 'px',
                height: Math.random() * 2 + 'px',
                top: Math.random() * 100 + '%',
                left: Math.random() * 100 + '%',
                opacity: Math.random()
              }}
            />
          ))}
        </div>
        {/* Chromatic aberration vignette overlay (using box shadow) */}
        <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_100px_rgba(255,0,0,0.1),inset_0_0_120px_rgba(0,0,255,0.1)] mix-blend-multiply" />
        
        {/* Fog Layers */}
        <div className={cn("fog-layer absolute top-1/4 left-1/4 w-[60%] h-[60%] bg-md-primary/10 blur-[100px] rounded-full", isMobile && "opacity-50 scale-75")} />
        <div className={cn("fog-layer absolute bottom-1/4 right-1/4 w-[50%] h-[50%] bg-md-secondary/10 blur-[120px] rounded-full", isMobile && "opacity-50 scale-75")} />
      </div>

      {/* Hero Content */}
      <div className="hero-content relative z-10 flex flex-col items-center gap-12 px-6 text-center">
        <div className="flex flex-col gap-4 max-w-[95vw]">
          <span className="text-md-primary font-mono text-sm uppercase tracking-[0.8em] font-black block opacity-80">
            System Initialization
          </span>
          <h1 className="font-display tracking-tighter leading-[0.85] flex flex-wrap justify-center gap-x-4 text-[clamp(36px,10vw,88px)]">
            {titleChars.map((char, i) => (
              <span key={i} className={cn("char inline-block text-white", char === " " ? "w-4 md:w-8" : "")}>{char}</span>
            ))}
          </h1>
        </div>

        <TiltCard intensity={15} className="hero-card max-w-[95vw] md:max-w-lg w-full bg-md-surface-2 border border-md-primary/10 p-[28px_20px] md:p-10 rounded-[28px] md:rounded-3xl shadow-[0_24px_64px_rgba(0,0,0,0.8),0_16px_32px_rgba(0,255,224,0.18)] backdrop-blur-2xl">
          <div className="flex flex-col gap-6 text-left relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-md-primary to-transparent opacity-40 shadow-[0_0_10px_var(--md-primary)]" />
            <div className="w-16 h-16 bg-md-primary-container rounded-2xl flex items-center justify-center border border-md-primary/20">
              <Zap className="w-8 h-8 text-md-primary fill-md-primary" />
            </div>
            <div>
              <h2 className="text-3xl font-display tracking-wide uppercase text-white">The Focus Protocol</h2>
              <p className="hero-subtitle text-md-on-surface-variant mt-3 leading-relaxed font-serif italic text-[clamp(14px,4vw,22px)]">
                "Average is the enemy. RANK 1 is the mission. Welcome to the engine that transforms effort into destiny."
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
};

export const StorySection: React.FC<{ onExplore: () => void }> = ({ onExplore }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const panels = gsap.utils.toArray('.panel');
    
    panels.forEach((panel: any) => {
      ScrollTrigger.create({
        trigger: panel,
        start: 'top top',
        pin: true,
        pinSpacing: false,
        snap: 1
      });

      gsap.from(panel.querySelector('.panel-content'), {
        y: 60,
        opacity: 0,
        duration: 1.2,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: panel,
          start: 'top 60%',
          toggleActions: 'play none none reverse'
        }
      });
    });

    gsap.from('.graph-line', {
      strokeDashoffset: 1000,
      strokeDasharray: 1000,
      duration: 2.5,
      ease: 'power2.inOut',
      scrollTrigger: { trigger: '.graph-section', scrub: 1.5 }
    });
    
    gsap.from('.graph-point', {
      scale: 0, opacity: 0,
      ease: "back.out(2)",
      stagger: 0.1,
      scrollTrigger: { trigger: '.graph-section', start: 'top 40%' }
    });
  }, { scope: containerRef });

  return (
    <div ref={containerRef} className="relative bg-[#04040a]">
      {/* Panel 1: Your Day */}
      <section className="panel min-h-screen w-full flex items-center justify-center px-6 py-20 bg-md-surface/80">
        <div className="panel-content max-w-6xl w-full flex flex-col md:flex-row gap-12 md:gap-20 items-center">
          <div className="flex-1 flex flex-col gap-6 md:gap-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-md-secondary-cont flex items-center justify-center border border-md-secondary/30">
                <Sparkles className="w-6 h-6 text-md-secondary" />
              </div>
              <span className="font-mono text-md-secondary uppercase tracking-[0.4em] text-xs font-bold">Segment Alpha</span>
            </div>
            <h3 className="text-5xl md:text-8xl font-display tracking-tight text-white leading-[0.9]">YOUR DAY.<br/><span className="text-white/30">ARCHITECTED.</span></h3>
            <p className="text-xl md:text-2xl text-md-on-surface-variant leading-relaxed font-serif italic max-w-md">
              "We build our habits, and then our habits build us." 
              Integrated bio-tracking for elite performance.
            </p>
          </div>
          <div className="flex-1 w-full max-w-sm md:max-w-none mx-auto">
            <TiltCard intensity={20}>
              <div className="bg-md-surface-3 p-8 md:p-12 rounded-[2rem] aspect-square flex items-center justify-center shadow-[0_24px_64px_rgba(0,0,0,0.8)] border border-white/5 relative">
                  <div className="absolute inset-0 bg-md-secondary/10 opacity-40 blur-3xl animate-pulse rounded-full" />
                  <div className="w-full h-full border border-md-secondary/20 rounded-[1.5rem] relative overflow-hidden backdrop-blur-md bg-white/5">
                    <div className="p-6 md:p-8 space-y-6">
                       <div className="flex gap-2">
                          <div className="h-4 w-4 bg-md-secondary rounded-full" />
                          <div className="h-4 w-4 bg-md-secondary/20 rounded-full" />
                          <div className="h-4 w-4 bg-md-secondary/20 rounded-full" />
                       </div>
                       <div className="space-y-3">
                          <div className="h-10 w-full bg-md-secondary/10 rounded-xl" />
                          <div className="h-10 w-2/3 bg-md-secondary/10 rounded-xl" />
                       </div>
                    </div>
                  </div>
              </div>
            </TiltCard>
          </div>
        </div>
      </section>

      {/* Panel 2: Focus */}
      <section className="panel min-h-screen w-full flex items-center justify-center px-6 py-20 bg-[#06060c]">
        <div className="panel-content max-w-6xl w-full flex flex-col md:flex-row-reverse gap-12 md:gap-20 items-center">
          <div className="flex-1 flex flex-col gap-6 md:gap-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-md-primary-container flex items-center justify-center border border-md-primary/30">
                <Target className="w-6 h-6 text-md-primary" />
              </div>
              <span className="font-mono text-md-primary uppercase tracking-[0.4em] text-xs font-bold">Segment Beta</span>
            </div>
            <h3 className="text-5xl md:text-8xl font-display tracking-tight text-white leading-[0.9]">DEEP WORK.<br/><span className="text-white/30">QUANTIZED.</span></h3>
            <p className="text-xl md:text-2xl text-md-on-surface-variant leading-relaxed font-serif italic max-w-md">
              A timer that feels like a mission control. 
              Visual cues optimized for dopamine management.
            </p>
          </div>
          <div className="flex-1 w-full max-w-sm md:max-w-none mx-auto">
            <TiltCard intensity={20}>
              <div className="bg-md-surface-3 p-8 md:p-12 rounded-[3rem] aspect-square flex items-center justify-center shadow-[0_24px_64px_rgba(0,0,0,0.8)] relative group border border-white/5">
                  <div className="absolute inset-0 bg-md-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-[80px]" />
                  <div className="w-48 h-48 md:w-64 md:h-64 rounded-full border-[2px] border-white/10 flex items-center justify-center relative md:scale-110 shadow-[0_0_50px_rgba(0,255,224,0.1)]">
                    <div className="absolute inset-0 border-[6px] border-md-primary rounded-full shadow-[0_0_20px_rgba(0,255,224,0.3)]" />
                    <span className="text-5xl md:text-7xl font-display text-white text-glow tracking-widest drop-shadow-[0_0_15px_rgba(0,255,224,0.5)]">25:00</span>
                  </div>
              </div>
            </TiltCard>
          </div>
        </div>
      </section>

      {/* Panel 3: Growth */}
      <section className="panel graph-section min-h-screen w-full flex items-center justify-center px-6 py-20 pb-32 bg-md-surface border-t border-white/5">
         <div className="panel-content max-w-6xl w-full flex flex-col gap-8 md:gap-12 pt-12 md:pt-0">
            <div className="text-center flex flex-col items-center gap-4">
               <span className="font-mono text-md-tertiary uppercase tracking-[0.4em] text-xs font-bold">Segment Gamma</span>
               <h3 className="text-4xl sm:text-5xl md:text-8xl font-display tracking-tight text-white">EXPONENTIAL GROWTH.</h3>
            </div>
            <div className="w-full bg-md-surface-2 p-6 md:p-12 rounded-[2rem] border border-white/5 h-[200px] sm:h-[300px] md:h-[400px] shadow-2xl relative overflow-hidden">
               <div className="absolute bottom-0 left-0 w-full h-[60%] bg-gradient-to-t from-md-tertiary/10 to-transparent pointer-events-none" />
               <svg className="w-full h-full relative z-10" viewBox="0 0 1000 300" preserveAspectRatio="none">
                  <path 
                    className="graph-line"
                    d="M 50 250 Q 250 230 400 150 T 650 100 T 950 40"
                    fill="none"
                    stroke="var(--md-tertiary)"
                    strokeWidth="6"
                    strokeLinecap="round"
                    style={{ filter: "drop-shadow(0 0 15px rgba(212,168,67,0.5))" }}
                  />
                  {[50, 400, 650, 950].map((x, i) => (
                    <circle key={i} cx={x} cy={i === 0 ? 250 : i === 1 ? 150 : i === 2 ? 100 : 40} r="8" className="graph-point fill-md-tertiary" />
                  ))}
               </svg>
            </div>
            
            <div className="flex justify-center mt-4 md:mt-8 pb-12 md:pb-0 z-50 relative">
               <button 
                onClick={onExplore}
                onMouseEnter={playTick}
                className="w-full md:w-auto px-12 py-6 bg-md-tertiary text-md-tertiary-cont border-none rounded-full font-mono font-bold hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 uppercase tracking-[0.2em] text-[10px] md:text-xs shadow-[0_16px_48px_rgba(212,168,67,0.3)] hover:shadow-[0_24px_64px_rgba(212,168,67,0.5)]"
               >
                 Launch Dashboard
               </button>
            </div>
         </div>
      </section>
    </div>
  );
};
