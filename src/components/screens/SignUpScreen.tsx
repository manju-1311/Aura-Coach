import React, { useState } from 'react';
import { ChevronLeft, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useApp } from '../../context/AppContext.js';
import { useAuth } from '../../context/AuthContext.js';

export const SignUpScreen: React.FC = () => {
  const { setCurrentScreen } = useApp();
  const { signup, ssoLogin } = useAuth();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [college, setCollege] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreed, setAgreed] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !password) {
      setError('Please fill out all required fields');
      return;
    }
    if (!agreed) {
      setError('Please agree to Terms of Service & Privacy Policy');
      return;
    }

    setLoading(true);
    setError(null);
    const result = await signup(fullName, email, password, college);
    setLoading(false);

    if (result.success) {
      // Direct user into calibration onboarding
      setCurrentScreen('onboarding');
    } else {
      setError(result.error || 'Failed to create account');
    }
  };

  const handleGoogleSSO = async () => {
    setLoading(true);
    const res = await ssoLogin('google');
    setLoading(false);
    if (res.success) {
      setCurrentScreen('onboarding');
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-between px-6 pt-10 pb-6 bg-[#0D0221] text-purple-100 min-h-full overflow-y-auto">
      <div>
        {/* Top Navigation */}
        <div className="flex items-center justify-between mb-5">
          <button
            onClick={() => setCurrentScreen('splash')}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-purple-300 hover:text-white hover:bg-purple-900/40 transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={() => setCurrentScreen('login')}
            className="text-sm font-semibold text-fuchsia-400 hover:text-fuchsia-300 hover:underline cursor-pointer"
          >
            Log In
          </button>
        </div>

        {/* Header Stack */}
        <div className="mb-6">
          <h1 className="text-[24px] font-bold text-[#FFFFFF] tracking-tight drop-shadow-[0_0_12px_rgba(168,85,247,0.4)]">
            Create your account
          </h1>
          <p className="text-[14px] text-purple-200/80 mt-1">Start personalizing your daily study routine.</p>
        </div>

        {/* Social SSO Button */}
        <button
          type="button"
          onClick={handleGoogleSSO}
          className="w-full h-12 rounded-[10px] bg-[#190838] border border-[#4C1D95] hover:border-purple-400 text-white font-medium text-sm flex items-center justify-center gap-3 transition-colors cursor-pointer shadow-[0_0_10px_rgba(168,85,247,0.15)]"
        >
          {/* Google SVG Logo */}
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
            />
            <path
              fill="#FBBC05"
              d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
            />
            <path
              fill="#EA4335"
              d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
            />
          </svg>
          <span>Continue with Google</span>
        </button>

        {/* Divider */}
        <div className="flex items-center my-5">
          <div className="flex-1 h-[1px] bg-[#4C1D95]/60" />
          <span className="px-3 text-[12px] text-purple-300/70">or sign up with email</span>
          <div className="flex-1 h-[1px] bg-[#4C1D95]/60" />
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
            {error}
          </div>
        )}

        {/* Input Fields */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-medium text-purple-200 mb-1">Full Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Priya Raman"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full h-[50px] px-3.5 rounded-[10px] bg-[#13052E] border border-[#4C1D95] focus:border-[#A855F7] focus:ring-1 focus:ring-[#A855F7] text-sm text-white placeholder-purple-300/50 outline-none transition-colors shadow-[0_0_10px_rgba(168,85,247,0.15)]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-purple-200 mb-1">College Email</label>
            <input
              type="email"
              required
              placeholder="student@university.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-[50px] px-3.5 rounded-[10px] bg-[#13052E] border border-[#4C1D95] focus:border-[#A855F7] focus:ring-1 focus:ring-[#A855F7] text-sm text-white placeholder-purple-300/50 outline-none transition-colors shadow-[0_0_10px_rgba(168,85,247,0.15)]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-purple-200 mb-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="Create a strong password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-[50px] px-3.5 pr-11 rounded-[10px] bg-[#13052E] border border-[#4C1D95] focus:border-[#A855F7] focus:ring-1 focus:ring-[#A855F7] text-sm text-white placeholder-purple-300/50 outline-none transition-colors shadow-[0_0_10px_rgba(168,85,247,0.15)]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-purple-300 hover:text-white cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Agreement Checkbox */}
          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="agreement"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="w-4 h-4 rounded border-[#4C1D95] bg-[#13052E] text-[#A855F7] focus:ring-0 focus:ring-offset-0 cursor-pointer accent-purple-500"
            />
            <label htmlFor="agreement" className="text-[12px] text-purple-300/80 cursor-pointer">
              I agree to the <span className="text-purple-200 underline">Terms of Service</span> & <span className="text-purple-200 underline">Privacy Policy</span>
            </label>
          </div>

          {/* Bottom CTA */}
          <div className="pt-3">
            <button
              type="submit"
              disabled={loading}
              className="w-full h-[52px] bg-gradient-to-r from-purple-600 via-fuchsia-600 to-pink-600 hover:from-purple-500 hover:to-fuchsia-500 active:scale-[0.99] text-white font-bold text-base rounded-xl transition-all shadow-[0_0_20px_rgba(168,85,247,0.5)] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Create Account'}
            </button>
          </div>
        </form>
      </div>

      <div className="text-center pt-4">
        <span className="text-xs text-purple-300/70">Already registered? </span>
        <button
          onClick={() => setCurrentScreen('login')}
          className="text-xs text-fuchsia-400 font-semibold hover:underline cursor-pointer"
        >
          Log In
        </button>
      </div>
    </div>
  );
};
