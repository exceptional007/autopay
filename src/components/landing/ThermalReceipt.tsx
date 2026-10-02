import React, { useState, useEffect } from 'react';

export const ThermalReceipt: React.FC = () => {
  const [hasReducedMotion, setHasReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setHasReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => setHasReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return (
    <div className="relative mx-auto w-full max-w-[340px] sm:max-w-[360px] filter drop-shadow-lg select-none">
      {/* Top thermal printer slot */}
      <div className="h-2.5 w-3/4 mx-auto bg-slate-800 dark:bg-slate-700 rounded-t-sm opacity-90 mb-[-1px]"></div>

      {/* Main Thermal Receipt Paper Slip (Theme Matched) */}
      <div
        className={`bg-white dark:bg-[#121826] text-[#111827] dark:text-white p-5 sm:p-6 font-mono text-xs border border-[#E5E7EB] dark:border-[#1E293B] relative rounded-t-sm ${
          hasReducedMotion ? '' : 'animate-receipt-print'
        }`}
        style={{
          boxShadow: '0 8px 30px -4px rgba(0, 0, 0, 0.08)',
        }}
      >
        {/* Receipt Header */}
        <div className="text-center pb-3 border-b border-dashed border-[#E5E7EB] dark:border-[#1E293B] space-y-1">
          <div className="flex items-center justify-center gap-1.5 text-[11px] font-bold tracking-widest text-[#10B981]">
            <span>***</span>
            <span className="font-display">AUTOPAY COMMUTE LEDGER</span>
            <span>***</span>
          </div>
          <p className="text-[10px] text-[#6B7280] dark:text-[#94A3B8] tracking-wide">
            DAILY FARES &amp; POCKET DISPATCH
          </p>
          <div className="flex justify-between text-[9px] text-[#9CA3AF] dark:text-[#64748B] pt-1 font-tabular">
            <span>TERMINAL: #082-IND</span>
            <span>{new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
          </div>
        </div>

        {/* Receipt Line Items with concrete amounts */}
        <div className="py-4 space-y-2.5 font-tabular">
          <div className="flex justify-between items-baseline leading-none">
            <div className="flex flex-col">
              <span className="font-semibold text-[#111827] dark:text-white">Morning Chai &amp; Bun</span>
              <span className="text-[9px] text-[#6B7280] dark:text-[#94A3B8]">08:35 AM • Corner tap</span>
            </div>
            <span className="font-bold text-[#111827] dark:text-white text-[13px]">₹40.00</span>
          </div>

          <div className="flex justify-between items-baseline leading-none">
            <div className="flex flex-col">
              <span className="font-semibold text-[#111827] dark:text-white">Auto: Station → Campus</span>
              <span className="text-[9px] text-[#6B7280] dark:text-[#94A3B8]">09:12 AM • Shared meter</span>
            </div>
            <span className="font-bold text-[#111827] dark:text-white text-[13px]">₹120.00</span>
          </div>

          <div className="flex justify-between items-baseline leading-none">
            <div className="flex flex-col">
              <span className="font-semibold text-[#111827] dark:text-white">UPI: Canteen Lunch Split</span>
              <span className="text-[9px] text-[#6B7280] dark:text-[#94A3B8]">01:25 PM • QR transfer</span>
            </div>
            <span className="font-bold text-[#111827] dark:text-white text-[13px]">₹145.00</span>
          </div>

          <div className="flex justify-between items-baseline leading-none">
            <div className="flex flex-col">
              <span className="font-semibold text-[#111827] dark:text-white">Auto: Return Leg (Home)</span>
              <span className="text-[9px] text-[#6B7280] dark:text-[#94A3B8]">05:40 PM • Fixed route</span>
            </div>
            <span className="font-bold text-[#111827] dark:text-white text-[13px]">₹80.00</span>
          </div>

          <div className="flex justify-between items-baseline leading-none">
            <div className="flex flex-col">
              <span className="font-semibold text-[#111827] dark:text-white">Quick Kirana / Evening Snack</span>
              <span className="text-[9px] text-[#6B7280] dark:text-[#94A3B8]">08:15 PM • Local store</span>
            </div>
            <span className="font-bold text-[#111827] dark:text-white text-[13px]">₹215.00</span>
          </div>
        </div>

        {/* Separator Line */}
        <div className="border-t-2 border-dashed border-[#E5E7EB] dark:border-[#1E293B] my-2"></div>

        {/* Day Total */}
        <div className="flex justify-between items-baseline pt-1 pb-3 text-sm font-bold font-tabular text-[#111827] dark:text-white">
          <span className="tracking-wide text-xs uppercase font-mono">DAY TOTAL (5 ITEMS)</span>
          <span className="text-base font-extrabold text-[#10B981]">₹600.00</span>
        </div>

        <div className="text-[10px] text-[#6B7280] dark:text-[#94A3B8] text-center italic border-t border-dotted border-[#E5E7EB] dark:border-[#1E293B] pt-2">
          30 days of unrecorded ₹600 = ₹18,000 lost per month
        </div>

        {/* Rubber Stamp Landing */}
        <div className="mt-4 mb-2 flex justify-center">
          <div className="rubber-stamp border-2 border-dashed border-[#10B981] text-[#10B981] bg-[#10B981]/10 px-3.5 py-1.5 font-mono text-[11px] font-extrabold tracking-widest uppercase transform -rotate-2 shadow-xs">
            WHERE DID IT GO?
          </div>
        </div>

        {/* Barcode & 2-Second Tag */}
        <div className="pt-3 text-center opacity-70">
          <div className="h-5 flex items-center justify-center gap-[2px] overflow-hidden">
            {[3, 1, 5, 2, 4, 1, 6, 2, 4, 3, 2, 6, 1, 4, 2, 5, 3, 2, 4, 2, 6, 1, 3, 5, 2].map((w, idx) => (
              <div
                key={idx}
                className="bg-[#111827] dark:bg-white h-full"
                style={{ width: `${w * 1.5}px` }}
              />
            ))}
          </div>
          <span className="text-[8px] tracking-widest text-[#9CA3AF] dark:text-[#64748B] block mt-1 uppercase font-mono">
            * 2 - S E C O N D - L O G G I N G *
          </span>
        </div>

        {/* Perforated bottom zigzag edge */}
        <div
          className="absolute -bottom-2 left-0 right-0 h-2 bg-white dark:bg-[#121826]"
          style={{
            clipPath:
              'polygon(0% 0%, 5% 100%, 10% 0%, 15% 100%, 20% 0%, 25% 100%, 30% 0%, 35% 100%, 40% 0%, 45% 100%, 50% 0%, 55% 100%, 60% 0%, 65% 100%, 70% 0%, 75% 100%, 80% 0%, 85% 100%, 90% 0%, 95% 100%, 100% 0%)',
          }}
        ></div>
      </div>
    </div>
  );
};
