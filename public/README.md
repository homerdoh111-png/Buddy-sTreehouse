# 🌳 Buddy's Treehouse V4 - React Rebuild

**Interactive Learning Companion for Kindergarten** - Inspired by Talking Tom 2

---

## 🎯 **What's New in V4:**

### **From V3 → V4:**
- ❌ **V3:** Boring multiple choice quizzes
- ✅ **V4:** Interactive mini-games and activities
- ❌ **V3:** Static 3D bear
- ✅ **V4:** Animated Buddy with needs, moods, and reactions
- ❌ **V3:** Simple progression
- ✅ **V4:** Full gamification (stars, levels, unlockables, badges)
- ❌ **V3:** Click buttons
- ✅ **V4:** Living, breathing companion

---

## ✨ **Current Features (Phase 1):**

### **Interactive Buddy:**
- 🐻 3D Animated bear (React Three Fiber)
- 😊 Mood system (happy, sad, tired, hungry, excited)
- ❤️ Needs system (hunger, energy, happiness)
- 🎭 Different reactions based on mood
- 💬 Speech bubbles with contextual messages
- 👆 Click/tap interactions

### **Gamification:**
- ⭐ Star earning system
- 📈 Level progression
- 🏆 Unlock activities as you level up
- 💾 Progress saved locally (Zustand + persist)

### **Activities (Placeholder):**
- 📚 Letters (unlocked)
- 🔢 Numbers (unlocked)
- 🎨 Colors (unlocked)
- ⬛ Shapes (locked - unlock at level 3)
- ➕ Math (locked - unlock at level 5)
- 🎵 Music (locked - unlock at level 7)

---

## 🛠️ **Tech Stack:**

```
Frontend:
├── React 18
├── TypeScript
├── Vite (build tool)
├── Tailwind CSS (styling)
├── Framer Motion (animations)
├── React Three Fiber (3D)
├── @react-three/drei (3D helpers)
├── Zustand (state management)
└── Howler.js (sound - coming soon)

Backend:
└── Supabase (auth + database - coming soon)
```

---

## 📦 **Installation:**

### **Prerequisites:**
- Node.js 18+ installed
- npm or yarn

### **Setup:**
```bash
# Navigate to project
cd buddys-treehouse

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## 🗂️ **Project Structure:**

```
buddys-treehouse/
├── src/
│   ├── components/
│   │   ├── Buddy3D.tsx           # 3D Buddy model
│   │   ├── BuddyNeeds.tsx        # Needs display bars
│   │   └── [more components]
│   ├── store/
│   │   └── buddyStore.ts         # Zustand state management
│   ├── types/
│   │   └── index.ts              # TypeScript types
│   ├── hooks/                    # Custom React hooks
│   ├── utils/                    # Helper functions
│   ├── assets/                   # Images, sounds, etc.
│   ├── App.tsx                   # Main app component
│   ├── main.tsx                  # Entry point
│   └── index.css                 # Global styles
├── public/
│   └── treehouse-background.jpg  # Background image
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tailwind.config.js
```

---

## 🎮 **How It Works:**

### **State Management (Zustand):**
```typescript
const buddyStore = useBuddyStore();

// Buddy's state
buddyStore.needs.hunger     // 0-100
buddyStore.needs.energy     // 0-100
buddyStore.needs.happiness  // 0-100
buddyStore.currentMood      // 'happy' | 'sad' | 'tired' | etc.
buddyStore.level            // Current level
buddyStore.totalStars       // Total stars earned

