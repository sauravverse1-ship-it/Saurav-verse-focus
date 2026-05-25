import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, Zap } from 'lucide-react';
import { playPochitaBark, playPochitaEngine, playPetSound } from '../lib/audio';
import { cn } from '../lib/utils';
import { PetAvatarRenderer } from './PetAvatarRenderer';

const PET_VOICES = {
  default: [
    "Keep going! Your dreams are waiting!",
    "Woof! You can do this!",
    "Don't let them kill your dreams!",
    "Make a contract with your future self!",
    "One step at a time, I'm with you!",
    "Success is just one focus session away!",
    "Focus like a chainsaw through wood!",
    "I'll rev my engine for every task you finish!",
    "You're doing great! No barking around!",
    "Let's slice through this distraction together!",
    "You can achieve anything! I believe in you!"
  ],
  meowy: [
    "Meow! (Power says you need to work harder, humph!)",
    "Prrr... (Licks your hand. Keep focus, human!)",
    "Nyaaa! Power wants us to complete those physics goals!",
    "Mew! (Curls on your keyboard. Sleep is for the weak!)",
    "Purrr... (Vibrates at a comforting frequency of productivity.)",
    "Meow! Slay those tasks, or I won't share my toys!",
    "Hiss! (At the procrastination devil!)"
  ],
  kon: [
    "Kon. (A mystical portal opens. Complete the assignment now.)",
    "An offering of completed tasks is required. Get to work.",
    "Do you hear the contract? Slay your milestones.",
    "Your intense focus feeds my strength. Slay.",
    "Kon. Procrastination has been devoured by the Fox.",
    "Let us tear this study target to shreds.",
    "Discipline is the ultimate devil hunter tool."
  ],
  pochita_hero: [
    "VANCE! (The true Chainsaw Devil roars for your progress!)",
    "GRAAAARRG! (Shatters distraction with maximum violence!)",
    "Dream of toast. Conquer the exam.",
    "THE HERO OF HELL WEIGHS YOUR RESOLVE. FOCUS NOW.",
    "RRR-R-REVVING! (Hellfire rages for your productivity!)"
  ],
  pikachu: [
    "Pika-pika! Electric power of productivity!",
    "Chu! Focus Thunderbolt activated!",
    "Pikachuuu! Slay this session, feel the spark!",
    "Pika, pika! (Crackles with focus-boosting energy!)"
  ],
  eevee: [
    "Ee-vee! Adapting to focus style!",
    "Vee! Snuggles and high scores!",
    "Cute head tilt. You can do it!",
    "Eevee! (Wags tail with extreme adaptability!)"
  ],
  mew: [
    "Mew... (Floats around you, radiating positive pink aura.)",
    "Prrr... (Unlocking genetic potential of focus!)",
    "Mew! (Curious gaze motivates your spirit.)",
    "Mew-mew! (Emitting calm study brainwaves!)"
  ],
  doraemon: [
    "Nobita, focus! Memory Bread is ready!",
    "Pulls out Anywhere Door... directly to the desk!",
    "Let's use the Time Hand to gain 10 more minutes!",
    "Doraemon is here! Any homework can be solved with focus!"
  ],
  dorami: [
    "Big Brother is too lazy, let me organize this checklist!",
    "Time to align your studies beautifully!",
    "Stay hydrated and focus with perfect posture!",
    "Dorami is cataloging your career milestones!"
  ],
  shiro: [
    "Bow woof! Fluffy white cotton candy energy!",
    "Shiro wants to roll around for your achievements!",
    "Wags tail. Complete this card and play with me!",
    "Shiro turns into a soft sphere of ultimate focus peace!"
  ],
  shinchan: [
    "Boobies... oh, wait, STUDY DEVIL!",
    "Doing the elephant dance... don't look, just focus!",
    "Look at my wiggle-wiggle! Hehehe, keep studying!",
    "Action Kamen says: FOCUS AND VICTORY!"
  ],
  charizard: [
    "GRAAAR! (Infernal motivational fire spin!)",
    "Flame of focus burns bright!",
    "Conquer the distraction with flames!",
    "Charizard roars! Your productivity is on fire!"
  ],
  blastoise: [
    "Blast! Clean water stream wash cognitive tired!",
    "Hydro Pump mental blocks!",
    "Stay cool, study steady!",
    "Blastoise shields you from social media drift!"
  ],
  gengar: [
    "Keke... devouring your stress shadow!",
    "Phantom grin lights your focus dark!",
    "Shadow Punching procrastination!",
    "Gengar cackles in the corner, keeping homework safe!"
  ]
};

type Expression = 'happy' | 'determined' | 'sleepy' | 'surprised' | 'bark';

interface PochitaPetProps {
  timerRunning?: boolean;
  mode?: 'study' | 'shortBreak' | 'longBreak';
  celebrate?: boolean;
  xp?: number;
  lastEvent?: { type: 'task_complete' | 'session_start' | 'xp_gain' | 'contract_signed', timestamp: number } | null;
  activePetId?: string;
}

