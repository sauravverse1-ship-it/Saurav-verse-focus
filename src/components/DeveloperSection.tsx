import React, { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { motion } from 'motion/react';
import { playTick } from '../lib/audio';

gsap.registerPlugin(ScrollTrigger);

export const DeveloperSection: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    // Scroll reveal timeline
    const tl = gsap.timeline({
      scrollTrigger: { trigger: '#developer', start: 'top 70%' }
    });
    tl.from('.dev-bg-particles', { opacity: 0, duration: 1.5 }, 0)
      .from('.dev-photo-wrap', { scale: 0.3, opacity: 0, duration: 1.2, ease: "expo.out" }, 0.3)
      .from('.dev-ring-svg', { rotate: -180, duration: 1.5, ease: "power2.out", transformOrigin: "center" }, 0.3)
      .from('.dev-name', { y: 40, opacity: 0, filter: 'blur(12px)', duration: 1, ease: "expo.out" }, 0.7)
      .from('.dev-role', { y: 20, opacity: 0, duration: 0.7, ease: "power2.out" }, 0.9)
      .from('.dev-bio', { y: 20, opacity: 0, duration: 0.7 }, 1.1)
      .from('.dev-tag', { scale: 0, opacity: 0, stagger: 0.08, ease: "back.out(2)", duration: 0.5 }, 1.3)
      .from('.dev-cta', { y: 30, opacity: 0, scale: 0.9, duration: 0.8, ease: "back.out(1.7)" }, 1.7)
      .from('.dev-connection-lines path', { strokeDashoffset: 200, stagger: 0.1, duration: 0.8 }, 1.4);
  }, { scope: containerRef });

  return (
    <section id="developer" ref={containerRef} className="relative min-h-screen w-full flex items-center justify-center py-24 overflow-hidden bg-transparent">
      {/* Background Layers */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-tr from-[#7b5fe8]/10 to-[#00ffe0]/10 blur-3xl opacity-30" />
        
        {/* Cinematic Grit/Grain Background Overlay */}
        <div className="absolute inset-0 opacity-[0.05] pointer-events-none mix-blend-overlay" 
             style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Ffilter id='n' %3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")` }} />

        <div className="dev-bg-particles absolute inset-0 opacity-30">
           {/* Drastically reduced particles to prevent initial render lag */}
           {[...Array(20)].map((_, i) => (
            <div key={i} className="absolute bg-white rounded-full opacity-50" style={{ width: Math.random() * 2 + 'px', height: Math.random() * 2 + 'px', top: Math.random() * 100 + '%', left: Math.random() * 100 + '%' }} />
           ))}
        </div>
        <svg className="dev-connection-lines absolute inset-0 w-full h-full pointer-events-none" style={{ opacity: 0.15 }}>
          <path d="M50% 50% Q 60% 40%, 70% 30%" stroke="var(--md-primary)" strokeWidth="1" strokeDasharray="6,4" fill="none" />
        </svg>
        {/* Internal grid removed to use global fixed cinematic grid */}
        
        <div className="absolute bottom-0 left-0 w-full h-64 bg-gradient-to-t from-[#020206] to-transparent" />
      </div>

      <div className="relative z-20 flex flex-col items-center text-center max-w-3xl px-6">
        {/* Profile Photo */}
        <div className="dev-photo-wrap relative w-48 h-48 md:w-64 md:h-64 mb-8 group">
          <div className="absolute inset-0 rounded-full border-4 border-[rgba(0,255,224,0.4)] shadow-[0_0_0_12px_rgba(0,255,224,0.08),0_0_0_24px_rgba(0,255,224,0.04),0_0_80px_rgba(0,255,224,0.3)] overflow-hidden transition-all duration-700 ease-out group-hover:scale-105 group-hover:shadow-[0_0_0_12px_rgba(0,255,224,0.15),0_0_0_24px_rgba(0,255,224,0.08),0_0_100px_rgba(0,255,224,0.4)]">
            <img 
              src="https://storage.googleapis.com/bit-p-storage-v1-production-09c0/865131783853/ais-attachments/8b4952d7-9ea8-4b72-9721-e37604f86d63/1745591560943.png" 
              alt="Saurav Verse" 
              className="w-full h-full object-cover filter grayscale-[0.1] transition-all duration-300 hover:grayscale-0"
            />
          </div>
          {/* Neon ring animation */}
          <div className="absolute -inset-4 rounded-full border border-md-primary/20 animate-[spin_10s_linear_infinite] pointer-events-none" />
          <div className="absolute -inset-8 rounded-full border border-md-secondary/10 animate-[spin_15s_linear_infinite_reverse] pointer-events-none" />
          <svg className="dev-ring-svg absolute -inset-6 w-[calc(100%+3rem)] h-[calc(100%+3rem)] pointer-events-none animate-[spin_20s_linear_infinite] group-hover:animate-[spin_10s_linear_infinite]" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="48" fill="none" stroke="var(--md-primary)" strokeWidth="1" strokeDasharray="4 8" opacity="0.3" />
          </svg>
          <div className="absolute top-0 left-1/2 -ml-1 w-2 h-2 bg-md-primary rounded-full shadow-[0_0_10px_var(--md-primary)] animate-[spin_20s_linear_infinite] group-hover:animate-[spin_10s_linear_infinite] origin-[center_176px]" />
        </div>

        <h2 className="dev-name text-5xl md:text-7xl font-display bg-clip-text text-transparent bg-gradient-to-r from-[#00ffe0] to-[#7b5fe8] mb-2">SAURAV VERSE</h2>
        <p className="dev-role font-mono text-[10px] md:text-xs tracking-[0.3em] text-md-on-surface-variant uppercase mb-8">Developer · Designer · Builder</p>

        <p className="dev-bio text-lg md:text-xl font-serif italic text-md-on-surface-variant max-w-xl mx-auto mb-10 leading-relaxed">
          "Crafting digital experiences that feel like cinema. Obsessed with performance, design, and the space between code and art."
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3 mb-12">
          {['React', 'GSAP', 'UI/UX', 'Performance', 'Creative Dev', 'Android'].map((tag, i) => (
            <span key={i} className="dev-tag px-4 py-2 bg-white/5 border border-white/10 rounded-full font-mono text-[10px] uppercase tracking-wider hover:bg-md-primary/10 hover:border-md-primary/30 hover:text-md-primary hover:shadow-[0_0_15px_rgba(0,255,224,0.2)] transition-all cursor-default">
              {tag}
            </span>
          ))}
        </div>

        <button 
          onClick={() => {
            playTick();
            window.open('https://sauravverseinfo.netlify.app', '_blank');
          }}
          onMouseEnter={playTick}
          className="dev-cta relative overflow-hidden group w-64 py-5 bg-md-surface-2 rounded-2xl border border-white/10 hover:border-md-primary/50 flex flex-col items-center justify-center transition-all duration-300 shadow-[0_4px_20px_rgba(0,0,0,0.5)] hover:shadow-[0_0_30px_rgba(0,255,224,0.2)] active:scale-95"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-md-primary/10 to-transparent group-hover:translate-x-full transition-transform duration-1000 -translate-x-full opacity-0 group-hover:opacity-100" />
          <span className="font-mono text-sm uppercase tracking-widest font-bold flex items-center gap-2 text-white">
            Visit Portfolio 
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </span>
        </button>
      </div>
    </section>
  );
};
