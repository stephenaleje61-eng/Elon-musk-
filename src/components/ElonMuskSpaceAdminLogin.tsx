import React, { useState } from 'react';
import { loginAdmin, AUTHORIZED_ADMIN_EMAIL } from '../services/firebaseAuth';
import { StarfieldCanvas } from './StarfieldCanvas';

interface ElonMuskSpaceAdminLoginProps {
  onLoginSuccess: () => void;
  onBackToVisitor: () => void;
}

export const ElonMuskSpaceAdminLogin: React.FC<ElonMuskSpaceAdminLoginProps> = ({
  onLoginSuccess,
  onBackToVisitor,
}) => {
  const [email] = useState(AUTHORIZED_ADMIN_EMAIL);
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!password) {
      setError('PASSWORD IS REQUIRED.');
      return;
    }

    setIsSubmitting(true);
    try {
      await loginAdmin(email, password);
      onLoginSuccess();
    } catch (err: any) {
      setError(err?.message || 'AUTHENTICATION FAILED. PLEASE VERIFY CREDENTIALS.');
    } finally {
      setIsSubmitting(false);
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
              SECURITY PROTOCOL
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
                SECURE ACCESS
              </div>
              <h1 className="text-xl sm:text-2xl font-light tracking-[2px] uppercase text-white">
                ADMIN CONTROL
              </h1>
              <p className="text-[10px] font-mono tracking-[1px] text-[#888888] uppercase">
                RESTRICTED TO AUTHORIZED COMMAND
              </p>
            </div>

            {error && (
              <div className="border border-[#333333] p-3 text-[11px] font-mono tracking-[0.5px] text-white bg-[#000000] uppercase rounded-none">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-mono tracking-[1.5px] uppercase text-[#888888] block">
                  AUTHORIZED EMAIL
                </label>
                <input
                  type="email"
                  disabled
                  value={email}
                  className="w-full bg-[#0a0a0a] border border-[#222222] px-3.5 py-2.5 text-[12px] font-mono text-[#888888] tracking-[1px] cursor-not-allowed select-none rounded-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono tracking-[1.5px] uppercase text-[#888888] block">
                  SECURITY KEY / PASSWORD
                </label>
                <input
                  type="password"
                  required
                  autoFocus
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="ENTER ACCESS KEY"
                  className="w-full bg-[#000000] border border-[#222222] focus:border-white px-3.5 py-2.5 text-[12px] font-mono text-white tracking-[1px] placeholder-[#444444] focus:outline-none rounded-none"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting || !password}
                  className="w-full bg-white text-black hover:bg-[#000000] hover:text-white border border-white py-3 text-[11px] font-normal tracking-[2px] uppercase transition-colors disabled:opacity-30 cursor-pointer rounded-none"
                >
                  {isSubmitting ? 'VERIFYING CREDENTIALS...' : 'SIGN IN TO COMMAND'}
                </button>
              </div>
            </form>

            <div className="text-[10px] font-mono tracking-[1px] uppercase text-[#666666] pt-3 border-t border-[#222222] text-center">
              PROTECTED PROTOCOL &bull; LEVEL 4 ENCRYPTION
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-[#222222] px-6 py-3 text-[10px] font-mono tracking-[1.5px] uppercase text-[#888888] flex items-center justify-between bg-[#000000]/90">
          <span>SPACEX / X COMMAND ACCESS</span>
          <span>AUTHORIZED PERSONNEL ONLY</span>
        </footer>
      </div>
    </div>
  );
};
