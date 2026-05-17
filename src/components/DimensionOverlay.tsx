import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { DimensionType } from '../types';
import { cn } from '../lib/utils';

interface DimensionOverlayProps {
  currentDimension: DimensionType;
}

export const DimensionOverlay: React.FC<DimensionOverlayProps> = ({ currentDimension }) => {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      <AnimatePresence mode="wait">
        {currentDimension === 'void' && (
          <motion.div 
            key="void"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black"
          >
             <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.03)_0%,transparent_70%)]" />
          </motion.div>
        )}

        {currentDimension === 'grid' && (
          <motion.div 
            key="grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black"
          >
             <div className="absolute inset-0" 
               style={{ 
                 backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)',
                 backgroundSize: '40px 40px'
               }}
             />
             <motion.div 
               animate={{ y: [0, 800] }}
               transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
               className="absolute inset-0 bg-gradient-to-b from-transparent via-md-primary/10 to-transparent h-1/2 opacity-20"
             />
          </motion.div>
        )}

        {currentDimension === 'cosmos' && (
          <motion.div 
            key="cosmos"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-[#020205]"
          >
             {[...Array(100)].map((_, i) => (
                <motion.div 
                  key={i}
                  className="absolute bg-white rounded-full"
                  style={{
                    width: Math.random() * 2 + 'px',
                    height: Math.random() * 2 + 'px',
                    left: Math.random() * 100 + '%',
                    top: Math.random() * 100 + '%',
                    opacity: Math.random() * 0.5 + 0.2
                  }}
                  animate={{ 
                    scale: [1, 1.5, 1],
                    opacity: [0.3, 0.8, 0.3]
                  }}
                  transition={{
                    duration: 2 + Math.random() * 4,
                    repeat: Infinity,
                  }}
                />
             ))}
             <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.05)_0%,transparent_80%)]" />
          </motion.div>
        )}

        {currentDimension === 'chainsaw' && (
          <motion.div 
            key="chainsaw"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-[#1a0000]"
          >
             <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(220,38,38,0.1)_0%,transparent_70%)]" />
             {[...Array(5)].map((_, i) => (
                <motion.div 
                  key={i}
                  className="absolute h-full w-px bg-red-600/10"
                  style={{ left: (i + 1) * 20 + '%' }}
                  animate={{ x: [-10, 10, -10] }}
                  transition={{ duration: 0.1, repeat: Infinity }}
                />
             ))}
          </motion.div>
        )}

        {currentDimension === 'legend' && (
          <motion.div 
            key="legend"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-white"
          >
             <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.05)_0%,transparent_70%)]" />
             <div className="absolute inset-0 opacity-10" 
               style={{ 
                 backgroundImage: 'linear-gradient(45deg, #ff0000 0%, #00ff00 50%, #0000ff 100%)',
                 filter: 'blur(100px)'
               }} 
             />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
