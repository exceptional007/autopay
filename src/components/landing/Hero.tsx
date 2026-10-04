import React from 'react';
import { ArrowRight, ChevronDown, CheckCircle2 } from 'lucide-react';
import { ThermalReceipt } from './ThermalReceipt';

interface HeroProps {
  onStartTracking: () => void;
  isAuthenticated: boolean;
}

export const Hero: React.FC<HeroProps> = ({ onStartTracking, isAuthenticated }) => {
  const scrollToExplanation = (e: React.MouseEvent) => {
    e.preventDefault();
    const el = document.getElementById('the-leak');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative pt-8 pb-16 sm:pt-16 sm:pb-24 overflow-hidden border-b border-[#E5E7EB] dark:border-[#1E293B] transition-colors">
      {/* Subtle ruled background grid */}
      <div className="absolute inset-0 ledger-paper-grid opacity-70 pointer-events-none"></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          
          {/* Left Column: Problem-first Hero Copy (Centered on mobile, left on desktop) */}
          <div className="lg:col-span-7 flex flex-col items-center text-center lg:items-start lg:text-left space-y-6">
            
            {/* Tag Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#10B981]/10 border border-[#10B981]/30 text-[#10B981] font-mono text-[11px] font-bold tracking-wider uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse"></span>
              The Daily Cash Drain
            </div>

            {/* Display Headline in Space Grotesk */}
            <h1 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-[46px] font-bold text-[#111827] dark:text-white leading-[1.12] tracking-tight">
              Your month doesn’t vanish on big purchases.
              <span className="block mt-2 font-semibold text-[#10B981]">
                It leaks in ₹40 chai and ₹120 auto rides.
              </span>
            </h1>

            {/* Crisp Body Copy */}
            <p className="font-sans text-base sm:text-lg text-[#6B7280] dark:text-[#94A3B8] leading-relaxed max-w-xl mx-auto lg:mx-0">
              Small daily spends leak quietly. Spreadsheets fail on the street. AutoPay turns expense logging into a two-second habit right from your phone's home screen.
            </p>

            {/* Call To Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={onStartTracking}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-[#10B981] hover:bg-[#059669] text-white font-mono text-sm font-semibold tracking-wide shadow-lg shadow-[#10B981]/25 transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#10B981]"
              >
                <span>{isAuthenticated ? 'Open Your Ledger' : 'Start Tracking — Free'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={scrollToExplanation}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-3.5 rounded-xl border border-[#E5E7EB] dark:border-[#1E293B] bg-white dark:bg-[#121826] hover:bg-slate-50 dark:hover:bg-[#1E293B] text-[#111827] dark:text-white font-mono text-xs font-semibold tracking-wide transition-colors cursor-pointer"
              >
                <span>See How It Works</span>
                <ChevronDown className="w-3.5 h-3.5 text-[#6B7280] dark:text-[#94A3B8]" />
              </button>
            </div>

            {/* Trust Micro-Details */}
            <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-y-2 gap-x-5 text-[11px] font-mono text-[#6B7280] dark:text-[#94A3B8]">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981]" /> 2-Second Logging
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981]" /> Installs as PWA
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981]" /> Offline Fail-safe Cache
              </span>
            </div>

          </div>

          {/* Right Column: Physical Thermal Receipt Component */}
          <div className="lg:col-span-5 flex justify-center w-full">
            <ThermalReceipt />
          </div>

        </div>
      </div>
    </section>
  );
};
