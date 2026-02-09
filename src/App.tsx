import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Buddy3D from './components/Buddy3D';
import { useBuddyStore } from './store/buddyStore';

function App() {
  const [showSpeechBubble, setShowSpeechBubble] = useState(true);
  const buddy = useBuddyStore();

  useEffect(() => {
    const timer = setInterval(() => {
      buddy.updateNeeds();
    }, 30000);

    return () => clearInterval(timer);
  }, []);

  const getSpeechText = () => {
    if (buddy.hunger < 30) return "I'm hungry! 🍎";
    if (buddy.energy < 30) return "I'm so tired... 😴";
    if (buddy.happiness < 50) return "Let's play together! 🎮";
    return "Ready for an adventure? ✨";
  };

  const handleActivityClick = (activityId: string) => {
    console.log('Activity clicked:', activityId);
    // Handle activity navigation here
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-gradient-to-b from-sky-200 to-green-100">
      {/* 3D Scene with Floating Activities */}
      <Buddy3D 
        onInteraction={() => setShowSpeechBubble(!showSpeechBubble)} 
        onActivityClick={handleActivityClick}
      />

      {/* Stats Panel - More Transparent */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        className="absolute top-6 left-6 z-10"
      >
        <div className="bg-gradient-to-br from-purple-400/30 via-pink-400/30 to-purple-500/30 backdrop-blur-sm rounded-3xl p-6 shadow-2xl border-2 border-white/20 w-80">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-2xl shadow-lg">
                🐻
              </div>
              <div>
                <h2 className="text-white font-bold text-lg">Buddy</h2>
                <p className="text-white/80 text-sm">Level {buddy.level}</p>
              </div>
            </div>
            <div className="flex items-center gap-1 bg-white/20 px-3 py-1 rounded-full">
              <span className="text-yellow-300 text-xl">⭐</span>
              <span className="text-white font-bold">{buddy.stars}</span>
              <span className="text-white/70 text-sm">Stars</span>
            </div>
          </div>

          {/* Needs */}
          <div className="space-y-4 mb-6">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-white/90 text-sm font-semibold flex items-center gap-2">
                  <span>😊</span> Happiness
                </span>
                <span className="text-white/90 text-sm font-bold">{Math.round(buddy.happiness)}%</span>
              </div>
              <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full transition-all"
                  style={{ width: `${buddy.happiness}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <span className="text-white/90 text-sm font-semibold flex items-center gap-2">
                  <span>🍎</span> Hunger
                </span>
                <span className="text-white/90 text-sm font-bold">{Math.round(buddy.hunger)}%</span>
              </div>
              <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-red-400 to-pink-400 rounded-full transition-all"
                  style={{ width: `${buddy.hunger}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <span className="text-white/90 text-sm font-semibold flex items-center gap-2">
                  <span>⚡</span> Energy
                </span>
                <span className="text-white/90 text-sm font-bold">{Math.round(buddy.energy)}%</span>
              </div>
              <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full transition-all"
                  style={{ width: `${buddy.energy}%` }}
                />
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => useBuddyStore.getState().feedBuddy('apple')}
              className="bg-white/70 hover:bg-white/85 rounded-xl p-3 transition-all hover:scale-105 shadow-lg"
            >
              <span className="text-3xl block">🍎</span>
              <span className="text-xs font-semibold text-gray-700">Feed</span>
            </button>
            <button
              onClick={() => useBuddyStore.getState().putBuddyToSleep()}
              className="bg-white/70 hover:bg-white/85 rounded-xl p-3 transition-all hover:scale-105 shadow-lg"
            >
              <span className="text-3xl block">😴</span>
              <span className="text-xs font-semibold text-gray-700">Sleep</span>
            </button>
            <button
              onClick={() => useBuddyStore.getState().playWithBuddy()}
              className="bg-white/70 hover:bg-white/85 rounded-xl p-3 transition-all hover:scale-105 shadow-lg"
            >
              <span className="text-3xl block">🎮</span>
              <span className="text-xs font-semibold text-gray-700">Play</span>
            </button>
          </div>
        </div>
      </motion.div>

      {/* Title Banner - More Transparent */}
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute top-6 left-1/2 -translate-x-1/2 z-10"
      >
        <div className="bg-gradient-to-r from-green-400/40 to-emerald-500/40 backdrop-blur-sm rounded-3xl px-8 py-4 shadow-2xl border-2 border-white/20">
          <div className="flex items-center gap-3">
            <span className="text-4xl">🌲</span>
            <div className="text-center">
              <h1 className="text-white font-bold text-2xl drop-shadow-lg">Buddy's Treehouse</h1>
              <p className="text-white/90 text-sm">Let's learn together!</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Speech Bubble - More Transparent */}
      <AnimatePresence>
        {showSpeechBubble && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ delay: 0.5 }}
            className="absolute bottom-32 right-8 z-10"
          >
            <div className="relative bg-white/40 backdrop-blur-sm rounded-3xl px-6 py-4 shadow-2xl border-2 border-pink-200/50 max-w-sm">
              <p className="text-gray-800 font-semibold text-lg">{getSpeechText()}</p>
              <div className="absolute -bottom-3 right-12 w-6 h-6 bg-white/40 backdrop-blur-sm rotate-45 border-r-2 border-b-2 border-pink-200/50" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Quick Actions - Minimal */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute bottom-6 left-6 z-10 flex gap-3"
      >
        <button
          onClick={() => useBuddyStore.getState().feedBuddy('apple')}
          className="bg-white/70 hover:bg-white/85 rounded-2xl p-4 transition-all hover:scale-105 shadow-xl"
        >
          <span className="text-3xl block">🍎</span>
          <span className="text-xs font-semibold text-gray-700">Feed</span>
        </button>
        <button
          onClick={() => useBuddyStore.getState().putBuddyToSleep()}
          className="bg-white/70 hover:bg-white/85 rounded-2xl p-4 transition-all hover:scale-105 shadow-xl"
        >
          <span className="text-3xl block">😴</span>
          <span className="text-xs font-semibold text-gray-700">Sleep</span>
        </button>
        <button
          onClick={() => useBuddyStore.getState().playWithBuddy()}
          className="bg-white/70 hover:bg-white/85 rounded-2xl p-4 transition-all hover:scale-105 shadow-xl"
        >
          <span className="text-3xl block">🎮</span>
          <span className="text-xs font-semibold text-gray-700">Play</span>
        </button>
      </motion.div>

      {/* Floating Sparkles Decoration */}
      {[...Array(10)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute text-2xl pointer-events-none"
          initial={{ 
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            opacity: 0 
          }}
          animate={{
            y: [null, Math.random() * window.innerHeight],
            opacity: [0, 1, 0],
            scale: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 2,
          }}
        >
          ✨
        </motion.div>
      ))}
    </div>
  );
}

export default App;
