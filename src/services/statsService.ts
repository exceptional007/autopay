import { 
  doc, 
  getDoc, 
  updateDoc, 
  increment, 
  serverTimestamp 
} from 'firebase/firestore';
import { getFirestoreDb } from '../firebase';

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
 * Fetch authenticated aggregate product metrics safely from the database.
 * Directly reads public aggregates document from Firestore.
 * Zero user-level data, routes, or personal descriptions are exposed.
 */
export async function fetchPublicStats(): Promise<{ stats: PublicStats | null; error: string | null }> {
  const now = Date.now();
  if (cachedStats && now - lastStatsFetchTime < STATS_CACHE_TTL) {
    return { stats: cachedStats, error: null };
  }

  try {
    const db = getFirestoreDb();
    const docRef = doc(db, 'site_stats', 'public_summary');
    const snap = await getDoc(docRef);

    if (snap.exists()) {
      const data = snap.data();
      const stats: PublicStats = {
        totalUsers: typeof data.totalUsers === 'number' ? data.totalUsers : 0,
        totalExpenseRecords: typeof data.totalExpenseRecords === 'number' ? data.totalExpenseRecords : 0,
        totalExpensesAmount: typeof data.totalExpensesAmount === 'number' ? data.totalExpensesAmount : 0,
        recordsThisMonth: typeof data.recordsThisMonth === 'number' ? data.recordsThisMonth : 0,
        recordsLast30Days: typeof data.recordsLast30Days === 'number' ? data.recordsLast30Days : 0,
        currency: data.currency || 'INR',
        timezone: data.timezone || 'Asia/Kolkata',
        lastUpdated: data.lastUpdated || new Date().toISOString(),
      };
      cachedStats = stats;
      lastStatsFetchTime = now;
      return { stats, error: null };
    }

    throw new Error('Public statistics document not found in Firestore');
  } catch (err: any) {
    console.warn('[StatsService] Could not retrieve live stats from Firestore:', err.message);

    // Fallback: check /api/stats (e.g. if running local dev server with API middleware)
    try {
      const res = await fetch('/api/stats', {
        headers: { Accept: 'application/json' },
      });
      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('application/json')) {
        const data = await res.json();
        if (data.success && data.stats) {
          cachedStats = data.stats;
          lastStatsFetchTime = now;
          return { stats: data.stats, error: null };
        }
      }
    } catch {
      // Ignore API middleware fallback error
    }

    return {
      stats: cachedStats,
      error: err.message || 'Unable to connect to live statistics database',
    };
  }
}

/**
 * Visitor Counter with Session Deduplication, Concurrency Safety, and Bot Exclusion
 * 
 * Rules:
 * 1. Deduplicates per browser session via sessionStorage to prevent inflation on rerenders,
 *    React Strict Mode double-invocations, and route transitions.
 * 2. Excludes automated test runners and headless browsers (navigator.webdriver).
 * 3. Atomically increments visitor counter using Firestore increment(1) in production.
 * 4. Never falls back to fabricated random numbers if offline; marks isUnavailable: true.
 */
