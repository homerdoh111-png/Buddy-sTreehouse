import { useEffect } from 'react';
import { useBuddyStore } from './store/buddyStore';
import Buddy3D from './components/Buddy3D';
import BuddyNeeds from './components/BuddyNeeds';

function App() {
  const buddyStore = useBuddyStore();
  
  // Time ticker - decrease needs every minute
  useEffect(() => {
    const interval = setInterval(() => {
      buddyStore.tickTime();
    }, 60000); // Every minute
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-300 via-sky-200 to-emerald-200 relative overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 opacity-80"
        style={{
          backgroundImage: 'url(/treehouse-background.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      
      {/* Sparkles Effect */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-yellow-300 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              opacity: 0.6,
            }}
          />
        ))}
      </div>
      
      {/* Main Content */}
      <div className="relative z-10 min-h-screen p-6">
        {/* Header */}
        <header className="mb-8">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div>
              <h1 className="text-5xl font-fredoka font-bold text-white drop-shadow-lg">
                🌳 Buddy's Treehouse
              </h1>
              <p className="text-white/90 text-lg font-fredoka mt-1">
                Let's learn together!
              </p>
            </div>
          </div>
        </header>
        
        {/* Main Grid */}
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Buddy Status */}
          <div className="lg:col-span-1">
            <BuddyNeeds />
          </div>
          
          {/* Center: Buddy 3D */}
          <div className="lg:col-span-2">
            <div className="bg-white/20 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border-4 border-white/30 h-[600px]">
              <Buddy3D onInteraction={() => {
                console.log('Buddy clicked!');
              }} />
              
              {/* Speech Bubble */}
              <div className="mt-6 mx-auto max-w-md bg-white rounded-2xl p-4 shadow-xl relative">
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 w-6 h-6 bg-white rotate-45" />
                <p className="text-center font-fredoka text-lg text-gray-800">
                  {getBuddySpeech(buddyStore.currentMood, buddyStore.needs)}
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Activities Grid - Coming Soon */}
        <div className="max-w-7xl mx-auto mt-8">
          <h2 className="text-3xl font-fredoka font-bold text-white drop-shadow-lg mb-4">
            🎮 Activities
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[
              { icon: '📚', name: 'Letters', locked: false },
              { icon: '🔢', name: 'Numbers', locked: false },
              { icon: '🎨', name: 'Colors', locked: false },
              { icon: '⬛', name: 'Shapes', locked: true },
              { icon: '➕', name: 'Math', locked: true },
              { icon: '🎵', name: 'Music', locked: true },
            ].map((activity) => (
              <ActivityButton key={activity.name} {...activity} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function getBuddySpeech(mood: string, needs: { hunger: number; energy: number; happiness: number }) {
  if (needs.energy < 20) return "I'm so sleepy... 😴";
  if (needs.hunger < 30) return "I'm hungry! Can I have a snack? 🍎";
  if (needs.happiness < 40) return "I'm feeling a bit sad... 😢";
  if (mood === 'excited') return "Yay! This is so fun! 🎉";
  
  const phrases = [
    "Hi! Want to play together? 🎈",
    "Let's learn something new! 📚",
    "I love learning with you! ❤️",
    "Ready for an adventure? 🌟",
    "You're doing great! ⭐",
  ];
  
  return phrases[Math.floor(Math.random() * phrases.length)];
}

function ActivityButton({ icon, name, locked }: { icon: string; name: string; locked: boolean }) {
  return (
    <button
      disabled={locked}
      className={`
        relative bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg
        border-4 border-primary-blue/30
        transform transition-all duration-300
        ${locked 
          ? 'opacity-50 cursor-not-allowed' 
          : 'hover:scale-110 hover:shadow-2xl active:scale-95 cursor-pointer'
        }
      `}
    >
      {locked && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-2xl">
          <span className="text-4xl">🔒</span>
        </div>
      )}
      <div className="text-5xl mb-2">{icon}</div>
      <div className="text-sm font-fredoka font-bold text-primary-blue">{name}</div>
    </button>
  );
}

export default App;
