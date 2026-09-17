import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, ArrowRight, Compass } from 'lucide-react';
import { useApp } from '../../context/AppContext.js';
import { useAuth } from '../../context/AuthContext.js';

export const SplashScreen: React.FC = () => {
  const { setCurrentScreen } = useApp();
  const { ssoLogin } = useAuth();

  const handleQuickDemo = async () => {
    await ssoLogin('google');
    setCurrentScreen('main');
  };

  return (
    <div className="flex-1 flex flex-col justify-between items-center px-6 py-10 bg-[#0D0221] text-purple-100 min-h-full">
      {/* Top subtle branding indicator */}
      <div className="w-full flex justify-end">
        <span className="text-[11px] font-mono text-fuchsia-300 bg-purple-900/40 px-2.5 py-1 rounded-full border border-purple-500/40 shadow-[0_0_10px_rgba(168,85,247,0.3)]">
          v2.4 • Student Edition
        </span>
      </div>

      {/* Brand Hero Centerpiece */}
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="flex flex-col items-center text-center my-auto"
      >
        {/* App Icon: 80 x 80 px rounded container (Cosmic Purple with Electric Neon Glow) */}
        <div className="w-20 h-20 rounded-[20px] bg-gradient-to-br from-[#9333EA] via-[#A855F7] to-[#F0ABFC] p-0.5 shadow-2xl shadow-purple-500/50 flex items-center justify-center mb-6">
          <div className="w-full h-full rounded-[18px] bg-gradient-to-br from-[#190838] to-[#260D52] flex items-center justify-center relative overflow-hidden border border-purple-400/40">
            {/* Spark / Compass Glyph */}
            <div className="relative">
              <Compass className="w-10 h-10 text-white stroke-[2.2]" />
              <Sparkles className="w-4 h-4 text-fuchsia-300 absolute -top-1 -right-1 animate-pulse" />
            </div>
          </div>
        </div>

        {/* Brand Wordmark */}
        <h1 className="text-[28px] font-extrabold text-[#FFFFFF] tracking-tight mb-2 drop-shadow-[0_0_15px_rgba(168,85,247,0.5)]">
          Aura Coach
        </h1>

        {/* Tagline */}
        <p className="text-[14px] text-purple-200/90 max-w-[260px] leading-relaxed">
          Empathetic AI guidance for peak academic focus.
        </p>

        {/* Empirical survey badge */}
        <div className="mt-6 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#190838] border border-[#4C1D95] text-xs text-purple-200 shadow-[0_0_10px_rgba(168,85,247,0.2)]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#A855F7] animate-ping" />
          <span>Research-backed • 62.5% demand</span>
        </div>
      </motion.div>

      {/* Bottom Controls */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="w-full space-y-3"
      >
        {/* Primary CTA: [Get Started ->] */}
        <button
          onClick={() => setCurrentScreen('signup')}
          className="w-full h-[52px] bg-gradient-to-r from-purple-600 via-fuchsia-600 to-pink-600 hover:from-purple-500 hover:to-fuchsia-500 active:scale-[0.99] text-white font-bold text-base rounded-xl transition-all shadow-[0_0_20px_rgba(168,85,247,0.6)] flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>Get Started</span>
          <ArrowRight className="w-5 h-5" />
        </button>

        {/* Existing account link */}
        <div className="text-center pt-1">
          <button
            onClick={() => setCurrentScreen('login')}
            className="text-[13px] text-fuchsia-300 hover:text-white hover:underline font-semibold cursor-pointer transition-colors"
          >
            Already have an account? Log in
          </button>
        </div>

        {/* Instant Demo Sandbox Shortcut */}
        <div className="pt-2 border-t border-[#4C1D95]/60 text-center">
          <button
            onClick={handleQuickDemo}
            className="text-[12px] text-purple-300 hover:text-white transition-colors cursor-pointer py-1"
          >
            ⚡ Quick Test with Demo Student Profile (Priya)
          </button>
        </div>
      </motion.div>
    </div>
  );
};
