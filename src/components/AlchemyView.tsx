import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Zap, 
  FlaskConical, 
  Sparkles, 
  Flame, 
  Skull, 
  Star, 
  Hammer, 
  ShieldCheck, 
  Infinity as InfinityIcon, 
  Key, 
  Award,
  Lock,
  MessageSquare as Potion, 
  Activity, 
  Ghost,
  Info,
  Package,
  Wand2,
  ChevronRight,
  TrendingUp
} from 'lucide-react';
import { ResourceInventory, CraftedItem, CraftingRecipe } from '../types';
import { cn } from '../lib/utils';
import { launchConfetti } from '../lib/confetti';

const RECIPES: CraftingRecipe[] = [
  {
    id: 'f-shield',
    name: 'Focus Shield',
    description: 'Protects your streak from decaying for one missed day.',
    inputs: { crystals: 50, tokens: 10 },
    outputType: 'focus_shield',
    rarity: 'common'
  },
  {
    id: 'xp-amp',
    name: 'XP Amplifier',
    description: '2x XP multiplier for your next focus session or task completion.',
    inputs: { crystals: 100, shards: 30 },
    outputType: 'xp_amplifier',
    rarity: 'rare'
  },
  {
    id: 'd-key',
    name: 'Dimension Key',
    description: 'Instant unlock for any standard focus dimension.',
    inputs: { crystals: 200, tokens: 100, bones: 50 },
    outputType: 'dimension_key',
    rarity: 'epic'
  },
  {
    id: 'p-evolve',
    name: 'Evolution Potion',
    description: 'Temporary boost to all stats and Pochita level +1.',
    inputs: { bones: 150, shards: 100 },
    outputType: 'evolution_potion',
    rarity: 'epic'
  },
  {
    id: 'r-sabotage',
    name: 'Rival Distraction',
    description: 'Send a harmless but annoying notification to your rival.',
    inputs: { crystals: 500, bones: 50 },
    outputType: 'rival_sabotage',
    rarity: 'rare'
  },
  {
    id: 'l-trial',
    name: 'Legend Trial',
    description: 'Exclusive ticket to attempt the LEGEND rank final challenge.',
    inputs: { crystals: 1000, shards: 1000, tokens: 1000, bones: 1000, dust: 1000 },
    outputType: 'legend_trial',
    rarity: 'legendary'
  }
];

interface AlchemyViewProps {
  resources: ResourceInventory;
  craftedItems: CraftedItem[];
  onCraft: (recipe: CraftingRecipe) => void;
  onUseItem: (item: CraftedItem) => void;
}

