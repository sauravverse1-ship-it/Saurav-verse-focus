import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, Sword, Heart, Zap, Skull, CheckCircle2, Lock, Sparkles, MessageSquare, Briefcase, X } from 'lucide-react';
import { cn } from '../lib/utils';
import { UserProfile, Character } from '../types';
import { BUREAU_CHARACTERS } from '../constants';

interface PublicSafetyBureauProps {
  profile: UserProfile;
  onRecruit: (characterId: string) => void;
  onSelectCharacter: (characterId: string | null) => void;
  onSelectMission: (mission: any) => void;
}

export const PublicSafetyBureau: React.FC<PublicSafetyBureauProps> = ({ profile, onRecruit, onSelectCharacter, onSelectMission }) => {
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);

  return (
    <div className="p-6 space-y-12 pb-32">
      {/* Header section with cinematic entrance */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-red-600/10 border border-red-600/20 text-red-600">
             <Shield className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-4xl font-display font-black text-white italic tracking-tighter uppercase leading-none">Public Safety Bureau</h1>
            <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em] mt-2">Division 4 Recruitment HQ</p>
          </div>
        </div>
      </motion.div>

      {/* Grid of characters */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {BUREAU_CHARACTERS.map((char, index) => {
          const isRecruited = profile.recruitedCharacters?.includes(char.id);
          return (
            <motion.div
              key={char.id}
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
              onClick={() => setSelectedCharacter(char)}
              className={cn(
                "group relative aspect-[3/4.5] rounded-[3rem] overflow-hidden border-2 transition-all duration-500 cursor-pointer shadow-2xl",
                isRecruited ? "border-emerald-500/50" : "border-white/5 hover:border-red-600/40"
              )}
            >
              {/* Character Image Background */}
              <div className="absolute inset-0 grayscale group-hover:grayscale-0 transition-all duration-700 scale-100 group-hover:scale-105">
                <img 
                  src={char.image} 
                  alt={char.name} 
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
              </div>

              {/* Overlay with details */}
              <div className="absolute inset-x-0 bottom-0 p-8 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-display font-black text-white italic uppercase leading-none">{char.name}</h3>
                    <p className="text-[10px] text-red-500 font-black uppercase tracking-widest mt-1">{char.role}</p>
                  </div>
                  {isRecruited ? (
                    <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                  ) : (
                    <Lock className="w-6 h-6 text-white/20" />
                  )}
                </div>

                <div className="h-px bg-white/5" />

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-emerald-500">
                    <Sparkles className="w-3 h-3" />
                    <span>Buff: {char.buff}</span>
                  </div>
                </div>
              </div>

              {/* Recruitment Progress / Status */}
              {!isRecruited && (
                <div className="absolute top-6 right-6">
                  <div className="bg-black/60 backdrop-blur-md border border-white/10 px-4 py-2 rounded-full">
                    <span className="text-[8px] font-black uppercase tracking-tighter text-white/40">{char.requirement}</span>
                  </div>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Selected Character Interaction Modal */}
      <AnimatePresence>
        {selectedCharacter && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/90 backdrop-blur-2xl"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="w-full max-w-2xl bg-neutral-950 border border-white/5 rounded-[4rem] p-12 relative overflow-hidden"
            >
              {/* Background Glow */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1/2 bg-[conic-gradient(from_0deg,transparent,rgba(220,38,38,0.1),transparent)] animate-[spin_10s_linear_infinite]" />

              <div className="relative z-10 space-y-8">
                <div className="flex justify-between items-start">
                  <div className="flex gap-6 items-center">
                    <div className="w-24 h-24 rounded-3xl overflow-hidden border-2 border-red-600/40">
                      <img 
                        src={selectedCharacter.image} 
                        className="w-full h-full object-cover" 
                        alt="" 
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div>
                      <h2 className="text-5xl font-display font-black text-white italic uppercase tracking-tighter">{selectedCharacter.name}</h2>
                      <p className="text-red-500 font-bold uppercase tracking-[0.3em] text-xs mt-1">{selectedCharacter.role}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setSelectedCharacter(null)}
                    className="p-3 bg-white/5 hover:bg-white/10 rounded-full text-white/40 hover:text-white transition-all"
                  >
                    <X className="w-8 h-8" />
                  </button>
                </div>

                <p className="text-xl text-white/60 font-serif italic leading-relaxed">
                  "{selectedCharacter.description}"
                </p>

                <div className="grid grid-cols-2 gap-6">
                  <div className="p-8 rounded-[2.5rem] bg-white/5 border border-white/5 space-y-4">
                    <div className="flex items-center justify-between">
                       <div className="flex items-center gap-3 text-emerald-500">
                          <Zap className="w-6 h-6" />
                          <span className="text-xs font-black uppercase tracking-widest">Active Influence</span>
                       </div>
                       <div className="text-[10px] text-white/20 font-mono">Bond: {profile.characterBonds?.[selectedCharacter.id] || 0}</div>
                    </div>
                    <p className="text-lg font-display font-black text-white italic uppercase">{selectedCharacter.buff}</p>
                    
                    {profile.recruitedCharacters?.includes(selectedCharacter.id) && (
                      <div className="pt-2">
                        <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(100, ((profile.characterBonds?.[selectedCharacter.id] || 0) % 100))}%` }}
                            className="h-full bg-emerald-500"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="p-8 rounded-[2.5rem] bg-white/5 border border-white/5 space-y-4">
                    <div className="flex items-center gap-3 text-white/40">
                       <Lock className="w-6 h-6" />
                       <span className="text-xs font-black uppercase tracking-widest">Unlock Requirement</span>
                    </div>
                    <p className="text-lg font-display font-black text-white/40 italic uppercase">{selectedCharacter.requirement}</p>
                  </div>
                </div>

                <div className="flex gap-4">
                   {profile.recruitedCharacters?.includes(selectedCharacter.id) ? (
                     <>
                       <button 
                         onClick={() => onSelectMission({ 
                           title: `Special Directive: ${selectedCharacter.id.toUpperCase()}`,
                           type: 'study',
                           difficulty: 3 
                         })}
                         className="flex-1 py-6 bg-emerald-600 hover:bg-emerald-500 text-white rounded-[2rem] font-black uppercase tracking-widest text-sm shadow-[0_20px_50px_rgba(16,185,129,0.3)] transition-all"
                       >
                          Accept Directive
                       </button>
                       <button 
                         onClick={() => onSelectCharacter(profile.activeCharacterId === selectedCharacter.id ? null : selectedCharacter.id)}
                         className={cn(
                           "px-6 py-6 rounded-[2rem] font-black uppercase tracking-widest text-xs transition-all border-2",
                           profile.activeCharacterId === selectedCharacter.id 
                             ? "bg-amber-500 border-amber-600 text-black shadow-[0_0_20px_rgba(245,158,11,0.4)]" 
                             : "bg-white/5 border-white/10 text-white hover:bg-white/10"
                         )}
                       >
                          {profile.activeCharacterId === selectedCharacter.id ? "Partner" : "Assign"}
                       </button>
                     </>
                   ) : (
                     <button 
                       onClick={() => onRecruit(selectedCharacter.id)}
                       className="flex-1 py-6 bg-red-600 hover:bg-red-500 text-white rounded-[2rem] font-black uppercase tracking-widest text-sm shadow-[0_20px_50px_rgba(220,38,38,0.3)] transition-all"
                     >
                        Draft Contract
                     </button>
                   )}
                   <button 
                     onClick={() => {
                        setSelectedCharacter(null);
                        // Future: Open AI chat with this context
                     }}
                     className="px-8 py-6 bg-white/5 hover:bg-white/10 text-white rounded-[2rem] font-black uppercase tracking-widest text-sm transition-all"
                   >
                      <X className="w-6 h-6" />
                   </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
