import React, { useState, useEffect, useRef } from 'react';
import {
  Users,
  Receipt,
  IndianRupee,
  CalendarDays,
  Activity,
  ShieldCheck,
  Radio,
  Clock
} from 'lucide-react';
import { fetchPublicStats, PublicStats } from '../../services/statsService';
import { useCountUp } from '../../hooks/useCountUp';

interface MetricCardProps {
  icon: React.ReactNode;
  label: string;
  value: number | null;
  isLoading: boolean;
  isUnavailable: boolean;
  isCurrency?: boolean;
  prefix?: string;
  suffix?: string;
  caption: string;
  badge?: string;
  isVisible: boolean;
}

const MetricCard: React.FC<MetricCardProps> = ({
  icon,
  label,
  value,
  isLoading,
  isUnavailable,
  isCurrency = false,
  prefix = '',
  suffix = '',
  caption,
  badge,
  isVisible,
}) => {
  const { displayValue } = useCountUp({
    end: isUnavailable ? null : value,
    start: 0,
    duration: isCurrency ? 1250 : 1000,
    decimals: 0,
    isCurrency,
    prefix,
    suffix,
    enabled: isVisible,
  });

  return (
    <div className="relative group bg-[#121826]/80 hover:bg-[#151D30] border border-gray-800/80 hover:border-emerald-500/30 rounded-2xl p-5 md:p-6 transition-all duration-300 shadow-lg hover:shadow-emerald-500/5 flex flex-col justify-between overflow-hidden">
      {/* Subtle background glow */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-colors pointer-events-none" />

      <div>
        <div className="flex items-center justify-between gap-2 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gray-800/80 border border-gray-700/50 flex items-center justify-center text-emerald-400 group-hover:scale-105 group-hover:text-emerald-300 transition-transform">
            {icon}
          </div>
          {badge && (
            <span className="text-[10px] font-mono tracking-wider font-semibold uppercase px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              {badge}
            </span>
          )}
        </div>

        <p className="text-xs font-medium text-gray-400 tracking-wide uppercase font-sans mb-1.5">
          {label}
        </p>

        {/* Metric Value Display with Loading, Unavailable, and Success States */}
        <div className="min-h-[44px] flex items-center">
          {isLoading ? (
            <div className="h-9 w-28 bg-gray-800/80 rounded-lg animate-pulse" />
          ) : isUnavailable ? (
            <div className="flex items-center gap-1.5">
              <span className="text-2xl sm:text-3xl font-bold font-mono text-gray-500">
                —
              </span>
              <span className="text-[10px] text-gray-500 font-mono">
                (syncing)
              </span>
            </div>
          ) : (
            <p className="text-2xl sm:text-3xl font-extrabold text-white font-mono font-tabular tracking-tight">
              {displayValue}
            </p>
          )}
        </div>
      </div>

      <p className="text-[11px] text-gray-400 font-sans mt-3 border-t border-gray-800/60 pt-2.5">
        {caption}
      </p>
    </div>
  );
};

export const LiveStats: React.FC = () => {
  const [stats, setStats] = useState<PublicStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUnavailable, setIsUnavailable] = useState(false);
  const [lastUpdatedTime, setLastUpdatedTime] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  // IntersectionObserver to trigger animation when scrolled into view
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          // Once visible, disconnect so we don't restart animation during incidental scrolls
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const loadData = async () => {
    const res = await fetchPublicStats();
    if (res.stats) {
      setStats(res.stats);
      setIsUnavailable(false);
      setLastUpdatedTime(new Date(res.stats.lastUpdated).toLocaleTimeString('en-IN', {
        timeZone: 'Asia/Kolkata',
        hour: '2-digit',
        minute: '2-digit',
      }));
    } else {
      setIsUnavailable(true);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
    // Live refresh every 45 seconds to keep metrics updated without heavy server load
    const interval = setInterval(loadData, 45000);
    return () => clearInterval(interval);
  }, []);

  // Format current month in IST (e.g. "October 2026")
  const currentMonthLabel = new Intl.DateTimeFormat('en-IN', {
    month: 'short',
    year: 'numeric',
    timeZone: 'Asia/Kolkata',
  }).format(new Date());

  return (
    <section
      ref={containerRef}
      id="stats"
      className="relative py-20 px-4 sm:px-6 lg:px-8 border-y border-gray-800/60 bg-[#0B0F19] overflow-hidden"
    >
      {/* Background ambient gradient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10 pb-6 border-b border-gray-800/80">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono font-medium mb-3">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
              <span>LIVE APPLICATION DATA</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-display">
              AutoPay in numbers
            </h2>
            <p className="mt-2 text-sm sm:text-base text-gray-400 font-sans max-w-xl">
              Authentic usage metrics aggregated in real-time. Zero vanity numbers, zero fabricated stats.
            </p>
          </div>

          {/* Live freshness and timezone indicator */}
          <div className="flex items-center gap-3 text-xs text-gray-400 font-mono bg-gray-900/60 border border-gray-800 px-3.5 py-2 rounded-xl self-start sm:self-auto">
            <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span>IST (Asia/Kolkata)</span>
            {lastUpdatedTime && (
              <>
                <span className="text-gray-700">•</span>
                <span className="flex items-center gap-1 text-gray-300">
                  <Clock className="w-3 h-3 text-gray-400" />
                  {lastUpdatedTime}
                </span>
              </>
            )}
          </div>
        </div>

        {/* 5 Real Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 md:gap-5">
          {/* 1. Total Registered Users */}
          <MetricCard
            icon={<Users className="w-5 h-5" />}
            label="Total Users"
            value={stats?.totalUsers ?? null}
            isLoading={isLoading}
            isUnavailable={isUnavailable}
            caption="Distinct registered accounts actively tracking trips"
            badge="Accounts"
            isVisible={isVisible}
          />

          {/* 2. Total Expense Records */}
          <MetricCard
            icon={<Receipt className="w-5 h-5" />}
            label="Trips Logged"
            value={stats?.totalExpenseRecords ?? null}
            isLoading={isLoading}
            isUnavailable={isUnavailable}
            caption="Verified auto ride expense entries in database"
            badge="Records"
            isVisible={isVisible}
          />

          {/* 3. Total Expenses Recorded (₹) */}
          <MetricCard
            icon={<IndianRupee className="w-5 h-5" />}
            label="Volume Recorded"
            value={stats?.totalExpensesAmount ?? null}
            isCurrency={true}
            isLoading={isLoading}
            isUnavailable={isUnavailable}
            caption="Cumulative commute spending accounted for"
            badge="INR (₹)"
            isVisible={isVisible}
          />

          {/* 4. Records This Month */}
          <MetricCard
            icon={<CalendarDays className="w-5 h-5" />}
            label="This Month"
            value={stats?.recordsThisMonth ?? null}
            isLoading={isLoading}
            isUnavailable={isUnavailable}
            caption={`Entries created during ${currentMonthLabel}`}
            badge={currentMonthLabel}
            isVisible={isVisible}
          />

          {/* 5. Additional Metric: 30-Day Activity */}
          <MetricCard
            icon={<Activity className="w-5 h-5" />}
            label="30-Day Velocity"
            value={stats?.recordsLast30Days ?? null}
            isLoading={isLoading}
            isUnavailable={isUnavailable}
            caption="Expense records logged within rolling 30-day window"
            badge="Active"
            isVisible={isVisible}
          />
        </div>

        {/* Data Integrity & Financial Safeguard Footer Note */}
        <div className="mt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-gray-500 font-sans px-2">
          <div className="flex items-center gap-2 text-emerald-400/90 font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Strict Financial Privacy: Personal routes, individual balances, and transaction notes are never publicly disclosed.</span>
          </div>
        </div>
      </div>
    </section>
  );
};
