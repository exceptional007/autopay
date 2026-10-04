import React from 'react';
import { Check, Search, FileText } from 'lucide-react';

export const HowItWorks: React.FC = () => {
  return (
    <section id="how-it-works" className="py-16 sm:py-24 border-b border-[#E5E7EB] dark:border-[#1E293B] bg-white dark:bg-[#0B0F19] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header (Centered on mobile, left on desktop) */}
        <div className="max-w-2xl mb-12 sm:mb-14 text-center md:text-left mx-auto md:mx-0">
          <div className="inline-flex items-center gap-2 font-mono text-[11px] font-bold text-[#10B981] uppercase tracking-wider mb-2">
            <span>[02 / Operational Simplicity]</span>
          </div>
          <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-[#111827] dark:text-white tracking-tight">
            Designed for the street, not an office desk.
          </h2>
          <p className="font-sans text-sm sm:text-base text-[#6B7280] dark:text-[#94A3B8] mt-3 leading-relaxed">
            Three steps that fit into the actual rhythm of your daily commute.
          </p>
        </div>

        {/* 3 Step Flow matching existing theme */}
        <div className="space-y-12 sm:space-y-16">
          
          {/* Step 01 */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 items-center border-t border-[#E5E7EB] dark:border-[#1E293B] pt-8">
            <div className="lg:col-span-3 text-center lg:text-left">
              <span className="font-mono text-3xl sm:text-4xl font-bold text-[#10B981] font-tabular">
                01/
              </span>
              <span className="block font-mono text-xs font-semibold uppercase tracking-wider text-[#6B7280] dark:text-[#94A3B8] mt-1">
                The Reflex
              </span>
            </div>
            <div className="lg:col-span-4 text-center lg:text-left">
              <h3 className="font-display text-xl sm:text-2xl font-bold text-[#111827] dark:text-white">
                Log in two seconds flat.
              </h3>
              <p className="font-sans text-xs sm:text-sm text-[#6B7280] dark:text-[#94A3B8] mt-2 leading-relaxed">
                Open from your home screen. Preset route chips and standard ₹25 fares auto-fill with one tap — recorded before you cross the street.
              </p>
            </div>
            <div className="lg:col-span-5 w-full max-w-md mx-auto lg:max-w-none bg-[#FAFAFA] dark:bg-[#121826] border border-[#E5E7EB] dark:border-[#1E293B] p-4 rounded-xl font-mono text-xs shadow-sm">
              <div className="text-[10px] text-[#6B7280] dark:text-[#94A3B8] uppercase tracking-wider pb-2 border-b border-[#E5E7EB] dark:border-[#1E293B] flex justify-between">
                <span>Quick Log Modal Preview</span>
                <span className="text-[#10B981] font-bold">● Instant</span>
              </div>
              <div className="pt-3 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#6B7280] dark:text-[#94A3B8]">Route:</span>
                  <span className="font-bold text-[#111827] dark:text-white bg-[#10B981]/10 text-[#10B981] px-2 py-0.5 rounded-lg border border-[#10B981]/20">
                    College → Home
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#6B7280] dark:text-[#94A3B8]">Amount (₹):</span>
                  <span className="font-bold text-[#10B981] text-sm font-tabular">₹ 25.00</span>
                </div>
                <div className="text-[10px] text-[#6B7280] dark:text-[#94A3B8] italic text-right pt-1">
                  Saved with single tap on "Log Commute Ride"
                </div>
              </div>
            </div>
          </div>

          {/* Step 02 */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 items-center border-t border-[#E5E7EB] dark:border-[#1E293B] pt-8">
            <div className="lg:col-span-3 text-center lg:text-left">
              <span className="font-mono text-3xl sm:text-4xl font-bold text-[#10B981] font-tabular">
                02/
              </span>
              <span className="block font-mono text-xs font-semibold uppercase tracking-wider text-[#6B7280] dark:text-[#94A3B8] mt-1">
                The Index
              </span>
            </div>
            <div className="lg:col-span-4 text-center lg:text-left">
              <h3 className="font-display text-xl sm:text-2xl font-bold text-[#111827] dark:text-white">
                Sorted by month, instantly searchable.
              </h3>
              <p className="font-sans text-xs sm:text-sm text-[#6B7280] dark:text-[#94A3B8] mt-2 leading-relaxed">
                Entries group into clean monthly accordions. Search any route to audit semester auto fares, or delete mistakes in one tap.
              </p>
            </div>
            <div className="lg:col-span-5 w-full max-w-md mx-auto lg:max-w-none bg-[#FAFAFA] dark:bg-[#121826] border border-[#E5E7EB] dark:border-[#1E293B] p-4 rounded-xl font-mono text-xs shadow-sm">
              <div className="text-[10px] text-[#6B7280] dark:text-[#94A3B8] uppercase tracking-wider pb-2 border-b border-[#E5E7EB] dark:border-[#1E293B] flex justify-between">
                <span>Monthly Query System</span>
                <span className="text-[#10B981] font-semibold">Active Filter</span>
              </div>
              <div className="pt-3 space-y-1.5 text-[11px] font-tabular">
                <div className="flex justify-between py-1 border-b border-dotted border-[#E5E7EB] dark:border-[#1E293B]">
                  <span className="text-[#6B7280] dark:text-[#94A3B8]">Yesterday • 05:45 PM</span>
                  <span className="font-semibold text-[#111827] dark:text-white">₹30.00</span>
                </div>
                <div className="flex justify-between py-1 border-b border-dotted border-[#E5E7EB] dark:border-[#1E293B]">
                  <span className="text-[#6B7280] dark:text-[#94A3B8]">01 Oct • 09:10 AM</span>
                  <span className="font-semibold text-[#111827] dark:text-white">₹25.00</span>
                </div>
                <div className="flex justify-between py-1 text-[#6B7280] dark:text-[#94A3B8]">
                  <span>Route Query: "College"</span>
                  <span className="text-[#10B981] font-bold">18 logs found</span>
                </div>
              </div>
            </div>
          </div>

          {/* Step 03 */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 items-center border-t border-[#E5E7EB] dark:border-[#1E293B] pt-8">
            <div className="lg:col-span-3 text-center lg:text-left">
              <span className="font-mono text-3xl sm:text-4xl font-bold text-[#10B981] font-tabular">
                03/
              </span>
              <span className="block font-mono text-xs font-semibold uppercase tracking-wider text-[#6B7280] dark:text-[#94A3B8] mt-1">
                The Audit
              </span>
            </div>
            <div className="lg:col-span-4 text-center lg:text-left">
              <h3 className="font-display text-xl sm:text-2xl font-bold text-[#111827] dark:text-white">
                Check your budget at a glance.
              </h3>
              <p className="font-sans text-xs sm:text-sm text-[#6B7280] dark:text-[#94A3B8] mt-2 leading-relaxed">
                A live progress bar tracks your monthly limit against daily commutes. Download official PDF statements anytime with a single tap.
              </p>
            </div>
            <div className="lg:col-span-5 w-full max-w-md mx-auto lg:max-w-none bg-[#FAFAFA] dark:bg-[#121826] border border-[#E5E7EB] dark:border-[#1E293B] p-4 rounded-xl font-mono text-xs shadow-sm">
              <div className="text-[10px] text-[#6B7280] dark:text-[#94A3B8] uppercase tracking-wider pb-2 border-b border-[#E5E7EB] dark:border-[#1E293B] flex justify-between">
                <span>Budget Status Meter</span>
                <span className="text-[#10B981] font-bold">71% Utilized</span>
              </div>
              <div className="pt-3 space-y-2">
                <div className="w-full bg-[#E5E7EB] dark:bg-[#1E293B] h-2.5 rounded-full overflow-hidden">
                  <div className="bg-[#10B981] h-full rounded-full" style={{ width: '71%' }}></div>
                </div>
                <div className="flex justify-between text-[11px] font-tabular pt-1">
                  <span className="text-[#6B7280] dark:text-[#94A3B8]">Spent: ₹1,420</span>
                  <span className="font-bold text-[#10B981]">Remaining: ₹580</span>
                </div>
                <div className="text-[10px] text-[#10B981] font-semibold pt-1 flex items-center gap-1 justify-center sm:justify-start">
                  <Check className="w-3.5 h-3.5" /> PDF Statement ready for 1-click download
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
