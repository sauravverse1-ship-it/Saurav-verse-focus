import { Character } from './types';

export const BUREAU_CHARACTERS: Character[] = [
  {
    id: 'makima',
    name: 'Makima',
    role: 'Bureau Chief',
    description: 'The control devil. She observes everything. Her orders are absolute.',
    buff: '+20% XP from all sources, -10% Stress',
    requirement: 'Reach Discipline Level 10',
    image: 'https://images.unsplash.com/photo-1638612913771-8f19722312f1?q=80&w=1200&auto=format&fit=crop'
  },
  {
    id: 'denji',
    name: 'Denji',
    role: 'Chainsaw Man',
    description: 'Just wants a normal life and some toast. Motivation: To live a happy day.',
    buff: 'Breaks recover 50% more focus stamina',
    requirement: 'Complete 50 focus sessions',
    image: 'https://images.unsplash.com/photo-1634157703702-3c124b455499?q=80&w=1200&auto=format&fit=crop'
  },
  {
    id: 'power',
    name: 'Power',
    role: 'Blood Fiend',
    description: 'Narcissistic, violent, and hates vegetables. Loves cats and her own glory.',
    buff: 'Arena wins grant double rewards',
    requirement: 'Win 5 Arena Matches',
    image: 'https://images.unsplash.com/photo-1618336753974-aae8e04506aa?q=80&w=1200&auto=format&fit=crop'
  },
  {
    id: 'aki',
    name: 'Aki Hayakawa',
    role: 'Top Hunter',
    description: 'Serious and disciplined. Ready to sacrifice everything for vengeance.',
    buff: 'Morning sessions are 2x more effective',
    requirement: '7-Day Focus Streak',
    image: 'https://images.unsplash.com/photo-1542451313-05996f01da01?q=80&w=1200&auto=format&fit=crop'
  },
  {
    id: 'himeno',
    name: 'Himeno',
    role: 'Senior Hunter',
    description: 'Experienced and laid-back. She treats her subordinates with warmth and cigarettes.',
    buff: '+30% XP for collaborative study sessions',
    requirement: 'Connect with 5 Rivals',
    image: 'https://images.unsplash.com/photo-1605142859862-978be7eba909?q=80&w=1200&auto=format&fit=crop'
  },
  {
    id: 'kobeni',
    name: 'Kobeni',
    role: 'Expert Hunter',
    description: 'Extremely skilled but constantly panicked. Her survival instinct is unmatched.',
    buff: 'Crisis Mode: -50% focus penalty when distracted',
    requirement: 'Log 100 hours of focus',
    image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1200&auto=format&fit=crop'
  }
];
