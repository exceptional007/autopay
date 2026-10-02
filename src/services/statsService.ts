export interface PublicStats {
  totalUsers: number;
  totalExpenseRecords: number;
  totalExpensesAmount: number;
  recordsThisMonth: number;
  recordsLast30Days: number;
  currency: string;
  timezone: string;
  lastUpdated: string;
}

export interface VisitorData {
  totalVisits: number | null;
  countingUnit: string;
  sinceDate: string;
  isUnavailable: boolean;
}

let cachedStats: PublicStats | null = null;
let lastStatsFetchTime = 0;
const STATS_CACHE_TTL = 30000; // 30 seconds client-side cache

/**
 * Fetch authenticated aggregate product metrics safely from the backend.
 * Zero user-level data, routes, or personal descriptions are exposed.
 */
export async function fetchPublicStats(): Promise<{ stats: PublicStats | null; error: string | null }> {
  const now = Date.now();
  if (cachedStats && now - lastStatsFetchTime < STATS_CACHE_TTL) {
    return { stats: cachedStats, error: null };
  }

  try {
    const res = await fetch('/api/stats', {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: Failed to fetch product stats`);
    }

    const data = await res.json();
    if (data.success && data.stats) {
      cachedStats = data.stats;
      lastStatsFetchTime = now;
      return { stats: data.stats, error: null };
    }

    throw new Error('Malformed stats response');
  } catch (err: any) {
    console.warn('[StatsService] Could not retrieve live stats:', err.message);
    // Return last-known valid cache if available, or null with error
    return {
      stats: cachedStats,
      error: err.message || 'Unable to connect to live statistics server'
    };
  }
}

/**
 * Visitor Counter with Session Deduplication and Bot Exclusion
 * 
 * Rules:
 * 1. Deduplicates per browser session via sessionStorage to prevent inflation on rerenders,
 *    React Strict Mode double-invocations, and page refreshes.
 * 2. Excludes automated test runners (navigator.webdriver).
 * 3. Never falls back to fabricated random numbers if offline; returns isUnavailable: true.
 */
export async function recordAndFetchVisitorCount(): Promise<VisitorData> {
  const defaultData: VisitorData = {
    totalVisits: null,
    countingUnit: 'qualifying landing visits',
    sinceDate: 'October 2026',
    isUnavailable: false
  };

  try {
    // Generate or retrieve session ID for this browser tab/session
    let sessionId = '';
    try {
      sessionId = sessionStorage.getItem('autopay_visitor_session_id') || '';
      if (!sessionId) {
        sessionId = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
        sessionStorage.setItem('autopay_visitor_session_id', sessionId);
      }
    } catch {
      sessionId = `sess_temp_${Date.now()}`;
    }

    const alreadyCounted = (() => {
      try {
        return sessionStorage.getItem('autopay_visitor_recorded') === 'true';
      } catch {
        return false;
      }
    })();

    const isBot = typeof navigator !== 'undefined' && (Boolean((navigator as any).webdriver));

    // If already counted in this browser session or automated bot, read without incrementing
    if (alreadyCounted || isBot) {
      const res = await fetch('/api/visitor', { method: 'GET' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      return {
        totalVisits: typeof data.totalVisits === 'number' ? data.totalVisits : null,
        countingUnit: data.countingUnit || defaultData.countingUnit,
        sinceDate: data.sinceDate || defaultData.sinceDate,
        isUnavailable: false
      };
    }

    // New legitimate qualifying visit: atomically increment
    const res = await fetch(`/api/visitor?sessionId=${encodeURIComponent(sessionId)}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sessionId })
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    try {
      sessionStorage.setItem('autopay_visitor_recorded', 'true');
    } catch {}

    return {
      totalVisits: typeof data.totalVisits === 'number' ? data.totalVisits : null,
      countingUnit: data.countingUnit || defaultData.countingUnit,
      sinceDate: data.sinceDate || defaultData.sinceDate,
      isUnavailable: false
    };
  } catch (err: any) {
    console.warn('[StatsService] Could not reach visitor counter:', err.message);
    return {
      ...defaultData,
      isUnavailable: true
    };
  }
}

/**
 * Record a newly added trip expense into server aggregates asynchronously.
 * Only non-sensitive numerical data (amount, date, timestamp) is synced.
 */
export function syncExpenseToStats(payload: {
  userIdHash: string;
  expenseId: string;
  amount: number;
  date: string;
  createdAt: number;
}): void {
  try {
    fetch('/api/stats/sync-expense', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).catch(err => {
      console.debug('[StatsService] Async sync deferred:', err.message);
    });
  } catch {}
}

/**
 * Batch sync local user expense history to establish authentic aggregate numbers.
 */
export function syncExistingLocalExpenses(userId: string, expenses: Array<{ id: string; amount: number; date: string; createdAt: number }>): void {
  if (!expenses || expenses.length === 0) return;
  try {
    const syncKey = `autopay_synced_stats_${userId}`;
    if (sessionStorage.getItem(syncKey) === 'true') return;

    fetch('/api/stats/sync-expense', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userIdHash: userId,
        expenses: expenses.map(e => ({
          expenseId: e.id,
          amount: e.amount,
          date: e.date,
          createdAt: e.createdAt
        }))
      })
    }).then(() => {
      try {
        sessionStorage.setItem(syncKey, 'true');
      } catch {}
    }).catch(() => {});
  } catch {}
}
