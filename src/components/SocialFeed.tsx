import React from 'react';
import { motion } from 'motion/react';
import { Flame, MessageSquare, Share2, User, Trophy, Zap, Sparkles, Camera } from 'lucide-react';
import { cn } from '../lib/utils';
import { SocialPost } from '../types';

interface SocialFeedProps {
  posts: SocialPost[];
  currentUserId: string;
  onReact: (postId: string) => void;
  onChallenge?: (userId: string) => void;
}

export const SocialFeed: React.FC<SocialFeedProps> = ({ posts, currentUserId, onReact, onChallenge }) => {
  return (
    <div className="space-y-6 pb-24">
      {posts.length === 0 && (
        <div className="p-12 text-center border-2 border-dashed border-white/5 rounded-[3rem]">
           <Sparkles className="w-12 h-12 text-white/10 mx-auto mb-4" />
           <p className="text-white/40 uppercase font-black tracking-widest text-xs">The Sector is quiet. Be the first to strike.</p>
        </div>
      )}
      
      {posts.map((post, i) => (
        <motion.div 
          key={post.id}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className="p-8 bg-white/5 border border-white/10 rounded-[2.5rem] hover:border-white/20 transition-all group"
        >
          <div className="flex justify-between items-start mb-6">
             <div className="flex items-center gap-4">
                <img src={post.userPhoto} alt={post.userName} className="w-12 h-12 rounded-full border-2 border-md-primary/20" />
                <div>
                   <h4 className="text-white font-display font-black italic tracking-tight uppercase">{post.userName}</h4>
                   <p className="text-[10px] text-white/30 font-black uppercase tracking-widest">
                      {new Date(post.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                   </p>
                </div>
             </div>
             <div className={cn(
               "px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border",
               post.type === 'session' ? "bg-md-primary/10 border-md-primary/30 text-md-primary" :
               post.type === 'achievement' ? "bg-amber-500/10 border-amber-500/30 text-amber-500" :
               "bg-blue-500/10 border-blue-500/30 text-blue-400"
             )}>
                {post.type}
             </div>
          </div>

          <div className="space-y-4 mb-8 text-neutral-200">
             <p className="text-lg leading-relaxed italic">{post.content}</p>
             
             {post.imageUrl && (
                <div className="relative aspect-video rounded-[2rem] overflow-hidden border border-white/10 my-4">
                   <img src={post.imageUrl} alt="Snapshot" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                   <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                   <div className="absolute bottom-4 left-6 flex items-center gap-2">
                      <Sparkles className="w-3 h-3 text-md-primary" />
                      <span className="text-[10px] font-black uppercase text-white/80 tracking-widest">Study Snapshot Captured</span>
                   </div>
                </div>
             )}

             {post.stats && (
               <div className="flex gap-4">
                  {post.stats.minutes && (
                    <div className="px-4 py-2 bg-white/5 rounded-2xl border border-white/5">
                       <span className="text-xl font-display font-black text-white">{post.stats.minutes}m</span>
                       <span className="text-[8px] font-black uppercase text-white/30 ml-2 tracking-widest">FOCUS</span>
                    </div>
                  )}
                  {post.stats.xp && (
                    <div className="px-4 py-2 bg-white/5 rounded-2xl border border-white/5">
                       <span className="text-xl font-display font-black text-md-primary">+{post.stats.xp}</span>
                       <span className="text-[8px] font-black uppercase text-white/30 ml-2 tracking-widest">XP gained</span>
                    </div>
                  )}
               </div>
             )}
          </div>

          <div className="flex items-center gap-4 pt-6 border-t border-white/5">
             <button 
               onClick={() => onReact(post.id)}
               className={cn(
                 "flex items-center gap-2 px-6 py-3 rounded-full transition-all active:scale-90",
                 post.reactions.includes(currentUserId) ? "bg-red-500 text-white" : "bg-white/5 text-white/40 hover:bg-white/10"
               )}
             >
                <Flame className={cn("w-4 h-4", post.reactions.includes(currentUserId) ? "fill-white" : "")} />
                <span className="text-xs font-black">{post.reactions.length}</span>
             </button>
             
             {post.userId !== currentUserId && onChallenge && (
               <button 
                 onClick={() => onChallenge(post.userId)}
                 className="flex items-center gap-2 px-6 py-3 rounded-full transition-all active:scale-90 bg-white/5 text-white/40 hover:bg-white/10 hover:text-white border border-transparent hover:border-white/10"
               >
                  <Trophy className="w-4 h-4" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Challenge</span>
               </button>
             )}

             <button className="flex-1 cursor-default opacity-0" aria-hidden="true" />
             <button className="p-3 rounded-full bg-white/5 text-white/20 hover:text-white transition-colors">
                <Share2 className="w-4 h-4" />
             </button>
          </div>
        </motion.div>
      ))}
    </div>
  );
};
