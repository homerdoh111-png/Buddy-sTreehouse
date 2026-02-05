export interface Activity {
  id: string;
  name: string;
  icon: string;
  title: string;
  description: string;
  minLevel: number;
  category: 'reading' | 'math' | 'creative' | 'music' | 'science' | 'life-skills';
}

export interface ActivityQuestion {
  type: 'multiple-choice' | 'interactive' | 'drawing' | 'matching' | 'sequence';
  question: string;
  answer: string | string[];
  options?: string[];
  data?: any;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  requirement: string;
  earned: boolean;
  earnedDate?: string;
}

export interface Outfit {
  id: string;
  name: string;
  category: 'casual' | 'costume' | 'seasonal' | 'special';
  unlockLevel: number;
  unlockCost: number;
  preview: string;
}

export interface FoodItem {
  id: string;
  name: string;
  emoji: string;
  hungerValue: number;
  happinessBonus?: number;
  category: 'healthy' | 'treat' | 'snack';
}

export interface Toy {
  id: string;
  name: string;
  emoji: string;
  happinessValue: number;
  energyCost: number;
}

export type BuddyMood = 'happy' | 'sad' | 'tired' | 'hungry' | 'excited' | 'playful';

export interface DailyChallenge {
  id: string;
  title: string;
  description: string;
  requirement: number;
  progress: number;
  reward: {
    type: 'stars' | 'item' | 'outfit';
    value: number | string;
  };
  expiresAt: string;
}
