import React, { useState } from 'react';
import { ChevronLeft, ShieldCheck, KeyRound, CheckCircle2, ArrowRight } from 'lucide-react';
import { useApp } from '../../context/AppContext.js';

export const ResetPasswordScreen: React.FC = () => {
  const { setCurrentScreen } = useApp();
  const [email, setEmail] = useState('');
  const [isSent, setIsSent] = useState(false);
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      setLoading(false);
      setIsSent(true);
      if (data.verificationCodePreview) {
        // Pre-fill simulated code for quick test verification
        const chars = data.verificationCodePreview.split('').slice(0, 6);
        setCode(chars);
      }
    } catch {
      setLoading(false);
      setIsSent(true);
    }
  };

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(true);
    setTimeout(() => {
      setCurrentScreen('login');
    }, 1500);
  };

  return (
    <div className="flex-1 flex flex-col justify-between px-6 pt-10 pb-6 bg-[#0D0221] text-purple-100 min-h-full">
      <div>
        {/* Top Navigation */}
        <div className="flex items-center mb-6">
          <button
            onClick={() => setCurrentScreen('login')}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-purple-300 hover:text-white hover:bg-purple-900/40 transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        </div>

        {/* Header Stack */}
        <div className="flex flex-col items-start mb-6">
          {/* Graphic: Shield / Key Badge */}
          <div className="w-12 h-12 rounded-[14px] bg-[#190838] border border-[#4C1D95] flex items-center justify-center mb-4 shadow-[0_0_15px_rgba(168,85,247,0.3)]">
            <KeyRound className="w-6 h-6 text-[#A855F7]" />
          </div>

          <h1 className="text-[22px] font-bold text-[#FFFFFF] drop-shadow-[0_0_12px_rgba(168,85,247,0.4)]">Reset Password</h1>
          <p className="text-[14px] text-purple-200/80 mt-1">
            {!isSent
              ? "Enter your email address and we'll send a 6-digit verification code to regain access."
              : `We've sent a 6-digit verification code to ${email}. Enter it below.`}
          </p>
        </div>

        {/* Form State */}
        {!isSent ? (
          <form onSubmit={handleSendCode} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-purple-200 mb-1">Email address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@university.edu"
                className="w-full h-[50px] px-3.5 rounded-[10px] bg-[#13052E] border border-[#4C1D95] focus:border-[#A855F7] focus:ring-1 focus:ring-[#A855F7] text-sm text-white placeholder-purple-300/50 outline-none transition-colors shadow-[0_0_10px_rgba(168,85,247,0.15)]"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-[52px] bg-gradient-to-r from-purple-600 via-fuchsia-600 to-pink-600 hover:from-purple-500 hover:to-fuchsia-500 active:scale-[0.99] text-white font-bold text-base rounded-xl transition-all shadow-[0_0_20px_rgba(168,85,247,0.5)] flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? 'Sending...' : 'Send Verification Code'}
            </button>
          </form>
        ) : !success ? (
          <form onSubmit={handleVerify} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-purple-200 mb-2">6-Digit Verification Code</label>
              <div className="flex gap-2 justify-between">
                {code.map((digit, i) => (
                  <input
                    key={i}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => {
                      const next = [...code];
                      next[i] = e.target.value;
                      setCode(next);
                    }}
                    className="w-11 h-12 text-center text-lg font-bold font-mono rounded-lg bg-[#13052E] border border-[#4C1D95] focus:border-[#A855F7] text-white outline-none shadow-[0_0_10px_rgba(168,85,247,0.15)]"
                  />
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-purple-200 mb-1">New Password</label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                className="w-full h-[50px] px-3.5 rounded-[10px] bg-[#13052E] border border-[#4C1D95] focus:border-[#A855F7] text-sm text-white placeholder-purple-300/50 outline-none shadow-[0_0_10px_rgba(168,85,247,0.15)]"
              />
            </div>

            <button
              type="submit"
              className="w-full h-[52px] bg-gradient-to-r from-purple-600 via-fuchsia-600 to-pink-600 hover:from-purple-500 hover:to-fuchsia-500 text-white font-bold text-base rounded-xl transition-all shadow-[0_0_20px_rgba(168,85,247,0.5)] flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Update Password</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </form>
        ) : (
          <div className="p-6 rounded-2xl bg-[#190838] border border-purple-500/40 text-center flex flex-col items-center shadow-[0_0_20px_rgba(168,85,247,0.3)]">
            <CheckCircle2 className="w-12 h-12 text-fuchsia-400 mb-3" />
            <h3 className="text-base font-bold text-white">Password Updated!</h3>
            <p className="text-xs text-purple-200 mt-1">Redirecting you to login screen...</p>
          </div>
        )}
      </div>

      {/* Bottom Link */}
      <div className="text-center pt-4">
        <button
          onClick={() => setCurrentScreen('login')}
          className="text-[13px] text-purple-300 hover:text-white transition-colors cursor-pointer"
        >
          Back to Log In
        </button>
      </div>
    </div>
  );
};
