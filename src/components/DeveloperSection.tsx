import React, { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { motion } from 'motion/react';
import { playTick } from '../lib/audio';
import { ExternalLink, Github, Twitter, Mail, Send } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

export const DeveloperSection: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const tl = gsap.timeline({
      scrollTrigger: { 
        trigger: '#developer-card-modern', 
        start: 'top 95%',
        toggleActions: 'play none none reverse'
      }
    });

    tl.from('.modern-dev-card', { y: 60, opacity: 0, duration: 1.2, ease: 'expo.out' })
      .from('.modern-avatar-frame', { scale: 0.5, rotate: -15, opacity: 0, duration: 1, ease: 'back.out(1.7)' }, '-=0.8')
      .from('.modern-content > *', { x: -20, opacity: 0, stagger: 0.15, duration: 0.6 }, '-=0.6');
  }, { scope: containerRef });

  return (
    <div id="developer-card-modern" ref={containerRef} className="w-full py-12 px-4">
      <div className="modern-dev-card relative bg-[#0a0a10] border border-white/5 rounded-[3rem] overflow-hidden shadow-2xl p-8 md:p-12">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/5 blur-[120px] -mr-64 -mt-64 rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-md-primary/5 blur-[100px] -ml-32 -mb-32 rounded-full pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-12">
          {/* Photo Frame */}
          <div className="modern-avatar-frame shrink-0 relative">
            <div className="w-48 h-48 md:w-56 md:h-56 rounded-[2.5rem] p-1 bg-gradient-to-br from-white/20 via-white/5 to-transparent shadow-2xl">
               <div className="w-full h-full rounded-[2.2rem] overflow-hidden bg-zinc-900 border border-white/10">
                  <img 
                    src="data:image/jpeg;base64,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 " 
                    alt="Saurav Verse" 
                    referrerPolicy="no-referrer"
                    crossOrigin="anonymous"
                    className="w-full h-full object-cover transform hover:scale-110 transition-transform duration-1000"
                  />
               </div>
            </div>
            
            {/* Status Indicator */}
            <div className="absolute -top-2 -right-2 bg-zinc-950 border border-white/10 rounded-2xl px-4 py-2 flex items-center gap-2 shadow-xl">
               <div className="w-2 h-2 rounded-full bg-md-primary animate-pulse shadow-[0_0_8px_var(--md-primary)]" />
               <span className="text-[10px] font-black uppercase tracking-widest text-white/60">Online</span>
            </div>
          </div>

          {/* Bio Content */}
          <div className="modern-content flex-1 flex flex-col gap-6 text-center md:text-left">
            <div className="space-y-2">
              <span className="inline-block px-3 py-1 bg-md-primary/10 text-md-primary rounded-full text-[9px] font-black uppercase tracking-[0.3em] border border-md-primary/20">
                Founding Developer
              </span>
              <h3 className="text-4xl md:text-5xl font-black tracking-tight text-white italic">SAURAV VERSE</h3>
            </div>

            <p className="text-zinc-400 text-base md:text-lg leading-relaxed font-serif italic opacity-80 max-w-xl">
              "Building Quantum isn't just about productivity; it's about engineering a system that respects your time and ambition. Every pixel is crafted to propel you forward."
            </p>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-2">
               {[
                 { icon: Send, label: 'Telegram', url: 'https://t.me/sauravverse', color: 'blue' },
                 { icon: Github, label: 'GitHub', url: 'https://github.com/sauravverse', color: 'zinc' },
                 { icon: Mail, label: 'Connect', url: 'mailto:sauravverse1@gmail.com', color: 'white' }
               ].map((item, i) => (
                 <motion.button
                   key={i}
                   whileHover={{ y: -4, scale: 1.02 }}
                   whileTap={{ scale: 0.98 }}
                   onClick={() => {
                     playTick();
                     if (item.url !== '#') window.open(item.url, '_blank');
                   }}
                   className="flex items-center gap-3 px-6 py-3 bg-white/[0.03] border border-white/10 rounded-2xl hover:bg-white/[0.07] hover:border-white/20 transition-all group"
                 >
                   <item.icon className="w-4 h-4 text-white/40 group-hover:text-md-primary transition-colors" />
                   <span className="text-[11px] font-black uppercase tracking-widest text-white/50 group-hover:text-white transition-colors">{item.label}</span>
                 </motion.button>
               ))}
            </div>
          </div>
        </div>

        {/* System Bar */}
        <div className="mt-12 pt-6 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4 opacity-30">
          <div className="flex items-center gap-6">
            <span className="text-[9px] font-mono tracking-widest uppercase">ID: VERSE.SYS.99</span>
            <span className="text-[9px] font-mono tracking-widest uppercase">Region: ASIA-SOUTH-1</span>
          </div>
          <p className="text-[9px] font-mono tracking-widest uppercase">© 2026 Quantum Technologies</p>
        </div>
      </div>
    </div>
  );
};
