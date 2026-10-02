import React from 'react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

export const TheLeak: React.FC = () => {
  return (
    <section id="the-leak" className="py-16 sm:py-24 border-b border-[#E5E7EB] dark:border-[#1E293B] bg-[#F8FAFC] dark:bg-[#0E131F] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 font-mono text-[11px] font-bold text-[#10B981] uppercase tracking-wider mb-2">
            <span>[01 / The Friction Trap]</span>
          </div>
          <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-[#111827] dark:text-white tracking-tight">
            Why you have never managed to track your daily expenses.
          </h2>
          <p className="font-sans text-sm sm:text-base text-[#6B7280] dark:text-[#94A3B8] mt-3 leading-relaxed">
            The problem isn't discipline. The problem is friction at the exact second money leaves your pocket.
          </p>
        </div>

        {/* Asymmetrical Comparison Cards */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 items-stretch">
          
          {/* Method 01: The Bank App */}
          <div className="bg-white dark:bg-[#121826] border border-[#E5E7EB] dark:border-[#1E293B] p-6 rounded-2xl relative flex flex-col justify-between shadow-sm">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-dashed border-[#E5E7EB] dark:border-[#1E293B]">
                <span className="font-mono text-[11px] uppercase font-bold text-[#6B7280] dark:text-[#94A3B8]">Method 01</span>
                <span className="text-[10px] font-mono text-rose-500 font-semibold bg-rose-500/10 px-2 py-0.5 rounded-full">
                  Passive
                </span>
              </div>
              <h3 className="font-display text-xl font-bold text-[#111827] dark:text-white">Your Bank App</h3>
              <p className="font-sans text-xs text-[#6B7280] dark:text-[#94A3B8] leading-relaxed">
                Shows your final balance, but not your habits. You open it on day 25 and see <span className="font-mono font-semibold text-[#111827] dark:text-white">₹1,840</span> left. It has no way of telling you that 38 separate UPI payments of ₹35 to ₹120 emptied the account.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-[#E5E7EB] dark:border-[#1E293B] font-mono text-[11px] text-rose-500 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>Result: Anxiety at month end with zero actionable insight.</span>
            </div>
          </div>

          {/* Method 02: The Spreadsheet */}
          <div className="bg-white dark:bg-[#121826] border border-[#E5E7EB] dark:border-[#1E293B] p-6 rounded-2xl relative flex flex-col justify-between shadow-sm">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-dashed border-[#E5E7EB] dark:border-[#1E293B]">
                <span className="font-mono text-[11px] uppercase font-bold text-[#6B7280] dark:text-[#94A3B8]">Method 02</span>
                <span className="text-[10px] font-mono text-amber-500 font-semibold bg-amber-500/10 px-2 py-0.5 rounded-full">
                  Over-engineered
                </span>
              </div>
              <h3 className="font-display text-xl font-bold text-[#111827] dark:text-white">The Spreadsheet</h3>
              <p className="font-sans text-xs text-[#6B7280] dark:text-[#94A3B8] leading-relaxed">
                You download a complex 12-tab template in January. It has 8 dropdowns, category tags, tax formulas, and needs a laptop or mobile zooming. By February 4, you forgot four days of auto fares and abandon it completely.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-[#E5E7EB] dark:border-[#1E293B] font-mono text-[11px] text-amber-500 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>Result: 90% abandonment rate before week three.</span>
            </div>
          </div>

          {/* Method 03: The AutoPay Solution */}
          <div className="bg-white dark:bg-[#121826] border-2 border-[#10B981] p-6 rounded-2xl relative flex flex-col justify-between shadow-xl shadow-[#10B981]/5 transform md:-translate-y-2">
            {/* Pill Badge */}
            <div className="absolute -top-3 right-5 bg-[#10B981] text-white font-mono text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full shadow-sm tracking-wider">
              2-Second Habit
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#E5E7EB] dark:border-[#1E293B]">
                <span className="font-mono text-[11px] uppercase font-bold text-[#10B981]">AutoPay Rule</span>
                <span className="text-[10px] font-mono text-[#10B981] font-semibold bg-[#10B981]/10 px-2.5 py-0.5 rounded-full border border-[#10B981]/20">
                  Instant
                </span>
              </div>
              <h3 className="font-display text-xl font-bold text-[#111827] dark:text-white">Tactile Commute Ledger</h3>
              <p className="font-sans text-xs text-[#6B7280] dark:text-[#94A3B8] leading-relaxed">
                One tap from your phone screen. Type <span className="font-mono font-bold text-[#10B981]">25</span>, tap <span className="font-mono font-medium underline text-[#111827] dark:text-white">College → Home</span>, hit Enter. Your monthly budget bar updates immediately. Done before the auto driver pulls away.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-[#E5E7EB] dark:border-[#1E293B] font-mono text-[11px] text-[#10B981] flex items-start gap-2 font-semibold">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <span>Result: 30 days of seamless, complete logs.</span>
            </div>
          </div>

        </div>

        {/* The Math of Daily Commutes */}
        <div className="mt-12 p-6 sm:p-8 bg-white dark:bg-[#121826] border border-[#E5E7EB] dark:border-[#1E293B] rounded-2xl shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-left font-mono">
            <div className="border-b md:border-b-0 md:border-r border-[#E5E7EB] dark:border-[#1E293B] pb-4 md:pb-0 md:pr-4">
              <span className="text-[10px] text-[#6B7280] dark:text-[#94A3B8] uppercase tracking-wider block">Daily Metro &amp; Auto</span>
              <span className="text-xl sm:text-2xl font-bold text-[#111827] dark:text-white font-tabular mt-1 block">₹60 + ₹40</span>
              <span className="text-[11px] text-[#6B7280] dark:text-[#94A3B8] mt-1 block">₹100 round trip</span>
            </div>
            <div className="border-b md:border-b-0 md:border-r border-[#E5E7EB] dark:border-[#1E293B] pb-4 md:pb-0 md:pr-4">
              <span className="text-[10px] text-[#6B7280] dark:text-[#94A3B8] uppercase tracking-wider block">Chai &amp; Evening Snacks</span>
              <span className="text-xl sm:text-2xl font-bold text-[#111827] dark:text-white font-tabular mt-1 block">₹45 / day</span>
              <span className="text-[11px] text-[#6B7280] dark:text-[#94A3B8] mt-1 block">Never feels like a budget spend</span>
            </div>
            <div className="border-b md:border-b-0 md:border-r border-[#E5E7EB] dark:border-[#1E293B] pb-4 md:pb-0 md:pr-4">
              <span className="text-[10px] text-[#6B7280] dark:text-[#94A3B8] uppercase tracking-wider block">Monthly Total Leaked</span>
              <span className="text-xl sm:text-2xl font-bold text-[#10B981] font-tabular mt-1 block">₹4,350</span>
              <span className="text-[11px] text-[#10B981] mt-1 block">Unrecorded without AutoPay</span>
            </div>
            <div className="flex flex-col justify-center font-sans text-xs text-[#6B7280] dark:text-[#94A3B8] italic">
              “When you log in two seconds, you never have to guess where ₹4,000 disappeared at the end of the month.”
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
