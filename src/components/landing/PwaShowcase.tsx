import React, { useState } from 'react';
import {
  Download,
  Share,
  PlusSquare,
  Smartphone,
  Check,
  Zap,
  ArrowRight,
  Navigation
} from 'lucide-react';
import { usePwaInstall } from '../../usePwaInstall';

interface PwaShowcaseProps {
  onOpenApp: () => void;
}

export const PwaShowcase: React.FC<PwaShowcaseProps> = ({ onOpenApp }) => {
  const { canInstall, isStandalone, isIos, isInstalled, triggerInstall } = usePwaInstall();
  const [phoneScreenState, setPhoneScreenState] = useState<'home' | 'app'>('app');
  const [installFeedback, setInstallFeedback] = useState<string | null>(null);

  const handleInstallClick = async () => {
    const outcome = await triggerInstall();
    if (outcome === 'accepted') {
      setInstallFeedback('AutoPay installed to your home screen!');
    } else if (outcome === 'dismissed') {
      setInstallFeedback('Installation dismissed. You can install anytime.');
    }
  };

  return (
    <section id="pwa-centerpiece" className="py-16 sm:py-24 border-b border-[#E5E7EB] dark:border-[#1E293B] bg-[#F8FAFC] dark:bg-[#0E131F] transition-colors relative overflow-hidden">
      {/* Background grid */}
      <div className="absolute inset-0 ledger-paper-grid opacity-50 pointer-events-none"></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-[#111827] dark:text-white tracking-tight">
            Lives right on your home screen.
            <span className="block mt-1 font-semibold text-[#10B981]">
              No app store. No 80MB download.
            </span>
          </h2>
          <p className="font-sans text-sm sm:text-base text-[#6B7280] dark:text-[#94A3B8] mt-4 leading-relaxed max-w-2xl mx-auto">
            AutoPay is engineered as a Progressive Web App. It installs directly from your browser to your phone's home screen, opens full-screen in standalone mode, and launches in less than a second.
          </p>
        </div>

        {/* Center Grid: Interactive Phone Mockup + Install Callouts */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">

          {/* Left Column: Interactive CSS/SVG Phone Mockup */}
          <div className="lg:col-span-6 flex flex-col items-center">

            {/* Phone Screen Mode Switcher */}
            <div className="flex items-center gap-2 bg-[#E2E8F0] dark:bg-[#1E293B] p-1 rounded-xl border border-[#CBD5E1] dark:border-[#334155] mb-5 font-mono text-xs">
              <button
                type="button"
                onClick={() => setPhoneScreenState('home')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${phoneScreenState === 'home'
                  ? 'bg-[#10B981] text-white font-bold shadow-sm'
                  : 'text-[#6B7280] dark:text-[#94A3B8] hover:text-[#111827] dark:hover:text-white'
                  }`}
              >
                1. Home Screen Tap
              </button>
              <button
                type="button"
                onClick={() => setPhoneScreenState('app')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${phoneScreenState === 'app'
                  ? 'bg-[#10B981] text-white font-bold shadow-sm'
                  : 'text-[#6B7280] dark:text-[#94A3B8] hover:text-[#111827] dark:hover:text-white'
                  }`}
              >
                2. Instant Quick-Add
              </button>
            </div>

            {/* Custom CSS/SVG Built Phone (No stock images!) */}
            <div className="relative w-[280px] sm:w-[310px] h-[580px] sm:h-[620px] bg-[#0F172A] rounded-[44px] p-3 shadow-2xl border-4 border-slate-700/80 select-none">

              {/* Phone Speaker Pill / Dynamic Island */}
              <div className="absolute top-5 left-1/2 -translate-x-1/2 w-24 h-4 bg-black rounded-full z-30 flex items-center justify-end px-2">
                <div className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-slate-700"></div>
              </div>

              {/* Phone Inner Display */}
              <div className="w-full h-full bg-[#FAFAFA] dark:bg-[#0B0F19] rounded-[34px] overflow-hidden flex flex-col relative border border-[#E2E8F0] dark:border-[#1E293B]">

                {/* Phone Status Bar */}
                <div className="h-9 px-6 pt-2 flex items-center justify-between text-[11px] font-mono font-bold text-[#111827] dark:text-white z-20">
                  <span>9:41</span>
                  <div className="flex items-center gap-1.5 text-[10px]">
                    <span>5G</span>
                    <div className="w-4 h-2 border border-current rounded-xs p-[1px]">
                      <div className="bg-current h-full w-3/4"></div>
                    </div>
                  </div>
                </div>

                {/* State 1: Home Screen Grid with AutoPay Emerald Icon */}
                {phoneScreenState === 'home' && (
                  <div className="flex-1 p-4 flex flex-col justify-between animate-fadeIn bg-gradient-to-b from-slate-100 to-slate-200 dark:from-slate-900 dark:to-slate-950">

                    {/* Top App Grid */}
                    <div className="grid grid-cols-4 gap-4 pt-6 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <div className="w-12 h-12 rounded-xl bg-slate-700 flex items-center justify-center text-white text-xs font-mono shadow-xs">
                          Photos
                        </div>
                        <span className="text-[10px] font-mono text-[#64748B]">Photos</span>
                      </div>
                      <div className="flex flex-col items-center gap-1">
                        <div className="w-12 h-12 rounded-xl bg-slate-600 flex items-center justify-center text-white text-xs font-mono shadow-xs">
                          Mail
                        </div>
                        <span className="text-[10px] font-mono text-[#64748B]">Mail</span>
                      </div>
                      <div className="flex flex-col items-center gap-1">
                        <div className="w-12 h-12 rounded-xl bg-slate-500 flex items-center justify-center text-white text-xs font-mono shadow-xs">
                          Notes
                        </div>
                        <span className="text-[10px] font-mono text-[#64748B]">Notes</span>
                      </div>
                      <div className="flex flex-col items-center gap-1">
                        <div className="w-12 h-12 rounded-xl bg-slate-400 flex items-center justify-center text-white text-xs font-mono shadow-xs">
                          Maps
                        </div>
                        <span className="text-[10px] font-mono text-[#64748B]">Maps</span>
                      </div>

                      {/* Row 2: The AutoPay Icon with Emerald Navigation Mark */}
                      <div className="flex flex-col items-center gap-1 relative col-span-1">
                        <button
                          type="button"
                          onClick={() => setPhoneScreenState('app')}
                          className="w-12 h-12 rounded-xl bg-[#10B981] text-white flex items-center justify-center shadow-lg shadow-[#10B981]/30 cursor-pointer transform hover:scale-105 active:scale-95 transition-transform"
                          title="Tap AutoPay icon"
                        >
                          <Navigation className="w-6 h-6 text-white transform rotate-45" />
                        </button>
                        <span className="text-[10px] font-mono font-bold text-[#111827] dark:text-white">AutoPay</span>

                        {/* Tap Pulse */}
                        <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-[#10B981] rounded-full border-2 border-white animate-ping pointer-events-none"></div>
                      </div>

                      <div className="flex flex-col items-center gap-1">
                        <div className="w-12 h-12 rounded-xl bg-slate-300 dark:bg-slate-800 flex items-center justify-center text-[#64748B] text-xs font-mono shadow-xs">
                          Clock
                        </div>
                        <span className="text-[10px] font-mono text-[#64748B]">Clock</span>
                      </div>
                    </div>

                    {/* App Shortcuts Preview Bubble */}
                    <div className="bg-white dark:bg-[#121826] text-[#111827] dark:text-white p-3 rounded-xl shadow-xl font-mono text-xs border border-[#E5E7EB] dark:border-[#1E293B] mb-8 space-y-2">
                      <div className="text-[9px] uppercase font-bold text-[#6B7280] dark:text-[#94A3B8] tracking-wider pb-1 border-b border-[#E5E7EB] dark:border-[#1E293B] flex items-center justify-between">
                        <span>PWA Shortcuts Menu</span>
                        <Zap className="w-3 h-3 text-[#10B981]" />
                      </div>
                      <button
                        type="button"
                        onClick={() => setPhoneScreenState('app')}
                        className="w-full text-left py-1 px-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-[#1E293B] text-xs font-semibold flex items-center justify-between text-[#111827] dark:text-white cursor-pointer"
                      >
                        <span>+ Add Expense (₹25)</span>
                        <ArrowRight className="w-3 h-3 text-[#10B981]" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setPhoneScreenState('app')}
                        className="w-full text-left py-1 px-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-[#1E293B] text-xs text-[#6B7280] dark:text-[#94A3B8] flex items-center justify-between cursor-pointer"
                      >
                        <span>View Monthly Ledger</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Bottom Phone Dock */}
                    <div className="bg-white/70 dark:bg-black/40 backdrop-blur-md rounded-2xl p-2.5 flex justify-around items-center border border-white/20">
                      <div className="w-10 h-10 rounded-xl bg-slate-700"></div>
                      <div className="w-10 h-10 rounded-xl bg-slate-600"></div>
                      <div className="w-10 h-10 rounded-xl bg-slate-500"></div>
                      <div className="w-10 h-10 rounded-xl bg-[#10B981] flex items-center justify-center text-white shadow-xs">
                        <Navigation className="w-5 h-5 transform rotate-45" />
                      </div>
                    </div>

                  </div>
                )}

                {/* State 2: Inside AutoPay App - Real Quick Add Screen */}
                {phoneScreenState === 'app' && (
                  <div className="flex-1 p-4 flex flex-col justify-between animate-fadeIn bg-[#FAFAFA] dark:bg-[#0B0F19]">

                    {/* App Header */}
                    <div className="pb-3 border-b border-[#E5E7EB] dark:border-[#1E293B] flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <div className="w-6 h-6 rounded-lg bg-[#10B981] text-white flex items-center justify-center">
                          <Navigation className="w-3.5 h-3.5 transform rotate-45" />
                        </div>
                        <span className="font-display font-bold text-sm text-[#111827] dark:text-white">AutoPay</span>
                      </div>
                      <span className="font-mono text-[9px] bg-[#10B981]/10 text-[#10B981] px-1.5 py-0.5 rounded font-bold border border-[#10B981]/20">
                        STUDENT
                      </span>
                    </div>

                    {/* Realistic Quick-Add Card matching App.tsx modal */}
                    <div className="bg-white dark:bg-[#121826] border border-[#E5E7EB] dark:border-[#1E293B] p-3.5 rounded-2xl shadow-sm space-y-3 font-mono">
                      <div className="flex items-center justify-between text-[10px] text-[#6B7280] dark:text-[#94A3B8] uppercase font-bold">
                        <span>New Commute Log</span>
                        <span className="text-[#10B981]">2-Sec Mode</span>
                      </div>

                      {/* Route Preset Chips */}
                      <div>
                        <label className="text-[9px] uppercase tracking-wider text-[#6B7280] dark:text-[#94A3B8] block mb-1">Route</label>
                        <div className="flex flex-wrap gap-1 text-[10px]">
                          <span className="bg-[#10B981] text-white px-2 py-0.5 rounded-lg font-bold">
                            College → Home
                          </span>
                          <span className="bg-slate-100 dark:bg-[#1E293B] text-[#6B7280] dark:text-[#94A3B8] px-2 py-0.5 rounded-lg">
                            Metro Return
                          </span>
                        </div>
                      </div>

                      {/* Amount Input */}
                      <div>
                        <label className="text-[9px] uppercase tracking-wider text-[#6B7280] dark:text-[#94A3B8] block mb-1">Fare (₹)</label>
                        <div className="flex items-center border border-[#10B981] bg-[#FAFAFA] dark:bg-[#0B0F19] rounded-xl px-2.5 py-1.5 font-bold text-sm text-[#111827] dark:text-white">
                          <span className="text-[#10B981] mr-1 font-mono">₹</span>
                          <span className="font-tabular">25.00</span>
                        </div>
                      </div>

                      {/* Save Button */}
                      <button
                        type="button"
                        className="w-full bg-[#10B981] text-white py-2 rounded-xl text-xs font-bold tracking-wider uppercase flex items-center justify-center gap-1.5 shadow-md shadow-[#10B981]/20 cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Log Commute Ride</span>
                      </button>
                    </div>

                    {/* Monthly Mini Ledger Summary */}
                    <div className="bg-white dark:bg-[#121826] border border-[#E5E7EB] dark:border-[#1E293B] p-2.5 rounded-xl font-mono text-[10px] space-y-1">
                      <div className="flex justify-between text-[#6B7280] dark:text-[#94A3B8]">
                        <span>Month Budget: ₹2,000</span>
                        <span className="text-[#111827] dark:text-white font-bold font-tabular">Spent: ₹720</span>
                      </div>
                      <div className="w-full bg-[#E5E7EB] dark:bg-[#1E293B] h-1.5 rounded-full overflow-hidden">
                        <div className="bg-[#10B981] h-full" style={{ width: '36%' }}></div>
                      </div>
                      <div className="text-[9px] text-[#10B981] text-right font-semibold">
                        ₹1,280 remaining
                      </div>
                    </div>

                    {/* Bottom Home Indicator */}
                    <div className="py-1 flex justify-center">
                      <div className="w-24 h-1 bg-slate-400 dark:bg-slate-600 rounded-full"></div>
                    </div>

                  </div>
                )}

              </div>
            </div>

          </div>

          {/* Right Column: Platform-Specific Installation Engine */}
          <div className="lg:col-span-6 space-y-6">

            <div className="bg-white dark:bg-[#121826] border border-[#E5E7EB] dark:border-[#1E293B] p-6 sm:p-8 rounded-2xl shadow-sm space-y-5">

              <div className="flex items-center justify-between pb-3 border-b border-[#E5E7EB] dark:border-[#1E293B]">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs uppercase font-bold text-[#111827] dark:text-white">Device Compatibility</span>
                </div>
                <span className="font-mono text-[10px] font-bold bg-[#10B981]/10 text-[#10B981] px-2.5 py-0.5 rounded-full border border-[#10B981]/20">
                  PWA Ready
                </span>
              </div>

              {/* Status 1: Standalone / Already Installed */}
              {isStandalone || isInstalled ? (
                <div className="p-4 bg-[#10B981]/10 border border-[#10B981]/30 rounded-xl text-[#111827] dark:text-white space-y-2">
                  <div className="flex items-center gap-2 font-mono text-xs font-bold text-[#10B981]">
                    <Check className="w-4 h-4" />
                    <span>AutoPay is installed on this device</span>
                  </div>
                  <p className="font-sans text-xs text-[#6B7280] dark:text-[#94A3B8]">
                    You are running AutoPay as an installed Progressive Web App.
                  </p>
                  <button
                    type="button"
                    onClick={onOpenApp}
                    className="mt-2 inline-flex items-center gap-2 px-4 py-2 bg-[#10B981] hover:bg-[#059669] text-white font-mono text-xs font-bold rounded-xl cursor-pointer shadow-md shadow-[#10B981]/20 transition-all"
                  >
                    <span>Launch Expense Ledger</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : isIos ? (
                /* Status 2: iOS Safari Instructions */
                <div className="p-4 bg-slate-50 dark:bg-[#0B0F19] border border-[#E5E7EB] dark:border-[#1E293B] rounded-xl space-y-3">
                  <div className="flex items-center gap-2 font-mono text-xs font-bold text-[#111827] dark:text-white">
                    <Share className="w-4 h-4 text-[#10B981]" />
                    <span>Install on iPhone / iPad (Safari)</span>
                  </div>
                  <ol className="font-sans text-xs text-[#6B7280] dark:text-[#94A3B8] space-y-2 list-decimal list-inside leading-relaxed">
                    <li>
                      Tap the <strong>Share</strong> button <Share className="w-3.5 h-3.5 inline mx-1 text-[#10B981]" /> in the Safari bottom bar.
                    </li>
                    <li>
                      Scroll down and tap <strong>Add to Home Screen</strong> <PlusSquare className="w-3.5 h-3.5 inline mx-1 text-[#111827] dark:text-white" />.
                    </li>
                    <li>
                      Tap <strong>Add</strong> in the top right. AutoPay now sits beside your everyday apps.
                    </li>
                  </ol>
                </div>
              ) : (
                /* Status 3: Android / Chromium / Desktop Install */
                <div className="space-y-3">
                  <p className="font-sans text-xs text-[#6B7280] dark:text-[#94A3B8] leading-relaxed">
                    Install AutoPay right now in one tap. No Play Store account required, no storage bloat, instant offline shell.
                  </p>

                  <button
                    type="button"
                    onClick={handleInstallClick}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#10B981] hover:bg-[#059669] text-white font-mono text-xs sm:text-sm font-bold tracking-wide shadow-md shadow-[#10B981]/20 transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#10B981]"
                  >
                    <Download className="w-4 h-4" />
                    <span>Install AutoPay to Phone</span>
                  </button>

                  {installFeedback && (
                    <div className="text-[11px] font-mono text-[#10B981] font-semibold">
                      {installFeedback}
                    </div>
                  )}
                </div>
              )}

              {/* Manifest Shortcuts Feature Highlight */}
              <div className="pt-3 border-t border-[#E5E7EB] dark:border-[#1E293B] font-mono text-xs space-y-2">
                <span className="text-[10px] text-[#6B7280] dark:text-[#94A3B8] uppercase font-bold tracking-wider block">
                  Configured App Shortcuts
                </span>
                <p className="font-sans text-xs text-[#6B7280] dark:text-[#94A3B8] leading-relaxed">
                  Long-press the AutoPay home screen icon anytime to trigger direct shortcuts without navigating menus:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 font-mono text-[11px]">
                  <div className="p-2.5 bg-slate-50 dark:bg-[#0B0F19] border border-[#E5E7EB] dark:border-[#1E293B] rounded-xl flex items-center gap-2">
                    <span className="text-[#10B981] font-bold">1.</span>
                    <span className="font-semibold text-[#111827] dark:text-white">Quick Log Expense</span>
                  </div>
                  <div className="p-2.5 bg-slate-50 dark:bg-[#0B0F19] border border-[#E5E7EB] dark:border-[#1E293B] rounded-xl flex items-center gap-2">
                    <span className="text-[#10B981] font-bold">2.</span>
                    <span className="font-semibold text-[#111827] dark:text-white">View Monthly Ledger</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Why PWA Beats 80MB Native Apps */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs text-[#6B7280] dark:text-[#94A3B8]">
              <div className="p-3.5 bg-white dark:bg-[#121826] border border-[#E5E7EB] dark:border-[#1E293B] rounded-xl shadow-xs">
                <span className="font-bold text-[#111827] dark:text-white block mb-1">0 KB App Store</span>
                <span>Installs in 1 second without draining mobile data.</span>
              </div>
              <div className="p-3.5 bg-white dark:bg-[#121826] border border-[#E5E7EB] dark:border-[#1E293B] rounded-xl shadow-xs">
                <span className="font-bold text-[#111827] dark:text-white block mb-1">Zero Permissions</span>
                <span>No contacts, no SMS scrapers, no camera spying.</span>
              </div>
              <div className="p-3.5 bg-white dark:bg-[#121826] border border-[#E5E7EB] dark:border-[#1E293B] rounded-xl shadow-xs">
                <span className="font-bold text-[#111827] dark:text-white block mb-1">Offline Cache</span>
                <span>Service worker caches app shell for instant loads.</span>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
