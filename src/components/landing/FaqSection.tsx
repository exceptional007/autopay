import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

interface FaqItem {
  question: string;
  answer: string;
}

const FAQ_ITEMS: FaqItem[] = [
  {
    question: "What does AutoPay actually track?",
    answer: "AutoPay tracks daily commute fares (auto-rickshaws, metro tokens) and small out-of-pocket spends (chai, canteen lunches, quick UPI splits). Enter the fare in ₹, pick your route, and your monthly budget updates immediately."
  },
  {
    question: "Does AutoPay connect to my bank account or scrape SMS messages?",
    answer: "No. AutoPay never requests bank credentials or SMS permissions. It is an intentional, two-second manual ledger that keeps you conscious of cash flow without invasive tracking."
  },
  {
    question: "How does the mobile home-screen installation work?",
    answer: "AutoPay is a Progressive Web App (PWA). On Chrome/Android, tap 'Install App'. On iOS Safari, tap Share → 'Add to Home Screen'. It opens full-screen in standalone mode with zero app-store downloads."
  },
  {
    question: "Can I log expenses if I have no internet connection at the station?",
    answer: "Yes. AutoPay uses local-first storage. If network drops at a metro basement or auto stand, entries save to your device immediately and synchronize once you reconnect."
  },
  {
    question: "How do I export my logs for reimbursements or records?",
    answer: "Open 'Logs & History' and tap 'Export PDF'. AutoPay generates an official, itemized PDF statement with dates, routes, and a reconciled total ready for download."
  }
];

export const FaqSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleItem = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section id="faq" className="py-16 sm:py-24 border-b border-[#E5E7EB] dark:border-[#1E293B] bg-[#F8FAFC] dark:bg-[#0E131F] transition-colors">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#10B981]/10 text-[#10B981] font-mono text-[11px] font-bold uppercase tracking-wider mb-2 border border-[#10B981]/25">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Common Inquiries</span>
          </div>
          <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-[#111827] dark:text-white tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="font-sans text-sm sm:text-base text-[#6B7280] dark:text-[#94A3B8] mt-3">
            Factual answers regarding AutoPay's features, privacy, and mobile installation.
          </p>
        </div>

        {/* Accordion List */}
        <div className="space-y-3 font-sans">
          {FAQ_ITEMS.map((item, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="bg-white dark:bg-[#121826] border border-[#E5E7EB] dark:border-[#1E293B] rounded-2xl overflow-hidden transition-all shadow-xs"
              >
                <button
                  type="button"
                  onClick={() => toggleItem(idx)}
                  className="w-full text-left px-5 py-4 flex items-center justify-between gap-4 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#10B981]"
                >
                  <span className="font-display font-semibold text-sm sm:text-base text-[#111827] dark:text-white">
                    {item.question}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-[#10B981] shrink-0 transform transition-transform duration-200 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 text-xs sm:text-sm text-[#6B7280] dark:text-[#94A3B8] leading-relaxed border-t border-[#E5E7EB] dark:border-[#1E293B] pt-3">
                    {item.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
