import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface BuddyNeeds {
  hunger: number; // 0-100
  energy: number; // 0-100
  happiness: number; // 0-100
}

interface BuddyState {
  // Buddy's state
  level: number;
  experience: number;
  needs: BuddyNeeds;
  currentOutfit: string;
  currentMood: 'happy' | 'sad' | 'tired' | 'hungry' | 'excited';
  
  // Player progress
  totalStars: number;
  currentStreak: number;
  activitiesCompleted: number;
  lastPlayed: string | null;
  
  // Collections
  unlockedOutfits: string[];
  unlockedActivities: string[];
  unlockedItems: string[];
  badges: string[];
  
  // Inventory
  foodItems: Record<string, number>;
  toys: string[];
  
  // Actions
  feedBuddy: (foodType: string) => void;
  petBuddy: () => void;
  playWithBuddy: () => void;
  putBuddyToSleep: () => void;
  addStars: (amount: number) => void;
  addExperience: (amount: number) => void;
  completeActivity: (activityName: string) => void;
  unlockItem: (itemType: 'outfit' | 'activity' | 'item', itemName: string) => void;
  updateNeeds: (needs: Partial<BuddyNeeds>) => void;
  tickTime: () => void; // Called every minute to decrease needs
}

const calculateMood = (needs: BuddyNeeds): BuddyState['currentMood'] => {
  if (needs.energy < 20) return 'tired';
  if (needs.hunger < 30) return 'hungry';
  if (needs.happiness < 40) return 'sad';
  if (needs.happiness > 80) return 'excited';
  return 'happy';
};

export const useBuddyStore = create<BuddyState>()(
  persist(
    (set, get) => ({
      // Initial state
      level: 1,
      experience: 0,
      needs: {
        hunger: 80,
        energy: 90,
        happiness: 85,
      },
      currentOutfit: 'default',
      currentMood: 'happy',
      
      totalStars: 0,
      currentStreak: 0,
      activitiesCompleted: 0,
      lastPlayed: null,
      
      unlockedOutfits: ['default'],
      unlockedActivities: ['letters', 'numbers', 'colors'],
      unlockedItems: [],
      badges: [],
      
      foodItems: {
        apple: 3,
        cookie: 2,
        carrot: 5,
      },
      toys: ['ball'],
      
      // Actions
      feedBuddy: (foodType: string) => {
        const state = get();
        const foodValue: Record<string, number> = {
          apple: 15,
          cookie: 10,
          carrot: 12,
          pizza: 20,
        };
        
        if (state.foodItems[foodType] && state.foodItems[foodType] > 0) {
          const hungerIncrease = foodValue[foodType] || 10;
          set({
            needs: {
              ...state.needs,
              hunger: Math.min(100, state.needs.hunger + hungerIncrease),
              happiness: Math.min(100, state.needs.happiness + 5),
            },
            foodItems: {
              ...state.foodItems,
              [foodType]: state.foodItems[foodType] - 1,
            },
            currentMood: calculateMood({
              ...state.needs,
              hunger: Math.min(100, state.needs.hunger + hungerIncrease),
            }),
          });
        }
      },
      
      petBuddy: () => {
        const state = get();
        set({
          needs: {
            ...state.needs,
            happiness: Math.min(100, state.needs.happiness + 3),
          },
          currentMood: calculateMood({
            ...state.needs,
            happiness: Math.min(100, state.needs.happiness + 3),
          }),
        });
      },
      
      playWithBuddy: () => {
        const state = get();
        set({
          needs: {
            ...state.needs,
            happiness: Math.min(100, state.needs.happiness + 10),
            energy: Math.max(0, state.needs.energy - 5),
          },
          currentMood: calculateMood({
            ...state.needs,
            happiness: Math.min(100, state.needs.happiness + 10),
            energy: Math.max(0, state.needs.energy - 5),
          }),
        });
      },
      
      putBuddyToSleep: () => {
        set({
          needs: {
            ...get().needs,
            energy: 100,
          },
          currentMood: 'happy',
        });
      },
      
      addStars: (amount: number) => {
        const state = get();
        const newStars = state.totalStars + amount;
        set({ totalStars: newStars });
        
        // Check for level up (every 50 stars = 1 level)
        const newLevel = Math.floor(newStars / 50) + 1;
        if (newLevel > state.level) {
          set({ level: newLevel });
          // Unlock new activities based on level
          if (newLevel === 3) {
            get().unlockItem('activity', 'shapes');
          }
          if (newLevel === 5) {
            get().unlockItem('activity', 'math');
          }
        }
      },
      
      addExperience: (amount: number) => {
        const state = get();
        set({ experience: state.experience + amount });
      },
      
      completeActivity: (activityName: string) => {
        const state = get();
        set({
          activitiesCompleted: state.activitiesCompleted + 1,
          lastPlayed: new Date().toISOString(),
        });
      },
      
      unlockItem: (itemType, itemName) => {
        const state = get();
        if (itemType === 'outfit' && !state.unlockedOutfits.includes(itemName)) {
          set({ unlockedOutfits: [...state.unlockedOutfits, itemName] });
        } else if (itemType === 'activity' && !state.unlockedActivities.includes(itemName)) {
          set({ unlockedActivities: [...state.unlockedActivities, itemName] });
        } else if (itemType === 'item' && !state.unlockedItems.includes(itemName)) {
          set({ unlockedItems: [...state.unlockedItems, itemName] });
        }
      },
      
      updateNeeds: (needs) => {
        const state = get();
        const newNeeds = { ...state.needs, ...needs };
        set({
          needs: newNeeds,
          currentMood: calculateMood(newNeeds),
        });
      },
      
      tickTime: () => {
        const state = get();
        // Decrease needs slowly over time
        set({
          needs: {
            hunger: Math.max(0, state.needs.hunger - 0.5),
            energy: Math.max(0, state.needs.energy - 0.3),
            happiness: Math.max(20, state.needs.happiness - 0.2),
          },
        });
        set({ currentMood: calculateMood(get().needs) });
      },
    }),
    {
      name: 'buddys-treehouse-storage',
    }
  )
);
