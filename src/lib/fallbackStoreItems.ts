import { StoreItem } from '../types';

export const fallbackStoreItems: StoreItem[] = [
  // Pets Category
  { id: 'pet_pochita_og', name: 'Pochita (Classic)', description: 'The absolute cutest chainsaw devil dog. Revs during study battles.', priceXP: 0, category: 'pet', type: 'pet', rarity: 'common', image: 'https://api.dicebear.com/7.x/shapes/svg?seed=pochitaClassic&backgroundColor=ffbe76' },
  { id: 'pet_meowy', name: 'Meowy', description: "Power's highly protective horned kitten. Squeaks happily with your focus.", priceXP: 2000, category: 'pet', type: 'pet', rarity: 'rare', image: 'https://api.dicebear.com/7.x/shapes/svg?seed=catMeowy&backgroundColor=feca57' },
  { id: 'pet_kon', name: 'Fox Devil (Kon)', description: 'A majestic floating fox head that devours procrastination.', priceXP: 5000, category: 'pet', type: 'pet', rarity: 'epic', image: 'https://api.dicebear.com/7.x/shapes/svg?seed=foxKon&backgroundColor=6c5ce7' },
  { id: 'pet_pochita_hero', name: 'Devil Pochita (Hero of Hell)', description: 'The true formidable Chainsaw Devil avatar. Intense radiant energy.', priceXP: 9000, category: 'pet', type: 'pet', rarity: 'legendary', image: 'https://api.dicebear.com/7.x/shapes/svg?seed=pochitaHero&backgroundColor=ff7675' },
  
  // Pokemon Pets in store
  { id: 'pet_pikachu', name: 'Pikachu', description: 'Classic Electric Mouse Pokémon. Crackles with real-time focus-strengthening Thunderbolt! Grants +15% Focus Efficiency.', priceXP: 3000, category: 'pet', type: 'pet', rarity: 'rare', image: 'https://api.dicebear.com/7.x/shapes/svg?seed=pikachu&backgroundColor=ffd32a' },
  { id: 'pet_charizard', name: 'Charizard', description: 'Fire Lizard Pokémon. Spits intense motivational Fire Spin during deep study sessions. Grants +25% XP multiplier on streak.', priceXP: 6000, category: 'pet', type: 'pet', rarity: 'epic', image: 'https://api.dicebear.com/7.x/shapes/svg?seed=charizard&backgroundColor=ff5722' },
  { id: 'pet_gengar', name: 'Gengar', description: 'Shadow Ghost Pokémon. Slips through shadows to cast Hypnosis and devour heavy mental Sloth. Grants +20% Exam Arena Time.', priceXP: 6500, category: 'pet', type: 'pet', rarity: 'epic', image: 'https://api.dicebear.com/7.x/shapes/svg?seed=gengar&backgroundColor=786fa6' },
  { id: 'pet_blastoise', name: 'Blastoise', description: 'Water Shell Pokémon. Fires Hydro Pump water blasts to clean up mental blocks and cognitive fatigue. Grants -15% Exhaustion accumulation.', priceXP: 4500, category: 'pet', type: 'pet', rarity: 'rare', image: 'https://api.dicebear.com/7.x/shapes/svg?seed=blastoise&backgroundColor=54a0ff' },

  // Elite and Special companions
  { id: 'pet_demon_kitsune', name: 'Kitsune Focus Sage', description: 'A mystical nine-tailed fox. Grants permanent passive focus speed, -15% exhaustion speed.', priceXP: 8000, category: 'pet', type: 'pet', rarity: 'legendary', image: 'https://api.dicebear.com/7.x/shapes/svg?seed=kitsuneSage&backgroundColor=a29bfe' },
  { id: 'pet_demon_cerberus', name: 'Inferno Cerberus', description: 'Three heads are better than one for tracking multi-tasks.', priceXP: 4000, category: 'pet', type: 'pet', rarity: 'epic', image: 'https://api.dicebear.com/7.x/shapes/svg?seed=inferno&backgroundColor=f44336' },
  { id: 'pet_cyber_pup', name: 'Cyber-Pup 2077', description: 'A robotic companion with holographic focus HUD indicators.', priceXP: 3000, category: 'pet', type: 'pet', rarity: 'rare', image: 'https://api.dicebear.com/7.x/shapes/svg?seed=cyber&backgroundColor=00bcd4' },
  { id: 'pet_blood_fiend', name: 'Blood Fiend Cat', description: 'A protective cat variant. Feeds on your finished task checklist.', priceXP: 3500, category: 'pet', type: 'pet', rarity: 'rare', image: 'https://api.dicebear.com/7.x/shapes/svg?seed=bloodfiend&backgroundColor=e91e63' },
  { id: 'pet_angel_devil', name: 'Angel Demon', description: 'Gives huge passive focal aura and maximum tranquility.', priceXP: 7500, category: 'pet', type: 'pet', rarity: 'legendary', image: 'https://api.dicebear.com/7.x/shapes/svg?seed=angel&backgroundColor=ffffff' },

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
