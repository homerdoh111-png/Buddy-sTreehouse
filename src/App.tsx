import { useEffect } from 'react';
import { motion } from 'framer-motion';
import Buddy3D from './components/Buddy3D';
import BuddyNeeds from './components/BuddyNeeds';
import { useBuddyStore } from './store/buddyStore';

function App() {
  const { 
    level, 
    totalStars, 
    unlockedActivities, 
    tickTime 
  } = useBuddyStore();

  // Time tick for needs
  useEffect(() => {
    const interval = setInterval(() => {
      tickTime();
    }, 60000); // Every minute
    return () => clearInterval(interval);
  }, [tickTime]);

  const activities = [
    { id: 'letters', name: 'Letters', icon: '📚', color: '#4CAF50', unlocked: true },
    { id: 'numbers', name: 'Numbers', icon: '🔢', color: '#2196F3', unlocked: true },
    { id: 'colors', name: 'Colors', icon: '🎨', color: '#FF9800', unlocked: true },
    { id: 'shapes', name: 'Shapes', icon: '🔷', color: '#9C27B0', unlocked: unlockedActivities.includes('shapes') },
    { id: 'math', name: 'Math', icon: '➕', color: '#F44336', unlocked: unlockedActivities.includes('math') },
    { id: 'music', name: 'Music', icon: '🎵', color: '#00BCD4', unlocked: unlockedActivities.includes('music') },
  ];

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* FULL SCREEN 3D FOREST SCENE */}
      <div className="absolute inset-0">
        <Buddy3D onInteraction={() => console.log('Buddy clicked!')} />
      </div>

      {/* FLOATING UI OVERLAYS */}
      
      {/* Top Left - Stats Panel */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        className="absolute top-6 left-6 z-10"
      >
        <div className="bg-gradient-to-br from-purple-400/90 via-pink-400/90 to-purple-500/90 backdrop-blur-md rounded-3xl p-6 shadow-2xl border-2 border-white/30 w-80">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <span className="text-3xl">🐻</span>
              <div>
                <h2 className="text-white font-bold text-xl">Buddy</h2>
                <p className="text-white/80 text-sm">Level {level}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full">
              <span className="text-xl">⭐</span>
              <span className="text-white font-bold">{totalStars}</span>
              <span className="text-white/70 text-sm">Stars</span>
            </div>
          </div>

          {/* Needs Bars */}
          <BuddyNeeds />

          {/* Quick Actions */}
          <div className="grid grid-cols-3 gap-2 mt-4">
            <button
              onClick={() => useBuddyStore.getState().feedBuddy('apple')}
              className="bg-white/90 hover:bg-white rounded-xl p-3 transition-all hover:scale-105 shadow-lg"
            >
              <span className="text-3xl block">🍎</span>
              <span className="text-xs font-semibold text-gray-700">Feed</span>
            </button>
            <button
              onClick={() => useBuddyStore.getState().putBuddyToSleep()}
              className="bg-white/90 hover:bg-white rounded-xl p-3 transition-all hover:scale-105 shadow-lg"
            >
              <span className="text-3xl block">😴</span>
              <span className="text-xs font-semibold text-gray-700">Sleep</span>
            </button>
            <button
              onClick={() => useBuddyStore.getState().playWithBuddy()}
              className="bg-white/90 hover:bg-white rounded-xl p-3 transition-all hover:scale-105 shadow-lg"
            >
              <span className="text-3xl block">🎮</span>
              <span className="text-xs font-semibold text-gray-700">Play</span>
            </button>
          </div>
        </div>
      </motion.div>

      {/* Top Center - Title */}
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute top-6 left-1/2 -translate-x-1/2 z-10"
      >
        <div className="bg-gradient-to-r from-green-400/90 to-emerald-500/90 backdrop-blur-md rounded-3xl px-8 py-4 shadow-2xl border-2 border-white/30">
          <div className="flex items-center gap-3">
            <span className="text-4xl">🌳</span>
            <div>
              <h1 className="text-white font-bold text-3xl drop-shadow-lg">Buddy's Treehouse</h1>
              <p className="text-white/90 text-sm">Let's learn together!</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Bottom - Activities Menu */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 w-full max-w-6xl px-6"
      >
        <div className="bg-gradient-to-r from-indigo-500/90 via-purple-500/90 to-pink-500/90 backdrop-blur-md rounded-3xl p-6 shadow-2xl border-2 border-white/30">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-3xl">🎮</span>
            <h2 className="text-white font-bold text-2xl">Activities</h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {activities.map((activity) => (
              <motion.button
                key={activity.id}
                whileHover={{ scale: activity.unlocked ? 1.05 : 1 }}
                whileTap={{ scale: activity.unlocked ? 0.95 : 1 }}
                disabled={!activity.unlocked}
                className={`
                  relative rounded-2xl p-6 transition-all shadow-xl
                  ${activity.unlocked 
                    ? 'bg-white/95 hover:bg-white cursor-pointer' 
                    : 'bg-gray-400/50 cursor-not-allowed'
                  }
                `}
              >
                {!activity.unlocked && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-2xl backdrop-blur-sm">
                    <span className="text-5xl">🔒</span>
                  </div>
                )}
                <div className="text-5xl mb-2">{activity.icon}</div>
                <div className={`text-sm font-bold ${activity.unlocked ? 'text-gray-800' : 'text-gray-500'}`}>
                  {activity.name}
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Bottom Right - Speech Bubble */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5 }}
        className="absolute bottom-32 right-8 z-10"
      >
        <div className="relative bg-white/95 backdrop-blur-sm rounded-3xl px-6 py-4 shadow-2xl border-2 border-pink-200 max-w-sm">
          <p className="text-gray-800 font-medium">Ready for an adventure? 🌟</p>
          {/* Speech bubble tail */}
          <div className="absolute -bottom-3 right-12 w-6 h-6 bg-white/95 rotate-45 border-r-2 border-b-2 border-pink-200"></div>
        </div>
      </motion.div>

      {/* Floating Sparkle Decorations */}
      {[...Array(10)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute text-2xl pointer-events-none z-5"
          initial={{ 
            opacity: 0,
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight
          }}
          animate={{
            opacity: [0.3, 0.8, 0.3],
            y: [0, -20, 0],
            rotate: [0, 180, 360]
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 2
          }}
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`
          }}
        >
          ✨
        </motion.div>
      ))}
    </div>
  );
}

export default App;
