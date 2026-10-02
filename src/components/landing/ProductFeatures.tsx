import React from 'react';
import {
  Wallet,
  BarChart2,
  FileDown,
  Cloud,
  CheckCircle,
  Check
} from 'lucide-react';

export const ProductFeatures: React.FC = () => {
  return (
    <section id="features" className="py-16 sm:py-24 border-b border-[#E5E7EB] dark:border-[#1E293B] bg-white dark:bg-[#0B0F19] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-2xl mb-14">
          <div className="inline-flex items-center gap-2 font-mono text-[11px] font-bold text-[#10B981] uppercase tracking-wider mb-2">
            <span>[03 / The Tooling]</span>
          </div>
          <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-[#111827] dark:text-white tracking-tight">
            Built from the actual product, not marketing promises.
          </h2>
          <p className="font-sans text-sm sm:text-base text-[#6B7280] dark:text-[#94A3B8] mt-3 leading-relaxed">
            Every feature shown here runs directly in AutoPay's existing codebase.
          </p>
        </div>

        {/* Feature 01 & 02: Budget Meter & Route Analytics (Side-by-side) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-12">
          
          {/* Piece 1: Real Budget Progress Meter */}
          <div className="lg:col-span-6 bg-[#FAFAFA] dark:bg-[#121826] border border-[#E5E7EB] dark:border-[#1E293B] p-6 sm:p-7 rounded-2xl space-y-5 shadow-sm relative">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5E7EB] dark:border-[#1E293B]">
              <div className="flex items-center gap-2">
                <Wallet className="w-4 h-4 text-[#10B981]" />
                <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#111827] dark:text-white">
                  Monthly Budget Allocation
                </span>
              </div>
              <span className="font-mono text-[10px] text-[#10B981] font-semibold bg-[#10B981]/10 px-2.5 py-0.5 rounded-full border border-[#10B981]/20">
                Live Tracker
              </span>
            </div>

            {/* Spent Card */}
            <div className="bg-white dark:bg-[#0B0F19] border border-[#E5E7EB] dark:border-[#1E293B] p-5 rounded-xl space-y-3 font-mono">
              <div className="flex justify-between items-baseline">
                <span className="text-xs text-[#6B7280] dark:text-[#94A3B8] uppercase font-bold">This Month Spent</span>
                <span className="text-[11px] text-[#10B981] font-semibold bg-[#10B981]/10 px-2 py-0.5 rounded-md">
                  71% of ₹2,000 Budget
                </span>
              </div>
              <div className="flex items-baseline gap-1 text-[#111827] dark:text-white">
                <span className="text-lg font-bold text-[#6B7280] dark:text-[#94A3B8]">₹</span>
                <span className="text-3xl font-extrabold font-tabular tracking-tight">1,420</span>
                <span className="text-xs text-[#6B7280] dark:text-[#94A3B8] ml-2">/ ₹2,000 limit</span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-[#E5E7EB] dark:bg-[#1E293B] h-3 rounded-full overflow-hidden">
                <div className="bg-[#10B981] h-full rounded-full transition-all" style={{ width: '71%' }}></div>
              </div>

              <div className="flex justify-between text-[11px] text-[#6B7280] dark:text-[#94A3B8] pt-1">
                <span>Remaining: <strong className="text-[#10B981] font-tabular">₹580.00</strong></span>
                <span>Days Left in Month: <strong className="text-[#111827] dark:text-white">11</strong></span>
              </div>
            </div>

            <p className="font-sans text-xs text-[#6B7280] dark:text-[#94A3B8] leading-relaxed">
              Set your target monthly limit once in settings. Every quick log instantly updates your utilization so you never run out of commute money before your monthly budget renews.
            </p>
          </div>

          {/* Piece 2: Real Route Analytics Chart */}
          <div className="lg:col-span-6 bg-[#FAFAFA] dark:bg-[#121826] border border-[#E5E7EB] dark:border-[#1E293B] p-6 sm:p-7 rounded-2xl space-y-5 shadow-sm relative">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5E7EB] dark:border-[#1E293B]">
              <div className="flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-[#10B981]" />
                <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#111827] dark:text-white">
                  Route Breakdown &amp; Frequency
                </span>
              </div>
              <span className="font-mono text-[10px] text-[#6B7280] dark:text-[#94A3B8]">Analytics Tab</span>
            </div>

            {/* Route Distribution Table Mockup */}
            <div className="bg-white dark:bg-[#0B0F19] border border-[#E5E7EB] dark:border-[#1E293B] p-5 rounded-xl space-y-3 font-mono text-xs font-tabular">
              <div className="text-[10px] text-[#6B7280] dark:text-[#94A3B8] uppercase font-bold flex justify-between">
                <span>Route Corridor</span>
                <span>Trips / Total Spent</span>
              </div>

              <div className="space-y-2.5">
                <div>
                  <div className="flex justify-between text-xs py-0.5">
                    <span className="font-semibold text-[#111827] dark:text-white">Home to College</span>
                    <span className="font-bold text-[#10B981]">18 trips • ₹450</span>
                  </div>
                  <div className="w-full bg-[#E5E7EB] dark:bg-[#1E293B] h-2 rounded-full overflow-hidden">
                    <div className="bg-[#10B981] h-full rounded-full" style={{ width: '54%' }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs py-0.5">
                    <span className="font-semibold text-[#111827] dark:text-white">College to Home</span>
                    <span className="font-bold text-[#10B981]">14 trips • ₹350</span>
                  </div>
                  <div className="w-full bg-[#E5E7EB] dark:bg-[#1E293B] h-2 rounded-full overflow-hidden">
                    <div className="bg-emerald-400 h-full rounded-full" style={{ width: '42%' }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs py-0.5">
                    <span className="font-semibold text-[#111827] dark:text-white">Station Connector</span>
                    <span className="font-bold text-[#10B981]">4 trips • ₹120</span>
                  </div>
                  <div className="w-full bg-[#E5E7EB] dark:bg-[#1E293B] h-2 rounded-full overflow-hidden">
                    <div className="bg-cyan-500 h-full rounded-full" style={{ width: '14%' }}></div>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-[#E5E7EB] dark:border-[#1E293B] flex justify-between text-[11px] text-[#6B7280] dark:text-[#94A3B8]">
                <span>Highest Spending Day: <strong>Tuesday (₹160)</strong></span>
                <span>Total Rides: <strong>36</strong></span>
              </div>
            </div>

            {/* Observation Callout */}
            <div className="p-3 bg-[#10B981]/5 border-l-2 border-[#10B981] rounded-r-lg font-mono text-[11px] text-[#6B7280] dark:text-[#94A3B8] leading-normal">
              <strong className="text-[#10B981]">Corridor observation:</strong> Daily rides along the "Home to College" route make up over 50% of your total commute expenses.
            </div>
          </div>

        </div>

        {/* Feature 03 & 04: PDF Statement + Cloud/Local Sync */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Piece 3: Authentic PDF Export Statement */}
          <div className="lg:col-span-7 bg-[#FAFAFA] dark:bg-[#121826] border border-[#E5E7EB] dark:border-[#1E293B] p-6 sm:p-7 rounded-2xl shadow-sm space-y-4 font-mono">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5E7EB] dark:border-[#1E293B]">
              <div>
                <span className="text-xs uppercase font-extrabold text-[#111827] dark:text-white tracking-wider block">
                  Automated PDF Statement
                </span>
                <span className="text-[10px] text-[#6B7280] dark:text-[#94A3B8]">Generated via jsPDF &amp; AutoTable</span>
              </div>
              <div className="flex items-center gap-1.5 bg-[#10B981] text-white px-3 py-1 rounded-xl text-[10px] font-bold shadow-sm">
                <FileDown className="w-3.5 h-3.5" />
                <span>1-Click Download</span>
              </div>
            </div>

            {/* Faithful PDF Layout Mockup */}
            <div className="p-4 bg-white dark:bg-[#0B0F19] border border-[#E5E7EB] dark:border-[#1E293B] rounded-xl space-y-3 text-xs font-tabular">
              <div className="text-center pb-2 border-b border-[#E5E7EB] dark:border-[#1E293B] space-y-0.5">
                <div className="font-display font-bold text-sm text-[#111827] dark:text-white">AutoPay Commuter Statement</div>
                <div className="text-[10px] text-[#6B7280] dark:text-[#94A3B8]">Monthly Audit Report • Month of October 2026</div>
              </div>

              {/* Sample Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-[11px]">
                  <thead>
                    <tr className="border-b border-[#E5E7EB] dark:border-[#1E293B] text-[#111827] dark:text-white font-bold">
                      <th className="py-1">Date</th>
                      <th className="py-1">Route &amp; Detail</th>
                      <th className="py-1 text-right">Fare (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-dotted divide-[#E5E7EB] dark:divide-[#1E293B] text-[#6B7280] dark:text-[#94A3B8]">
                    <tr>
                      <td className="py-1">02 Oct 2026</td>
                      <td className="py-1 text-[#111827] dark:text-white">College to Home</td>
                      <td className="py-1 text-right font-bold text-[#10B981]">₹25.00</td>
                    </tr>
                    <tr>
                      <td className="py-1">01 Oct 2026</td>
                      <td className="py-1 text-[#111827] dark:text-white">Home to College</td>
                      <td className="py-1 text-right font-bold text-[#10B981]">₹25.00</td>
                    </tr>
                    <tr>
                      <td className="py-1">30 Sep 2026</td>
                      <td className="py-1 text-[#111827] dark:text-white">Station Connector Shared</td>
                      <td className="py-1 text-right font-bold text-[#10B981]">₹40.00</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="pt-2 border-t border-[#E5E7EB] dark:border-[#1E293B] flex justify-between font-bold text-[#111827] dark:text-white">
                <span>STATEMENT TOTAL RECONCILED</span>
                <span className="text-[#10B981]">₹1,420.00</span>
              </div>
            </div>

            <p className="font-sans text-xs text-[#6B7280] dark:text-[#94A3B8] leading-relaxed">
              Export an official formatted PDF statement anytime from the Logs &amp; History view. Perfect for submitting expense reimbursements to parents, colleges, or employers.
            </p>
          </div>

          {/* Piece 4: Offline Resilience & Cloud Sync Architecture */}
          <div className="lg:col-span-5 bg-[#FAFAFA] dark:bg-[#121826] border border-[#E5E7EB] dark:border-[#1E293B] p-6 sm:p-7 rounded-2xl space-y-5 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5E7EB] dark:border-[#1E293B]">
              <div className="flex items-center gap-2">
                <Cloud className="w-4 h-4 text-[#10B981]" />
                <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#111827] dark:text-white">
                  Cloud Sync &amp; Offline Mode
                </span>
              </div>
              <span className="font-mono text-[10px] text-[#10B981] font-bold bg-[#10B981]/10 px-2 py-0.5 rounded-full border border-[#10B981]/20">Dual Storage</span>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div className="p-3.5 bg-white dark:bg-[#0B0F19] border border-[#E5E7EB] dark:border-[#1E293B] rounded-xl space-y-1">
                <span className="font-bold text-[#111827] dark:text-white flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-[#10B981]" />
                  Firebase Firestore Cloud Sync
                </span>
                <p className="font-sans text-xs text-[#6B7280] dark:text-[#94A3B8]">
                  Logs synchronize to your encrypted cloud partition so you can log on your phone and inspect analytics on your laptop.
                </p>
              </div>

              <div className="p-3.5 bg-white dark:bg-[#0B0F19] border border-[#E5E7EB] dark:border-[#1E293B] rounded-xl space-y-1">
                <span className="font-bold text-[#111827] dark:text-white flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-[#10B981]" />
                  Local-First Fail-safe (localStorage)
                </span>
                <p className="font-sans text-xs text-[#6B7280] dark:text-[#94A3B8]">
                  If the network cuts out at the metro basement or auto stand, writes succeed locally without spinning loaders or errors.
                </p>
              </div>

              <div className="p-3.5 bg-white dark:bg-[#0B0F19] border border-[#E5E7EB] dark:border-[#1E293B] rounded-xl space-y-1">
                <span className="font-bold text-[#111827] dark:text-white flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-[#10B981]" />
                  Google OAuth &amp; Email Auth
                </span>
                <p className="font-sans text-xs text-[#6B7280] dark:text-[#94A3B8]">
                  One-tap sign-in with your Google account or college email. Guest sessions supported with unique student keys.
                </p>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