export const AlchemyView: React.FC<AlchemyViewProps> = ({ resources, craftedItems, onCraft, onUseItem }) => {
  const [selectedRecipe, setSelectedRecipe] = useState<CraftingRecipe | null>(null);
  const [isCrafting, setIsCrafting] = useState(false);

  const canCraft = (recipe: CraftingRecipe) => {
    return Object.entries(recipe.inputs).every(([k, v]) => {
      const available = resources[k as keyof ResourceInventory] || 0;
      return available >= (v || 0);
    });
  };

  const handleCraftClick = (recipe: CraftingRecipe) => {
    if (!canCraft(recipe)) return;
    
    setIsCrafting(true);
    // Simulate complex crafting animation
    setTimeout(() => {
      onCraft(recipe);
      setIsCrafting(false);
      launchConfetti({ 
        colors: recipe.rarity === 'legendary' ? ['#fde047', '#fbbf24', '#ffffff'] : ['#00ffe0', '#7b5fe8'],
        count: 80
      });
    }, 2500);
  };

  const getRarityColor = (rarity: CraftingRecipe['rarity']) => {
     switch(rarity) {
       case 'common': return 'text-white/60 bg-white/5 border-white/10';
       case 'rare': return 'text-blue-400 bg-blue-500/10 border-blue-500/30';
       case 'epic': return 'text-purple-400 bg-purple-500/10 border-purple-500/30';
       case 'legendary': return 'text-amber-400 bg-amber-500/10 border-amber-500/30 ring-2 ring-amber-500/20';
     }
  };

  const resourceTypes = [
    { key: 'crystals', label: 'Crystals', icon: Sparkles, color: 'text-md-primary', desc: 'Earned focus minutes' },
    { key: 'shards', label: 'Energy Shards', icon: Zap, color: 'text-orange-400', desc: 'Habits marked' },
    { key: 'tokens', label: 'Flame Tokens', icon: Flame, color: 'text-red-400', desc: 'Streak milestones' },
    { key: 'bones', label: 'Devil Bones', icon: Skull, color: 'text-zinc-400', desc: 'Contracts complete' },
    { key: 'dust', label: 'Star Dust', icon: Star, color: 'text-amber-300', desc: 'Achievements earned' },
  ];

  return (
    <div className="min-h-screen pb-24 md:pb-8 pt-6 px-4 md:px-8 space-y-8 max-w-7xl mx-auto overflow-hidden">
      {/* Header */}
      <div className="space-y-4">
         <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20 shadow-[0_0_20px_rgba(168,85,247,0.1)]">
               <FlaskConical className="w-5 h-5 text-purple-400" />
            </div>
            <h1 className="text-3xl font-black italic uppercase tracking-tighter">Alchemy Workshop</h1>
         </div>
         
         {/* Resource Bar */}
         <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {resourceTypes.map(res => (
              <div key={res.key} className="glass-card p-4 flex flex-col gap-1 relative overflow-hidden group">
                 <div className="absolute top-0 right-0 p-2 opacity-5 translate-x-2 -translate-y-2 group-hover:opacity-10 transition-opacity">
                    <res.icon className="w-12 h-12" />
                 </div>
                 <div className="flex items-center gap-2">
                    <res.icon className={cn("w-4 h-4", res.color)} />
                    <span className="text-[10px] uppercase font-black tracking-widest text-white/40">{res.label}</span>
                 </div>
                 <div className="text-2xl font-black italic tracking-tighter text-white">
                   {resources[res.key as keyof ResourceInventory] || 0}
                 </div>
              </div>
            ))}
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-8">
        {/* Main Workshop Area */}
        <div className="space-y-6">
           <div className="flex items-center justify-between">
              <h2 className="text-xl font-black italic uppercase tracking-tight flex items-center gap-2">
                 <Hammer className="w-5 h-5 text-md-primary" />
                 Transmutation Recipes
              </h2>
              <div className="px-3 py-1 bg-white/5 rounded-full border border-white/5 text-[9px] font-mono text-white/40 uppercase tracking-widest">
                 System Ready
              </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {RECIPES.map(recipe => {
                const affordable = canCraft(recipe);
                return (
                  <button 
                    key={recipe.id}
                    onClick={() => setSelectedRecipe(recipe)}
                    className={cn(
                      "glass-card p-6 text-left transition-all relative overflow-hidden flex flex-col justify-between h-56",
                      selectedRecipe?.id === recipe.id ? "border-md-primary ring-2 ring-md-primary/20 bg-md-primary/5" : "hover:border-white/20",
                      !affordable && "opacity-80"
                    )}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className={cn("px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border", getRarityColor(recipe.rarity))}>
                         {recipe.rarity}
                      </div>
                      {!affordable && <Lock className="w-3 h-3 text-white/20" />}
                    </div>
                    
                    <div className="mb-4">
                      <h3 className="text-lg font-black italic uppercase tracking-tighter text-white mb-1 group-hover:text-md-primary transition-colors">{recipe.name}</h3>
                      <p className="text-white/40 text-[11px] leading-snug line-clamp-2">{recipe.description}</p>
                    </div>

                    <div className="space-y-3">
                       <div className="flex gap-2">
                          {Object.entries(recipe.inputs).map(([k, v]) => {
                             const has = resources[k as keyof ResourceInventory] || 0;
                             const Icon = resourceTypes.find(r => r.key === k)?.icon || Sparkles;
                             const color = resourceTypes.find(r => r.key === k)?.color || 'text-white';
                             return (
                               <div key={k} className="flex items-center gap-1.5 px-2 py-1 bg-white/5 rounded-lg border border-white/5">
                                  <Icon className={cn("w-3 h-3", color)} />
                                  <span className={cn("text-[10px] font-bold", has < (v || 0) ? "text-red-400" : "text-white")}>
                                     {has}/{v}
                                  </span>
                               </div>
                             )
                          })}
                       </div>
                       <div className="flex items-center justify-between">
                          <span className="text-[9px] font-bold text-white/20 uppercase tracking-[0.2em]">Deployable item</span>
                          <ChevronRight className="w-4 h-4 text-white/20" />
                       </div>
                    </div>
                  </button>
                )
              })}
           </div>
        </div>

        {/* Action Panel */}
        <div className="space-y-6">
           <AnimatePresence mode="wait">
             {selectedRecipe ? (
               <motion.div 
                 key="craft-panel"
                 initial={{ opacity: 0, x: 20 }}
                 animate={{ opacity: 1, x: 0 }}
                 exit={{ opacity: 0, x: 20 }}
                 className="glass-card p-8 flex flex-col gap-6 relative overflow-hidden"
               >
                  <div className="absolute top-0 inset-x-0 h-1 bg-md-primary/20">
                     <motion.div 
                       className="h-full bg-md-primary shadow-[0_0_10px_rgba(0,255,224,0.8)]"
                       animate={{ width: isCrafting ? '100%' : '0%' }}
                       transition={{ duration: isCrafting ? 2.5 : 0.3, ease: 'linear' }}
                     />
                  </div>

                  <div className="flex flex-col items-center text-center gap-4">
                     <div className={cn("w-20 h-20 rounded-[32px] flex items-center justify-center border-2 shadow-2xl transition-all relative", 
                       getRarityColor(selectedRecipe.rarity),
                       isCrafting && "animate-pulse scale-110"
                     )}>
                        {isCrafting ? (
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                          >
                             <Sparkles className="w-10 h-10" />
                          </motion.div>
                        ) : (
                          <Wand2 className="w-10 h-10" />
                        )}
                        <AnimatePresence>
                          {isCrafting && (
                             <motion.div 
                               initial={{ opacity: 0, scale: 0 }}
                               animate={{ opacity: [0, 1, 0], scale: [0, 2, 0], y: [0, -40, -80] }}
                               transition={{ repeat: Infinity, duration: 1 }}
                               className="absolute inset-0 flex items-center justify-center text-md-primary"
                             >
                                <FlaskConical className="w-8 h-8" />
                             </motion.div>
                          )}
                        </AnimatePresence>
                     </div>
                     <div>
                        <h3 className="text-2xl font-black italic uppercase tracking-tighter text-white">{selectedRecipe.name}</h3>
                        <p className="text-white/60 text-xs mt-2 leading-relaxed">{selectedRecipe.description}</p>
                     </div>
                  </div>

                  <div className="space-y-3 pt-4 border-t border-white/5">
                     <div className="text-[10px] uppercase font-black tracking-widest text-white/40 text-center mb-4">Required Materials</div>
                     {Object.entries(selectedRecipe.inputs).map(([k, v]) => {
                        const has = resources[k as keyof ResourceInventory] || 0;
                        const res = resourceTypes.find(r => r.key === k)!;
                        const prog = Math.min(100, (has / (v || 1)) * 100);
                        return (
                          <div key={k} className="space-y-1.5">
                             <div className="flex justify-between items-center text-[10px] font-bold">
                                <div className="flex items-center gap-2">
                                   <res.icon className={cn("w-3 h-3", res.color)} />
                                   <span className="text-white/60 uppercase">{res.label}</span>
                                </div>
                                <span className={has < (v||0) ? "text-red-400" : "text-md-primary"}>{has}/{v}</span>
                             </div>
                             <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                                <motion.div 
                                  className={cn("h-full", has < (v||0) ? "bg-red-500" : "bg-md-primary")}
                                  initial={{ width: 0 }}
                                  animate={{ width: `${prog}%` }}
                                />
                             </div>
                          </div>
                        )
                     })}
                  </div>

                  <button 
                    disabled={!canCraft(selectedRecipe) || isCrafting}
                    onClick={() => handleCraftClick(selectedRecipe)}
                    className={cn(
                      "w-full py-5 rounded-3xl font-black uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-3 overflow-hidden group disabled:opacity-30 disabled:grayscale disabled:hover:scale-100 shadow-xl",
                      canCraft(selectedRecipe) 
                        ? "bg-md-primary text-md-on-primary shadow-md-primary/20 hover:scale-[1.02] active:scale-95" 
                        : "bg-surface-variant text-on-surface"
                    )}
                  >
                     {isCrafting ? (
                       <InfinityIcon className="w-5 h-5 animate-[spin_3s_linear_infinite]" />
                     ) : (
                       <>
                         <Wand2 className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                         <span>TRANSMUTE ITEM</span>
                       </>
                     )}
                  </button>
               </motion.div>
             ) : (
               <motion.div 
                 key="inventory-panel"
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 1 }}
                 className="glass-card p-6 space-y-6"
               >
                  <div className="flex items-center gap-3">
                     <Package className="w-5 h-5 text-white/40" />
                     <h3 className="font-bold text-white uppercase tracking-widest text-xs">Inventory</h3>
                  </div>

                  <div className="space-y-4">
                     {craftedItems.length === 0 ? (
                       <div className="py-12 border-2 border-dashed border-white/5 rounded-[32px] flex flex-col items-center justify-center text-center px-6 gap-3 opacity-30">
                          <Package className="w-10 h-10" />
                          <p className="text-[10px] uppercase font-black tracking-widest">Workshop currently empty</p>
                       </div>
                     ) : (
                       craftedItems.map(item => (
                         <div key={item.id} className="p-4 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between group hover:bg-white/10 transition-all">
                            <div className="flex items-center gap-3">
                               <div className="w-10 h-10 rounded-xl bg-md-primary/10 flex items-center justify-center border border-md-primary/20">
                                  {item.type === 'focus_shield' && <ShieldCheck className="w-5 h-5 text-md-primary" />}
                                  {item.type === 'xp_amplifier' && <TrendingUp className="w-5 h-5 text-md-primary" />}
                                  {item.type === 'dimension_key' && <Key className="w-5 h-5 text-md-primary" />}
                                  {item.type === 'evolution_potion' && <Potion className="w-5 h-5 text-md-primary" />}
                                  {item.type === 'rival_sabotage' && <Ghost className="w-5 h-5 text-md-primary" />}
                                  {item.type === 'legend_trial' && <Award className="w-5 h-5 text-md-primary" />}
                               </div>
                               <div>
                                  <div className="text-xs font-bold text-white">{item.name || item.type.replace('_', ' ').toUpperCase()}</div>
                                  <div className="text-[9px] text-white/40 uppercase tracking-widest">Qty: {item.quantity}</div>
                               </div>
                            </div>
                            <button 
                              onClick={() => onUseItem(item)}
                              className="px-4 py-2 bg-md-primary/10 text-md-primary rounded-xl text-[9px] font-black uppercase tracking-widest border border-md-primary/20 hover:bg-md-primary hover:text-md-on-primary transition-all opacity-0 group-hover:opacity-100"
                            >
                               Deploy
                            </button>
                         </div>
                       ))
                     )}
                  </div>

                  <div className="p-5 bg-md-primary/10 rounded-3xl border border-md-primary/20 flex gap-4">
                     <Info className="w-5 h-5 text-md-primary shrink-0" />
                     <p className="text-[10px] text-md-primary/80 leading-relaxed font-bold uppercase tracking-tight">
                        Power-ups are permanently stored in your workshop and can be deployed at any mission stage.
                     </p>
                  </div>
               </motion.div>
             )}
           </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
