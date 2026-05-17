import React, { useState } from 'react';
import { db } from '../lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { User } from 'firebase/auth';
import { motion, AnimatePresence } from 'motion/react';

interface Props {
  user: User;
  onClose: () => void;
  onSave: () => void;
}

export const NameRequestModal: React.FC<Props> = ({ user, onClose, onSave }) => {
  const [name, setName] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (name.trim()) {
      setIsSaving(true);
      try {
        await updateDoc(doc(db, 'users', user.uid), {
          displayName: name.trim()
        });
        onSave();
        onClose();
      } catch (e) {
        console.error("Error saving name:", e);
      } finally {
        setIsSaving(false);
      }
    }
  };

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
      >
        <motion.div 
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-sm border border-gray-100"
        >
          <h2 className="text-2xl font-semibold mb-6 text-gray-900">Welcome!</h2>
          <p className="text-gray-600 mb-6">What would you like to be called?</p>
          <input 
            type="text" 
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border border-gray-300 p-3 mb-6 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
            placeholder="Enter your name"
            disabled={isSaving}
          />
          <div className="flex justify-end gap-3">
            <button 
              onClick={onClose} 
              className="px-5 py-2.5 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors font-medium"
              disabled={isSaving}
            >
              Skip
            </button>
            <button 
              onClick={handleSave} 
              className={`px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-medium ${isSaving ? 'opacity-70 cursor-not-allowed' : ''}`}
              disabled={isSaving || !name.trim()}
            >
              {isSaving ? 'Saving...' : 'Save Name'}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
