import React, { useState } from 'react';
import { ChevronRight } from 'lucide-react';

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
    <div className="flex gap-3">
      <input 
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
        placeholder="Ask for strategy, motivation, or JEE tips..."
        className="flex-1 bg-surface-variant border border-outline/30 rounded-2xl px-5 py-3 text-sm focus:outline-none focus:border-blue-500 transition-colors"
      />
      <button 
        onClick={handleSend}
        className="p-3 bg-primary text-white rounded-2xl active:scale-90 transition-transform"
      >
        <ChevronRight className="w-6 h-6" />
      </button>
    </div>
  );
};