export async function recordAndFetchVisitorCount(): Promise<VisitorData> {
  const defaultData: VisitorData = {
    totalVisits: null,
    countingUnit: 'qualifying landing visits',
    sinceDate: 'October 2026',
    isUnavailable: false,
  };

  try {
    const db = getFirestoreDb();
    const docRef = doc(db, 'site_stats', 'public_summary');

    let alreadyCounted = false;
    try {
      alreadyCounted = sessionStorage.getItem('autopay_visitor_recorded') === 'true';
    } catch {
      alreadyCounted = false;
    }

    const isBot = typeof navigator !== 'undefined' && Boolean((navigator as any).webdriver);

    // If new legitimate visit, perform concurrency-safe atomic increment
    if (!alreadyCounted && !isBot) {
      try {
        await updateDoc(docRef, {
          totalVisits: increment(1),
          lastVisitAt: serverTimestamp(),
        });
        try {
          sessionStorage.setItem('autopay_visitor_recorded', 'true');
        } catch {}
      } catch (incErr: any) {
        console.warn('[StatsService] Visit increment skipped or restricted:', incErr?.message);
      }
    }

    // Read current state
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data();
      return {
        totalVisits: typeof data.totalVisits === 'number' ? data.totalVisits : null,
        countingUnit: data.countingUnit || defaultData.countingUnit,
        sinceDate: data.sinceDate || defaultData.sinceDate,
        isUnavailable: false,
      };
    }

    throw new Error('Public visitor document missing');
  } catch (err: any) {
    console.warn('[StatsService] Could not reach visitor counter in Firestore:', err.message);

    // Fallback: check /api/visitor if available
    try {
      const res = await fetch('/api/visitor', {
        headers: { Accept: 'application/json' },
      });
      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('application/json')) {
        const data = await res.json();
        return {
          totalVisits: typeof data.totalVisits === 'number' ? data.totalVisits : null,
          countingUnit: data.countingUnit || defaultData.countingUnit,
          sinceDate: data.sinceDate || defaultData.sinceDate,
          isUnavailable: false,
        };
      }
    } catch {}

    return {
      ...defaultData,
      isUnavailable: true,
    };
  }
}

/**
 * Syncs a newly created expense into the aggregate metrics document.
 * Non-blocking and concurrency-safe.
 */
export async function syncExpenseToStats(payload: {
  amount: number;
  date: string;
  userIdHash?: string;
  expenseId?: string;
  createdAt?: number;
  [key: string]: any;
}): Promise<void> {
  try {
    const db = getFirestoreDb();
    const docRef = doc(db, 'site_stats', 'public_summary');

    const now = new Date();
    const currentMonthPrefix = new Intl.DateTimeFormat('en-CA', { 
      timeZone: 'Asia/Kolkata', 
      year: 'numeric', 
      month: '2-digit' 
    }).format(now).slice(0, 7);

    const isThisMonth = typeof payload.date === 'string' && payload.date.startsWith(currentMonthPrefix);

    await updateDoc(docRef, {
      totalExpenseRecords: increment(1),
      totalExpensesAmount: increment(Math.round(payload.amount)),
      ...(isThisMonth ? { recordsThisMonth: increment(1) } : {}),
      recordsLast30Days: increment(1),
      lastUpdated: new Date().toISOString(),
    });
  } catch (err: any) {
    console.debug('[StatsService] Aggregate increment deferred:', err?.message);
  }
}

/**
 * Syncs an expense deletion into the aggregate metrics document.
 */
export async function syncExpenseDeletionFromStats(payload: {
  amount: number;
  date: string;
}): Promise<void> {
  try {
    const db = getFirestoreDb();
    const docRef = doc(db, 'site_stats', 'public_summary');

    const now = new Date();
    const currentMonthPrefix = new Intl.DateTimeFormat('en-CA', { 
      timeZone: 'Asia/Kolkata', 
      year: 'numeric', 
      month: '2-digit' 
    }).format(now).slice(0, 7);

    const isThisMonth = typeof payload.date === 'string' && payload.date.startsWith(currentMonthPrefix);

    await updateDoc(docRef, {
      totalExpenseRecords: increment(-1),
      totalExpensesAmount: increment(-Math.round(payload.amount)),
      ...(isThisMonth ? { recordsThisMonth: increment(-1) } : {}),
      lastUpdated: new Date().toISOString(),
    });
  } catch (err: any) {
    console.debug('[StatsService] Aggregate decrement deferred:', err?.message);
  }
}

/**
 * Syncs a new user registration to the aggregate metrics document.
 */
export async function syncNewUserToStats(): Promise<void> {
  try {
    const db = getFirestoreDb();
    const docRef = doc(db, 'site_stats', 'public_summary');
    await updateDoc(docRef, {
      totalUsers: increment(1),
      lastUpdated: new Date().toISOString(),
    });
  } catch (err: any) {
    console.debug('[StatsService] User count increment deferred:', err?.message);
  }
}

/**
 * Legacy stub for backward compatibility
 */
export function syncExistingLocalExpenses(_userId: string, _expenses: Array<any>): void {
  // Direct Firestore-backed aggregates handle historical data natively
}