export const PochitaPet: React.FC<PochitaPetProps> = ({ timerRunning, mode, celebrate, xp = 0, lastEvent, activePetId }) => {
  const [position, setPosition] = useState({ x: 50, y: window.innerHeight - 150 });
  const [message, setMessage] = useState<string | null>(null);
  
  // Find pet data if not default
  const isDefaultPochita = !activePetId || activePetId === 'pet_pochita_og';
  const petImageUrl = activePetId && activePetId !== 'pet_pochita_og' 
    ? `https://api.dicebear.com/7.x/bottts/svg?seed=${activePetId.replace('pet_', '')}&backgroundColor=${activePetId.includes('dark') ? '212121' : activePetId.includes('kitsune') ? '673ab7' : 'f44336'}`
    : null;
  const [direction, setDirection] = useState(1); // 1 for right, -1 for left
  const [expression, setExpression] = useState<Expression>('happy');
  const [isMoving, setIsMoving] = useState(false);
  const [isBarking, setIsBarking] = useState(false);
  const [isCelebrating, setIsCelebrating] = useState(false);
  const [petCount, setPetCount] = useState(0);
  const [showHearts, setShowHearts] = useState(false);

  // Level Logic based on XP
  // Level 1: 0-500 XP (Puppy, small, no chainsaw)
  // Level 2: 500-2000 XP (Normal size, no chainsaw)
  // Level 3: 2000-5000 XP (With chainsaw)
  // Level 4: 5000-15000 XP (Red glow)
  // Level 5: 15000+ XP (Devil mode, animated glow, dark)
  
  const isMobile = window.innerWidth < 768;
  const level = xp >= 15000 ? 5 : xp >= 5000 ? 4 : xp >= 2000 ? 3 : xp >= 500 ? 2 : 1;
  const hasChainsaw = level >= 3;
  const scaleMultiplier = (level === 1 ? 0.7 : level === 5 ? 1.2 : 1) * (isMobile ? 0.6 : 1);
  const bodyColor = level >= 5 ? '#dc2626' : '#f97316';
  const glowShadow = level >= 5 ? 'drop-shadow-[0_0_80px_rgba(220,38,38,0.8)] drop-shadow-[0_0_30px_rgba(220,38,38,0.5)]' 
                   : level >= 4 ? 'drop-shadow-[0_20px_50px_rgba(220,38,38,0.6)]' 
                   : 'drop-shadow-[0_20px_50px_rgba(249,115,22,0.4)]';

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

  useEffect(() => {
    if (!lastEvent) return;

    const handleEvent = () => {
        setIsBarking(true);
        setExpression('bark');
        playPetSound(activePetId || 'pet_pochita_og');
        
        let msg = "";
        switch(lastEvent.type) {
            case 'task_complete':
                msg = activePetId === 'pet_shinchan' ? "Ooh! Slayed it! Want to see my wiggle dance?" : "A perfect completion! Amazing job!";
                break;
            case 'session_start':
                msg = activePetId === 'pet_shinchan' ? "Time to focus, or I'll do the elephant dance!" : "Let's begin! Focused energy activated!";
                break;
            case 'xp_gain':
                msg = "Yes! Stronger together! Growing stronger!";
                break;
            case 'contract_signed':
                msg = "A focus contract seal has been established!";
                break;
        }
        setMessage(msg);
        
        if (barkTimeoutRef.current) clearTimeout(barkTimeoutRef.current);
        barkTimeoutRef.current = setTimeout(() => {
            setMessage(null);
            setIsBarking(false);
        }, 3000);
    };

    handleEvent();
  }, [lastEvent, activePetId]);

  const barkTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const moveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
        if (barkTimeoutRef.current) clearTimeout(barkTimeoutRef.current);
        if (moveTimeoutRef.current) clearTimeout(moveTimeoutRef.current);
    };
  }, []);

  const positionRef = useRef(position);
  useEffect(() => {
    positionRef.current = position;
  }, [position]);

  const movePochita = useCallback(() => {
    // Avoid moving if telling something
    if (message) return;

    // Limit random movement to a safer strip to avoid overlapping UI
    const isMobile = window.innerWidth < 768;
    const minX = isMobile ? 10 : window.innerWidth - 300;
    const maxX = isMobile ? window.innerWidth - 60 : window.innerWidth - 60;
    const maxY = window.innerHeight - (isMobile ? 150 : 120); 
    
    setIsMoving(true);
    const nextX = Math.max(minX, Math.min(maxX, positionRef.current.x + (Math.random() * 60 - 30)));
    const nextY = Math.max(maxY - 100, Math.min(maxY, positionRef.current.y + (Math.random() * 40 - 20)));
    
    setDirection(nextX > positionRef.current.x ? 1 : -1);
    setPosition({ x: nextX, y: nextY });
    
    // Smooth transition time (6s)
    if (moveTimeoutRef.current) clearTimeout(moveTimeoutRef.current);
    moveTimeoutRef.current = setTimeout(() => setIsMoving(false), 6000);
  }, [message]);

  useEffect(() => {
    // Re-calculate window limits on resize
    const interval = setInterval(movePochita, 10000 + Math.random() * 8000);
    movePochita(); 
    return () => clearInterval(interval);
  }, [movePochita]);

  const handleTap = () => {
    setPetCount(prev => prev + 1);
    
    if (isBarking) {
        if (!activePetId || activePetId === 'pet_pochita_og' || activePetId.includes('pochita')) {
            playPochitaEngine();
        } else {
            playPetSound(activePetId);
        }
        return;
    }
    
    setIsBarking(true);
    setExpression('bark');
    playPetSound(activePetId || 'pet_pochita_og');
    
    if (!activePetId || activePetId === 'pet_pochita_og' || activePetId.includes('pochita')) {
        setTimeout(() => playPochitaEngine(), 200);
    }

    const getPetMotivations = () => {
      if (activePetId === 'pet_meowy' || activePetId === 'pet_blood_fiend') return PET_VOICES.meowy;
      if (activePetId === 'pet_kon' || activePetId === 'pet_demon_kitsune') return PET_VOICES.kon;
      if (activePetId === 'pet_pochita_hero' || activePetId === 'pet_pochita_dark') return PET_VOICES.pochita_hero;
      if (activePetId === 'pet_pikachu') return PET_VOICES.pikachu;
      if (activePetId === 'pet_eevee') return PET_VOICES.eevee;
      if (activePetId === 'pet_mew') return PET_VOICES.mew;
      if (activePetId === 'pet_doraemon') return PET_VOICES.doraemon;
      if (activePetId === 'pet_dorami') return PET_VOICES.dorami;
      if (activePetId === 'pet_shiro') return PET_VOICES.shiro;
      if (activePetId === 'pet_shinchan') return PET_VOICES.shinchan;
      if (activePetId === 'pet_charizard') return PET_VOICES.charizard;
      if (activePetId === 'pet_blastoise') return PET_VOICES.blastoise;
      if (activePetId === 'pet_gengar') return PET_VOICES.gengar;
      return PET_VOICES.default;
    };
    
    const list = getPetMotivations();
    const randomMsg = list[Math.floor(Math.random() * list.length)];
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
            {/* Custom Interactive SVG Companion Avatars */}
            {activePetId === 'pet_meowy' || activePetId === 'pet_blood_fiend' ? (
              <motion.svg 
                width="95" 
                height="80" 
                viewBox="0 0 110 90" 
                className={glowShadow}
                style={{ transform: `scaleX(${direction}) scale(${scaleMultiplier})` }}
                animate={{
                    y: isMoving ? [0, -3, 0] : [0, -1, 0],
                    scaleY: isMoving ? [1, 0.97, 1] : 1
                }}
                transition={{
                    duration: isMoving ? 0.35 : 2.0,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
              >
                {/* Shadow */}
                <ellipse cx="55" cy="82" rx="28" ry="4" fill="black" opacity="0.15" />

                {/* Body */}
                <ellipse cx="55" cy="55" rx="30" ry="24" fill="#fcb045" />
                {/* Face Mask/Light Accent */}
                <ellipse cx="55" cy="58" rx="24" ry="18" fill="#fff5e6" />

                {/* Power's Cat Horns (Red) */}
                <path d="M42 30 L45 18 L48 28" fill="#ff4d4d" stroke="#000" strokeWidth="1.5" strokeLinejoin="round" />
                <path d="M68 30 L65 18 L62 28" fill="#ff4d4d" stroke="#000" strokeWidth="1.5" strokeLinejoin="round" />

                {/* Cat Ears */}
                <polygon points="30,34 16,14 38,26" fill="#fcb045" stroke="#000" strokeWidth="1.5" />
                <polygon points="30,34 22,20 34,28" fill="#ffb8b8" />
                
                <polygon points="80,34 94,14 72,26" fill="#fcb045" stroke="#000" strokeWidth="1.5" />
                <polygon points="80,34 88,20 76,28" fill="#ffb8b8" />

                {/* Pups / Paws */}
                <circle cx="40" cy="76" r="6" fill="#fff" stroke="#cbd5e1" strokeWidth="1" />
                <circle cx="70" cy="76" r="6" fill="#fff" stroke="#cbd5e1" strokeWidth="1" />

                {/* Twitching Cat Tail */}
                <motion.path 
                  animate={{ rotate: isBarking ? [0, 25, -25, 0] : [0, 8, -8, 0] }}
                  transition={{ repeat: Infinity, duration: isBarking ? 0.3 : 1.5 }}
                  d="M28 62 C15 62 10 40 12 30" 
                  fill="none" 
                  stroke="#fcb045" 
                  strokeWidth="5.5" 
                  strokeLinecap="round" 
                  style={{ originX: '28px', originY: '62px' }}
                />

                {/* Face Details */}
                {/* Eyes */}
                {expression === 'sleepy' ? (
                  <>
                    <path d="M38 48 Q44 52 50 48" fill="none" stroke="#1e293b" strokeWidth="2.5" strokeLinecap="round" />
                    <path d="M60 48 Q66 52 72 48" fill="none" stroke="#1e293b" strokeWidth="2.5" strokeLinecap="round" />
                  </>
                ) : expression === 'bark' ? (
                  <>
                    <ellipse cx="44" cy="46" rx="6" ry="6" fill="#000" />
                    <ellipse cx="66" cy="46" rx="6" ry="6" fill="#000" />
                    <circle cx="46" cy="44" r="2.2" fill="#fff" />
                    <circle cx="68" cy="44" r="2.2" fill="#fff" />
                  </>
                ) : (
                  <>
                    <circle cx="44" cy="46" r="5" fill="#1e293b" />
                    <circle cx="66" cy="46" r="5" fill="#1e293b" />
                    <circle cx="46" cy="44" r="1.5" fill="#fff" />
                    <circle cx="68" cy="44" r="1.5" fill="#fff" />
                  </>
                )}

                {/* Cat Nose & Muzzle */}
                <polygon points="55,51 53,49 57,49" fill="#ff7f7f" />
                <path d="M55 51 Q52 54 49 52 M55 51 Q58 54 61 52" fill="none" stroke="#1e293b" strokeWidth="1.5" strokeLinecap="round" />

                {/* Whiskers */}
                <line x1="26" y1="52" x2="16" y2="50" stroke="#1e293b" strokeWidth="1.5" />
                <line x1="26" y1="56" x2="14" y2="56" stroke="#1e293b" strokeWidth="1.5" />
                <line x1="84" y1="52" x2="94" y2="50" stroke="#1e293b" strokeWidth="1.5" />
                <line x1="84" y1="56" x2="96" y2="56" stroke="#1e293b" strokeWidth="1.5" />
                
                {/* Blush */}
                <circle cx="34" cy="53" r="3.5" fill="#ff7979" opacity="0.4" />
                <circle cx="76" cy="53" r="3.5" fill="#ff7979" opacity="0.4" />
              </motion.svg>
            ) : activePetId === 'pet_kon' || activePetId === 'pet_demon_kitsune' ? (
              <motion.svg 
                width="95" 
                height="80" 
                viewBox="0 0 110 90" 
                className={glowShadow}
                style={{ transform: `scaleX(${direction}) scale(${scaleMultiplier})` }}
                animate={{
                    y: isMoving ? [0, -4, 0] : [0, -2, 0],
                }}
                transition={{
                    duration: 1.8,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
              >
                {/* Shadow */}
                <ellipse cx="55" cy="82" rx="30" ry="4" fill="black" opacity="0.15" />

                {/* Fox Devil Mask Face Base */}
                <polygon points="55,15 25,50 35,78 75,78 85,50" fill="#ffffff" stroke="#1e293b" strokeWidth="2.5" strokeLinejoin="round" />
                
                {/* Fox Ears */}
                <polygon points="28,26 10,-2 40,30" fill="#ffffff" stroke="#1e293b" strokeWidth="2.5" strokeLinejoin="round" />
                <polygon points="30,22 17,4 36,25" fill="#ff5252" />
                <polygon points="82,26 100,-2 70,30" fill="#ffffff" stroke="#1e293b" strokeWidth="2.5" strokeLinejoin="round" />
                <polygon points="80,22 93,4 74,25" fill="#ff5252" />

                {/* Mystical Red Markings */}
                <path d="M55 15 L55 35 M55 35 L45 42 M55 35 L65 42" stroke="#d63031" strokeWidth="2.5" strokeLinecap="round" />
                <path d="M30 52 Q40 54 36 65" fill="none" stroke="#d63031" strokeWidth="3" strokeLinecap="round" />
                <path d="M80 52 Q70 54 74 65" fill="none" stroke="#d63031" strokeWidth="3" strokeLinecap="round" />
                
                {/* Snout */}
                <polygon points="55,62 50,56 60,56" fill="#1e293b" />
                <line x1="55" y1="62" x2="55" y2="70" stroke="#1e293b" strokeWidth="2" />

                {/* Glowing Eyes */}
                {expression === 'sleepy' ? (
                  <>
                    <line x1="32" y1="46" x2="45" y2="48" stroke="#f1c40f" strokeWidth="3" strokeLinecap="round" />
                    <line x1="78" y1="46" x2="65" y2="48" stroke="#f1c40f" strokeWidth="3" strokeLinecap="round" />
                  </>
                ) : (
                  <>
                    {/* Left Eye */}
                    <path d="M30 46 Q38 43 45 49 C38 49 34 47 30 46" fill="#d63031" stroke="#1e293b" strokeWidth="1.5" />
                    <circle cx="38" cy="46.5" r="1.5" fill="#f1c45f" />
                    
                    {/* Right Eye */}
                    <path d="M80 46 Q72 43 65 49 C72 49 76 47 80 46" fill="#d63031" stroke="#1e293b" strokeWidth="1.5" />
                    <circle cx="72" cy="46.5" r="1.5" fill="#f1c45f" />
                  </>
                )}
                
                {/* Mystical Smoke Whiskers */}
                <path d="M33 72 Q20 74 15 68" fill="none" stroke="#8c7ae6" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
                <path d="M77 72 Q90 74 95 68" fill="none" stroke="#8c7ae6" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
              </motion.svg>
            ) : activePetId === 'pet_pochita_hero' || activePetId === 'pet_angel_devil' || activePetId === 'pet_pochita_dark' ? (
              <motion.svg 
                width="95" 
                height="80" 
                viewBox="0 0 100 85" 
                className={glowShadow}
                style={{ transform: `scaleX(${direction}) scale(${scaleMultiplier})` }}
                animate={{
                    y: isMoving ? [0, -5, 0] : (expression === 'determined' ? [0, -3, 0] : [0, -2, 0]),
                }}
                transition={{
                    duration: 1.2,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
              >
                {/* Shadow */}
                <ellipse cx="50" cy="78" rx="26" ry="4.5" fill="black" opacity="0.3" />

                {/* Demon Body in dark obsidian */}
                <rect x="20" y="30" width="65" height="44" rx="22" fill="#1e272e" stroke="#fa8282" strokeWidth="25" />
                <circle cx="80" cy="52" r="14" fill="#1e272e" />

                {/* 4 Obsidian Claws */}
                <polygon points="35,68 25,75 30,78" fill="#0f171e" />
                <polygon points="45,68 40,78 45,80" fill="#0f171e" />
                <polygon points="55,68 62,78 57,80" fill="#0f171e" />
                <polygon points="65,68 75,75 70,78" fill="#0f171e" />

                {/* Spiked Handles */}
                <path d="M32 30 Q32 12 55 12 Q75 12 75 30" fill="none" stroke="#2d3436" strokeWidth="6.5" strokeLinecap="round" />
                <path d="M32 30 Q32 12 55 12 Q75 12 75 30" fill="none" stroke="#da1a1a" strokeWidth="3" strokeLinecap="round" />

                {/* Large Spiked Face Knife / Saw */}
                <g className="origin-[45px_30px]">
                    <rect x="36" y="2" width="20" height="34" rx="4" fill="#57606f" stroke="#000" strokeWidth="1.5" />
                    <rect x="41" y="-8" width="10" height="15" rx="2" fill="#dcdde1" stroke="#000" strokeWidth="1.5" />
                    {/* Glowing crimson saw blade spikes */}
                    <polygon points="35,10 30,8 35,6" fill="#ea2027" />
                    <polygon points="35,20 30,17 35,15" fill="#ea2027" />
                    <polygon points="57,10 62,8 57,6" fill="#ea2027" />
                    <polygon points="57,20 62,17 57,15" fill="#ea2027" />
                </g>

                {/* Glowing Core Heart */}
                <g transform="translate(63, 60) scale(0.65)">
                  <Heart className="w-8 h-8 text-pink-500 fill-current animate-pulse" />
                </g>

                {/* Intense glowing gaze */}
                {expression === 'sleepy' ? (
                  <path d="M70 45 Q76 49 82 45" fill="none" stroke="#ea2027" strokeWidth="3" strokeLinecap="round" />
                ) : (
                  <>
                    <polygon points="68,43 80,37 82,47 70,49" fill="#ff7f7f" stroke="#000" strokeWidth="1.5" />
                    <circle cx="75" cy="43" r="2.5" fill="#ffd32a" />
                  </>
                )}

                {/* Spiked Starter Rope */}
                <circle cx="15" cy="52" r="6" fill="#000" />
                <path d="M15 52 L5 62" stroke="#ea2027" strokeWidth="4.5" strokeLinecap="round" />
              </motion.svg>
            ) : activePetId === 'pet_pikachu' ? (
              <motion.svg 
                width="95" 
                height="80" 
                viewBox="0 0 100 85" 
                className={glowShadow}
                style={{ transform: `scaleX(${direction}) scale(${scaleMultiplier})` }}
                animate={{
                    y: isMoving ? [0, -4, 0] : [0, -1.5, 0],
                }}
                transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
              >
                {/* Shadow */}
                <ellipse cx="50" cy="78" rx="28" ry="4" fill="black" opacity="0.15" />

                {/* Bolt Tail */}
                <motion.path 
                  animate={{ rotate: isBarking ? [0, 15, -15, 0] : [0, 5, -5, 0] }}
                  transition={{ repeat: Infinity, duration: 1.2 }}
                  d="M10 65 L4 50 L14 45 L10 32 L30 36 M30 36 L25 50" 
                  fill="#ffd32a" 
                  stroke="#000" 
                  strokeWidth="1.5" 
                  strokeLinecap="round"
                />

                {/* Pikachu Body */}
                <ellipse cx="50" cy="52" rx="26" ry="22" fill="#ffd32a" stroke="#000" strokeWidth="1.5" />

                {/* Pointy Pikachu Ears */}
                <g>
                  {/* Left Ear */}
                  <path d="M35 34 L18 8 C16 4, 12 12, 28 29" fill="#ffd32a" stroke="#000" strokeWidth="1.5" />
                  <path d="M18 8 L22 14 L28 20" fill="#000" />
                  {/* Right Ear */}
                  <path d="M65 34 L82 8 C84 4, 88 12, 72 29" fill="#ffd32a" stroke="#000" strokeWidth="1.5" />
                  <path d="M82 8 L78 14 L72 20" fill="#000" />
                </g>

                {/* Red Cheek Circles */}
                <circle cx="34" cy="56" r="5" fill="#e74c3c" />
                <circle cx="66" cy="56" r="5" fill="#e74c3c" />

                {/* Tiny black nose */}
                <polygon points="50,52 48,50 52,50" fill="#000" />

                {/* Smile / Mouth */}
                <path d="M47 56 Q50 58 53 56" fill="none" stroke="#000" strokeWidth="1.5" strokeLinecap="round" />

                {/* Eye logic */}
                {expression === 'sleepy' ? (
                  <>
                    <path d="M36 46 Q42 50 48 46" fill="none" stroke="#000" strokeWidth="2.5" strokeLinecap="round" />
                    <path d="M52 46 Q58 50 64 46" fill="none" stroke="#000" strokeWidth="2.5" strokeLinecap="round" />
                  </>
                ) : (
                  <>
                    <circle cx="40" cy="46" r="4.5" fill="#000" />
                    <circle cx="60" cy="46" r="4.5" fill="#000" />
                    <circle cx="41.5" cy="44.5" r="1.5" fill="#fff" />
                    <circle cx="61.5" cy="44.5" r="1.5" fill="#fff" />
                  </>
                )}

                {/* Paws */}
                <ellipse cx="40" cy="74" rx="4" ry="3" fill="#ffd32a" stroke="#000" strokeWidth="1" />
                <ellipse cx="60" cy="74" rx="4" ry="3" fill="#ffd32a" stroke="#000" strokeWidth="1" />

                {/* Lightning Spark Crackle Overlay when Focusing */}
                {timerRunning && (
                  <motion.g animate={{ opacity: [1, 0, 1] }} transition={{ repeat: Infinity, duration: 0.15 }}>
                    <path d="M22 28 L16 18 L24 20" fill="none" stroke="#ffd32a" strokeWidth="2" strokeLinecap="round" />
                    <path d="M78 28 L84 18 L76 20" fill="none" stroke="#ffd32a" strokeWidth="2" strokeLinecap="round" />
                    <path d="M50 15 L50 4" fill="none" stroke="#f1c40f" strokeWidth="2" />
                  </motion.g>
                )}
              </motion.svg>
            ) : activePetId === 'pet_charizard' ? (
              <motion.svg 
                width="95" 
                height="80" 
                viewBox="0 0 100 85" 
                className={glowShadow}
                style={{ transform: `scaleX(${direction}) scale(${scaleMultiplier})` }}
                animate={{
                    y: isMoving ? [0, -3, 0] : [0, -1.5, 0],
                }}
                transition={{
                    duration: 1.6,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
              >
                {/* Shadow */}
                <ellipse cx="50" cy="78" rx="28" ry="4" fill="black" opacity="0.15" />

                {/* Dragon Wings behind */}
                <g>
                  {/* Left Wing */}
                  <path d="M20 40 L5 25 C0 15, 10 20, 20 34" fill="#3dc1d3" stroke="#000" strokeWidth="1.5" />
                  <path d="M20 40 L5 25 C0 15, 10 20, 20 34" fill="#e66767" opacity="0.3" />
                  {/* Right Wing */}
                  <path d="M80 40 L95 25 C100 15, 90 20, 80 34" fill="#3dc1d3" stroke="#000" strokeWidth="1.5" />
                  <path d="M80 40 L95 25 C100 15, 90 20, 80 34" fill="#e66767" opacity="0.3" />
                </g>

                {/* Tail with glowing flame */}
                <path d="M25 58 C15 58 10 45 4 48" fill="none" stroke="#e66767" strokeWidth="5" strokeLinecap="round" />
                {/* Flame on tail tip */}
                <motion.ellipse 
                  animate={{ scale: [1, 1.4, 1], fill: ["#f1c40f", "#e67e22", "#e74c3c", "#f1c40f"] }}
                  transition={{ repeat: Infinity, duration: 0.4 }}
                  cx="3" cy="46" rx="4" ry="6" fill="#f1c40f"
                />

                {/* Charizard Body */}
                <ellipse cx="50" cy="52" rx="26" ry="22" fill="#e66767" stroke="#000" strokeWidth="1.5" />
                <ellipse cx="50" cy="56" rx="16" ry="14" fill="#f7d794" /> {/* Belly */}

                {/* Determined Eyes */}
                {expression === 'sleepy' ? (
                  <>
                    <path d="M38 46 Q44 49 50 46" fill="none" stroke="#000" strokeWidth="2" strokeLinecap="round" />
                    <path d="M50 46 Q56 49 62 46" fill="none" stroke="#000" strokeWidth="2" strokeLinecap="round" />
                  </>
                ) : (
                  <>
                    <polygon points="36,44 46,41 44,48 37,48" fill="#fff" stroke="#000" strokeWidth="1.5" />
                    <circle cx="41" cy="44.5" r="2" fill="#2bcbba" />
                    <polygon points="64,44 54,41 56,48 63,48" fill="#fff" stroke="#000" strokeWidth="1.5" />
                    <circle cx="59" cy="44.5" r="2" fill="#2bcbba" />
                  </>
                )}

                {/* Mini horns on head */}
                <path d="M38 31 C35 25, 30 25, 36 34" fill="#e66767" stroke="#000" strokeWidth="1.5" />
                <path d="M62 31 C65 25, 70 25, 64 34" fill="#e66767" stroke="#000" strokeWidth="1.5" />

                {/* Nostril dots and tiny teeth */}
                <circle cx="47" cy="50" r="0.7" fill="#000" />
                <circle cx="53" cy="50" r="0.7" fill="#000" />
                <polygon points="38,52 40,55 42,52" fill="#fff" />
                <polygon points="62,52 60,55 58,52" fill="#fff" />
              </motion.svg>
            ) : activePetId === 'pet_gengar' ? (
              <motion.svg 
                width="95" 
                height="80" 
                viewBox="0 0 100 85" 
                className={glowShadow}
                style={{ transform: `scaleX(${direction}) scale(${scaleMultiplier})` }}
                animate={{
                    y: isMoving ? [0, -5, 0] : [0, -3, 0],
                }}
                transition={{
                    duration: 1.2,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
              >
                {/* Shadow */}
                <ellipse cx="50" cy="78" rx="22" ry="3.5" fill="black" opacity="0.2" />

                {/* Spike ears / Back spikes */}
                <g>
                  <polygon points="26,30 14,10 34,24" fill="#574b90" stroke="#000" strokeWidth="1.5" />
                  <polygon points="74,30 86,10 66,24" fill="#574b90" stroke="#000" strokeWidth="1.5" />
                  <polygon points="50,22 50,14 44,24" fill="#574b90" stroke="#000" strokeWidth="1" />
                </g>

                {/* Gengar Body */}
                <ellipse cx="50" cy="52" rx="28" ry="24" fill="#574b90" stroke="#000" strokeWidth="1.5" />

                {/* Red Eyes */}
                {expression === 'sleepy' ? (
                  <>
                    <path d="M32 42 Q40 45 44 40" fill="none" stroke="#ea2027" strokeWidth="3" strokeLinecap="round" />
                    <path d="M68 42 Q60 45 56 40" fill="none" stroke="#ea2027" strokeWidth="3" strokeLinecap="round" />
                  </>
                ) : (
                  <>
                    <polygon points="28,34 46,42 42,46 30,44" fill="#ea2027" stroke="#000" strokeWidth="1.5" />
                    <circle cx="38" cy="40" r="2.5" fill="#ffdd59" />

                    <polygon points="72,34 54,42 58,46 70,44" fill="#ea2027" stroke="#000" strokeWidth="1.5" />
                    <circle cx="62" cy="40" r="2.5" fill="#ffdd59" />
                  </>
                )}

                {/* Wicked Smile with teeth */}
                <path d="M30 52 Q50 66 70 52 C60 62 40 62 30 52" fill="#fff" stroke="#000" strokeWidth="1.5" />
                {/* Tooth separations */}
                <path d="M40 56 L42 59 M50 58 L50 61 M60 56 L58 59" stroke="#000" strokeWidth="1" />

                {/* Little stubby arms and legs */}
                <ellipse cx="22" cy="54" rx="5" ry="4" fill="#574b90" stroke="#000" strokeWidth="1" />
                <ellipse cx="78" cy="54" rx="5" ry="4" fill="#574b90" stroke="#000" strokeWidth="1" />
                <ellipse cx="38" cy="74" rx="5" ry="4" fill="#574b90" stroke="#000" strokeWidth="1.2" />
                <ellipse cx="62" cy="74" rx="5" ry="4" fill="#574b90" stroke="#000" strokeWidth="1.2" />
              </motion.svg>
            ) : activePetId === 'pet_blastoise' ? (
              <motion.svg 
                width="95" 
                height="80" 
                viewBox="0 0 100 85" 
                className={glowShadow}
                style={{ transform: `scaleX(${direction}) scale(${scaleMultiplier})` }}
                animate={{
                    y: isMoving ? [0, -3, 0] : [0, -1.5, 0],
                }}
                transition={{
                    duration: 1.7,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
              >
                {/* Shadow */}
                <ellipse cx="50" cy="78" rx="28" ry="4" fill="black" opacity="0.15" />

                {/* Giant shoulder water cannons */}
                <g>
                  {/* Left Cannon */}
                  <motion.rect 
                    animate={{ x: isBarking ? [14, 18, 14] : 14 }}
                    transition={{ repeat: Infinity, duration: 0.3 }}
                    x="14" y="24" width="16" height="10" rx="3" fill="#bdc5c9" stroke="#000" strokeWidth="1.5" transform="rotate(-25, 14, 24)" 
                  />
                  {/* Right Cannon */}
                  <motion.rect 
                    animate={{ x: isBarking ? [70, 66, 70] : 70 }}
                    transition={{ repeat: Infinity, duration: 0.3 }}
                    x="70" y="24" width="16" height="10" rx="3" fill="#bdc5c9" stroke="#000" strokeWidth="1.5" transform="rotate(25, 70, 24)" 
                  />
                </g>

                {/* Blastoise shell back */}
                <ellipse cx="50" cy="55" rx="29" ry="22" fill="#786fa6" stroke="#000" strokeWidth="1.5" />

                {/* Blastoise Body */}
                <ellipse cx="50" cy="54" rx="24" ry="19" fill="#54a0ff" stroke="#000" strokeWidth="1.5" />
                <path d="M34 54 C34 44, 66 44, 66 54 C66 64, 34 64, 34 54" fill="#f7d794" stroke="#000" strokeWidth="1" /> {/* Shell belly plate */}

                {/* Determined Eyes */}
                {expression === 'sleepy' ? (
                  <>
                    <path d="M38 46 Q43 49 48 46" fill="none" stroke="#000" strokeWidth="2.5" strokeLinecap="round" />
                    <path d="M52 46 Q57 49 62 46" fill="none" stroke="#000" strokeWidth="2.5" strokeLinecap="round" />
                  </>
                ) : (
                  <>
                    <polygon points="35,46 45,43 42,49" fill="#fff" stroke="#000" strokeWidth="1.5" />
                    <circle cx="41.5" cy="45.5" r="1.5" fill="#cf6a87" />
                    <polygon points="65,46 55,43 58,49" fill="#fff" stroke="#000" strokeWidth="1.5" />
                    <circle cx="58.5" cy="45.5" r="1.5" fill="#cf6a87" />
                  </>
                )}

                {/* Turtle Ears */}
                <path d="M32 36 L24 28 L32 31" fill="#54a0ff" stroke="#000" strokeWidth="1.5" />
                <path d="M68 36 L76 28 L68 31" fill="#54a0ff" stroke="#000" strokeWidth="1.5" />

                {/* Mouth */}
                <path d="M44 54 Q50 56 56 54" fill="none" stroke="#000" strokeWidth="1.5" strokeLinecap="round" />

                {/* Stout feet */}
                <ellipse cx="34" cy="73" rx="5" ry="4" fill="#54a0ff" stroke="#000" strokeWidth="1" />
                <ellipse cx="66" cy="73" rx="5" ry="4" fill="#54a0ff" stroke="#000" strokeWidth="1" />
              </motion.svg>
            ) : isDefaultPochita ? (
              <motion.svg 
                width="90" 
                height="75" 
                viewBox="0 0 100 85" 
                className={glowShadow}
                style={{ transform: `scaleX(${direction}) scale(${scaleMultiplier})` }}
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
                <rect x="20" y="32" width="65" height="42" rx="21" fill={bodyColor} />
                <circle cx="80" cy="53" r="14" fill={bodyColor} />
                
                {/* Legs */}
                <motion.rect 
                    animate={{ height: isMoving ? [10, 5, 10] : 8, y: isMoving ? [68, 73, 68] : 70 }}
                    transition={{ repeat: Infinity, duration: 0.2 }}
                    x="32" y="70" width="8" height="8" rx="4" fill={level >= 5 ? '#991b1b' : '#ea580c'} 
                />
                <motion.rect 
                    animate={{ height: isMoving ? [5, 10, 5] : 8, y: isMoving ? [73, 68, 73] : 70 }}
                    transition={{ repeat: Infinity, duration: 0.2 }}
                    x="65" y="70" width="8" height="8" rx="4" fill={level >= 5 ? '#991b1b' : '#ea580c'} 
                />
                
                {/* Handle */}
                <path d="M35 32 Q35 18 55 18 Q72 18 72 32" fill="none" stroke="#475569" strokeWidth="5.5" strokeLinecap="round" />
                
                {/* Chainsaw Blade - HEAD (Only levels 3+) */}
                {hasChainsaw && (
                    <motion.g
                        initial={false}
                        animate={{ 
                            scale: isBarking || isCelebrating ? 1.3 : (expression === 'determined' ? 1.1 : 1),
                            x: isBarking || isCelebrating ? 5 : 0,
                            y: isBarking || isCelebrating ? -5 : 0
                        }}
                        className="origin-[45px_35px]"
                    >
                        <rect x="38" y="5" width="18" height="32" rx="3" fill={level >= 5 ? '#1f2937' : '#94a3b8'} />
                        <path d="M38 18 L24 24 L38 30" fill={level >= 5 ? '#1f2937' : '#94a3b8'} />
                        {/* Teeth Vibration */}
                        <motion.path 
                            animate={{ x: isBarking || isCelebrating || expression === 'determined' ? [-0.5, 0.5, -0.5] : 0 }}
                            transition={{ repeat: Infinity, duration: 0.05 }}
                            d="M38 6 L42 2 L42 10 M38 15 L42 11 L42 19 M38 24 L42 20 L42 28" 
                            stroke="#64748b" strokeWidth="1.5" 
                        />
                    </motion.g>
                )}
                
                {/* Tail (Starter Grip) */}
                <circle cx="15" cy="53" r="5" fill="black" />
                <motion.path 
                    animate={{ 
                        rotate: expression === 'happy' || isBarking || isCelebrating ? [0, 45, -45, 0] : [0, 20, 0],
                    }}
                    transition={{ 
                        repeat: Infinity, 
                        duration: isBarking || isCelebrating ? 0.3 : 2,
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
            ) : (
              <motion.div
                animate={{
                  y: isMoving ? [0, -4, 0] : [0, -2, 0],
                  scale: isBarking ? 1.1 : 1
                }}
                transition={{ duration: 0.5, repeat: Infinity }}
                className={cn("w-24 h-24 rounded-3xl overflow-hidden glass-card p-2 border-2 flex items-center justify-center", glowShadow)}
                style={{ transform: `scaleX(${direction})` }}
              >
                <PetAvatarRenderer 
                  petId={activePetId!} 
                  className="w-20 h-20" 
                  xp={xp} 
                  expression={expression} 
                  isBarking={isBarking} 
                  timerRunning={timerRunning}
                />
              </motion.div>
            )}
        </motion.div>
      </div>
    </motion.div>
  </div>
);
};
