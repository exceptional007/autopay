import React from 'react';
import { ShieldCheck, Database, EyeOff } from 'lucide-react';

export const TrustNote: React.FC = () => {
  return (
    <section className="py-14 sm:py-20 border-b border-[#E5E7EB] dark:border-[#1E293B] bg-white dark:bg-[#0B0F19] transition-colors">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Paper Notice Card */}
        <div className="bg-[#FAFAFA] dark:bg-[#121826] border border-[#E5E7EB] dark:border-[#1E293B] p-6 sm:p-8 rounded-2xl shadow-sm relative">
          
          <div className="flex items-center gap-2 mb-3">
            <ShieldCheck className="w-5 h-5 text-[#10B981]" />
            <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-[#10B981]">
              Honest Data &amp; Privacy Statement
            </h3>
          </div>

          <h4 className="font-display text-xl sm:text-2xl font-bold text-[#111827] dark:text-white tracking-tight mb-4">
            Exactly what is stored. Nothing more.
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-sans text-xs text-[#6B7280] dark:text-[#94A3B8] leading-relaxed">
            
            <div className="space-y-3 font-mono">
              <div className="text-[11px] font-bold text-[#111827] dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-[#10B981]" />
                <span>Stored in Firebase Database</span>
              </div>
              <ul className="space-y-1.5 list-disc list-inside text-xs">
                <li>Your logged trip entries: amount (₹), route name, and date.</li>
                <li>Your chosen monthly budget limit (e.g. ₹2,000).</li>
                <li>Your preferred default fare and route shortcuts.</li>
                <li>Your user account ID via Firebase Authentication.</li>
              </ul>
            </div>

            <div className="space-y-3 font-mono">
              <div className="text-[11px] font-bold text-[#111827] dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <EyeOff className="w-3.5 h-3.5 text-[#10B981]" />
                <span>What is NEVER accessed</span>
              </div>
              <ul className="space-y-1.5 list-disc list-inside text-xs">
                <li>Zero access to bank accounts or UPI payment credentials.</li>
                <li>Zero background SMS reading or notification scrapers.</li>
                <li>Zero background GPS or passive location trackers.</li>
                <li>Zero third-party advertising SDKs or tracking cookies.</li>
              </ul>
            </div>

          </div>

          <div className="mt-6 pt-4 border-t border-[#E5E7EB] dark:border-[#1E293B] font-mono text-[11px] text-[#6B7280] dark:text-[#94A3B8] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span>Authentication handled securely via Firebase Auth.</span>
            <span className="text-[#10B981] font-semibold">✓ Safe for students and daily commuters</span>
          </div>

        </div>

      </div>
    </section>
  );
};
