import React from 'react';
import { motion } from 'motion/react';
import {
  Navigation,
  Mail,
  Lock,
  RefreshCw,
  LogIn,
  Plus,
  Globe,
  AlertTriangle,
  ArrowLeft,
  Sun,
  Moon
} from 'lucide-react';

interface AuthViewProps {
  authTab: 'signin' | 'signup';
  setAuthTab: (tab: 'signin' | 'signup') => void;
  emailInput: string;
  setEmailInput: (val: string) => void;
  passwordInput: string;
  setPasswordInput: (val: string) => void;
  authError: string | null;
  authActionLoading: boolean;
  handleEmailAuth: (e: React.FormEvent) => void;
  handleGoogleAuth: () => void;
  onNavigateHome: () => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
}

export const AuthView: React.FC<AuthViewProps> = ({
  authTab,
  setAuthTab,
  emailInput,
  setEmailInput,
  passwordInput,
  setPasswordInput,
  authError,
  authActionLoading,
  handleEmailAuth,
  handleGoogleAuth,
  onNavigateHome,
  isDarkMode,
  onToggleTheme,
}) => {
  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#0B0F19] text-[#111827] dark:text-white flex flex-col justify-between p-4 sm:p-6 transition-colors duration-300">
      {/* Top Bar with Back to Landing Page link & theme toggle */}
      <header className="max-w-md w-full mx-auto flex items-center justify-between py-4">
        <button
          type="button"
          onClick={onNavigateHome}
          className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold text-[#6B7280] dark:text-[#94A3B8] hover:text-[#111827] dark:hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Overview</span>
        </button>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={onToggleTheme}
            className="p-2 rounded-xl bg-white dark:bg-[#121826] border border-[#E5E7EB] dark:border-[#1E293B] text-[#6B7280] dark:text-[#94A3B8] hover:text-[#111827] dark:hover:text-white transition-all cursor-pointer"
            title="Switch Theme"
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
          </button>
          <div className="w-8 h-8 rounded-xl bg-[#10B981] flex items-center justify-center text-white shadow-xs">
            <Navigation className="w-4 h-4 transform rotate-45" />
          </div>
          <span className="font-display font-bold text-sm text-[#111827] dark:text-white">AutoPay</span>
        </div>
      </header>

      {/* Main Auth Container matching existing portal */}
      <main className="max-w-md w-full mx-auto my-auto py-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl bg-white dark:bg-[#121826] p-7 sm:p-8 border border-[#E5E7EB] dark:border-[#1E293B] shadow-xl relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#10B981]/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="text-center mb-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-[#10B981] to-[#34D399] flex items-center justify-center shadow-lg mx-auto mb-3 text-white">
              <Navigation className="w-6 h-6 transform rotate-45" />
            </div>
            <h1 className="text-2xl font-bold font-display text-[#111827] dark:text-white tracking-tight">
              Access Commuter Portal
            </h1>
            <p className="text-xs text-[#6B7280] dark:text-[#94A3B8] mt-1.5 leading-relaxed font-sans">
              Daily auto fares and UPI expenses tracked in two seconds. Synchronized securely in the cloud.
            </p>
          </div>

          {/* Sign In vs Register Toggle */}
          <div className="flex rounded-xl bg-[#FAFAFA] dark:bg-[#0B0F19] p-1 mb-6 border border-[#E5E7EB] dark:border-[#1E293B]">
            <button
              type="button"
              onClick={() => setAuthTab('signin')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                authTab === 'signin'
                  ? 'bg-white dark:bg-[#1E293B] text-[#111827] dark:text-white shadow-sm'
                  : 'text-[#6B7280] dark:text-[#94A3B8] hover:text-[#111827] dark:hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setAuthTab('signup')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                authTab === 'signup'
                  ? 'bg-white dark:bg-[#1E293B] text-[#111827] dark:text-white shadow-sm'
                  : 'text-[#6B7280] dark:text-[#94A3B8] hover:text-[#111827] dark:hover:text-white'
              }`}
            >
              Register
            </button>
          </div>

          <form onSubmit={handleEmailAuth} className="space-y-4">
            {authError && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 rounded-xl text-[11px] leading-snug flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{authError}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#6B7280] dark:text-[#94A3B8] uppercase tracking-wider font-mono">
                Email Address
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6B7280] dark:text-[#94A3B8]">
                  <Mail className="w-4 h-4" />
                </span>
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="e.g. yourname@student.edu"
                  required
                  className="w-full rounded-xl pl-10 pr-4 py-2.5 text-sm border bg-white dark:bg-[#0B0F19] border-[#E5E7EB] dark:border-[#1E293B] text-[#111827] dark:text-white focus:outline-none focus:border-[#10B981] dark:focus:border-[#10B981] transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#6B7280] dark:text-[#94A3B8] uppercase tracking-wider font-mono">
                Password
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6B7280] dark:text-[#94A3B8]">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  type="password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full rounded-xl pl-10 pr-4 py-2.5 text-sm border bg-white dark:bg-[#0B0F19] border-[#E5E7EB] dark:border-[#1E293B] text-[#111827] dark:text-white focus:outline-none focus:border-[#10B981] dark:focus:border-[#10B981] transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={authActionLoading}
              className="w-full bg-[#10B981] hover:bg-[#059669] disabled:bg-[#6B7280] text-white font-semibold text-sm py-3 rounded-xl transition-all shadow-md shadow-[#10B981]/20 flex items-center justify-center gap-2 cursor-pointer"
            >
              {authActionLoading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : authTab === 'signin' ? (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Sign In to Account</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>Create Account</span>
                </>
              )}
            </button>
          </form>

          {/* Federated Auth Divider */}
          <div className="relative flex items-center justify-center my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#E5E7EB] dark:border-[#1E293B]"></div>
            </div>
            <span className="relative px-3 text-[9px] uppercase font-bold tracking-widest bg-white dark:bg-[#121826] text-[#6B7280] dark:text-[#94A3B8] font-mono">
              Federated Sync
            </span>
          </div>

          <button
            type="button"
            onClick={handleGoogleAuth}
            disabled={authActionLoading}
            className="w-full py-2.5 px-4 bg-white dark:bg-[#0B0F19] border border-[#E5E7EB] dark:border-[#1E293B] hover:bg-slate-50 dark:hover:bg-[#1E293B] text-[#111827] dark:text-white rounded-xl font-semibold text-xs flex items-center justify-center gap-2.5 transition-all cursor-pointer shadow-sm"
          >
            <Globe className="w-4 h-4 text-[#10B981]" />
            <span>Continue with Google</span>
          </button>
        </motion.div>
      </main>

      {/* Footer Note */}
      <footer className="max-w-md w-full mx-auto py-4 text-center font-mono text-[10px] text-[#6B7280] dark:text-[#94A3B8]">
        <span>AutoPay Commute Ledger • Encrypted via Firebase</span>
      </footer>
    </div>
  );
};
