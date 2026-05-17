import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Zap, 
  Battery, 
  Wifi, 
  Activity, 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle,
  Fingerprint,
  TrendingUp,
  Wind
} from 'lucide-react';
import { cn } from '../lib/utils';

interface NeuralLinkProps {
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
}

export const NeuralLink: React.FC<NeuralLinkProps> = ({ enabled, onToggle }) => {
  const [batteryLevel, setBatteryLevel] = useState<number | null>(null);
  const [connectionType, setConnectionType] = useState<string>('unknown');
  const [isStill, setIsStill] = useState(true);
  const [focusReadiness, setFocusReadiness] = useState(0);

  useEffect(() => {
    // 1. Battery Status
    if ('getBattery' in navigator) {
      (navigator as any).getBattery().then((battery: any) => {
        setBatteryLevel(battery.level * 100);
        battery.addEventListener('levelchange', () => setBatteryLevel(battery.level * 100));
      });
    }

    // 2. Network Status
    if ('connection' in navigator) {
      const conn = (navigator as any).connection;
      setConnectionType(conn.effectiveType || 'strong');
      conn.addEventListener('change', () => setConnectionType(conn.effectiveType));
    }

    // 3. Motion Detection (Simplistic for web)
    const handleMotion = (e: DeviceMotionEvent) => {
      if (!enabled) return;
      const acc = e.accelerationIncludingGravity;
      if (acc && (Math.abs(acc.x || 0) > 2 || Math.abs(acc.y || 0) > 2)) {
         setIsStill(false);
         setTimeout(() => setIsStill(true), 2000);
      }
    };

    if (enabled) {
      window.addEventListener('devicemotion', handleMotion);
    }

    return () => {
      window.removeEventListener('devicemotion', handleMotion);
    };
  }, [enabled]);

  // Calculate Readiness
  useEffect(() => {
    let score = 50;
    if (batteryLevel && batteryLevel > 50) score += 15;
    if (connectionType === '4g' || connectionType === 'wifi') score += 15;
    if (isStill) score += 20;
    
    // Time of day bonus (morning focus)
    const hours = new Date().getHours();
    if (hours >= 5 && hours <= 10) score += 10;

    setFocusReadiness(Math.min(100, score));
  }, [batteryLevel, connectionType, isStill]);

  return (
    <div className="glass-card bg-black p-10 md:p-14 rounded-[3.5rem] border-white/5 relative overflow-hidden group">
       <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(220,38,38,0.05)_0%,transparent_70%)] opacity-50" />
       
       <div className="relative z-10 space-y-12">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
             <div className="space-y-1">
                <div className="flex items-center gap-3">
                   <Fingerprint className="w-6 h-6 text-md-primary" />
                   <h2 className="text-3xl font-black italic uppercase tracking-tighter text-white">NEURAL LINK</h2>
                </div>
                <p className="text-white/40 text-[10px] font-mono uppercase tracking-[0.4em]">Biometric & Environmental Sync</p>
             </div>
             
             <button 
               onClick={() => onToggle(!enabled)}
               className={cn(
                 "px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border",
                 enabled 
                   ? "bg-md-primary text-md-on-primary border-md-primary shadow-[0_0_30px_rgba(220,38,38,0.3)]" 
                   : "bg-white/5 text-white/40 border-white/5 hover:bg-white/10"
               )}
             >
                {enabled ? 'SYSTEM ONLINE' : 'ESTABLISH LINK'}
             </button>
          </div>

          {!enabled ? (
            <div className="py-20 text-center space-y-6">
               <div className="w-24 h-24 rounded-full bg-white/5 border border-dashed border-white/20 mx-auto flex items-center justify-center animate-pulse">
                  <ShieldAlert className="w-8 h-8 text-white/20" />
               </div>
               <div className="space-y-2">
                  <h3 className="text-xl font-black italic uppercase tracking-tighter text-white/60">Synchronization Suspended</h3>
                  <p className="text-xs text-white/20 font-serif italic max-w-xs mx-auto">Neural Link utilizes sensory data to optimize your focus windows. Establish link to proceed.</p>
               </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
               {/* Readiness Score */}
               <div className="space-y-8 flex flex-col justify-center">
                  <div className="space-y-2">
                     <span className="text-[10px] font-black uppercase tracking-widest text-white/30">Focus Readiness Index</span>
                     <div className="flex items-baseline gap-4">
                        <span className="text-7xl font-black italic text-white tracking-tighter">{focusReadiness}</span>
                        <span className="text-sm font-black text-md-primary uppercase tracking-widest">/ 100</span>
                     </div>
                  </div>
                  
                  <div className="glass-card bg-white/5 p-6 rounded-[2rem] border-white/5 flex items-center gap-6">
                     <div className={cn(
                       "w-12 h-12 rounded-full flex items-center justify-center",
                       focusReadiness > 80 ? "bg-green-500/20 text-green-500" : "bg-amber-500/20 text-amber-500"
                     )}>
                        {focusReadiness > 80 ? <CheckCircle2 className="w-6 h-6" /> : <TrendingUp className="w-6 h-6" />}
                     </div>
                     <div className="space-y-1">
                        <h4 className="text-sm font-black uppercase tracking-widest text-white">Neural Assessment</h4>
                        <p className="text-[10px] text-white/40 font-serif italic italic leading-relaxed">
                           {focusReadiness > 90 ? "All systems optimal. Initiate deep work now." : 
                            focusReadiness > 70 ? "Stable environment detected. Good for moderate focus." :
                            "Conditions sub-optimal. Minimize distractions immediately."}
                        </p>
                     </div>
                  </div>
               </div>

               {/* Sensor Diagnostics */}
               <div className="grid grid-cols-2 gap-4">
                  <div className="glass-card bg-black/40 p-6 rounded-3xl border border-white/5 space-y-4">
                     <Battery className={cn("w-5 h-5", (batteryLevel || 100) < 20 ? "text-red-500" : "text-md-primary")} />
                     <div className="space-y-1">
                        <span className="text-[8px] font-black uppercase tracking-widest text-white/20">Battery</span>
                        <div className="text-lg font-black text-white">{batteryLevel ? `${Math.round(batteryLevel)}%` : '---'}</div>
                     </div>
                  </div>
                  <div className="glass-card bg-black/40 p-6 rounded-3xl border border-white/5 space-y-4">
                     <Wifi className="w-5 h-5 text-blue-400" />
                     <div className="space-y-1">
                        <span className="text-[8px] font-black uppercase tracking-widest text-white/20">Connectivity</span>
                        <div className="text-lg font-black text-white uppercase">{connectionType}</div>
                     </div>
                  </div>
                  <div className="glass-card bg-black/40 p-6 rounded-3xl border border-white/5 space-y-4">
                     <Activity className={cn("w-5 h-5", isStill ? "text-green-500" : "text-amber-500 animate-pulse")} />
                     <div className="space-y-1">
                        <span className="text-[8px] font-black uppercase tracking-widest text-white/20">Stability</span>
                        <div className="text-lg font-black text-white uppercase">{isStill ? 'STILL' : 'UNSTABLE'}</div>
                     </div>
                  </div>
                  <div className="glass-card bg-black/40 p-6 rounded-3xl border border-white/5 space-y-4">
                     <Wind className="w-5 h-5 text-purple-400" />
                     <div className="space-y-1">
                        <span className="text-[8px] font-black uppercase tracking-widest text-white/20">Peak Window</span>
                        <div className="text-lg font-black text-white uppercase">{new Date().getHours() < 12 ? 'ACTIVE' : 'LATE'}</div>
                     </div>
                  </div>
               </div>
            </div>
          )}

          {/* Warning Overlay for Instability */}
          <AnimatePresence>
             {enabled && !isStill && (
               <motion.div 
                 initial={{ opacity: 0, scale: 0.9 }}
                 animate={{ opacity: 1, scale: 1 }}
                 exit={{ opacity: 0, scale: 0.9 }}
                 className="absolute inset-0 z-20 flex items-center justify-center p-8 backdrop-blur-md bg-red-600/10 pointer-events-none"
               >
                  <div className="text-center space-y-4">
                     <AlertTriangle className="w-16 h-16 text-red-500 mx-auto animate-bounce" />
                     <div className="space-y-1">
                        <h3 className="text-2xl font-black italic uppercase tracking-tighter text-white">Movement Detected</h3>
                        <p className="text-[10px] font-black uppercase tracking-widest text-red-500/80">Return to your desk. Stability is required for neural sync. 🔥</p>
                     </div>
                  </div>
               </motion.div>
             )}
          </AnimatePresence>
       </div>
    </div>
  );
};
