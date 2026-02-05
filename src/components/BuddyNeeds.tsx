import { useBuddyStore } from '@/store/buddyStore';
import { motion } from 'framer-motion';

interface NeedBarProps {
  label: string;
  icon: string;
  value: number;
  color: string;
}

function NeedBar({ label, icon, value, color }: NeedBarProps) {
  return (
    <div className="mb-3">
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm font-fredoka font-bold flex items-center gap-1">
          <span>{icon}</span>
          <span>{label}</span>
        </span>
        <span className="text-sm font-fredoka">{Math.round(value)}%</span>
      </div>
      <div className="w-full h-4 bg-white/30 rounded-full overflow-hidden backdrop-blur-sm border-2 border-white/50">
        <motion.div
          className="h-full rounded-full"
          style={{
            background: `linear-gradient(90deg, ${color}, ${color}dd)`,
          }}
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}

export default function BuddyNeeds() {
  const { needs, level, totalStars } = useBuddyStore();
  
  return (
    <div className="w-full max-w-sm bg-gradient-to-br from-primary-blue/80 to-primary-pink/80 backdrop-blur-xl rounded-3xl p-6 shadow-2xl border-4 border-white/30">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-2xl font-fredoka font-bold text-white">
            🐻 Buddy
          </h3>
          <p className="text-white/90 text-sm font-fredoka">Level {level}</p>
        </div>
        <div className="text-right">
          <p className="text-3xl font-fredoka font-bold text-primary-yellow">
            ⭐ {totalStars}
          </p>
          <p className="text-white/80 text-xs font-fredoka">Stars</p>
        </div>
      </div>
      
      {/* Needs Bars */}
      <NeedBar
        label="Happiness"
        icon="😊"
        value={needs.happiness}
        color="#FFC14D"
      />
      <NeedBar
        label="Hunger"
        icon="🍔"
        value={needs.hunger}
        color="#FF6B9D"
      />
      <NeedBar
        label="Energy"
        icon="⚡"
        value={needs.energy}
        color="#4ECDC4"
      />
      
      {/* Quick Actions */}
      <div className="flex gap-2 mt-4">
        <ActionButton icon="🍎" label="Feed" onClick={() => useBuddyStore.getState().feedBuddy('apple')} />
        <ActionButton icon="😴" label="Sleep" onClick={() => useBuddyStore.getState().putBuddyToSleep()} />
        <ActionButton icon="🎾" label="Play" onClick={() => useBuddyStore.getState().playWithBuddy()} />
      </div>
    </div>
  );
}

function ActionButton({ icon, label, onClick }: { icon: string; label: string; onClick: () => void }) {
  return (
    <motion.button
      className="flex-1 bg-white/90 hover:bg-white rounded-xl py-2 px-3 flex flex-col items-center gap-1 shadow-lg border-2 border-primary-blue/30"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
    >
      <span className="text-2xl">{icon}</span>
      <span className="text-xs font-fredoka font-bold text-primary-blue">{label}</span>
    </motion.button>
  );
}
