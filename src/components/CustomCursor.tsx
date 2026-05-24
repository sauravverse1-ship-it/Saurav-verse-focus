import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

export const CustomCursor: React.FC = () => {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(true);

  useEffect(() => {
    const isCoarse = window.matchMedia('(pointer: coarse)').matches;
    setIsMobile(isCoarse);
    if (isCoarse) return;

    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    gsap.set(dot, { xPercent: -50, yPercent: -50 });
    gsap.set(ring, { xPercent: -50, yPercent: -50 });

    const moveCursor = (e: MouseEvent) => {
      // Dot is instant
      gsap.to(dot, {
        x: e.clientX,
        y: e.clientY,
        duration: 0.05,
        ease: 'none'
      });
      // Ring lags behind
      gsap.to(ring, {
        x: e.clientX,
        y: e.clientY,
        duration: 0.3,
        ease: 'power3.out'
      });
    };

    const handleHover = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const isInteractive = target.tagName === 'BUTTON' || target.tagName === 'A' || target.closest('button') || target.closest('a') || target.closest('.interactive');
      const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA';

      if (isInput) {
        gsap.to(ring, {
          scale: 0.3,
          opacity: 0,
          duration: 0.3,
          ease: 'power2.out'
        });
        gsap.to(dot, {
          scale: 0,
          duration: 0.2
        });
      } else if (isInteractive) {
        gsap.to(ring, {
          scale: 2.2,
          opacity: 1,
          borderWidth: '1px',
          borderColor: 'var(--md-primary)',
          backgroundColor: 'rgba(0, 255, 224, 0.05)',
          duration: 0.4,
          ease: 'elastic.out(1, 0.6)'
        });
        gsap.to(dot, { scale: 0, duration: 0.2 });
      } else {
        gsap.to(ring, {
          scale: 1,
          opacity: 0.6,
          borderWidth: '1px',
          borderColor: 'var(--md-on-background)',
          backgroundColor: 'transparent',
          duration: 0.3,
          ease: 'power2.out'
        });
        gsap.to(dot, { scale: 1, duration: 0.2 });
      }
    };

    const handleMouseDown = () => {
      gsap.to(ring, { scale: 0.8, opacity: 1, duration: 0.1, ease: 'power2.in' });
      gsap.to(dot, { scale: 0.6, duration: 0.1 });
    };

    const handleMouseUp = () => {
      gsap.to(ring, { scale: 1.2, duration: 0.5, ease: 'elastic.out(1, 0.4)' });
      gsap.to(dot, { scale: 1, duration: 0.5, ease: 'elastic.out(1, 0.4)' });
    };

    window.addEventListener('mousemove', moveCursor);
    window.addEventListener('mouseover', handleHover);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', moveCursor);
      window.removeEventListener('mouseover', handleHover);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  if (isMobile) return null;

  return (
    <>
      <div 
        ref={ringRef} 
        className="fixed top-0 left-0 w-8 h-8 border border-white rounded-full pointer-events-none z-[9998]"
      />
      <div 
        ref={dotRef} 
        className="fixed top-0 left-0 w-1.5 h-1.5 bg-md-primary shadow-[0_0_8px_var(--md-primary)] rounded-full pointer-events-none z-[9999]" 
      />
    </>
  );
};
