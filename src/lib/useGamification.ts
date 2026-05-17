import { useState, useEffect, useCallback, useRef } from 'react';
import { UserProfile, Achievement } from '../types';
import { doc, updateDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';
import { RANKS, ACHIEVEMENTS, getRank } from './gamification';
import { ResourceInventory, LegacyMilestone } from '../types';

export function useGamification(
  profile: UserProfile | null, 
  setProfile: (p: UserProfile | ((prev: UserProfile) => UserProfile)) => void,
  awardResources: (res: Partial<ResourceInventory>) => Promise<void>,
  addLegacyMilestone: (milestone: Omit<LegacyMilestone, 'id' | 'date'>) => Promise<void>
) {
  const [xpLabels, setXpLabels] = useState<{ id: number; xp: number; x: number; y: number; bonus?: string; multiplier?: number }[]>([]);
  const [rankUp, setRankUp] = useState<{ oldRank: string; newRank: string } | null>(null);
  const [unlockedAchievement, setUnlockedAchievement] = useState<Achievement | null>(null);
  const [combo, setCombo] = useState({ multiplier: 1, count: 0, lastTime: 0 });

  // Use a ref to always have access to the latest profile without re-creating callbacks
  const profileRef = useRef<UserProfile | null>(profile);
  useEffect(() => {
    profileRef.current = profile;
  }, [profile]);

  // Combo decay: if no action for 60 seconds, reset combo
  useEffect(() => {
    const interval = setInterval(() => {
      setCombo(prev => {
        if (prev.count > 0 && Date.now() - prev.lastTime > 60000) {
          return { multiplier: 1, count: 0, lastTime: 0 };
        }
        return prev;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const awardXP = useCallback(async (amount: number, type: 'focus' | 'tasks' | 'habits' | 'achievement' | 'challenge_complete' | 'special' | 'study', labelText?: string) => {
    const currentProfile = profileRef.current;
    if (!currentProfile || !currentProfile.uid) return;
    
    // Normalize type for internal logic
    const normalizedType = (type === 'special' || type === 'study') ? 'achievement' : type;

    // 1. Calculate Multiplier (Streak & Characters)
    let totalMultiplier = 1;

    // Streak Multipliers
    if (currentProfile.streak >= 7) totalMultiplier *= 1.25;
    if (currentProfile.streak >= 14) totalMultiplier *= 1.5;
    if (currentProfile.streak >= 30) totalMultiplier *= 2.0;

    // Character Buffs
    if (currentProfile.activeCharacterId === 'makima') {
      totalMultiplier *= 1.20; // +20% Controls everything
    }

    // Apply combo multiplier from current combo state
    totalMultiplier *= combo.multiplier;
    const finalAmount = Math.round(amount * totalMultiplier);

    // 2. Update Local State for Animation
    const labelId = Math.random();
    const x = Math.random() * (window.innerWidth - 300) + 150;
    const y = Math.random() * (window.innerHeight - 300) + 150;

    setXpLabels(prev => [...prev, { 
      id: labelId, 
      xp: finalAmount, 
      x, 
      y,
      bonus: labelText,
      multiplier: totalMultiplier > 1 ? totalMultiplier : undefined
    }]);

    setTimeout(() => {
      setXpLabels(prev => prev.filter(l => l.id !== labelId));
    }, 2000);

    // 3. Update Combo
    if (normalizedType !== 'achievement' && normalizedType !== 'challenge_complete') {
      setCombo(prev => {
        const now = Date.now();
        const newCount = prev.count + 1;
        const newMultiplier = Math.min(5, Math.floor(newCount / 3) + 1);
        return { multiplier: newMultiplier, count: newCount, lastTime: now };
      });
    }

    // 4. Calculate new values
    const now = new Date();
    const hours = now.getHours();
    let bonusXP = 0;
    let bonusLabel = labelText;

    if (normalizedType === 'focus') {
      if (hours < 9) {
        bonusXP += 30; // Early Bird
        bonusLabel = 'EARLY BIRD (+30)';
      } else if (hours >= 22) {
        bonusXP += 40; // Night Owl
        bonusLabel = 'NIGHT OWL (+40)';
      }
    }

    const currentXP = currentProfile.xp || 0;
    const currentAllTimeXP = currentProfile.allTimeXP || 0;
    const finalTotalXP = finalAmount + bonusXP;
    const newXP = currentXP + finalTotalXP;
    const newAllTimeXP = currentAllTimeXP + finalTotalXP;
    
    const oldRankObj = getRank(currentAllTimeXP);
    const newRankObj = getRank(newAllTimeXP);

    // Track Daily Challenge Progress
    const updatedChallenges = (currentProfile.dailyChallenges || []).map(challenge => {
      if (challenge.completed) return challenge;
      
      let progressInc = 0;
      if (challenge.type === normalizedType) {
        progressInc = 1;
      }

      const newProgress = Math.min(challenge.goal, challenge.progress + progressInc);
      const isNewlyCompleted = newProgress >= challenge.goal;
      
      if (isNewlyCompleted && !challenge.completed) {
        // Award challenge completion XP with a delay
        setTimeout(() => awardXP(challenge.xp, 'challenge_complete', `CHALLENGE: ${challenge.title}`), 800);
      }

      return {
        ...challenge,
        progress: newProgress,
        completed: isNewlyCompleted
      };
    });

    // Achievement Checking
    const currentAchievements = currentProfile.unlockedAchievements || [];
    const newUnlockedAchievements = [...currentAchievements];
    
    ACHIEVEMENTS.forEach(ach => {
      if (newUnlockedAchievements.includes(ach.id)) return;

      let achieved = false;
      if (ach.id === 'first_blood' && normalizedType === 'focus') achieved = true;
      if (ach.id === 'deep_diver' && (currentProfile.pomodorosCompleted || 0) >= 10) achieved = true;
      if (ach.id === 'centurion' && (currentProfile.pomodorosCompleted || 0) >= 100) achieved = true;
      if (ach.id === 'rank_master' && newRankObj.id === 'master') achieved = true;
      if (ach.id === 'ascension' && newRankObj.id === 'legend') achieved = true;
      if (ach.id === 'week_warrior' && currentProfile.streak >= 7) achieved = true;

      if (achieved) {
        newUnlockedAchievements.push(ach.id);
        setUnlockedAchievement(ach);
        awardResources({ dust: 1 }); // Award Star Dust
        addLegacyMilestone({
          title: `Achievement Unlocked: ${ach.name}`,
          description: ach.description,
          type: 'achievement'
        });
        setTimeout(() => awardXP(ach.xpReward, 'achievement', `UNLOCK: ${ach.name}`), 1800);
      }
    });

    // Trifecta Check
    const allCompletedNow = updatedChallenges.every(c => c.completed);
    const wasAllCompletedBefore = (currentProfile.dailyChallenges || []).every(c => c.completed);
    if (allCompletedNow && !wasAllCompletedBefore) {
      setTimeout(() => awardXP(300, 'challenge_complete', 'DAILY TRIFECTA BONUS'), 1500);
      addLegacyMilestone({
        title: 'Daily Trifecta Secured',
        description: 'Completed all daily challenges in record time.',
        type: 'milestone'
      });
    }

    // Rank Up detection
    if (oldRankObj.id !== newRankObj.id) {
      setRankUp({ oldRank: oldRankObj.name, newRank: newRankObj.name });
      addLegacyMilestone({
        title: `Rank Up: ${newRankObj.name}`,
        description: `Ascended from ${oldRankObj.name} to higher dimensions.`,
        statValue: newRankObj.name,
        type: 'rank'
      });
    }

    // Update Firestore
    const userDoc = doc(db, 'users', currentProfile.uid);
    const updates = {
      xp: newXP,
      allTimeXP: newAllTimeXP,
      dailyChallenges: updatedChallenges,
      unlockedAchievements: newUnlockedAchievements,
      rank: newRankObj.name
    };

    try {
      await updateDoc(userDoc, updates);
      setProfile(prev => {
        if (!prev) return prev;
        return { ...prev, ...updates };
      });
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `users/${currentProfile.uid}`);
    }
  }, [combo.multiplier, setProfile]);

  const awardBonus = useCallback((amount: number, label: string) => {
    awardXP(amount, 'achievement', label);
  }, [awardXP]);

  return {
    xpLabels,
    awardXP,
    rankUp,
    setRankUp,
    unlockedAchievement,
    setUnlockedAchievement,
    combo,
    awardBonus
  };
}
