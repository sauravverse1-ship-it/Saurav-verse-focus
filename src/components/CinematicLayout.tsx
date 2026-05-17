import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { cn } from '../lib/utils';

interface TiltCardProps {
  children: React.ReactNode;
  className?: string;
  intensity?: number;
}

export const TiltCard: React.FC<TiltCardProps> = ({ children, className, intensity = 15 }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const shineRef = useRef<HTMLDivElement>(null);
  const rect = useRef<DOMRect | null>(null);
  const rafId = useRef<number | null>(null);

  const handleMouseEnter = () => {
    if (cardRef.current) {
        rect.current = cardRef.current.getBoundingClientRect();
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current || !rect.current) return;
    
    if (rafId.current) cancelAnimationFrame(rafId.current);
    
    rafId.current = requestAnimationFrame(() => {
      const { left, top, width, height } = rect.current!;
      const x = e.clientX - left;
      const y = e.clientY - top;
      
      const cx = (x / width) - 0.5;
      const cy = (y / height) - 0.5;

      gsap.to(cardRef.current, {
        rotateX: -cy * intensity * 2,
        rotateY: cx * intensity * 2,
        z: 30, scale: 1.02,
        duration: 0.35,
        ease: "power2"
      });

      if (shineRef.current) {
        gsap.to(shineRef.current, {
          opacity: 1,
          background: `radial-gradient(circle at ${(cx+0.5)*100}% ${(cy+0.5)*100}%, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.06) 30%, transparent 65%)`,
          duration: 0.1,
        });
      }
      
      cardRef.current?.style.setProperty('--mx', `${(cx+0.5)*100}%`);
      cardRef.current?.style.setProperty('--my', `${(cy+0.5)*100}%`);
    });
  };

  const handleMouseLeave = () => {
    if (rafId.current) cancelAnimationFrame(rafId.current);
    if (!cardRef.current) return;
    
    gsap.to(cardRef.current, {
      rotateX: 0, rotateY: 0,
      z: 0, scale: 1,
      duration: 0.9,
      ease: "elastic.out(1, 0.45)"
    });
    
    if (shineRef.current) {
      gsap.to(shineRef.current, { opacity: 0, duration: 0.4 });
    }
  };

  return (
    <div 
      className="perspective-1000 w-full h-full interactive"
      onMouseEnter={handleMouseEnter}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <div 
        ref={cardRef}
        className={cn(
          "preserve-3d relative transition-shadow duration-300 will-change-transform",
          className
        )}
      >
        <div 
          ref={shineRef}
          className="absolute inset-0 pointer-events-none opacity-0 z-10 mix-blend-screen rounded-[inherit]"
        />
        {children}
      </div>
    </div>
  );
};

export const MagneticButton: React.FC<{ children: React.ReactNode; className?: string; onClick?: () => void; title?: string }> = ({ children, className, onClick, title }) => {
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const btn = buttonRef.current;
    if (!btn) return;

    const move = (e: MouseEvent) => {
      const { left, top, width, height } = btn.getBoundingClientRect();
      const x = e.clientX - (left + width / 2);
      const y = e.clientY - (top + height / 2);
      
      gsap.to(btn, {
        x: x * 0.4,
        y: y * 0.4,
        duration: 0.5,
        ease: 'power2.out',
      });
    };

    const reset = () => {
      gsap.to(btn, {
        x: 0, y: 0,
        duration: 0.9,
        ease: 'elastic.out(1, 0.4)',
      });
    };

    btn.addEventListener('mousemove', move);
    btn.addEventListener('mouseleave', reset);
    return () => {
      btn.removeEventListener('mousemove', move);
      btn.removeEventListener('mouseleave', reset);
    };
  }, []);

  return (
    <button 
      ref={buttonRef} 
      onClick={onClick}
      className={cn("relative z-10 interactive", className)}
      title={title}
    >
      {children}
    </button>
  );
};
