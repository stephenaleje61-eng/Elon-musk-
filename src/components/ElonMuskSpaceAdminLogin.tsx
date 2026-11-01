import React, { useState } from 'react';
import {
  loginAdmin,
  sendAdminPasswordReset,
  AUTHORIZED_ADMIN_EMAIL,
} from '../services/firebaseAuth';
import { StarfieldCanvas } from './StarfieldCanvas';
import { AlertCircle, CheckCircle, KeyRound, Mail, ArrowRight } from 'lucide-react';

interface ElonMuskSpaceAdminLoginProps {
  onLoginSuccess: () => void;
  onBackToVisitor: () => void;
}

export const ElonMuskSpaceAdminLogin: React.FC<ElonMuskSpaceAdminLoginProps> = ({
  onLoginSuccess,
  onBackToVisitor,
}) => {
  const [email, setEmail] = useState(AUTHORIZED_ADMIN_EMAIL);
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    const cleanEmail = email.toLowerCase().trim();
    const cleanPassword = password.trim();

    if (!cleanEmail) {
      setError('Please enter your administrator email.');
      return;
    }

    if (!cleanPassword) {
      setError('Password is required.');
      return;
    }

    setIsSubmitting(true);
    try {
      await loginAdmin(cleanEmail, cleanPassword);
      onLoginSuccess();
    } catch (err: any) {
      console.log('Admin login error:', err?.code, err?.message);
      // Display the REAL Firebase error, not hardcoded text
      setError(err?.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Forgot? Reset password handler
  const handlePasswordReset = async () => {
    setError(null);
    setSuccessMsg(null);
    const cleanEmail = email.toLowerCase().trim();

    if (!cleanEmail) {
      setError('Please enter your email address to receive a password reset link.');
      return;
    }

    setIsResetting(true);
    try {
      await sendAdminPasswordReset(cleanEmail);
      setSuccessMsg(`Password reset email sent to ${cleanEmail}. Please check your inbox or spam folder.`);
    } catch (err: any) {
      console.log('Password reset error:', err?.code, err?.message);
      setError(err?.message || 'Failed to dispatch password reset email.');
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#000000] text-[#FFFFFF] font-sans flex flex-col justify-between selection:bg-white selection:text-black">
      {/* Animated Starfield Background */}
      <StarfieldCanvas />

      <div className="relative z-10 flex flex-col min-h-screen justify-between">
        {/* Header - Ultra Minimal SpaceX Bar */}
        <header className="border-b border-[#222222] px-6 py-4 flex items-center justify-between bg-[#000000]/90 backdrop-blur-sm sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <span className="text-[13px] font-bold tracking-[2px] uppercase text-white">
              ELON MUSK SPACE
            </span>
            <span className="hidden sm:inline text-[10px] font-mono tracking-[1.5px] uppercase text-[#888888] border-l border-[#222222] pl-3">
              ADMIN CONTROL ACCESS
            </span>
          </div>

          <button
            onClick={onBackToVisitor}
            className="text-[10px] font-mono tracking-[1.5px] uppercase text-[#888888] hover:text-white transition-colors cursor-pointer bg-transparent border-0 p-0"
          >
            RETURN TO TRANSMISSION
          </button>
        </header>

        {/* Centered Minimal Form - SpaceX / X.com Style */}
        <main className="flex-1 flex flex-col justify-center items-center px-6 py-12">
          <div className="w-full max-w-sm space-y-6">
            {/* Title */}
            <div className="space-y-1">
              <div className="text-[10px] font-mono tracking-[2px] uppercase text-[#888888]">
                FIREBASE AUTHENTICATION &bull; ELON MUSK 22
              </div>
              <h1 className="text-xl sm:text-2xl font-light tracking-[2px] uppercase text-white">
                ADMIN COMMAND LOGIN
              </h1>
              <p className="text-[10px] font-mono tracking-[1px] text-[#888888]">
                Sign in with any authorized Firebase Auth administrator credentials
              </p>
            </div>

            {/* REAL Error Display without .toUpperCase() */}
            {error && (
              <div className="border border-red-900/60 p-3 text-[12px] font-mono text-red-300 bg-red-950/30 rounded-none flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
                <div className="leading-snug break-words">{error}</div>
              </div>
            )}

            {/* Success Message */}
            {successMsg && (
              <div className="border border-emerald-900/60 p-3 text-[12px] font-mono text-emerald-300 bg-emerald-950/30 rounded-none flex items-start gap-2">
                <CheckCircle className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
                <div className="leading-snug break-words">{successMsg}</div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email Field - Editable for any Firebase Auth account */}
              <div className="space-y-1">
                <label className="text-[10px] font-mono tracking-[1.5px] uppercase text-[#888888] flex items-center justify-between">
                  <span>ADMINISTRATOR EMAIL</span>
                  <span className="text-[#555555]">LOWERCASE AUTO</span>
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@example.com"
                    className="w-full bg-[#0a0a0a] border border-[#222222] focus:border-white px-3.5 py-2.5 text-[12px] font-mono text-white tracking-[0.5px] focus:outline-none rounded-none"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-mono tracking-[1.5px] uppercase text-[#888888]">
                    SECURITY PASSWORD
                  </label>

                  {/* Forgot? Reset Button calling sendPasswordResetEmail */}
                  <button
                    type="button"
                    onClick={handlePasswordReset}
                    disabled={isResetting}
                    className="text-[10px] font-mono text-[#00F0FF] hover:underline cursor-pointer bg-transparent border-0 p-0"
                    title="Send a password reset link to this email"
                  >
                    {isResetting ? 'Sending reset link...' : 'Forgot? Reset'}
                  </button>
                </div>

                <div className="relative">
                  <input
                    type="password"
                    required
                    autoFocus
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter account password"
                    className="w-full bg-[#000000] border border-[#222222] focus:border-white px-3.5 py-2.5 text-[12px] font-mono text-white tracking-[0.5px] placeholder-[#444444] focus:outline-none rounded-none"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting || !password}
                  className="w-full bg-white text-black hover:bg-[#000000] hover:text-white border border-white py-3 text-[11px] font-semibold tracking-[2px] uppercase transition-colors disabled:opacity-30 cursor-pointer rounded-none"
                >
                  {isSubmitting ? 'VERIFYING WITH FIREBASE AUTH...' : 'SIGN IN TO COMMAND'}
                </button>
              </div>
            </form>

            {/* Quick Helper for elonmuskspace241@gmail.com */}
            <div className="border border-[#222222] p-3 text-[11px] font-mono text-[#888888] space-y-1.5 bg-[#050505]">
              <div className="text-white font-semibold text-[10px] tracking-wider uppercase">
                Active Command Account
              </div>
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-white select-all">{AUTHORIZED_ADMIN_EMAIL}</span>
                <button
                  type="button"
                  onClick={() => {
                    setEmail(AUTHORIZED_ADMIN_EMAIL);
                    setPassword('elonmuskspace2026');
                  }}
                  className="text-[#00F0FF] hover:underline cursor-pointer"
                >
                  [Autofill Verified Key]
                </button>
              </div>
            </div>

            <div className="text-[10px] font-mono tracking-[1px] text-[#666666] pt-2 border-t border-[#222222] text-center">
              SECURE FIREBASE UPLINK &bull; AUTH INSTANCE CONNECTED
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-[#222222] px-6 py-3 text-[10px] font-mono tracking-[1.5px] uppercase text-[#888888] flex items-center justify-between bg-[#000000]/90">
          <span>SPACEX / X COMMAND ACCESS</span>
          <span>FIREBASE AUTHENTICATION</span>
        </footer>
      </div>
    </div>
  );
};
