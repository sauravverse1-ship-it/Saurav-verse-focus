import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Zap, X, Brain, ChevronRight, ChevronLeft, RotateCcw, Skull, Flame } from 'lucide-react';
import { cn } from '../lib/utils';
import { FlashcardDeck } from '../types';

interface FlashcardArenaProps {
  decks: FlashcardDeck[];
  onClose: () => void;
  onSessionComplete: (deckId: string, performance: any) => void;
}

export const FlashcardArena: React.FC<FlashcardArenaProps> = ({ decks, onClose, onSessionComplete }) => {
  const [activeDeckId, setActiveDeckId] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [stats, setStats] = useState({ mastered: 0, struggling: 0 });

  const [isBossMode, setIsBossMode] = useState(false);
  const [bossHealth, setBossHealth] = useState(100);
  const [timer, setTimer] = useState(30);

  const activeDeck = decks.find(d => d.id === activeDeckId);

  useEffect(() => {
    let interval: any;
    if (isBossMode && !showResults && timer > 0) {
      interval = setInterval(() => {
        setTimer(t => {
          if (t <= 1) {
            setShowResults(true);
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isBossMode, showResults, timer]);

  const handleNext = (mastered: boolean) => {
    if (!activeDeck) return;
    
    if (isBossMode) {
      if (mastered) {
        setBossHealth(prev => Math.max(0, prev - (100 / activeDeck.cards.length)));
      } else {
        setTimer(prev => Math.max(0, prev - 5));
      }
      
      if (currentIndex < activeDeck.cards.length - 1 && bossHealth > 0) {
        setIsFlipped(false);
        setTimeout(() => setCurrentIndex(prev => prev + 1), 200);
      } else {
        setShowResults(true);
      }
      return;
    }

    setStats(prev => ({
      mastered: prev.mastered + (mastered ? 1 : 0),
      struggling: prev.struggling + (mastered ? 0 : 1),
    }));

    if (currentIndex < activeDeck.cards.length - 1) {
      setIsFlipped(false);
      setTimeout(() => setCurrentIndex(prev => prev + 1), 200);
    } else {
      setShowResults(true);
    }
  };

  const startBossBattle = (deckId: string) => {
    setActiveDeckId(deckId);
    setIsBossMode(true);
    setBossHealth(100);
    setTimer(30);
    setCurrentIndex(0);
    setIsFlipped(false);
    setShowResults(false);
  };

  const currentCard = activeDeck?.cards[currentIndex];

  if (!activeDeckId) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[300] bg-[#05070d] flex flex-col p-8 overflow-y-auto"
      >
        <div className="max-w-4xl mx-auto w-full">
           <div className="flex justify-between items-center mb-12">
              <div>
                <h2 className="text-6xl font-display font-black text-white italic tracking-tighter uppercase leading-none">Flashcard Arena</h2>
                <p className="text-amber-500 font-mono text-[10px] uppercase font-bold tracking-[0.4em] mt-3">Active Recall Protocol v1.0</p>
              </div>
              <button onClick={onClose} className="p-4 hover:bg-white/5 rounded-full text-white/40 hover:text-white transition-all">
                <X className="w-10 h-10" />
              </button>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {decks.map(deck => (
                <motion.div
                  key={deck.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveDeckId(deck.id)}
                  className="bg-white/5 border border-white/10 p-8 rounded-[3rem] cursor-pointer hover:border-amber-500/40 hover:bg-amber-500/5 group transition-all"
                >
                   <div className="w-14 h-14 bg-amber-500/20 text-amber-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                      <Brain className="w-8 h-8" />
                   </div>
                   <h3 className="text-2xl font-display font-black text-white uppercase italic mb-2 tracking-tight">{deck.title}</h3>
                   <div className="flex items-center gap-3 mb-6">
                      <p className="text-xs text-white/40 uppercase font-black tracking-widest">{deck.cards.length} Cards</p>
                      <div className="w-1 h-1 rounded-full bg-white/20" />
                      <p className="text-xs text-amber-500 font-black uppercase tracking-widest">{deck.subject}</p>
                   </div>
                   <div className="pt-6 border-t border-white/5 flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-widest text-white/20">Mastery: {deck.masteryLevel}%</span>
                      <div className="flex gap-2">
                        <button 
                          onClick={(e) => { e.stopPropagation(); startBossBattle(deck.id); }}
                          className="p-2 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-lg transition-all"
                        >
                           <Skull className="w-4 h-4" />
                        </button>
                        <ChevronRight className="w-5 h-5 text-amber-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                   </div>
                </motion.div>
              ))}
           </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[300] bg-[#05070d] flex flex-col p-8 overflow-hidden"
    >
       <div className="max-w-2xl mx-auto w-full h-full flex flex-col pt-12">
          <div className="flex justify-between items-center mb-12">
             <button onClick={() => { setActiveDeckId(null); setIsBossMode(false); }} className="flex items-center gap-2 text-white/40 hover:text-white transition-colors uppercase font-black text-[10px] tracking-widest">
                <ChevronLeft className="w-4 h-4" /> Exit Arena
             </button>
             <div className="flex flex-col items-center">
                <span className="text-[10px] font-black uppercase text-amber-500 tracking-[0.2em]">{activeDeck.title}</span>
                {isBossMode ? (
                   <div className="flex flex-col items-center gap-1 mt-2">
                      <div className="w-48 h-1.5 bg-white/10 rounded-full overflow-hidden border border-white/5">
                        <motion.div 
                          animate={{ width: `${bossHealth}%` }}
                          className="h-full bg-red-600 shadow-[0_0_10px_rgba(220,38,38,0.5)]"
                        />
                      </div>
                      <span className="text-[8px] font-black text-red-500 uppercase tracking-widest">{timer}s REMAINING</span>
                   </div>
                ) : (
                   <span className="text-[8px] font-bold text-white/40 italic">{currentIndex + 1} of {activeDeck.cards.length}</span>
                )}
             </div>
             <div className="w-20" />
          </div>

          <div className="flex-1 flex flex-col justify-center perspective-1000">
             <AnimatePresence mode="wait">
               {showResults ? (
                 <motion.div
                   key="results"
                   initial={{ opacity: 0, scale: 0.9 }}
                   animate={{ opacity: 1, scale: 1 }}
                   className="bg-white/5 border border-white/10 rounded-[4rem] p-12 text-center"
                 >
                    <div className="w-24 h-24 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-8">
                       <Flame className="w-12 h-12 text-amber-500" />
                    </div>
                    <h3 className="text-4xl font-display font-black text-white uppercase italic tracking-tighter mb-4">
                      {isBossMode ? (bossHealth <= 0 ? 'BOSS EXTERMINATED' : 'MISSION FAILED') : 'Session Complete'}
                    </h3>
                    <div className="grid grid-cols-2 gap-4 mb-12">
                       <div className="p-6 bg-emerald-500/10 rounded-[2rem] border border-emerald-500/20">
                          <p className="text-3xl font-display font-black text-emerald-500">{isBossMode ? (bossHealth <= 0 ? '100%' : '0%') : stats.mastered}</p>
                          <p className="text-[10px] font-black uppercase text-emerald-500/60 tracking-widest">{isBossMode ? 'Efficiency' : 'Mastered'}</p>
                       </div>
                       <div className="p-6 bg-red-500/10 rounded-[2rem] border border-red-500/20">
                          <p className="text-3xl font-display font-black text-red-500">{isBossMode ? `${Math.round(bossHealth)}%` : stats.struggling}</p>
                          <p className="text-[10px] font-black uppercase text-red-500/60 tracking-widest">{isBossMode ? 'Boss HP' : 'Re-Grind'}</p>
                       </div>
                    </div>
                    <button 
                      onClick={() => {
                        onSessionComplete(activeDeckId, isBossMode ? { mastered: bossHealth <= 0 ? activeDeck.cards.length : 0 } : stats);
                        onClose();
                      }}
                      className="w-full py-6 bg-amber-600 rounded-[2rem] font-black text-white hover:bg-amber-500 transition-all uppercase tracking-widest text-sm shadow-[0_10px_40px_rgba(217,119,6,0.3)]"
                    >
                      Retrieve Rewards
                    </button>
                 </motion.div>
               ) : (
                 <motion.div 
                    key={currentIndex}
                    initial={{ x: 300, opacity: 0, rotateY: 45 }}
                    animate={{ x: 0, opacity: 1, rotateY: 0 }}
                    exit={{ x: -300, opacity: 0, rotateY: -45 }}
                    className="relative w-full aspect-[4/5] md:aspect-[5/3]"
                 >
                    <motion.div
                      animate={{ rotateY: isFlipped ? 180 : 0 }}
                      transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
                      className="w-full h-full preserve-3d cursor-pointer"
                      onClick={() => setIsFlipped(!isFlipped)}
                    >
                       <div className="absolute inset-0 backface-hidden bg-white/5 border border-white/10 rounded-[3.5rem] flex flex-col items-center justify-center p-12 text-center group">
                          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-500 mb-8">{isBossMode ? 'BOSS ATTACK' : 'Extermination Directive'}</p>
                          <h4 className="text-2xl md:text-3xl font-black text-white leading-tight italic tracking-tighter uppercase">{currentCard?.front}</h4>
                          <div className="absolute bottom-12 left-1/2 -translate-x-1/2 opacity-20 text-[10px] font-bold uppercase tracking-widest">Click to Flip</div>
                       </div>
                       <div className="absolute inset-0 backface-hidden bg-amber-500 border border-amber-400 rotate-y-180 rounded-[3.5rem] flex flex-col items-center justify-center p-12 text-center text-black">
                          <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40 mb-8">Solution Payload</p>
                          <h4 className="text-2xl md:text-3xl font-black leading-tight italic tracking-tighter uppercase">{currentCard?.back}</h4>
                       </div>
                    </motion.div>
                 </motion.div>
               )}
             </AnimatePresence>
          </div>

          <div className="mt-auto pb-12">
             {isFlipped && !showResults && (
               <motion.div 
                 initial={{ opacity: 0, y: 50 }}
                 animate={{ opacity: 1, y: 0 }}
                 className="flex gap-4"
               >
                  <button 
                    onClick={() => handleNext(false)}
                    className="flex-1 py-6 bg-red-600/20 text-red-500 border border-red-500/20 rounded-[2rem] font-black uppercase tracking-widest text-sm hover:bg-red-600 hover:text-white transition-all flex items-center justify-center gap-3"
                  >
                    <RotateCcw className="w-5 h-5" /> {isBossMode ? 'MISS' : 'RE-GRIND'}
                  </button>
                  <button 
                    onClick={() => handleNext(true)}
                    className="flex-1 py-6 bg-emerald-600/20 text-emerald-500 border border-emerald-500/20 rounded-[2rem] font-black uppercase tracking-widest text-sm hover:bg-emerald-600 hover:text-white transition-all flex items-center justify-center gap-3"
                  >
                    <Zap className="w-5 h-5" /> {isBossMode ? 'CRITICAL HIT' : 'MASTERED'}
                  </button>
               </motion.div>
             )}
          </div>
       </div>
    </motion.div>
  );
};
