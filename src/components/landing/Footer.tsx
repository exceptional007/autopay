import React, { useState, useEffect } from 'react';
import { Navigation, ArrowUp, Github, Eye, ShieldCheck } from 'lucide-react';
import { recordAndFetchVisitorCount, VisitorData } from '../../services/statsService';

interface FooterProps {
  onNavigateLogin: () => void;
  onNavigateApp: () => void;
  isAuthenticated: boolean;
}

export const Footer: React.FC<FooterProps> = ({
  onNavigateLogin,
  onNavigateApp,
  isAuthenticated,
}) => {
  const [visitorData, setVisitorData] = useState<VisitorData>({
    totalVisits: null,
    countingUnit: 'qualifying landing visits',
    sinceDate: 'October 2026',
    isUnavailable: false,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    recordAndFetchVisitorCount()
      .then((data) => {
        if (isMounted) {
          setVisitorData(data);
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setVisitorData((prev) => ({ ...prev, isUnavailable: true }));
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-white dark:bg-[#0B0F19] border-t border-[#E5E7EB] dark:border-[#1E293B] py-12 text-[#6B7280] dark:text-[#94A3B8] font-mono text-xs transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-8 border-b border-[#E5E7EB] dark:border-[#1E293B]">
          
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#10B981] flex items-center justify-center text-white shadow-xs">
              <Navigation className="w-5 h-5 transform rotate-45" />
            </div>
            <div>
              <span className="font-display font-bold text-base text-[#111827] dark:text-white block leading-none">
                AutoPay
              </span>
              <span className="text-[10px] text-[#6B7280] dark:text-[#94A3B8] tracking-wide block mt-1">
                Daily Expense &amp; Commute Ledger
              </span>
            </div>
          </div>

          {/* Links */}
          <div className="flex flex-wrap items-center gap-4 sm:gap-5 text-xs text-[#6B7280] dark:text-[#94A3B8]">
            <a
              href="#the-leak"
              className="hover:text-[#111827] dark:hover:text-white transition-colors"
            >
              The Problem
            </a>
            <a
              href="#how-it-works"
              className="hover:text-[#111827] dark:hover:text-white transition-colors"
            >
              How It Works
            </a>
            <a
              href="#pwa-centerpiece"
              className="hover:text-[#111827] dark:hover:text-white transition-colors"
            >
              PWA Install
            </a>
            <a
              href="#features"
              className="hover:text-[#111827] dark:hover:text-white transition-colors"
            >
              Features
            </a>
            <a
              href="#pdf-export-feature"
              className="hover:text-[#111827] dark:hover:text-white transition-colors text-[#10B981] font-bold"
            >
              PDF Export
            </a>
            <a
              href="#stats"
              className="hover:text-[#111827] dark:hover:text-white transition-colors font-medium text-emerald-400"
            >
              Live Numbers
            </a>
            <a
              href="#faq"
              className="hover:text-[#111827] dark:hover:text-white transition-colors"
            >
              FAQ
            </a>
            <a
              href="https://github.com/exceptional007/autopay"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#111827] dark:hover:text-white transition-colors flex items-center gap-1"
            >
              <Github className="w-3.5 h-3.5" />
              <span>GitHub</span>
            </a>
            {isAuthenticated ? (
              <button
                type="button"
                onClick={onNavigateApp}
                className="hover:text-[#10B981] font-bold text-[#10B981] transition-colors cursor-pointer"
              >
                Dashboard
              </button>
            ) : (
              <button
                type="button"
                onClick={onNavigateLogin}
                className="hover:text-[#10B981] font-bold text-[#10B981] transition-colors cursor-pointer"
              >
                Log In
              </button>
            )}
            <button
              type="button"
              onClick={scrollToTop}
              className="inline-flex items-center gap-1 hover:text-[#111827] dark:hover:text-white transition-colors cursor-pointer"
              title="Scroll to top"
            >
              <span>Back to Top</span>
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>

        {/* Bottom Credits, Privacy & Actual Visitor Counter */}
        <div className="pt-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-[11px] text-[#9CA3AF] dark:text-[#64748B]">
          <div>
            © {new Date().getFullYear()} AutoPay. Plain-text tracking for real commuters.
          </div>

          {/* Actual Visitor Counter (Understated, truthful, session-deduplicated) */}
          <div className="flex items-center gap-2">
            {isLoading ? (
              <div className="h-6 w-36 bg-gray-200 dark:bg-gray-800 rounded-full animate-pulse" />
            ) : visitorData.isUnavailable ? (
              <div 
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700/60 text-[11px] text-gray-400"
                title="Visitor telemetry temporarily unavailable. Never displays mock figures."
              >
                <Eye className="w-3.5 h-3.5 text-gray-400" />
                <span>Visitors: —</span>
              </div>
            ) : (
              <div 
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-[11px] text-gray-700 dark:text-gray-300 transition-colors"
                title={`Actual recorded landing visits since ${visitorData.sinceDate}. Deduplicated per browser session to prevent reload inflation; automated bots excluded.`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
                <span className="text-gray-500 dark:text-gray-400">Visitors:</span>
                <span className="font-bold font-mono text-gray-900 dark:text-white tabular-nums">
                  {visitorData.totalVisits !== null ? visitorData.totalVisits.toLocaleString('en-IN') : '0'}
                </span>
                <span className="text-[10px] text-gray-400 font-sans border-l border-gray-300 dark:border-gray-700 pl-2">
                  real visits
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-1 text-[10px] text-gray-500 dark:text-gray-500">
            <ShieldCheck className="w-3 h-3 text-emerald-500 shrink-0" />
            <span>No tracker pixels • No bank scraping • Privacy first</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
