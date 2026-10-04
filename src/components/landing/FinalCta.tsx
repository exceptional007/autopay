import React from 'react';
import { ArrowRight } from 'lucide-react';

interface FinalCtaProps {
  onStartTracking: () => void;
  isAuthenticated: boolean;
}

export const FinalCta: React.FC<FinalCtaProps> = ({ onStartTracking, isAuthenticated }) => {
  return (
    <section className="py-20 sm:py-28 bg-[#F8FAFC] dark:bg-[#0E131F] relative overflow-hidden transition-colors">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        
        {/* Receipt-Inspired Card Container */}
        <div className="bg-white dark:bg-[#121826] border border-[#E5E7EB] dark:border-[#1E293B] p-6 sm:p-12 rounded-3xl shadow-xl relative max-w-2xl mx-auto">
          
          {/* Stamped badge in corner */}
          <div className="absolute -top-3.5 right-6 sm:right-10 bg-[#10B981] text-white font-mono text-[10px] font-extrabold uppercase px-3.5 py-1 rounded-full shadow-sm tracking-wider">
            2-Second Habit
          </div>

          <div className="inline-flex items-center gap-1.5 font-mono text-xs uppercase font-bold text-[#6B7280] dark:text-[#94A3B8] mb-3">
            <span>Terminal Ready</span>
            <span>•</span>
            <span>Zero Setup Required</span>
          </div>

          <h2 className="font-display text-2xl sm:text-4xl font-bold text-[#111827] dark:text-white tracking-tight">
            Log today's first ₹30.
          </h2>

          <p className="font-sans text-sm sm:text-base text-[#6B7280] dark:text-[#94A3B8] mt-3 sm:mt-4 max-w-lg mx-auto leading-relaxed">
            The next time you step out of an auto or scan a QR code for chai, take two seconds. Never wonder where your money went at month end.
          </p>

          <div className="mt-7 sm:mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              type="button"
              onClick={onStartTracking}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 sm:py-4 rounded-xl bg-[#10B981] hover:bg-[#059669] text-white font-mono text-xs sm:text-sm font-bold tracking-wide shadow-lg shadow-[#10B981]/25 transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#10B981]"
            >
              <span>{isAuthenticated ? 'Open Commuter Ledger' : 'Start Tracking Now — It’s Free'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <p className="font-mono text-[11px] text-[#6B7280] dark:text-[#94A3B8] mt-3 sm:mt-4">
            Runs directly in your mobile browser • Add to home screen anytime
          </p>

          {/* Dotted border at bottom */}
          <div className="mt-6 sm:mt-8 pt-4 border-t-2 border-dashed border-[#E5E7EB] dark:border-[#1E293B] flex flex-col sm:flex-row items-center justify-between text-[9px] font-mono text-[#9CA3AF] dark:text-[#64748B] gap-1">
            <span>AUTOPAY COMMUTE LEDGER</span>
            <span>NO SURPRISES AT MONTH END</span>
          </div>

        </div>

      </div>
    </section>
  );
};
