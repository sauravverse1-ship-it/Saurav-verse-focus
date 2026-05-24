import React from 'react';
import { cn } from '../lib/utils';

interface PetAvatarRendererProps {
  petId: string;
  className?: string;
  xp?: number;
}

export const PetAvatarRenderer: React.FC<PetAvatarRendererProps> = ({ petId, className, xp = 0 }) => {
  // Level Logic based on XP
  const level = xp >= 15000 ? 5 : xp >= 5000 ? 4 : xp >= 2000 ? 3 : xp >= 500 ? 2 : 1;
  const hasChainsaw = level >= 3;
  const bodyColor = level >= 5 ? '#dc2626' : '#f97316';

  // Meowy or Blood Fiend Cat
  if (petId === 'pet_meowy' || petId === 'pet_blood_fiend') {
    return (
      <svg 
        viewBox="0 0 110 90" 
        className={cn("w-full h-full object-contain select-none", className)}
      >
        {/* Shadow */}
        <ellipse cx="55" cy="82" rx="28" ry="4" fill="black" opacity="0.15" />

        {/* Body */}
        <ellipse cx="55" cy="55" rx="30" ry="24" fill="#fcb045" />
        {/* Face Mask/Light Accent */}
        <ellipse cx="55" cy="58" rx="24" ry="18" fill="#fff5e6" />

        {/* Power's Cat Horns (Red) */}
        <path d="M42 30 L45 18 L48 28" fill="#ff4d4d" stroke="#000" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M68 30 L65 18 L62 28" fill="#ff4d4d" stroke="#000" strokeWidth="1.5" strokeLinejoin="round" />

        {/* Cat Ears */}
        <polygon points="30,34 16,14 38,26" fill="#fcb045" stroke="#000" strokeWidth="1.5" />
        <polygon points="30,34 22,20 34,28" fill="#ffb8b8" />
        
        <polygon points="80,34 94,14 72,26" fill="#fcb045" stroke="#000" strokeWidth="1.5" />
        <polygon points="80,34 88,20 76,28" fill="#ffb8b8" />

        {/* Pups / Paws */}
        <circle cx="40" cy="76" r="6" fill="#fff" stroke="#cbd5e1" strokeWidth="1" />
        <circle cx="70" cy="76" r="6" fill="#fff" stroke="#cbd5e1" strokeWidth="1" />

        {/* Twitching Cat Tail */}
        <path 
          d="M28 62 C15 62 10 40 12 30" 
          fill="none" 
          stroke="#fcb045" 
          strokeWidth="5.5" 
          strokeLinecap="round" 
        />

        {/* Face Details */}
        <circle cx="44" cy="46" r="5" fill="#1e293b" />
        <circle cx="66" cy="46" r="5" fill="#1e293b" />
        <circle cx="46" cy="44" r="1.5" fill="#fff" />
        <circle cx="68" cy="44" r="1.5" fill="#fff" />

        {/* Cat Nose & Muzzle */}
        <polygon points="55,51 53,49 57,49" fill="#ff7f7f" />
        <path d="M55 51 Q52 54 49 52 M55 51 Q58 54 61 52" fill="none" stroke="#1e293b" strokeWidth="1.5" strokeLinecap="round" />

        {/* Whiskers */}
        <line x1="26" y1="52" x2="16" y2="50" stroke="#1e293b" strokeWidth="1.5" />
        <line x1="26" y1="56" x2="14" y2="56" stroke="#1e293b" strokeWidth="1.5" />
        <line x1="84" y1="52" x2="94" y2="50" stroke="#1e293b" strokeWidth="1.5" />
        <line x1="84" y1="56" x2="96" y2="56" stroke="#1e293b" strokeWidth="1.5" />
        
        {/* Blush */}
        <circle cx="34" cy="53" r="3.5" fill="#ff7979" opacity="0.4" />
        <circle cx="76" cy="53" r="3.5" fill="#ff7979" opacity="0.4" />
      </svg>
    );
  }

  // Fox Devil
  if (petId === 'pet_kon' || petId === 'pet_demon_kitsune') {
    return (
      <svg 
        viewBox="0 0 110 90" 
        className={cn("w-full h-full object-contain select-none", className)}
      >
        {/* Shadow */}
        <ellipse cx="55" cy="82" rx="30" ry="4" fill="black" opacity="0.15" />

        {/* Fox Devil Mask Face Base */}
        <polygon points="55,15 25,50 35,78 75,78 85,50" fill="#ffffff" stroke="#1e293b" strokeWidth="2.5" strokeLinejoin="round" />
        
        {/* Fox Ears */}
        <polygon points="28,26 10,-2 40,30" fill="#ffffff" stroke="#1e293b" strokeWidth="2.5" strokeLinejoin="round" />
        <polygon points="30,22 17,4 36,25" fill="#ff5252" />
        <polygon points="82,26 100,-2 70,30" fill="#ffffff" stroke="#1e293b" strokeWidth="2.5" strokeLinejoin="round" />
        <polygon points="80,22 93,4 74,25" fill="#ff5252" />

        {/* Mystical Red Markings */}
        <path d="M55 15 L55 35 M55 35 L45 42 M55 35 L65 42" stroke="#d63031" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M30 52 Q40 54 36 65" fill="none" stroke="#d63031" strokeWidth="3" strokeLinecap="round" />
        <path d="M80 52 Q70 54 74 65" fill="none" stroke="#d63031" strokeWidth="3" strokeLinecap="round" />
        
        {/* Snout */}
        <polygon points="55,62 50,56 60,56" fill="#1e293b" />
        <line x1="55" y1="62" x2="55" y2="70" stroke="#1e293b" strokeWidth="2" />

        {/* Glowing Eyes */}
        <path d="M30 46 Q38 43 45 49 C38 49 34 47 30 46" fill="#d63031" stroke="#1e293b" strokeWidth="1.5" />
        <circle cx="38" cy="46.5" r="1.5" fill="#f1c45f" />
        
        <path d="M80 46 Q72 43 65 49 C72 49 76 47 80 46" fill="#d63031" stroke="#1e293b" strokeWidth="1.5" />
        <circle cx="72" cy="46.5" r="1.5" fill="#f1c45f" />
        
        {/* Mystical Smoke Whiskers */}
        <path d="M33 72 Q20 74 15 68" fill="none" stroke="#8c7ae6" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
        <path d="M77 72 Q90 74 95 68" fill="none" stroke="#8c7ae6" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
      </svg>
    );
  }

  // Devil Pochita / Hero of Hell / Angel Demon
  if (petId === 'pet_pochita_hero' || petId === 'pet_angel_devil' || petId === 'pet_pochita_dark') {
    return (
      <svg 
        viewBox="0 0 100 85" 
        className={cn("w-full h-full object-contain select-none", className)}
      >
        {/* Shadow */}
        <ellipse cx="50" cy="78" rx="26" ry="4.5" fill="black" opacity="0.3" />

        {/* Demon Body */}
        <rect x="20" y="30" width="65" height="44" rx="22" fill="#1e272e" stroke="#fa8282" strokeWidth="2.5" />
        <circle cx="80" cy="52" r="14" fill="#1e272e" />

        {/* Claws */}
        <polygon points="35,68 25,75 30,78" fill="#0f171e" />
        <polygon points="45,68 40,78 45,80" fill="#0f171e" />
        <polygon points="55,68 62,78 57,80" fill="#0f171e" />
        <polygon points="65,68 75,75 70,78" fill="#0f171e" />

        {/* Handle */}
        <path d="M32 30 Q32 12 55 12 Q75 12 75 30" fill="none" stroke="#2d3436" strokeWidth="6.5" strokeLinecap="round" />
        <path d="M32 30 Q32 12 55 12 Q75 12 75 30" fill="none" stroke="#da1a1a" strokeWidth="3" strokeLinecap="round" />

        {/* Chainsaw */}
        <g>
          <rect x="36" y="2" width="20" height="34" rx="4" fill="#57606f" stroke="#000" strokeWidth="1.5" />
          <rect x="41" y="-8" width="10" height="15" rx="2" fill="#dcdde1" stroke="#000" strokeWidth="1.5" />
          <polygon points="35,10 30,8 35,6" fill="#ea2027" />
          <polygon points="35,20 30,17 35,15" fill="#ea2027" />
          <polygon points="57,10 62,8 57,6" fill="#ea2027" />
          <polygon points="57,20 62,17 57,15" fill="#ea2027" />
        </g>

        {/* Glow Core */}
        <g transform="translate(63, 60) scale(0.65)">
          <path d="M12 21.35C11.3 21.35 0 12.28 0 8.5 0 5.42 2.42 3 5.5 3c1.74 0 3.41.81 4.5 2.09C11.09 3.81 12.76 3 14.5 3c3.08 0 5.5 2.42 5.5 5.5 0 3.78-11.3 12.85-12 12.85z" fill="#ee5253" />
        </g>

        {/* Gaze */}
        <polygon points="68,43 80,37 82,47 70,49" fill="#ff7f7f" stroke="#000" strokeWidth="1.5" />
        <circle cx="75" cy="43" r="2.5" fill="#ffd32a" />

        {/* Starter Rope */}
        <circle cx="15" cy="52" r="6" fill="#000" />
        <path d="M15 52 L5 62" stroke="#ea2027" strokeWidth="4.5" strokeLinecap="round" />
      </svg>
    );
  }

  // Pikachu
  if (petId === 'pet_pikachu') {
    return (
      <svg 
        viewBox="0 0 100 85" 
        className={cn("w-full h-full object-contain select-none", className)}
      >
        {/* Shadow */}
        <ellipse cx="50" cy="78" rx="28" ry="4" fill="black" opacity="0.15" />

        {/* Bolt Tail */}
        <path d="M10 65 L4 50 L14 45 L10 32 L30 36 M30 36 L25 50" fill="#ffd32a" stroke="#000" strokeWidth="1.5" strokeLinecap="round" />

        {/* Pikachu Body */}
        <ellipse cx="50" cy="52" rx="26" ry="22" fill="#ffd32a" stroke="#000" strokeWidth="1.5" />

        {/* Ears */}
        <path d="M35 34 L18 8 C16 4, 12 12, 28 29" fill="#ffd32a" stroke="#000" strokeWidth="1.5" />
        <path d="M18 8 L22 14 L28 20" fill="#000" />
        <path d="M65 34 L82 8 C84 4, 88 12, 72 29" fill="#ffd32a" stroke="#000" strokeWidth="1.5" />
        <path d="M82 8 L78 14 L72 20" fill="#000" />

        {/* Red Cheeks */}
        <circle cx="34" cy="56" r="5" fill="#e74c3c" />
        <circle cx="66" cy="56" r="5" fill="#e74c3c" />

        {/* Nose */}
        <polygon points="50,52 48,50 52,50" fill="#000" />

        {/* Smile */}
        <path d="M47 56 Q50 58 53 56" fill="none" stroke="#000" strokeWidth="1.5" strokeLinecap="round" />

        {/* Eyes */}
        <circle cx="40" cy="46" r="4.5" fill="#000" />
        <circle cx="60" cy="46" r="4.5" fill="#000" />
        <circle cx="41.5" cy="44.5" r="1.5" fill="#fff" />
        <circle cx="61.5" cy="44.5" r="1.5" fill="#fff" />

        {/* Paws */}
        <ellipse cx="40" cy="74" rx="4" ry="3" fill="#ffd32a" stroke="#000" strokeWidth="1" />
        <ellipse cx="60" cy="74" rx="4" ry="3" fill="#ffd32a" stroke="#000" strokeWidth="1" />
      </svg>
    );
  }

  // Charizard
  if (petId === 'pet_charizard') {
    return (
      <svg 
        viewBox="0 0 100 85" 
        className={cn("w-full h-full object-contain select-none", className)}
      >
        {/* Shadow */}
        <ellipse cx="50" cy="78" rx="28" ry="4" fill="black" opacity="0.15" />

        {/* Dragon Wings */}
        <path d="M20 40 L5 25 C0 15, 10 20, 20 34" fill="#3dc1d3" stroke="#000" strokeWidth="1.5" />
        <path d="M20 40 L5 25 C0 15, 10 20, 20 34" fill="#e66767" opacity="0.3" />
        <path d="M80 40 L95 25 C100 15, 90 20, 80 34" fill="#3dc1d3" stroke="#000" strokeWidth="1.5" />
        <path d="M80 40 L95 25 C100 15, 90 20, 80 34" fill="#e66767" opacity="0.3" />

        {/* Tail */}
        <path d="M25 58 C15 58 10 45 4 48" fill="none" stroke="#e66767" strokeWidth="5" strokeLinecap="round" />
        <ellipse cx="3" cy="46" rx="4" ry="6" fill="#f1c40f" />

        {/* Body */}
        <ellipse cx="50" cy="52" rx="26" ry="22" fill="#e66767" stroke="#000" strokeWidth="1.5" />
        <ellipse cx="50" cy="56" rx="16" ry="14" fill="#f7d794" />

        {/* Eyes */}
        <polygon points="36,44 46,41 44,48 37,48" fill="#fff" stroke="#000" strokeWidth="1.5" />
        <circle cx="41" cy="44.5" r="2" fill="#2bcbba" />
        <polygon points="64,44 54,41 56,48 63,48" fill="#fff" stroke="#000" strokeWidth="1.5" />
        <circle cx="59" cy="44.5" r="2" fill="#2bcbba" />

        {/* Horns */}
        <path d="M38 31 C35 25, 30 25, 36 34" fill="#e66767" stroke="#000" strokeWidth="1.5" />
        <path d="M62 31 C65 25, 70 25, 64 34" fill="#e66767" stroke="#000" strokeWidth="1.5" />

        {/* Nostrils & Teeth */}
        <circle cx="47" cy="50" r="0.7" fill="#000" />
        <circle cx="53" cy="50" r="0.7" fill="#000" />
        <polygon points="38,52 40,55 42,52" fill="#fff" />
        <polygon points="62,52 60,55 58,52" fill="#fff" />
      </svg>
    );
  }

  // Gengar
  if (petId === 'pet_gengar') {
    return (
      <svg 
        viewBox="0 0 100 85" 
        className={cn("w-full h-full object-contain select-none", className)}
      >
        {/* Shadow */}
        <ellipse cx="50" cy="78" rx="22" ry="3.5" fill="black" opacity="0.2" />

        {/* Spikes */}
        <polygon points="26,30 14,10 34,24" fill="#574b90" stroke="#000" strokeWidth="1.5" />
        <polygon points="74,30 86,10 66,24" fill="#574b90" stroke="#000" strokeWidth="1.5" />
        <polygon points="50,22 50,14 44,24" fill="#574b90" stroke="#000" strokeWidth="1" />

        {/* Body */}
        <ellipse cx="50" cy="52" rx="28" ry="24" fill="#574b90" stroke="#000" strokeWidth="1.5" />

        {/* Eyes */}
        <polygon points="28,34 46,42 42,46 30,44" fill="#ea2027" stroke="#000" strokeWidth="1.5" />
        <circle cx="38" cy="40" r="2.5" fill="#ffdd59" />
        <polygon points="72,34 54,42 58,46 70,44" fill="#ea2027" stroke="#000" strokeWidth="1.5" />
        <circle cx="62" cy="40" r="2.5" fill="#ffdd59" />

        {/* Smile */}
        <path d="M30 52 Q50 66 70 52 C60 62 40 62 30 52" fill="#fff" stroke="#000" strokeWidth="1.5" />
        <path d="M40 56 L42 59 M50 58 L50 61 M60 56 L58 59" stroke="#000" strokeWidth="1" />

        {/* Limbs */}
        <ellipse cx="22" cy="54" rx="5" ry="4" fill="#574b90" stroke="#000" strokeWidth="1" />
        <ellipse cx="78" cy="54" rx="5" ry="4" fill="#574b90" stroke="#000" strokeWidth="1" />
        <ellipse cx="38" cy="74" rx="5" ry="4" fill="#574b90" stroke="#000" strokeWidth="1.2" />
        <ellipse cx="62" cy="74" rx="5" ry="4" fill="#574b90" stroke="#000" strokeWidth="1.2" />
      </svg>
    );
  }

  // Blastoise
  if (petId === 'pet_blastoise') {
    return (
      <svg 
        viewBox="0 0 100 85" 
        className={cn("w-full h-full object-contain select-none", className)}
      >
        {/* Shadow */}
        <ellipse cx="50" cy="78" rx="28" ry="4" fill="black" opacity="0.15" />

        {/* Cannons */}
        <rect x="14" y="24" width="16" height="10" rx="3" fill="#bdc5c9" stroke="#000" strokeWidth="1.5" transform="rotate(-25, 14, 24)" />
        <rect x="70" y="24" width="16" height="10" rx="3" fill="#bdc5c9" stroke="#000" strokeWidth="1.5" transform="rotate(25, 70, 24)" />

        {/* Shell */}
        <ellipse cx="50" cy="55" rx="29" ry="22" fill="#786fa6" stroke="#000" strokeWidth="1.5" />

        {/* Body */}
        <ellipse cx="50" cy="54" rx="24" ry="19" fill="#54a0ff" stroke="#000" strokeWidth="1.5" />
        <path d="M34 54 C34 44, 66 44, 66 54 C66 64, 34 64, 34 54" fill="#f7d794" stroke="#000" strokeWidth="1" />

        {/* Eyes */}
        <polygon points="35,46 45,43 42,49" fill="#fff" stroke="#000" strokeWidth="1.5" />
        <circle cx="41.5" cy="45.5" r="1.5" fill="#cf6a87" />
        <polygon points="65,46 55,43 58,49" fill="#fff" stroke="#000" strokeWidth="1.5" />
        <circle cx="58.5" cy="45.5" r="1.5" fill="#cf6a87" />

        {/* Ears */}
        <path d="M32 36 L24 28 L32 31" fill="#54a0ff" stroke="#000" strokeWidth="1.5" />
        <path d="M68 36 L76 28 L68 31" fill="#54a0ff" stroke="#000" strokeWidth="1.5" />

        {/* Mouth */}
        <path d="M44 54 Q50 56 56 54" fill="none" stroke="#000" strokeWidth="1.5" strokeLinecap="round" />

        {/* Feet */}
        <ellipse cx="34" cy="73" rx="5" ry="4" fill="#54a0ff" stroke="#000" strokeWidth="1" />
        <ellipse cx="66" cy="73" rx="5" ry="4" fill="#54a0ff" stroke="#000" strokeWidth="1" />
      </svg>
    );
  }

  // Classic Pochita
  if (!petId || petId === 'pet_pochita_og') {
    return (
      <svg 
        viewBox="0 0 100 85" 
        className={cn("w-full h-full object-contain select-none", className)}
      >
        <ellipse cx="50" cy="78" rx="25" ry="4" fill="black" opacity="0.15" />
        <rect x="20" y="32" width="65" height="42" rx="21" fill={bodyColor} />
        <circle cx="80" cy="53" r="14" fill={bodyColor} />
        <rect x="32" y="70" width="8" height="8" rx="4" fill={level >= 5 ? '#991b1b' : '#ea580c'} />
        <rect x="65" y="70" width="8" height="8" rx="4" fill={level >= 5 ? '#991b1b' : '#ea580c'} />
        <path d="M35 32 Q35 18 55 18 Q72 18 72 32" fill="none" stroke="#475569" strokeWidth="5.5" strokeLinecap="round" />
        {hasChainsaw && (
          <g>
            <rect x="38" y="5" width="18" height="32" rx="3" fill={level >= 5 ? '#1f2937' : '#94a3b8'} />
            <path d="M38 18 L24 24 L38 30" fill={level >= 5 ? '#1f2937' : '#94a3b8'} />
            <path d="M38 6 L42 2 L42 10 M38 15 L42 11 L42 19 M38 24 L42 20 L42 28" stroke="#64748b" strokeWidth="1.5" />
          </g>
        )}
        <circle cx="15" cy="53" r="5" fill="black" />
        <path d="M15 53 L5 53" stroke="#1f2937" strokeWidth="3.5" strokeLinecap="round" />
        <circle cx="76" cy="46" r="6.5" fill="black" />
        <circle cx="79" cy="44" r="2.5" fill="white" />
        <circle cx="70" cy="55" r="4" fill="#fb923c" opacity="0.4" />
        <circle cx="85" cy="55" r="4" fill="#fb923c" opacity="0.4" />
        <path d="M74 58 Q78 64 82 58" fill="none" stroke="black" strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }

  // Fallback Dynamic bottts
  const petImageUrl = `https://api.dicebear.com/7.x/bottts/svg?seed=${petId.replace('pet_', '')}&backgroundColor=${petId.includes('dark') ? '212121' : petId.includes('kitsune') ? '673ab7' : 'f44336'}`;
  
  return (
    <img 
      src={petImageUrl} 
      alt="Pet Avatar Preview" 
      className={cn("w-full h-full object-contain select-none", className)}
      referrerPolicy="no-referrer"
    />
  );
};
