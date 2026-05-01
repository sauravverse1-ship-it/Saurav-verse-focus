import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, Zap } from 'lucide-react';
import { playPochitaBark, playPochitaEngine } from '../lib/audio';

const MOTIVATIONS = [
  "Keep going! Your dreams are waiting!",
  "Woof! You can do this!",
  "Don't let them kill your dreams!",
  "Make a contract with your future self!",
  "One step at a time, I'm with you!",
  "Success is just one focus session away!",
  "Focus like a chainsaw through wood!",
  "Your heart is strong, keep pushing!",
  "Bite into your goals! Grrr!",
  "I'll rev my engine for every task you finish!",
  "You're doing great! No barking around!",
  "Let's slice through this distraction together!",
  "I love seeing you focused! Heart eyes!",
  "You can achieve anything! I believe in you!"
];

type Expression = 'happy' | 'determined' | 'sleepy' | 'surprised' | 'bark';

interface PochitaPetProps {
  timerRunning?: boolean;
  mode?: 'study' | 'shortBreak' | 'longBreak';
  celebrate?: boolean;
}

export const PochitaPet: React.FC<PochitaPetProps> = ({ timerRunning, mode, celebrate }) => {
  const [position, setPosition] = useState({ x: 50, y: window.innerHeight - 150 });
  const [message, setMessage] = useState<string | null>(null);
  const [direction, setDirection] = useState(1); // 1 for right, -1 for left
  const [expression, setExpression] = useState<Expression>('happy');
  const [isMoving, setIsMoving] = useState(false);
  const [isBarking, setIsBarking] = useState(false);
  const [isCelebrating, setIsCelebrating] = useState(false);
  const [petCount, setPetCount] = useState(0);
  const [showHearts, setShowHearts] = useState(false);

  useEffect(() => {
     if (petCount > 0) {
        setShowHearts(true);
        const timer = setTimeout(() => setShowHearts(false), 2000);
        return () => clearTimeout(timer);
     }
  }, [petCount]);

  useEffect(() => {
    if (celebrate) {
        setIsCelebrating(true);
        setExpression('happy');
        const timer = setTimeout(() => setIsCelebrating(false), 5000);
        return () => clearTimeout(timer);
    }
  }, [celebrate]);

  useEffect(() => {
    if (isBarking || isCelebrating) return;
    if (timerRunning) {
      setExpression('determined');
    } else if (mode === 'shortBreak' || mode === 'longBreak') {
      setExpression('happy');
    } else {
      setExpression('sleepy');
    }
  }, [timerRunning, mode, isBarking, isCelebrating]);

  const barkTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const moveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
        if (barkTimeoutRef.current) clearTimeout(barkTimeoutRef.current);
        if (moveTimeoutRef.current) clearTimeout(moveTimeoutRef.current);
    };
  }, []);

  const movePochita = useCallback(() => {
    // Avoid moving if telling something
    if (message) return;

    const maxX = window.innerWidth - 80;
    const maxY = window.innerHeight - 80;
    
    setIsMoving(true);
    // Use a wider random range to ensure it goes everywhere
    const nextX = Math.max(40, Math.random() * (maxX - 40));
    const nextY = Math.max(100, Math.random() * (maxY - 100));
    
    setDirection(nextX > position.x ? 1 : -1);
    setPosition({ x: nextX, y: nextY });
    
    // Smooth transition time (6s)
    if (moveTimeoutRef.current) clearTimeout(moveTimeoutRef.current);
    moveTimeoutRef.current = setTimeout(() => setIsMoving(false), 6000);
  }, [position.x, position.y, message]);

  useEffect(() => {
    // Re-calculate window limits on resize
    const interval = setInterval(movePochita, 10000 + Math.random() * 8000);
    movePochita(); 
    return () => clearInterval(interval);
  }, [movePochita]);

  const handleTap = () => {
    setPetCount(prev => prev + 1);
    
    if (isBarking) {
        // Just play a happy engine sound if already barking
        playPochitaEngine();
        return;
    }
    
    setIsBarking(true);
    setExpression('bark');
    playPochitaBark();
    
    // Small engine rev after a split second
    setTimeout(() => playPochitaEngine(), 200);

    const randomMsg = MOTIVATIONS[Math.floor(Math.random() * MOTIVATIONS.length)];
    setMessage(randomMsg);
    
    if (barkTimeoutRef.current) clearTimeout(barkTimeoutRef.current);
    barkTimeoutRef.current = setTimeout(() => {
        setMessage(null);
        setIsBarking(false);
    }, 3000);
  };

  const getEyes = () => {
    if (petCount % 5 === 0 && petCount > 0 && isBarking) {
        // Special heart eyes every 5th pet
        return (
            <g transform="translate(68, 38)">
                <Heart className="w-5 h-5 text-red-500 fill-current" />
            </g>
        );
    }
    switch(expression) {
      case 'determined':
        return (
          <>
            <path d="M72 40 L82 43" stroke="black" strokeWidth="3" strokeLinecap="round" />
            <circle cx="76" cy="46" r="4.5" fill="black" />
            <circle cx="78" cy="44" r="1.5" fill="white" />
          </>
        );
      case 'sleepy':
        return (
          <path d="M70 46 Q75 52 80 46" fill="none" stroke="black" strokeWidth="3" strokeLinecap="round" />
        );
      case 'bark':
      case 'surprised':
        return (
          <>
            <circle cx="76" cy="46" r="9" fill="black" />
            <circle cx="79" cy="43" r="3.5" fill="white" />
          </>
        );
      default: // happy
        return (
          <>
            <circle cx="76" cy="46" r="6.5" fill="black" />
            <circle cx="79" cy="44" r="2.5" fill="white" />
          </>
        );
    }
  };

  return (
    <div className="fixed inset-0 pointer-events-none z-[3000] overflow-hidden">
      <motion.div
        animate={{ 
          x: position.x, 
          y: position.y,
        }}
        transition={{ 
          x: { duration: 6, ease: "easeInOut" },
          y: { duration: 6, ease: "easeInOut" },
        }}
        className="absolute"
      >
        <div className="relative">
          {/* Motivation Bubble - Now Stable relative to movement but not rotation */}
          <AnimatePresence>
            {message && (
              <motion.div
                initial={{ opacity: 0, scale: 0.5, y: 0 }}
                animate={{ opacity: 1, scale: 1, y: -80 }}
                exit={{ opacity: 0, scale: 0.5, y: -20 }}
                className="absolute left-1/2 -translate-x-1/2 w-64 bg-black/95 backdrop-blur-xl text-white p-3.5 rounded-[1.5rem] shadow-[0_0_50px_rgba(249,115,22,0.4)] border-2 border-orange-500/50 text-[10px] font-black uppercase tracking-[0.1em] text-center z-50 ring-1 ring-white/10"
              >
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 rotate-45 w-3 h-3 bg-black border-r-2 border-b-2 border-orange-500/50" />
                <div className="flex justify-center gap-1.5 mb-1.5">
                    <Heart className="w-2.5 h-2.5 text-red-500 animate-pulse fill-current" />
                    <Zap className="w-2.5 h-2.5 text-yellow-400 fill-current" />
                </div>
                {message}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Floating Hearts for Petting */}
          <AnimatePresence>
            {showHearts && (
              <motion.div
                initial={{ opacity: 0, y: 0 }}
                animate={{ opacity: [0, 1, 0], y: -100, x: [0, 20, -20, 0] }}
                exit={{ opacity: 0 }}
                transition={{ duration: 2 }}
                className="absolute left-1/2 -translate-x-1/2 pointer-events-none"
              >
                <div className="flex gap-2">
                    <Heart className="w-4 h-4 text-red-500 fill-current" />
                    <Heart className="w-3 h-3 text-red-400 fill-current mt-4" />
                    <Heart className="w-4 h-4 text-red-600 fill-current -mt-4" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Vibrating/Rotating Body Wrapper */}
          <motion.div
            animate={{ 
              rotate: expression === 'sleepy' ? 10 : 
               (isBarking ? [0, -4, 4, -4, 0] : 
               (isCelebrating ? [0, -15, 15, -15, 0] : 
               (expression === 'determined' ? [0, 1.5, -1.5, 0] : [0, 2, -2, 0]))),
              scale: isBarking || isCelebrating ? 1.1 : 1
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95, rotate: isBarking ? 0 : 5 }}
            transition={{ 
              rotate: { duration: isBarking ? 0.25 : (isCelebrating ? 0.5 : 0.8), repeat: expression === 'sleepy' ? 0 : Infinity },
              scale: { type: 'spring', stiffness: 400, damping: 10 }
            }}
            className="pointer-events-auto cursor-pointer"
            onClick={handleTap}
            onMouseEnter={() => playPochitaEngine()}
          >
            {/* Pochita SVG */}
            <motion.svg 
              width="90" 
              height="75" 
              viewBox="0 0 100 85" 
              className="drop-shadow-[0_20px_50px_rgba(249,115,22,0.4)]"
            style={{ transform: `scaleX(${direction})` }}
            animate={{
                y: isMoving ? [0, -4, 0] : (expression === 'determined' ? [0, -2.5, 0] : [0, -1.5, 0]),
                scaleY: isMoving ? [1, 0.95, 1] : 1
            }}
            transition={{
                duration: isMoving ? 0.4 : (expression === 'determined' ? 1.5 : 2.5),
                repeat: Infinity,
                ease: "easeInOut"
            }}
          >
            {/* Shadow */}
            <motion.ellipse 
                cx="50" cy="78" rx="25" ry="4" fill="black" opacity="0.15" 
                animate={{ rx: isMoving ? 20 : 25, opacity: isMoving ? 0.1 : 0.15 }}
                transition={{ duration: 0.4, repeat: Infinity }}
            />

            {/* Body - More Rounded Sausage Shape */}
            <rect x="20" y="32" width="65" height="42" rx="21" fill="#f97316" />
            <circle cx="80" cy="53" r="14" fill="#f97316" />
            
            {/* Legs */}
            <motion.rect 
                animate={{ height: isMoving ? [10, 5, 10] : 8, y: isMoving ? [68, 73, 68] : 70 }}
                transition={{ repeat: Infinity, duration: 0.2 }}
                x="32" y="70" width="8" height="8" rx="4" fill="#ea580c" 
            />
            <motion.rect 
                animate={{ height: isMoving ? [5, 10, 5] : 8, y: isMoving ? [73, 68, 73] : 70 }}
                transition={{ repeat: Infinity, duration: 0.2 }}
                x="65" y="70" width="8" height="8" rx="4" fill="#ea580c" 
            />
            
            {/* Handle */}
            <path d="M35 32 Q35 18 55 18 Q72 18 72 32" fill="none" stroke="#475569" strokeWidth="5.5" strokeLinecap="round" />
            
            {/* Chainsaw Blade - HEAD */}
            <motion.g
                initial={false}
                animate={{ 
                    scale: isBarking ? 1.3 : (expression === 'determined' ? 1.1 : 1),
                    x: isBarking ? 5 : 0,
                    y: isBarking ? -5 : 0
                }}
                className="origin-[45px_35px]"
            >
                <rect x="38" y="5" width="18" height="32" rx="3" fill="#94a3b8" />
                <path d="M38 18 L24 24 L38 30" fill="#94a3b8" />
                {/* Teeth Vibration */}
                <motion.path 
                    animate={{ x: isBarking || expression === 'determined' ? [-0.5, 0.5, -0.5] : 0 }}
                    transition={{ repeat: Infinity, duration: 0.05 }}
                    d="M38 6 L42 2 L42 10 M38 15 L42 11 L42 19 M38 24 L42 20 L42 28" 
                    stroke="#64748b" strokeWidth="1.5" 
                />
            </motion.g>
            
            {/* Tail (Starter Grip) */}
            <circle cx="15" cy="53" r="5" fill="black" />
            <motion.path 
                animate={{ 
                    rotate: expression === 'happy' || isBarking ? [0, 45, -45, 0] : [0, 20, 0],
                }}
                transition={{ 
                    repeat: Infinity, 
                    duration: isBarking ? 0.3 : 2,
                }}
                d="M15 53 L5 53" stroke="#1f2937" strokeWidth="3.5" strokeLinecap="round"
                style={{ originX: '15px', originY: '53px' }}
            />

            {/* Face */}
            <g transform="translate(0, 0)">
                {getEyes()}
                {/* Cheeks */}
                <circle cx="70" cy="55" r="4" fill="#fb923c" opacity="0.4" />
                <circle cx="85" cy="55" r="4" fill="#fb923c" opacity="0.4" />
                
                {/* Mouth */}
                {isBarking ? (
                    <circle cx="78" cy="62" r="4" fill="black" />
                ) : (
                    expression === 'happy' && (
                        <path d="M74 58 Q78 64 82 58" fill="none" stroke="black" strokeWidth="2" strokeLinecap="round" />
                    )
                )}
            </g>
          </motion.svg>
        </motion.div>
      </div>
    </motion.div>
  </div>
);
};
