import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShoppingBag, 
  Zap, 
  Clock, 
  Palette, 
  Sparkles, 
  Shield, 
  Trophy, 
  Star,
  Lock,
  CheckCircle2,
  AlertCircle,
  Heart
} from 'lucide-react';
import { StoreItem, UserProfile } from '../types';
import { cn } from '../lib/utils';
import { PetAvatarRenderer } from './PetAvatarRenderer';

interface QuantumStoreProps {
  profile: UserProfile;
  items: StoreItem[];
  onPurchase: (item: StoreItem) => void;
  onEquip?: (itemId: string) => void;
}

export const QuantumStore: React.FC<QuantumStoreProps> = ({ profile, items, onPurchase, onEquip }) => {
  const [activeCategory, setActiveCategory] = useState<StoreItem['category'] | 'all' | 'pet'>('all');
  const [selectedItem, setSelectedItem] = useState<StoreItem | null>(null);

  const categories: { id: StoreItem['category'] | 'all' | 'pet', label: string, icon: any }[] = [
    { id: 'all', label: 'All Gear', icon: ShoppingBag },
    { id: 'pet', label: 'Pet Store', icon: Heart },
    { id: 'cosmetic', label: 'Cosmetics', icon: Palette },
    { id: 'powerup', label: 'Power-Ups', icon: Zap },
    { id: 'special', label: 'Special', icon: Star }
  ];

  const filteredItems = items.filter(item => {
    if (activeCategory === 'all') return true;
    if (activeCategory === 'pet') return item.type === 'pet';
    return (item.category as string) === activeCategory;
  });

  const isOwned = (itemId: string) => profile.inventory?.ownedItemIds?.includes(itemId) || false;
  const isActivePet = (itemId: string) => profile.activePetId === itemId;

  return (
    <div className="min-h-screen pb-24 md:pb-8 pt-6 px-4 md:px-8 space-y-8 md:space-y-12 max-w-7xl mx-auto font-sans">
       {/* Header */}
       <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 md:gap-8">
          <div className="space-y-1">
             <h1 className="text-3xl md:text-4xl font-black italic uppercase tracking-tighter text-white flex items-center gap-3 md:gap-4">
                <ShoppingBag className="w-8 h-8 md:w-10 md:h-10 text-md-primary" />
                QUANTUM STORE
             </h1>
             <p className="text-white/40 text-[9px] md:text-[10px] font-mono uppercase tracking-[0.4em]">Neural Enhancement Procurement Depot</p>
          </div>

          <div className="bg-white/5 border border-white/10 px-4 sm:px-8 py-3 sm:py-4 rounded-[1.5rem] sm:rounded-[2rem] flex items-center justify-between md:justify-start gap-4 sm:gap-6 shadow-xl w-full md:w-auto">
             <div className="flex flex-col">
                <span className="text-[7.5px] sm:text-[8px] font-black uppercase tracking-widest text-white/30">Available Capital</span>
                <span className="text-xl sm:text-2xl font-black text-md-primary flex items-center gap-1.5 sm:gap-2">
                   <Zap className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
                   {profile.xp.toLocaleString()} XP
                </span>
             </div>
             <div className="w-px h-10 bg-white/10" />
             <div className="flex -space-x-2">
                {(profile.inventory?.ownedItemIds || []).slice(0, 3).map((id, i) => (
                  <div key={id} className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-black bg-zinc-900 flex items-center justify-center text-[10px] z-10 font-mono text-white/60">
                     {(profile.inventory?.ownedItemIds || []).length - 1 === i && (profile.inventory?.ownedItemIds || []).length > 3 ? `+${(profile.inventory?.ownedItemIds || []).length - 3}` : <Shield className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white/40" />}
                  </div>
                ))}
             </div>
          </div>
       </div>

       {/* Category Navigation */}
       <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
          {categories.map(cat => (
             <button 
               key={cat.id}
               onClick={() => setActiveCategory(cat.id)}
               className={cn(
                 "px-4 sm:px-6 md:px-8 py-2.5 sm:py-3.5 md:py-4 rounded-xl sm:rounded-2xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 md:gap-3 border shrink-0",
                 activeCategory === cat.id 
                   ? "bg-md-primary text-md-on-primary border-md-primary shadow-lg shadow-md-primary/20" 
                   : "bg-white/5 text-white/40 border-white/5 hover:bg-white/10"
               )}
             >
                <cat.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                {cat.label}
             </button>
          ))}
       </div>

       {/* Items Grid (Responsive 2 columns on mobile, 4 on desktop) */}
       <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
          {filteredItems.map(item => {
             const owned = isOwned(item.id);
             const canAfford = profile.xp >= item.priceXP;

             return (
               <motion.div 
                 key={item.id}
                 initial={{ opacity: 0, y: 15 }}
                 animate={{ opacity: 1, y: 0 }}
                 whileHover={{ y: -6 }}
                 className={cn(
                   "glass-card bg-black border rounded-[1.5rem] sm:rounded-[2.5rem] overflow-hidden group/card relative flex flex-col h-full",
                   item.rarity === 'legendary' ? "border-amber-500/30" : "border-white/5"
                 )}
               >
                  {item.limited && (
                    <div className="absolute top-3 left-3 sm:top-6 sm:left-6 z-20 px-2 sm:px-3 py-1 bg-red-600 text-white text-[7px] sm:text-[8px] font-black uppercase tracking-widest rounded-full shadow-lg">
                       LIMITED
                    </div>
                  )}

                  <div className="aspect-square relative p-3 sm:p-6 shrink-0 flex items-center justify-center">
                     <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent rounded-[1rem] sm:rounded-[2rem] m-3 sm:m-6 transform group-hover/card:scale-110 transition-transform duration-700" />
                     {item.type === 'pet' ? (
                       <div className="w-24 h-24 sm:w-36 sm:h-36 md:w-40 md:h-40 relative z-10 transition-all duration-700 group-hover/card:scale-110 group-hover/card:rotate-3 flex items-center justify-center">
                         <PetAvatarRenderer petId={item.id} xp={profile.xp} />
                       </div>
                     ) : (
                       <img 
                         src={item.image} 
                         alt={item.name} 
                         className="w-24 h-24 sm:w-36 sm:h-36 md:w-40 md:h-40 object-contain relative z-10 transition-all duration-700 group-hover/card:scale-110 group-hover/card:rotate-3"
                         referrerPolicy="no-referrer"
                       />
                     )}
                  </div>

                  <div className="p-4 sm:p-6 lg:p-8 flex flex-col flex-1 gap-3 sm:gap-6">
                     <div className="flex-1 space-y-1 sm:space-y-2">
                        <div className="flex items-center justify-between">
                           <span className={cn(
                             "text-[7px] sm:text-[8px] font-black uppercase tracking-widest",
                             item.rarity === 'common' ? "text-white/20" : 
                             item.rarity === 'rare' ? "text-blue-400" :
                             item.rarity === 'epic' ? "text-purple-400" : "text-amber-500"
                           )}>
                              {item.rarity} {item.category}
                           </span>
                           {owned && <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-500 shrink-0 ml-2" />}
                        </div>
                        <h3 className="text-sm sm:text-base md:text-xl font-black italic uppercase tracking-tighter text-white line-clamp-1 sm:line-clamp-2 leading-tight">{item.name}</h3>
                        <p className="text-[10px] sm:text-xs text-white/40 leading-relaxed line-clamp-2 sm:line-clamp-3 mt-1 sm:mt-2">{item.description}</p>
                     </div>

                     <button 
                       disabled={(!owned && !canAfford) || (owned && item.type === 'pet' && isActivePet(item.id))}
                       onClick={() => {
                         if (owned) {
                           if (item.type === 'pet') onEquip?.(item.id);
                         } else {
                           setSelectedItem(item);
                         }
                       }}
                       className={cn(
                         "w-full py-3 sm:py-4 rounded-xl sm:rounded-2xl flex items-center justify-center gap-1.5 sm:gap-3 font-black uppercase tracking-widest text-[8px] sm:text-[10px] transition-all",
                         owned 
                           ? item.type === 'pet' 
                             ? isActivePet(item.id)
                               ? "bg-green-500/20 text-green-500 border border-green-500/30 cursor-default"
                               : "bg-md-primary text-md-on-primary shadow-xl hover:scale-105"
                             : "bg-white/5 text-white/20 border border-white/5 cursor-default" 
                           : canAfford
                             ? "bg-white text-black hover:bg-md-primary hover:text-md-on-primary shadow-xl hover:scale-105"
                             : "bg-red-500/10 text-red-500 border border-red-500/20 cursor-not-allowed"
                       )}
                     >
                        {owned ? (
                          item.type === 'pet'
                            ? isActivePet(item.id) ? "ACTIVE COMPANION" : "EQUIP PROTOCOL"
                            : "COLLECTED"
                        ) : (
                          <>
                            <Zap className="w-3 h-3 fill-current" />
                            {item.priceXP.toLocaleString()} XP
                          </>
                        )}
                     </button>
                  </div>
               </motion.div>
             );
          })}
       </div>

       {/* Purchase Confirmation Modal */}
       <AnimatePresence>
          {selectedItem && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[500] flex items-center justify-center p-4 backdrop-blur-2xl bg-black/80"
              onClick={() => setSelectedItem(null)}
            >
               <motion.div 
                 initial={{ scale: 0.9, y: 20 }}
                 animate={{ scale: 1, y: 0 }}
                 exit={{ scale: 0.9, y: 20 }}
                 className="glass-card bg-black border border-white/10 w-full max-w-lg rounded-[2rem] sm:rounded-[3rem] p-6 sm:p-10 space-y-6 sm:space-y-8 relative overflow-hidden"
                 onClick={e => e.stopPropagation()}
               >
                  <div className="absolute top-0 right-0 p-8 opacity-5">
                     <ShoppingBag className="w-48 h-48" />
                  </div>

                  <div className="space-y-2 relative z-10">
                     <h2 className="text-sm font-black uppercase tracking-widest text-md-primary">Confirm Protocol</h2>
                     <h3 className="text-2xl sm:text-3xl font-black italic uppercase tracking-tighter text-white">Acquire {selectedItem.name}?</h3>
                  </div>

                  <div className="flex gap-4 sm:gap-8 items-center relative z-10">
                     <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl sm:rounded-3xl bg-white/5 p-3 sm:p-4 border border-white/10 flex items-center justify-center shrink-0">
                        {selectedItem.type === 'pet' ? (
                          <div className="w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center">
                           <PetAvatarRenderer petId={selectedItem.id} xp={profile.xp} />
                          </div>
                        ) : (
                          <img src={selectedItem.image} alt="" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                        )}
                     </div>
                     <div className="space-y-2 sm:space-y-4">
                        <div className="flex flex-col">
                           <span className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest text-white/30">Cost</span>
                           <span className="text-lg sm:text-xl font-black text-md-primary">{selectedItem.priceXP} XP</span>
                        </div>
                        <div className="flex flex-col">
                           <span className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest text-white/30">Current Balance</span>
                           <span className="text-xs sm:text-sm font-black text-white/60">{profile.xp} XP</span>
                        </div>
                     </div>
                  </div>

                  <div className="space-y-3 sm:space-y-4 relative z-10">
                     <button 
                       onClick={() => {
                         onPurchase(selectedItem);
                         setSelectedItem(null);
                       }}
                       className="w-full py-4 sm:py-5 bg-white text-black font-black uppercase tracking-widest text-xs rounded-xl sm:rounded-2xl hover:bg-md-primary hover:text-md-on-primary transition-all active:scale-95 shadow-2xl"
                     >
                        Confirm Transaction
                     </button>
                     <button 
                       onClick={() => setSelectedItem(null)}
                       className="w-full py-4 text-white/40 font-black uppercase tracking-widest text-[10px] hover:text-white transition-colors"
                     >
                        Cancel
                     </button>
                  </div>
               </motion.div>
            </motion.div>
          )}
       </AnimatePresence>
    </div>
  );
};
