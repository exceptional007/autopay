import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Navigation,
  Sun,
  Moon,
  LogIn,
  LogOut,
  Menu,
  X,
  ArrowRight,
  Download
} from 'lucide-react';
import { usePwaInstall } from '../../usePwaInstall';

interface NavbarProps {
  onNavigateLogin: () => void;
  onNavigateSignup?: () => void;
  onNavigateApp: () => void;
  onSignOut?: () => void;
  isAuthenticated: boolean;
  userEmail?: string | null;
  isDarkMode: boolean;
  onToggleTheme: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onNavigateLogin,
  onNavigateSignup,
  onNavigateApp,
  onSignOut,
  isAuthenticated,
  isDarkMode,
  onToggleTheme,
}) => {
  const { canInstall, isStandalone, isInstalled, triggerInstall } = usePwaInstall();
  const [activeSection, setActiveSection] = useState<string>('how-it-works');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Track active section on scroll for landing page
  useEffect(() => {
    const sectionIds = ['how-it-works', 'features', 'pdf-export-feature', 'stats', 'faq'];
    const handleScroll = () => {
      const scrollY = window.scrollY;
      for (const id of sectionIds) {
        const el = document.getElementById(id);
        if (el) {
          const top = el.offsetTop - 120;
          const height = el.offsetHeight;
          if (scrollY >= top && scrollY < top + height) {
            setActiveSection(id);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    setIsMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleAppTabNavigate = (tab: 'dashboard' | 'history' | 'analytics' | 'portal') => {
    setIsMobileMenuOpen(false);
    if (isAuthenticated) {
      onNavigateApp();
      window.history.pushState({}, '', `?tab=${tab}`);
      window.dispatchEvent(new PopStateEvent('popstate'));
    } else {
      onNavigateLogin();
    }
  };

  return (
    <nav
      id="main-nav"
      className="sticky top-0 z-40 bg-white/80 dark:bg-[#0B0F19]/80 backdrop-blur-md border-b border-[#E5E7EB] dark:border-[#1E293B] transition-colors"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Brand Identity matching exact screenshot */}
          <div className="flex items-center gap-3">
            <motion.div
              whileHover={{ scale: 1.05 }}
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="w-10 h-10 rounded-xl bg-[#10B981] flex items-center justify-center shadow-md shadow-[#10B981]/20 shrink-0 cursor-pointer"
              title="AutoPay Home"
            >
              <Navigation className="w-5 h-5 text-white transform rotate-45" />
            </motion.div>
            <div>
              <span className="text-base font-bold font-display tracking-tight flex items-center gap-1.5 text-[#111827] dark:text-white">
                AutoPay{' '}
                <span className="text-[10px] bg-[#10B981] text-white px-2 py-0.5 rounded-full font-mono font-bold tracking-wider">
                  STUDENT
                </span>
              </span>
              <span className="text-[10px] text-[#6B7280] dark:text-[#94A3B8] block font-medium -mt-0.5">
                Commute Expense Ledger
              </span>
            </div>
          </div>

          {/* Center: Sleek Capsule Pill Navigation matching screenshot */}
          {isAuthenticated ? (
            /* When authenticated, show app tabs directly */
            <div className="hidden md:flex items-center gap-1 bg-[#FAFAFA] dark:bg-[#121826]/60 p-1 rounded-xl border border-[#E5E7EB] dark:border-[#1E293B]">
              <button
                onClick={() => handleAppTabNavigate('dashboard')}
                className="px-4 py-1.5 text-xs font-semibold rounded-lg transition-all bg-white dark:bg-[#1E293B] text-[#111827] dark:text-white shadow-sm cursor-pointer"
              >
                Dashboard
              </button>
              <button
                onClick={() => handleAppTabNavigate('history')}
                className="px-4 py-1.5 text-xs font-semibold rounded-lg transition-all text-[#6B7280] dark:text-[#94A3B8] hover:text-[#111827] dark:hover:text-white cursor-pointer"
              >
                Logs & History
              </button>
              <button
                onClick={() => handleAppTabNavigate('analytics')}
                className="px-4 py-1.5 text-xs font-semibold rounded-lg transition-all text-[#6B7280] dark:text-[#94A3B8] hover:text-[#111827] dark:hover:text-white cursor-pointer"
              >
                Analytics
              </button>
              <button
                onClick={() => handleAppTabNavigate('portal')}
                className="px-4 py-1.5 text-xs font-semibold rounded-lg transition-all text-[#6B7280] dark:text-[#94A3B8] hover:text-[#111827] dark:hover:text-white cursor-pointer"
              >
                Portal Settings
              </button>
            </div>
          ) : (
            /* When not authenticated on landing page, show landing section tabs in exact capsule style */
            <div className="hidden md:flex items-center gap-1 bg-[#FAFAFA] dark:bg-[#121826]/60 p-1 rounded-xl border border-[#E5E7EB] dark:border-[#1E293B]">
              <button
                onClick={() => scrollToSection('how-it-works')}
                className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  activeSection === 'how-it-works'
                    ? 'bg-white dark:bg-[#1E293B] text-[#111827] dark:text-white shadow-sm'
                    : 'text-[#6B7280] dark:text-[#94A3B8] hover:text-[#111827] dark:hover:text-white'
                }`}
              >
                How It Works
              </button>
              <button
                onClick={() => scrollToSection('features')}
                className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  activeSection === 'features'
                    ? 'bg-white dark:bg-[#1E293B] text-[#111827] dark:text-white shadow-sm'
                    : 'text-[#6B7280] dark:text-[#94A3B8] hover:text-[#111827] dark:hover:text-white'
                }`}
              >
                Features
              </button>
              <button
                onClick={() => scrollToSection('pdf-export-feature')}
                className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  activeSection === 'pdf-export-feature'
                    ? 'bg-white dark:bg-[#1E293B] text-[#111827] dark:text-white shadow-sm'
                    : 'text-[#6B7280] dark:text-[#94A3B8] hover:text-[#111827] dark:hover:text-white'
                }`}
              >
                PDF Export
              </button>
              <button
                onClick={() => scrollToSection('stats')}
                className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  activeSection === 'stats'
                    ? 'bg-white dark:bg-[#1E293B] text-[#111827] dark:text-white shadow-sm'
                    : 'text-[#6B7280] dark:text-[#94A3B8] hover:text-[#111827] dark:hover:text-white'
                }`}
              >
                Numbers
              </button>
              <button
                onClick={() => scrollToSection('faq')}
                className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  activeSection === 'faq'
                    ? 'bg-white dark:bg-[#1E293B] text-[#111827] dark:text-white shadow-sm'
                    : 'text-[#6B7280] dark:text-[#94A3B8] hover:text-[#111827] dark:hover:text-white'
                }`}
              >
                FAQ
              </button>
            </div>
          )}

          {/* Right: Icon Buttons matching exact screenshot */}
          <div className="flex items-center gap-2">
            {/* Open Ledger / Launch App icon */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={isAuthenticated ? onNavigateApp : onNavigateLogin}
              className="p-2 rounded-xl bg-white dark:bg-[#121826] border border-[#E5E7EB] dark:border-[#1E293B] text-[#6B7280] dark:text-[#94A3B8] hover:text-[#111827] dark:hover:text-white hover:bg-slate-50 dark:hover:bg-[#1E293B] transition-all cursor-pointer"
              title={isAuthenticated ? 'Open Commute Ledger' : 'Sign In to Ledger'}
            >
              <Navigation className="w-4 h-4 text-[#10B981] transform rotate-45" />
            </motion.button>

            {/* Theme Toggle Button */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={onToggleTheme}
              className="p-2 rounded-xl bg-white dark:bg-[#121826] border border-[#E5E7EB] dark:border-[#1E293B] text-[#6B7280] dark:text-[#94A3B8] hover:text-[#111827] dark:hover:text-white hover:bg-slate-50 dark:hover:bg-[#1E293B] transition-all cursor-pointer"
              title="Switch Theme"
            >
              {isDarkMode ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-slate-700" />
              )}
            </motion.button>

            {/* Auth Button: LogOut if authenticated, LogIn if not */}
            {isAuthenticated ? (
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={onSignOut || onNavigateLogin}
                className="p-2 rounded-xl bg-white dark:bg-[#121826] border border-[#E5E7EB] dark:border-[#1E293B] text-rose-500 hover:text-white hover:bg-rose-500 dark:hover:bg-rose-600/30 transition-all cursor-pointer"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </motion.button>
            ) : (
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={onNavigateLogin}
                className="p-2 rounded-xl bg-white dark:bg-[#121826] border border-[#E5E7EB] dark:border-[#1E293B] text-[#10B981] hover:text-white hover:bg-[#10B981] transition-all cursor-pointer"
                title="Log In"
              >
                <LogIn className="w-4 h-4" />
              </motion.button>
            )}

            {/* Compact Start Tracking Button for High Conversion */}
            {!isAuthenticated && (
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={onNavigateSignup || onNavigateLogin}
                className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#10B981] hover:bg-[#059669] text-white font-mono text-xs font-semibold shadow-md shadow-[#10B981]/20 transition-all cursor-pointer ml-1"
              >
                <span>Start Tracking</span>
                <ArrowRight className="w-3 h-3" />
              </motion.button>
            )}

            {/* Mobile Menu Hamburger */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-xl bg-white dark:bg-[#121826] border border-[#E5E7EB] dark:border-[#1E293B] text-[#6B7280] dark:text-[#94A3B8] hover:text-[#111827] dark:hover:text-white transition-all cursor-pointer"
              title="Menu"
            >
              {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </motion.button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-[#E5E7EB] dark:border-[#1E293B] bg-white dark:bg-[#0B0F19] px-4 py-4 space-y-3 font-mono text-xs shadow-xl"
          >
            {isAuthenticated ? (
              <div className="space-y-1">
                <button
                  onClick={() => handleAppTabNavigate('dashboard')}
                  className="w-full text-left px-3 py-2 rounded-lg text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/20"
                >
                  Dashboard
                </button>
                <button
                  onClick={() => handleAppTabNavigate('history')}
                  className="w-full text-left px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:text-emerald-500"
                >
                  Logs & History
                </button>
                <button
                  onClick={() => handleAppTabNavigate('analytics')}
                  className="w-full text-left px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:text-emerald-500"
                >
                  Analytics
                </button>
                <button
                  onClick={() => handleAppTabNavigate('portal')}
                  className="w-full text-left px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:text-emerald-500"
                >
                  Portal Settings
                </button>
              </div>
            ) : (
              <div className="space-y-1">
                <button
                  onClick={() => scrollToSection('how-it-works')}
                  className="w-full text-left px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:text-emerald-500 font-medium"
                >
                  How It Works
                </button>
                <button
                  onClick={() => scrollToSection('features')}
                  className="w-full text-left px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:text-emerald-500 font-medium"
                >
                  Product Features
                </button>
                <button
                  onClick={() => scrollToSection('pdf-export-feature')}
                  className="w-full text-left px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:text-emerald-500 font-medium"
                >
                  PDF Export & Reports
                </button>
                <button
                  onClick={() => scrollToSection('stats')}
                  className="w-full text-left px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:text-emerald-500 font-medium flex items-center justify-between"
                >
                  <span>AutoPay in Numbers</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
                </button>
                <button
                  onClick={() => scrollToSection('faq')}
                  className="w-full text-left px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:text-emerald-500 font-medium"
                >
                  FAQ
                </button>
              </div>
            )}

            <div className="border-t border-gray-100 dark:border-gray-800 pt-3 space-y-2">
              {!isStandalone && !isInstalled && canInstall && (
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    triggerInstall();
                  }}
                  className="w-full py-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold text-center border border-emerald-500/20 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Install Web App</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  if (isAuthenticated) {
                    onNavigateApp();
                  } else if (onNavigateSignup) {
                    onNavigateSignup();
                  } else {
                    onNavigateLogin();
                  }
                }}
                className="w-full py-2.5 rounded-xl bg-[#10B981] hover:bg-[#059669] text-white font-semibold text-center flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-[#10B981]/20"
              >
                <span>{isAuthenticated ? 'Open Ledger' : 'Start Tracking'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