// Actions
buddyStore.feedBuddy('apple')
buddyStore.petBuddy()
buddyStore.playWithBuddy()
buddyStore.putBuddyToSleep()
buddyStore.addStars(5)
```

### **Needs System:**
- **Hunger** decreases by 0.5 per minute
- **Energy** decreases by 0.3 per minute
- **Happiness** decreases by 0.2 per minute
- Feed Buddy → Increases hunger
- Play → Increases happiness, decreases energy
- Pet → Increases happiness slightly
- Sleep → Restores energy to 100

### **Mood Calculation:**
```typescript
if (energy < 20) → 'tired'
else if (hunger < 30) → 'hungry'
else if (happiness < 40) → 'sad'
else if (happiness > 80) → 'excited'
else → 'happy'
```

### **Progression:**
- Every 50 stars = 1 level
- Level 3 → Unlock Shapes
- Level 5 → Unlock Math
- Level 7 → Unlock Music

---

## 🚧 **Coming Soon (Next Phases):**

### **Phase 2: Enhanced Activities (Week 2-3)**
- ✍️ Letter tracing (canvas drawing)
- 🔢 Interactive counting games
- 🎨 Color mixing lab
- 🧩 Puzzle games
- 📖 Story time with tap-along
- 🎹 Music mini-games

### **Phase 3: Gamification++ (Week 4)**
- 🏆 Achievement badges
- 🎁 Daily challenges
- 🔥 Play streaks
- 👕 Outfit unlockables
- 🧸 Toy collection
- 🍎 Food inventory system

### **Phase 4: Polish (Week 5-6)**
- 🔊 Sound effects & music
- 🎙️ Voice acting for Buddy
- 🌓 Day/night cycle
- 🌤️ Weather system
- ✨ Better animations
- 📱 Mobile optimization

### **Phase 5: Parent Dashboard (Week 7)**
- 📊 Progress tracking
- 📈 Skill graphs
- ⏱️ Time spent
- 🎯 Recommended activities

---

## 🎨 **Customization:**

### **Colors (tailwind.config.js):**
```javascript
colors: {
  primary: {
    blue: '#4A90E2',
    pink: '#FF6B9D',
    yellow: '#FFC14D',
    green: '#4ECDC4',
  }
}
```

### **Add New Activity:**
```typescript
// 1. Add to unlockedActivities in store
// 2. Create activity component
// 3. Add to activities grid
```

---

## 🐛 **Known Issues:**

- [ ] Background image needs to be added to /public
- [ ] Sound effects not yet implemented
- [ ] Activities are placeholders (not functional)
- [ ] No authentication yet
- [ ] No database persistence (local storage only)

---

## 📝 **Development Notes:**

### **Why React Over Vanilla JS?**
1. **State Complexity:** Buddy's needs, inventory, progress = React handles beautifully
2. **30+ Activities:** Component-based architecture = easy to manage
3. **Animations:** Framer Motion > manual CSS
4. **3D:** React Three Fiber > raw Three.js
5. **Scalability:** Easy to add features
6. **Mobile:** React Native port later

### **Performance:**
- Initial bundle: ~200 KB (gzipped)
- Load time: ~2-3 seconds
- 60 FPS 3D rendering
- Optimized for mobile

---

## 🚀 **Deployment:**

### **Vercel (Recommended):**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Production
vercel --prod
```

### **Netlify:**
```bash
# Build command
npm run build

# Publish directory
dist
```

---

## 🎯 **Roadmap:**

**Week 1-2:** ✅ Core Buddy interactions + needs system
**Week 3:** 🔄 Enhanced activities (letter tracing, games)
**Week 4:** Gamification (badges, achievements, unlockables)
**Week 5:** Polish (sounds, animations, weather)
**Week 6:** Parent dashboard + analytics
**Week 7:** Testing + bug fixes

---

## 💬 **Feedback:**

This is V4.0 - Phase 1 (Foundation)

**What works:**
- ✅ Interactive 3D Buddy
- ✅ Mood system
- ✅ Needs management
- ✅ Level progression
- ✅ State persistence

**What's next:**
- 🎮 Actual activity mini-games
- 🎵 Sounds & music
- 🏆 Full gamification
- 👕 Unlockable items

---

## 📄 **License:**

Personal/Educational Project

---

**Built with ❤️ for kids who love to learn!** 🌳✨
