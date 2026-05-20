import { StoreItem } from '../types';

export const fallbackStoreItems: StoreItem[] = [
  // Skins / Pets
  { id: 'pet_pochita_og', name: 'Pochita (Classic)', description: 'The original orange chainsaw demon.', priceXP: 0, category: 'special', type: 'pet', rarity: 'common', image: 'https://api.dicebear.com/7.x/bottts/svg?seed=pochita&backgroundColor=ff5722' },
  { id: 'pet_pochita_dark', name: 'Shadow Pochita', description: 'Void-infused variant of the chainsaw demon.', priceXP: 1500, category: 'special', type: 'pet', rarity: 'rare', image: 'https://api.dicebear.com/7.x/bottts/svg?seed=shadow&backgroundColor=212121' },
  { id: 'pet_demon_kitsune', name: 'Shadow Kitsune', description: 'A mystical fox demon from the violet dimension.', priceXP: 2500, category: 'special', type: 'pet', rarity: 'epic', image: 'https://api.dicebear.com/7.x/bottts/svg?seed=kitsune&backgroundColor=673ab7' },
  { id: 'pet_demon_cerberus', name: 'Inferno Cerberus', description: 'Three heads are better than one for focus.', priceXP: 4000, category: 'special', type: 'pet', rarity: 'legendary', image: 'https://api.dicebear.com/7.x/bottts/svg?seed=inferno&backgroundColor=f44336' },
  { id: 'pet_cyber_pup', name: 'Cyber-Pup 2077', description: 'A robotic companion with holographic focus HUD.', priceXP: 3000, category: 'special', type: 'pet', rarity: 'epic', image: 'https://api.dicebear.com/7.x/bottts/svg?seed=cyber&backgroundColor=00bcd4' },
  { id: 'pet_blood_fiend', name: 'Blood Fiend Cat', description: 'A meowing fiend that feeds on your completed tasks.', priceXP: 3500, category: 'special', type: 'pet', rarity: 'epic', image: 'https://api.dicebear.com/7.x/bottts/svg?seed=bloodfiend&backgroundColor=e91e63' },
  { id: 'pet_angel_devil', name: 'Angel Demon', description: 'A lazy pet but gives huge passive aura effects.', priceXP: 5000, category: 'special', type: 'pet', rarity: 'legendary', image: 'https://api.dicebear.com/7.x/bottts/svg?seed=angel&backgroundColor=ffffff' },
  
  // Powerups and Boosts
  { id: 'item_3', name: 'Time Weaver', description: 'Slow down focus timer ticking speed visually.', priceXP: 2500, category: 'powerup', type: 'time', rarity: 'legendary', image: 'https://images.unsplash.com/photo-1501139082106-1d820b8f6420?w=400&q=80' },
  { id: 'item_4', name: 'Focus Shield', description: 'Protect your streak if you miss a day.', priceXP: 1500, category: 'powerup', type: 'shield', rarity: 'rare', image: 'https://images.unsplash.com/photo-1614031679093-6b801bdac8db?w=400&q=80' },
  { id: 'item_8', name: 'XP Multiplier', description: 'Earn 1.5x XP for 24 hours.', priceXP: 2000, category: 'powerup', type: 'boost', rarity: 'epic', image: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=400&q=80', limited: true },
  
  // Cosmetics
  { id: 'item_5', name: 'Golden Focus', description: 'Sparkling golden timer style.', priceXP: 5000, category: 'cosmetic', type: 'theme', rarity: 'legendary', image: 'https://images.unsplash.com/photo-1601004890684-d8fba4f7e2ce?w=400&q=80' },
  { id: 'pochita-skin-hat', name: 'Adventurer Hat', description: 'A cute tiny hat for your companion.', priceXP: 500, category: 'cosmetic', type: 'accessory', rarity: 'rare', image: 'https://api.dicebear.com/7.x/shapes/svg?seed=hat&backgroundColor=b6e3f4' },
  { id: 'pochita-skin-glasses', name: 'Smart Glasses', description: 'Makes your companion look like a scholar.', priceXP: 800, category: 'cosmetic', type: 'accessory', rarity: 'rare', image: 'https://api.dicebear.com/7.x/shapes/svg?seed=glasses&backgroundColor=ffdfba' },
  { id: 'cosmetic_katana', name: 'Back Katana', description: 'A stylish katana worn on the back.', priceXP: 2000, category: 'cosmetic', type: 'accessory', rarity: 'epic', image: 'https://images.unsplash.com/photo-1589330694653-0669d300eb07?w=400&q=80' }
];
