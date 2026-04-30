import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Quote, Heart, Zap, Coffee, Brain } from 'lucide-react';
import { playTick } from '../lib/audio';

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
  }, [position.x, position.y]);

  useEffect(() => {
    const interval = setInterval(movePochita, 12000 + Math.random() * 8000);
    movePochita(); // Initial move
    return () => clearInterval(interval);
  }, [movePochita]);

  const handleTap = () => {
    const randomMsg = MOTIVATIONS[Math.floor(Math.random() * MOTIVATIONS.length)];
    setMessage(randomMsg);
    setExpression('surprised');
    playTick();
    setTimeout(() => {
        setMessage(null);
        setExpression(timerRunning ? 'determined' : (mode?.includes('Break') ? 'happy' : 'sleepy'));
    }, 4000);
  };

  const getEyes = () => {
    switch(expression) {
      case 'determined':
        return (
          <>
            <path d="M70 42 L80 45" stroke="black" strokeWidth="2.5" />
            <circle cx="75" cy="45" r="3.5" fill="black" />
          </>
        );
      case 'sleepy':
        return (
          <>
            <path d="M70 45 Q75 50 80 45" fill="none" stroke="black" strokeWidth="2.5" strokeLinecap="round" />
          </>
        );
      case 'surprised':
        return (
          <>
            <circle cx="75" cy="45" r="8" fill="black" />
            <circle cx="77" cy="42" r="3" fill="white" />
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
          rotate: expression === 'sleepy' ? 10 : [0, 5, -5, 0],
          scale: message ? 1.2 : 1
        }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9, rotate: direction * 15 }}
        transition={{ 
          x: { duration: 6, ease: "easeInOut" },
          y: { duration: 6, ease: "easeInOut" },
          rotate: { duration: 0.5, repeat: expression === 'sleepy' ? 0 : Infinity },
          scale: { type: 'spring', stiffness: 300, damping: 15 }
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
                animate={{ opacity: 1, scale: 1, y: -90 }}
                exit={{ opacity: 0, scale: 0.5, y: -20 }}
                className="absolute left-1/2 -translate-x-1/2 w-64 bg-black/90 backdrop-blur-xl text-white p-4 rounded-[2rem] shadow-[0_0_50px_rgba(249,115,22,0.6)] border-2 border-orange-500 text-[10px] font-black uppercase tracking-widest text-center z-50"
              >
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 rotate-45 w-4 h-4 bg-black/90 border-r-2 border-b-2 border-orange-500" />
                <div className="flex justify-center gap-2 mb-2">
                    <Heart className="w-3 h-3 text-red-500 animate-pulse fill-current" />
                    <Zap className="w-3 h-3 text-yellow-400 fill-current" />
                </div>
                {message}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Pochita SVG */}
          <motion.svg 
            width="120" 
            height="100" 
            viewBox="0 0 100 80" 
            className="drop-shadow-[0_25px_60px_rgba(249,115,22,0.4)] transition-transform duration-700"
            style={{ transform: `scaleX(${direction})` }}
            animate={{
                scale: isMoving ? [1, 1.05, 1] : [1, 1.02, 1],
                y: isMoving ? [0, -5, 0] : [0, -2, 0]
            }}
            transition={{
                duration: isMoving ? 0.4 : 2,
                repeat: Infinity,
                ease: "easeInOut"
            }}
          >
            {/* Shadow beneath */}
            <motion.ellipse 
                cx="50" cy="75" rx="30" ry="5" fill="black" opacity="0.2" 
                animate={{ rx: isMoving ? 25 : 30, opacity: isMoving ? 0.1 : 0.2 }}
                transition={{ duration: 0.4, repeat: Infinity }}
            />

            {/* Body */}
            <motion.rect 
                animate={{ height: expression === 'sleepy' ? 38 : 40, y: expression === 'sleepy' ? 32 : 30 }}
                x="20" y="30" width="60" height="40" rx="20" fill="#f97316" 
            />
            <circle cx="80" cy="50" r="12" fill="#f97316" />
            
            {/* Legs */}
            <motion.rect 
                animate={{ height: isMoving ? [12, 6, 12] : 10, y: isMoving ? [63, 67, 63] : 65 }}
                transition={{ repeat: Infinity, duration: 0.2 }}
                x="30" y="65" width="8" height="10" rx="4" fill="#ea580c" 
            />
            <motion.rect 
                animate={{ height: isMoving ? [6, 12, 6] : 10, y: isMoving ? [67, 63, 67] : 65 }}
                transition={{ repeat: Infinity, duration: 0.2 }}
                x="62" y="65" width="8" height="10" rx="4" fill="#ea580c" 
            />
            
            {/* Chainsaw Blade */}
            <motion.g
                animate={{ 
                    x: expression === 'determined' ? [0, 2, 0] : 0,
                    y: expression === 'determined' ? [-1, 1, -1] : 0
                }}
                transition={{ repeat: Infinity, duration: 0.1 }}
            >
                <rect x="40" y="10" width="20" height="30" rx="2" fill="#94a3b8" />
                <path d="M40 20 L25 25 L40 30" fill="#94a3b8" />
                {/* Teeth detail */}
                <path d="M40 10 L45 5 L45 15 M40 25 L45 20 L45 30" stroke="#64748b" strokeWidth="1" />
            </motion.g>
            
            {/* Eyes */}
            {getEyes()}
            
            {/* Mouth */}
            {expression === 'happy' && (
                <path d="M75 57 Q80 62 85 57" fill="none" stroke="black" strokeWidth="2" strokeLinecap="round" />
            )}
            
            {/* Handle */}
            <path d="M30 30 Q30 15 50 15 Q70 15 70 30" fill="none" stroke="#64748b" strokeWidth="5" strokeLinecap="round" />
            
            {/* Tail (Starter) */}
            <circle cx="15" cy="50" r="4" fill="black" />
            <motion.path 
                animate={{ 
                    rotate: expression === 'happy' ? [0, 60, -60, 0] : [0, 30, 0],
                    scale: expression === 'happy' ? 1.2 : 1
                }}
                transition={{ 
                    repeat: Infinity, 
                    duration: expression === 'happy' ? 0.3 : 2,
                    ease: "linear"
                }}
                d="M15 50 L5 50" stroke="black" strokeWidth="3" strokeLinecap="round"
                style={{ originX: '15px', originY: '50px' }}
            />
          </motion.svg>
        </div>
      </motion.div>
    </div>
  );
};
