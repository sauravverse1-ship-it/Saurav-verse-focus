import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Persona } from '../types';

import { cn } from '../lib/utils';
import { CheckCircle2 } from 'lucide-react';

interface PersonaLabProps {
  currentPersona: Persona | null;
  onSavePersona?: (persona: Partial<Persona>) => void;
}

export const PersonaLab: React.FC<PersonaLabProps> = ({ currentPersona, onSavePersona }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(currentPersona?.name || '');
  const [traitInput, setTraitInput] = useState(currentPersona?.traits?.join(', ') || '');
  const [signaturePhrase, setSignaturePhrase] = useState(currentPersona?.signaturePhrase || '');
  const [photoURL, setPhotoURL] = useState(currentPersona?.photoURL || '');
  const [visualStyle, setVisualStyle] = useState<Persona['visualStyle']>(currentPersona?.visualStyle || 'neon');

  const presetCharacters = [
    { name: 'Makima', traits: 'Control, Calm, Ruthless', signaturePhrase: 'A devil hunter who doesn\'t focus is useless.', style: 'crimson', url: 'https://wallpapercave.com/wp/wp8353386.jpg' },
    { name: 'Denji', traits: 'Wild, Chaotic, Hero', signaturePhrase: 'I\'ll slice through these tasks!', style: 'gold', url: 'https://wallpapercave.com/wp/wp8353335.png' },
    { name: 'Power', traits: 'Blood, Blood, Blood', signaturePhrase: 'I AM THE PRESIDENT!', style: 'crimson', url: 'https://wallpapercave.com/wp/wp8353412.jpg' },
    { name: 'Aki', traits: 'Cool, Focused, Tragic', signaturePhrase: 'I have to do this.', style: 'neon', url: 'https://wallpapercave.com/wp/wp8353360.jpg' },
    { name: 'Kobeni', traits: 'Nervous, Sudden, Fast', signaturePhrase: '...Please don\'t kill me!', style: 'shadow', url: 'https://wallpapercave.com/wp/wp10740922.jpg' },
    { name: 'Kishibe', traits: 'Veteran, Drunk, Lethal', signaturePhrase: '1st policy: No dying. 2nd policy: No dying.', style: 'shadow', url: 'https://wallpapercave.com/wp/wp11400305.jpg' },
    { name: 'Reze', traits: 'Bomb, Sweet, Dangerous', signaturePhrase: 'Should we run away together?', style: 'violet', url: 'https://wallpapercave.com/wp/wp11812852.jpg' }
  ];

  const handleApplyPreset = (idx: number) => {
    const p = presetCharacters[idx];
    setName(p.name);
    setTraitInput(p.traits);
    setSignaturePhrase(p.signaturePhrase);
    setPhotoURL(p.url);
    setVisualStyle(p.style as any);
  };

  const handleSave = () => {
    if (name && traitInput && onSavePersona) {
      const traits = traitInput.split(',').map(t => t.trim()).filter(Boolean).slice(0, 3);
      onSavePersona({ name, traits, signaturePhrase, photoURL, visualStyle, level: currentPersona?.level || 1, experience: currentPersona?.experience || 0, totalHours: currentPersona?.totalHours || 0, flawlessSessions: currentPersona?.flawlessSessions || 0 });
      setIsEditing(false);
    }
  };

  if (!currentPersona && !isEditing) {
    return (
      <div className="p-8 rounded-[2.5rem] bg-white/5 border border-white/5 flex flex-col items-center justify-center text-center">
        <h2 className="text-sm font-black uppercase tracking-widest text-white/40 mb-6">Persona Lab</h2>
        <p className="text-white/60 mb-6 text-sm">Create your alter ego for deep focus.</p>
        <button onClick={() => setIsEditing(true)} className="w-full py-4 rounded-xl bg-white text-black font-black uppercase text-xs tracking-widest hover:bg-white/90">
            Create Your Persona
        </button>
      </div>
    );
  }

  const styles = {
    neon: 'from-cyan-500 to-blue-500',
    violet: 'from-purple-500 to-pink-500',
    gold: 'from-yellow-500 to-orange-500',
    crimson: 'from-red-500 to-rose-700',
    shadow: 'from-zinc-700 to-black'
  };

  return (
    <div className="p-8 rounded-[2.5rem] bg-white/5 border border-white/5 relative h-full">
      <h2 className="text-sm font-black uppercase tracking-widest text-white/40 mb-6">Persona Lab</h2>
      {isEditing ? (
        <div className="space-y-6">
          <div className="space-y-3">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-white/30">Select Character Preset</h3>
            <div className="flex gap-3 bg-white/5 p-4 rounded-3xl overflow-x-auto no-scrollbar snap-x">
              {presetCharacters.map((p, i) => (
                <button 
                  key={i} 
                  onClick={() => handleApplyPreset(i)} 
                  className={cn(
                    "group relative w-24 sm:w-32 aspect-square rounded-2xl overflow-hidden border-2 transition-all flex-shrink-0 snap-center",
                    name === p.name ? "border-md-primary scale-95 shadow-[0_0_20px_rgba(234,88,12,0.4)]" : "border-transparent hover:border-white/20 grayscale hover:grayscale-0"
                  )}
                >
                  <img src={p.url} loading="lazy" className="w-full h-full object-cover" />
                  <div className="absolute inset-x-0 bottom-0 bg-black/80 p-2 text-center backdrop-blur-md translate-y-full group-hover:translate-y-0 transition-transform">
                    <span className="text-[9px] font-black uppercase text-white">{p.name}</span>
                  </div>
                  {name === p.name && (
                    <div className="absolute top-2 right-2 bg-md-primary rounded-full p-1 shadow-lg">
                      <CheckCircle2 className="w-3 h-3 text-md-on-primary" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
          <input 
            value={name} 
            onChange={e => setName(e.target.value)} 
            placeholder="Persona Name (e.g. The Iron Scholar)"
            className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white placeholder:text-white/20"
          />
          <input 
            value={traitInput} 
            onChange={e => setTraitInput(e.target.value)} 
            placeholder="Traits (comma separated, max 3)"
            className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white placeholder:text-white/20"
          />
          <input 
            value={signaturePhrase} 
            onChange={e => setSignaturePhrase(e.target.value)} 
            placeholder="Signature Phrase"
            className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white placeholder:text-white/20"
          />
          <input 
            value={photoURL} 
            onChange={e => setPhotoURL(e.target.value)} 
            placeholder="Persona Photo URL (Optional)"
            className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white placeholder:text-white/20"
          />
          <select 
            value={visualStyle}
            onChange={e => setVisualStyle(e.target.value as any)}
            className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none"
          >
            <option value="neon">Neon (Cyan/Blue)</option>
            <option value="violet">Violet (Purple/Pink)</option>
            <option value="gold">Gold (Yellow/Orange)</option>
            <option value="crimson">Crimson (Red)</option>
            <option value="shadow">Shadow (Dark)</option>
          </select>
          <div className="flex gap-2">
            <button onClick={handleSave} className="px-6 py-3 bg-white text-black rounded-xl font-bold hover:bg-white/90 flex-1">
              Save
            </button>
            <button onClick={() => setIsEditing(false)} className="px-6 py-3 bg-white/10 text-white rounded-xl font-bold hover:bg-white/20">
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="relative group cursor-pointer" onClick={() => setIsEditing(true)}>
          <div className="flex items-center gap-6">
              {currentPersona?.photoURL ? (
                <img src={currentPersona.photoURL} alt={currentPersona.name} className="w-16 h-16 rounded-full object-cover shrink-0 shadow-lg"/>
              ) : (
                <div className={`w-16 h-16 rounded-full bg-gradient-to-tr ${styles[currentPersona?.visualStyle || 'neon']} shadow-lg shrink-0`} />
              )}
              <div>
                  <p className="text-xl font-black text-white">{currentPersona?.name}</p>
                  <p className="text-xs text-purple-400 capitalize">{currentPersona?.traits?.join(' · ')}</p>
                  <p className="text-xs text-white/50 mt-1 italic">"{currentPersona?.signaturePhrase}"</p>
              </div>
          </div>
          <div className="mt-6 grid grid-cols-3 gap-2 border-t border-white/10 pt-4">
              <div className="text-center">
                  <p className="text-[10px] font-black uppercase text-white/40">Level</p>
                  <p className="text-lg font-black text-white">{currentPersona?.level}</p>
              </div>
              <div className="text-center">
                  <p className="text-[10px] font-black uppercase text-white/40">Hours</p>
                  <p className="text-lg font-black text-white">{currentPersona?.totalHours}</p>
              </div>
              <div className="text-center">
                  <p className="text-[10px] font-black uppercase text-white/40">Flawless</p>
                  <p className="text-lg font-black text-white">{currentPersona?.flawlessSessions}</p>
              </div>
          </div>
          <div className="absolute -inset-4 bg-black/50 blur-md opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-xl z-10 pointer-events-none" />
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-20">
              <span className="text-white font-bold px-4 py-2 text-sm drop-shadow-md bg-black/80 rounded-full">Edit Persona</span>
          </div>
        </div>
      )}
    </div>
  );
};
