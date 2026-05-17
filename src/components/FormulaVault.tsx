import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Star, BookOpen, ChevronRight, X } from 'lucide-react';
import { cn } from '../lib/utils';

const FORMULAS = {
  physics: [
    { title: "Newton's Second Law", formula: "F = ma", details: "F: Force, m: Mass, a: Acceleration", unit: "Newton (N)" },
    { title: "Kinetic Energy", formula: "K.E. = ½mv²", details: "m: Mass, v: Velocity", unit: "Joule (J)" },
    { title: "Work Done", formula: "W = Fd cos θ", details: "F: Force, d: Displacement, θ: Angle", unit: "Joule (J)" },
    { title: "Gravitational Force", formula: "F = G(m₁m₂)/r²", details: "G: Gravitational Constant, r: Distance", unit: "Newton (N)" },
  ],
  chemistry: [
    { title: "Ideal Gas Law", formula: "PV = nRT", details: "P: Pressure, V: Volume, n: Moles, R: Gas Constant, T: Temperature", unit: "atm·L/mol·K" },
    { title: "Mole Fraction", formula: "χᵢ = nᵢ / Σn", details: "nᵢ: Moles of component, Σn: Total moles", unit: "Dimensionless" },
    { title: "Molarity", formula: "M = n_solute / V_solution", details: "n: Moles, V: Volume in Liters", unit: "mol/L" },
  ],
  math: [
    { title: "Quadratic Formula", formula: "x = (-b ± √(b² - 4ac)) / 2a", details: "Standard form: ax² + bx + c = 0", unit: "Roots" },
    { title: "Euler's Identity", formula: "e^(iπ) + 1 = 0", details: "Relates e, i, π, 1, and 0", unit: "Constant" },
    { title: "Integration: ∫xⁿ dx", formula: "(xⁿ⁺¹)/(n+1) + C", details: "n ≠ -1", unit: "Result" },
  ]
};

export const FormulaVault: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'physics' | 'chemistry' | 'math'>('physics');
  const [search, setSearch] = useState('');
  const [favorites, setFavorites] = useState<string[]>([]);

  const filteredFormulas = FORMULAS[activeTab].filter(f => 
    f.title.toLowerCase().includes(search.toLowerCase()) || 
    f.formula.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4 md:p-10"
    >
      <div className="w-full max-w-4xl h-full max-h-[800px] bg-neutral-950 border border-white/5 rounded-[3rem] overflow-hidden flex flex-col">
        <header className="p-8 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-md-primary/20 rounded-2xl">
              <BookOpen className="w-6 h-6 text-md-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-display font-black text-white italic uppercase tracking-tighter">Formula Vault</h2>
              <p className="text-[10px] text-white/50 uppercase font-black tracking-widest">Quantum Reference System</p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-white/5 rounded-full transition-colors text-white/50 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </header>

        <div className="flex-1 overflow-hidden flex flex-col">
          <div className="p-8 pb-4">
            <div className="relative mb-6">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
              <input 
                type="text" 
                placeholder="Search formulas (e.g. Newton, Gravity...)"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-white placeholder:text-white/20 focus:ring-2 focus:ring-md-primary outline-none transition-all"
              />
            </div>

            <div className="flex gap-2 mb-8">
              {(['physics', 'chemistry', 'math'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    "px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                    activeTab === tab 
                      ? "bg-md-primary text-md-on-primary shadow-[0_0_20px_rgba(0,179,161,0.3)]" 
                      : "bg-white/5 text-white/50 hover:bg-white/10"
                  )}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-8 pb-8 grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredFormulas.map((f, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="group p-6 bg-white/5 border border-white/10 rounded-[2rem] hover:border-md-primary/50 transition-all cursor-pointer relative"
                onClick={() => {
                  if (favorites.includes(f.title)) {
                    setFavorites(prev => prev.filter(t => t !== f.title));
                  } else {
                    setFavorites(prev => [...prev, f.title]);
                  }
                }}
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-white font-bold tracking-tight">{f.title}</h3>
                  <Star className={cn("w-4 h-4 transition-colors", favorites.includes(f.title) ? "text-amber-400 fill-amber-400" : "text-white/10")} />
                </div>
                <div className="py-4 px-6 bg-black/40 rounded-xl border border-white/5 text-center">
                  <span className="text-2xl font-mono font-black text-md-primary tracking-wider">{f.formula}</span>
                </div>
                <div className="mt-4 flex flex-col gap-1">
                  <span className="text-[10px] text-white/30 uppercase font-black">Variables</span>
                  <p className="text-xs text-white/60 leading-relaxed">{f.details}</p>
                </div>
                {f.unit && (
                  <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
                    <span className="text-[10px] text-white/30 uppercase font-black">Unit</span>
                    <span className="text-xs font-mono font-bold text-md-primary">{f.unit}</span>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
