import React from 'react';
import { motion } from 'motion/react';
import { useAuth } from '../context/AuthContext.js';

interface CompanionSpriteProps {
  state?: 'idle' | 'sleeping' | 'reading' | 'celebrating' | 'happy' | 'needy';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showLabel?: boolean;
}

export const CompanionSprite: React.FC<CompanionSpriteProps> = ({ state = 'reading', size = 'md', showLabel = true }) => {
  const { user } = useAuth();
  const isEnabled = user?.petCompanionEnabled ?? true;

  // If user opted out of the digital pet (per 50% survey research), render the subtle botanical focus ring
  if (!isEnabled) {
    return (
      <div className="flex flex-col items-center justify-center p-3 text-center">
        <div className="w-14 h-14 rounded-full border border-emerald-500/30 bg-emerald-950/20 flex items-center justify-center">
          <svg className="w-7 h-7 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M12 2L15 8L22 9L17 14L18 21L12 17.5L6 21L7 14L2 9L9 8L12 2Z" />
          </svg>
        </div>
        {showLabel && <span className="text-[11px] text-emerald-400/80 font-medium mt-1">Zen Botanical Focus</span>}
      </div>
    );
  }

  const dimensions =
    size === 'sm'
      ? 'w-12 h-12'
      : size === 'lg'
      ? 'w-24 h-24'
      : size === 'xl'
      ? 'w-28 h-28'
      : 'w-18 h-18';

  return (
    <div className="flex flex-col items-center justify-center">
      <motion.div
        animate={{
          y:
            state === 'sleeping'
              ? [0, -3, 0]
              : state === 'reading'
              ? [0, -4, 0]
              : state === 'needy'
              ? [0, 2, 0, -1, 0]
              : [0, -8, 0],
          scale:
            state === 'sleeping'
              ? [1, 1.03, 1]
              : state === 'needy'
              ? [0.97, 1, 0.97]
              : state === 'happy'
              ? [1, 1.05, 1]
              : 1,
          rotate: state === 'needy' ? [-1.5, 1.5, -1.5] : 0,
        }}
        transition={{
          repeat: Infinity,
          duration: state === 'sleeping' ? 3.2 : state === 'needy' ? 2.0 : state === 'happy' ? 1.8 : 2.5,
          ease: 'easeInOut',
        }}
        className={`relative ${dimensions} flex items-center justify-center`}
      >
        {/* Glow Aura behind pet */}
        <div
          className={`absolute inset-0 rounded-full blur-xl animate-pulse ${
            state === 'needy'
              ? 'bg-amber-500/25'
              : state === 'happy'
              ? 'bg-emerald-400/30'
              : 'bg-emerald-500/15'
          }`}
        />

        {/* 2D Vector Sprite: "Aura the Focus Sprout / Kit" */}
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
          {/* Sprout Leaves on Head */}
          {state === 'needy' ? (
            <>
              {/* Drooping/wilting sprout leaves */}
              <motion.path
                d="M50 28 C42 16, 26 22, 34 34 C42 34, 46 30, 50 28 Z"
                fill="#F59E0B"
                animate={{ rotate: [-2, 2, -2] }}
                transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
              />
              <motion.path
                d="M50 28 C58 18, 70 24, 62 34 C56 34, 52 30, 50 28 Z"
                fill="#FBBF24"
                animate={{ rotate: [2, -2, 2] }}
                transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
              />
            </>
          ) : (
            <>
              {/* Healthy thriving sprout leaves */}
              <motion.path
                d="M50 25 C45 10, 30 15, 38 28 C45 28, 48 26, 50 25 Z"
                fill="#10B981"
                animate={{ rotate: state === 'happy' ? [-6, 6, -6] : [-3, 3, -3] }}
                transition={{ repeat: Infinity, duration: state === 'happy' ? 1.6 : 2.2, ease: 'easeInOut' }}
              />
              <motion.path
                d="M50 25 C55 10, 70 15, 62 28 C55 28, 52 26, 50 25 Z"
                fill="#34D399"
                animate={{ rotate: state === 'happy' ? [6, -6, 6] : [3, -3, 3] }}
                transition={{ repeat: Infinity, duration: state === 'happy' ? 1.6 : 2.2, ease: 'easeInOut' }}
              />
            </>
          )}

          {/* Main Body */}
          <ellipse
            cx="50"
            cy="58"
            rx="30"
            ry="26"
            fill="#1E293B"
            stroke={state === 'needy' ? '#F59E0B' : state === 'happy' ? '#10B981' : '#334155'}
            strokeWidth="2"
          />
          <ellipse cx="50" cy="62" rx="20" ry="16" fill="#0F172A" />

          {/* Cute Rosy Cheeks */}
          <circle
            cx="34"
            cy="58"
            r="4"
            fill={state === 'needy' ? '#F59E0B' : '#F43F5E'}
            opacity={state === 'happy' ? 0.65 : 0.4}
          />
          <circle
            cx="66"
            cy="58"
            r="4"
            fill={state === 'needy' ? '#F59E0B' : '#F43F5E'}
            opacity={state === 'happy' ? 0.65 : 0.4}
          />

          {/* Eyes & Mouth depending on state */}
          {state === 'sleeping' ? (
            <>
              {/* Closed gentle curved sleeping eyes */}
              <path d="M34 50 Q40 56 46 50" fill="none" stroke="#F8FAFC" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M54 50 Q60 56 66 50" fill="none" stroke="#F8FAFC" strokeWidth="2.5" strokeLinecap="round" />
              {/* Little Zzz */}
              <motion.text
                x="72"
                y="36"
                fill="#34D399"
                fontSize="12"
                fontWeight="bold"
                animate={{ opacity: [0, 1, 0], y: [36, 26, 16], x: [72, 78, 84] }}
                transition={{ repeat: Infinity, duration: 2.5 }}
              >
                z
              </motion.text>
            </>
          ) : state === 'reading' ? (
            <>
              {/* Attentive study eyes looking down at book */}
              <circle cx="40" cy="50" r="3.5" fill="#F8FAFC" />
              <circle cx="60" cy="50" r="3.5" fill="#F8FAFC" />
              <circle cx="41" cy="52" r="1.5" fill="#10B981" />
              <circle cx="61" cy="52" r="1.5" fill="#10B981" />
              {/* Little smiling mouth */}
              <path d="M48 57 Q50 59 52 57" fill="none" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" />

              {/* Open Study Book */}
              <g transform="translate(32, 64) scale(0.75)">
                <path d="M2 14 Q24 6 24 2 Q24 6 46 14 L46 22 Q24 14 24 10 Q24 14 2 22 Z" fill="#10B981" />
                <path d="M4 13 Q24 7 24 3 Q24 7 44 13 L44 19 Q24 13 24 9 Q24 13 4 19 Z" fill="#F8FAFC" />
                <line x1="24" y1="3" x2="24" y2="10" stroke="#059669" strokeWidth="1.5" />
              </g>
            </>
          ) : state === 'needy' ? (
            <>
              {/* Large pleading puppy eyes looking up */}
              <circle cx="38" cy="49" r="4.5" fill="#F8FAFC" />
              <circle cx="62" cy="49" r="4.5" fill="#F8FAFC" />
              <circle cx="39" cy="49" r="3.2" fill="#0F172A" />
              <circle cx="61" cy="49" r="3.2" fill="#0F172A" />
              {/* Sparkle reflections in pleading eyes */}
              <circle cx="37.5" cy="47.5" r="1.4" fill="#FFFFFF" />
              <circle cx="40.5" cy="50.5" r="0.8" fill="#FFFFFF" />
              <circle cx="59.5" cy="47.5" r="1.4" fill="#FFFFFF" />
              <circle cx="62.5" cy="50.5" r="0.8" fill="#FFFFFF" />

              {/* Sad/pleading downturned mouth */}
              <path d="M47 59 Q50 56.5 53 59" fill="none" stroke="#F43F5E" strokeWidth="2" strokeLinecap="round" />

              {/* Teardrop / Sweat distress droplet */}
              <motion.path
                d="M72 44 C72 44, 75 48, 75 50 C75 52, 73.5 53, 72 53 C70.5 53, 69 52, 69 50 C69 48, 72 44, 72 44 Z"
                fill="#38BDF8"
                animate={{ y: [0, 5, 9], opacity: [0.95, 0.7, 0] }}
                transition={{ repeat: Infinity, duration: 1.8, ease: 'easeIn' }}
              />
            </>
          ) : state === 'happy' ? (
            <>
              {/* Big joyful curved smiling eyes */}
              <path d="M33 50 Q39 42 45 50" fill="none" stroke="#F8FAFC" strokeWidth="3" strokeLinecap="round" />
              <path d="M55 50 Q61 42 67 50" fill="none" stroke="#F8FAFC" strokeWidth="3" strokeLinecap="round" />

              {/* Cheerful wide open happy smile */}
              <path d="M45 56 Q50 63 55 56" fill="#F43F5E" stroke="#F43F5E" strokeWidth="1.5" />
              <path d="M46 57 Q50 60 54 57" fill="#FFFFFF" opacity="0.9" />

              {/* Floating joy sparkles */}
              <motion.circle
                cx="74"
                cy="38"
                r="1.8"
                fill="#FDE047"
                animate={{ scale: [0.8, 1.5, 0.8], opacity: [0.4, 1, 0.4] }}
                transition={{ repeat: Infinity, duration: 1.4 }}
              />
              <motion.circle
                cx="26"
                cy="40"
                r="1.5"
                fill="#34D399"
                animate={{ scale: [1.2, 0.7, 1.2], opacity: [0.8, 0.3, 0.8] }}
                transition={{ repeat: Infinity, duration: 1.6 }}
              />
            </>
          ) : (
            <>
              {/* Big happy celebrating eyes */}
              <circle cx="39" cy="48" r="4.5" fill="#F8FAFC" />
              <circle cx="61" cy="48" r="4.5" fill="#F8FAFC" />
              <circle cx="41" cy="47" r="1.5" fill="#0F172A" />
              <circle cx="63" cy="47" r="1.5" fill="#0F172A" />
              <path d="M46 56 Q50 62 54 56" fill="#F43F5E" stroke="#F43F5E" strokeWidth="1.5" />
            </>
          )}
        </svg>
      </motion.div>

      {showLabel && (
        <span
          className={`text-[11px] font-medium mt-1 transition-colors ${
            state === 'needy'
              ? 'text-amber-400'
              : state === 'happy'
              ? 'text-emerald-400'
              : 'text-slate-400'
          }`}
        >
          {state === 'sleeping'
            ? 'Aura is resting'
            : state === 'reading'
            ? 'Focusing with you'
            : state === 'needy'
            ? 'Aura needs attention!'
            : state === 'happy'
            ? 'Aura is happy & energized!'
            : 'Level Up!'}
        </span>
      )}
    </div>
  );
};
