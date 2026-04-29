import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Quote, Heart, Zap, Coffee, Brain } from 'lucide-react';

const MOTIVATIONS = [
  "Keep going! Your dreams are waiting!",
  "Woof! You can do this!",
  "Don't let them kill your dreams!",
  "Make a contractor with your future self!",
  "One step at a time, I'm with you!",
  "Success is just one focus session away!",
  "Focus like a chainsaw through wood!",
  "Your heart is strong, keep pushing!"
];

type Expression = 'happy' | 'determined' | 'sleepy' | 'surprised';

interface PochitaPetProps {
  timerRunning?: boolean;
  mode?: 'study' | 'shortBreak' | 'longBreak';
}

export const PochitaPet: React.FC<PochitaPetProps> = ({ timerRunning, mode }) => {
  const [position, setPosition] = useState({ x: 50, y: 500 });
  const [message, setMessage] = useState<string | null>(null);
  const [direction, setDirection] = useState(1); // 1 for right, -1 for left
  const [expression, setExpression] = useState<Expression>('happy');
  const [isMoving, setIsMoving] = useState(false);

  useEffect(() => {
    if (timerRunning) {
      setExpression('determined');
    } else if (mode === 'shortBreak' || mode === 'longBreak') {
      setExpression('happy');
    } else {
      setExpression('sleepy');
    }
  }, [timerRunning, mode]);

  const movePochita = useCallback(() => {
    const maxX = window.innerWidth - 100;
    const maxY = window.innerHeight - 100;
    
    setIsMoving(true);
    const nextX = Math.max(20, Math.random() * maxX);
    const nextY = Math.max(20, Math.random() * maxY);
    
    setDirection(nextX > position.x ? 1 : -1);
    setPosition({ x: nextX, y: nextY });
    
    // Set back to not moving after transition
    setTimeout(() => setIsMoving(false), 6000);
  }, [position.x]);

  useEffect(() => {
    const interval = setInterval(movePochita, 8000 + Math.random() * 5000);
    movePochita(); // Initial move
    return () => clearInterval(interval);
  }, [movePochita]);

  const handleTap = () => {
    const randomMsg = MOTIVATIONS[Math.floor(Math.random() * MOTIVATIONS.length)];
    setMessage(randomMsg);
    setExpression('surprised');
    setTimeout(() => {
        setMessage(null);
        setExpression('happy');
    }, 4000);
  };

  const getEyes = () => {
    switch(expression) {
      case 'determined':
        return (
          <>
            <path d="M70 42 L80 45" stroke="black" strokeWidth="2" />
            <circle cx="75" cy="45" r="3" fill="black" />
          </>
        );
      case 'sleepy':
        return (
          <>
            <path d="M70 45 Q75 50 80 45" fill="none" stroke="black" strokeWidth="2" />
          </>
        );
      case 'surprised':
        return (
          <>
            <circle cx="75" cy="45" r="6" fill="black" />
            <circle cx="76" cy="43" r="2" fill="white" />
          </>
        );
      default:
        return (
          <>
            <circle cx="75" cy="45" r="5" fill="black" />
            <circle cx="77" cy="43" r="1.5" fill="white" />
          </>
        );
    }
  };

  return (
    <div className="fixed inset-0 pointer-events-none z-[2000] overflow-hidden">
      <motion.div
        animate={{ 
          x: position.x, 
          y: position.y,
          rotate: expression === 'sleepy' ? 10 : [0, 5, -5, 0]
        }}
        transition={{ 
          x: { duration: 6, ease: "easeInOut" },
          y: { duration: 6, ease: "easeInOut" },
          rotate: { duration: 0.5, repeat: expression === 'sleepy' ? 0 : Infinity }
        }}
        className="absolute pointer-events-auto cursor-pointer"
        onClick={handleTap}
      >
        <div className="relative group">
          {/* Motivation Bubble */}
          <AnimatePresence>
            {message && (
              <motion.div
                initial={{ opacity: 0, scale: 0.5, y: 0 }}
                animate={{ opacity: 1, scale: 1, y: -80 }}
                exit={{ opacity: 0, scale: 0.5, y: -20 }}
                className="absolute left-1/2 -translate-x-1/2 w-64 bg-black/90 backdrop-blur-xl text-white p-4 rounded-[2rem] shadow-[0_0_40px_rgba(249,115,22,0.4)] border-2 border-orange-500/50 text-[10px] font-black uppercase tracking-widest text-center"
              >
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 rotate-45 w-4 h-4 bg-black/90 border-r-2 border-b-2 border-orange-500/50" />
                <div className="flex justify-center gap-2 mb-2">
                    <Heart className="w-3 h-3 text-red-500 animate-pulse" />
                    <Zap className="w-3 h-3 text-yellow-400" />
                </div>
                {message}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Pochita SVG */}
          <motion.svg 
            width="100" 
            height="80" 
            viewBox="0 0 100 80" 
            className="drop-shadow-[0_20px_50px_rgba(249,115,22,0.3)] transition-transform duration-700"
            style={{ transform: `scaleX(${direction})` }}
          >
            {/* Shadow beneath */}
            <ellipse cx="50" cy="75" rx="30" ry="5" fill="black" opacity="0.2" />

            {/* Body */}
            <motion.rect 
                animate={{ height: expression === 'sleepy' ? 38 : 40 }}
                x="20" y="30" width="60" height="40" rx="20" fill="#f97316" 
            />
            <circle cx="80" cy="50" r="12" fill="#f97316" />
            
            {/* Legs */}
            <motion.rect 
                animate={{ height: isMoving ? [12, 6, 12] : 10 }}
                transition={{ repeat: Infinity, duration: 0.2 }}
                x="30" y="65" width="8" height="10" rx="4" fill="#ea580c" 
            />
            <motion.rect 
                animate={{ height: isMoving ? [6, 12, 6] : 10 }}
                transition={{ repeat: Infinity, duration: 0.2 }}
                x="62" y="65" width="8" height="10" rx="4" fill="#ea580c" 
            />
            
            {/* Chainsaw Blade */}
            <motion.rect 
                animate={{ x: expression === 'determined' ? [40, 42, 40] : 40 }}
                transition={{ repeat: Infinity, duration: 0.1 }}
                x="40" y="10" width="20" height="30" rx="2" fill="#94a3b8" 
            />
            <path d="M40 20 L25 25 L40 30" fill="#94a3b8" />
            
            {/* Eyes */}
            {getEyes()}
            
            {/* Mouth */}
            {expression === 'happy' && (
                <path d="M75 55 Q80 60 85 55" fill="none" stroke="black" strokeWidth="1" />
            )}
            
            {/* Handle */}
            <path d="M30 30 Q30 15 50 15 Q70 15 70 30" fill="none" stroke="#64748b" strokeWidth="4" />
            
            {/* Tail (Starter) */}
            <circle cx="15" cy="50" r="4" fill="black" />
            <motion.path 
                animate={{ rotate: [0, 45, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
                d="M15 50 L5 50" stroke="black" strokeWidth="2" 
                style={{ originX: '15px', originY: '50px' }}
            />
          </motion.svg>
        </div>
      </motion.div>
    </div>
  );
};
