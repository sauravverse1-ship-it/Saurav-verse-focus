import { Character } from './types';

export const BUREAU_CHARACTERS: Character[] = [
  {
    id: 'makima',
    name: 'Makima',
    role: 'HQ Bureau Chief',
    description: 'The Control Devil. She observes everything. Her voice is chillingly calm, and her orders are absolute: "This is an order. Work for me, dog."',
    buff: '+20% XP from all focus sessions, -15% exhaustion generation rate.',
    requirement: 'Reach Discipline Level 15',
    image: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&auto=format&fit=crop&q=80'
  },
  {
    id: 'denji',
    name: 'Denji',
    role: 'Chainsaw Man',
    description: 'Just wants a normal life, some jam on his toast, and a high-five. Ready to rev his chainsaws for your goals! "Dude, if we study hard, we get super delicious meals!"',
    buff: 'Breaks recover 50% more focus stamina. Combos persist 1 session longer.',
    requirement: 'Complete 30 Focus Sessions',
    image: 'https://images.unsplash.com/photo-1560169897-fc0cdbdfa4d5?w=805&auto=format&fit=crop&q=80'
  },
  {
    id: 'power',
    name: 'Power',
    role: 'Blood Fiend',
    description: 'Narcissistic, chaotic, and loud. Refers to herself as President Power, hates vegetables, and loves her pet cat Meowy! "Bow down to me! The Nobel Prize is within my grasp!"',
    buff: 'Arena wins grant double rewards. Completed high-priority tasks grant +100 EP.',
    requirement: 'Win 5 Flashcard Arena Matches',
    image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=800&auto=format&fit=crop&q=80'
  },
  {
    id: 'aki',
    name: 'Aki Hayakawa',
    role: 'Division 4 Squad Leader',
    description: 'Tragic, disciplined, and highly professional. Uses a contract with the Fox Devil. Ready to sacrifice his very lifespan for vengeance: "Keep your focus sharp. Do not stray."',
    buff: 'Morning sessions (5 AM - 10 AM) are 2x more effective. Extermination rate +20%.',
    requirement: '7-Day Focus Streak',
    image: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&auto=format&fit=crop&q=80'
  },
  {
    id: 'kishibe',
    name: 'Captain Kishibe',
    role: 'Special Division 1 Captain',
    description: 'The absolute strongest Devil Hunter. Cynical, brutally honest, but possesses a secret heart. "I like toy dogs, booze, and women. But what I love most is a squad member who studies without whining."',
    buff: '+25% battle attack damage in focus sessions, increases maximum stamina capacity by +50.',
    requirement: 'Slay 3 Procrastination Demon Raid Bosses',
    image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop&q=80'
  },
  {
    id: 'reze',
    name: 'Bomb Devil Reze',
    role: 'Undercover Dynamo',
    description: 'A charming, sweet cafe worker who secretes the explosive capabilities of the Bomb Devil. "Let\'s swim in the school pool together at midnight! Let\'s blow this mundane routine sky high!"',
    buff: '+30% critical focus strike rate. Slaying procrastination demons awards +100 flat bonus coins.',
    requirement: 'Unlock Cafe Soundscape Ambient Option',
    image: 'https://images.unsplash.com/photo-111512578047-dfb367046420?w=800&auto=format&fit=crop&q=80'
  }
];
