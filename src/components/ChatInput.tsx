import React, { useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { cn } from '../lib/utils';

interface ChatInputProps {
  onSend: (message: string) => void;
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSend }) => {
  const [inputValue, setInputValue] = useState('');

  const handleSend = () => {
    if (!inputValue.trim()) return;
    onSend(inputValue);
    setInputValue('');
  };

  return (
    <div className="flex items-center gap-3">
      <input 
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
        placeholder="Ask for strategy, motivation, or tips..."
        className="flex-1 min-w-0 bg-md-surface-3 border border-white/20 rounded-full px-6 py-4 text-sm focus:outline-none focus:border-md-primary transition-colors text-white placeholder-white/40"
      />
      <button 
        onClick={handleSend}
        disabled={!inputValue.trim()}
        className={cn(
          "shrink-0 w-12 h-12 flex items-center justify-center rounded-full transition-all active:scale-95",
          inputValue.trim() ? "bg-md-primary text-md-on-primary hover:opacity-90 shadow-lg shadow-md-primary/20" : "bg-white/10 text-white/40 cursor-not-allowed"
        )}
      >
        <ChevronRight className="w-6 h-6" />
      </button>
    </div>
  );
};
