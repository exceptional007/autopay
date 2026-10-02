import fs from 'fs';
import path from 'path';
import type { IncomingMessage, ServerResponse } from 'http';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  getCountFromServer, 
  getAggregateFromServer, 
  sum, 
  query, 
  where 
} from 'firebase/firestore';

interface SiteStatsData {
  visitors: {
    totalVisits: number;
    countingUnit: string;
    sinceDate: string;
    sessions: Record<string, number>; // sessionId -> timestamp
  };
  metrics: {
    totalUsers: number;
    totalExpenseRecords: number;
    totalExpensesAmount: number;
    recordsThisMonth: number;
    recordsLast30Days: number;
    currency: string;
    timezone: string;
    lastUpdated: string;
    source?: string;
  };
  users: Record<string, boolean>;
  expenseIds: Record<string, { amount: number; date: string; createdAt: number }>;
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const STATS_FILE = path.join(DATA_DIR, 'site_stats.json');

function getCurrentMonthPrefix(): string {
  // Use Asia/Kolkata timezone
  const now = new Date();
  const options: Intl.DateTimeFormatOptions = { timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit' };
  const formatter = new Intl.DateTimeFormat('en-CA', options);
  // Returns 'YYYY-MM'
  return formatter.format(now).slice(0, 7);
}

function getDefaultStats(): SiteStatsData {
  return {
    visitors: {
      totalVisits: 0,
      countingUnit: 'qualifying landing visits',
      sinceDate: 'October 2026',
      sessions: {}
    },
    metrics: {
      totalUsers: 0,
      totalExpenseRecords: 0,
      totalExpensesAmount: 0,
      recordsThisMonth: 0,
      recordsLast30Days: 0,
      currency: 'INR',
      timezone: 'Asia/Kolkata',
      lastUpdated: new Date().toISOString(),
      source: 'initial'
    },
    users: {},
    expenseIds: {}
  };
}

let cachedStats: SiteStatsData | null = null;
let writeQueue: Promise<void> = Promise.resolve();
let lastDatabaseSyncTime = 0;
const DB_SYNC_INTERVAL = 45000; // Sync with real Firestore every 45s

function loadStats(): SiteStatsData {
  if (cachedStats) return cachedStats;
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(STATS_FILE)) {
      const raw = fs.readFileSync(STATS_FILE, 'utf-8');
      cachedStats = JSON.parse(raw);
      return cachedStats!;
    }
  } catch (err) {
    console.error('[StatsServer] Error reading stats file:', err);
  }
  cachedStats = getDefaultStats();
  saveStats(cachedStats);
  return cachedStats;
}

function saveStats(data: SiteStatsData): void {
  cachedStats = data;
  writeQueue = writeQueue.then(async () => {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      const tmpFile = `${STATS_FILE}.tmp.${Date.now()}`;
      fs.writeFileSync(tmpFile, JSON.stringify(data, null, 2), 'utf-8');
      fs.renameSync(tmpFile, STATS_FILE);
    } catch (err) {
      console.error('[StatsServer] Error writing stats file:', err);
    }
  });
}

/**
 * Query authentic database metrics directly from Firebase Firestore
 * Uses database-side aggregation (count & sum) with authorized server context.
 */
async function fetchLiveFirestoreMetrics(): Promise<SiteStatsData['metrics'] | null> {
  try {
    const configPath = path.resolve(process.cwd(), 'firebase-applet-config.json');
    if (!fs.existsSync(configPath)) {
      console.warn('[StatsServer] firebase-applet-config.json not found');
      return null;
    }
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

    const app = getApps().length === 0 ? initializeApp(config) : getApp();
    const auth = getAuth(app);
    const db = getFirestore(app);

    // Ensure authorized session for querying aggregates
    if (!auth.currentUser) {
      try {
        await signInWithEmailAndPassword(auth, 'stats-auditor@autopay.dev', 'AutoPay2026!Audit');
      } catch (err: any) {
        console.warn('[StatsServer] Database auth failed:', err.code, err.message);
        return null;
      }
    }

    const currentMonthPrefix = getCurrentMonthPrefix();
    const startOfMonth = `${currentMonthPrefix}-01`;
    const endOfMonth = `${currentMonthPrefix}-31`;
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;

    const expensesCol = collection(db, 'expenses');
    const settingsCol = collection(db, 'settings');

    const [expenseCountSnap, expenseSumSnap, userCountSnap, monthCountSnap, thirtyDaySnap] = await Promise.all([
      getCountFromServer(expensesCol),
      getAggregateFromServer(expensesCol, { totalAmount: sum('amount') }),
      getCountFromServer(settingsCol),
      getCountFromServer(query(expensesCol, where('date', '>=', startOfMonth), where('date', '<=', endOfMonth))),
      getCountFromServer(query(expensesCol, where('createdAt', '>=', thirtyDaysAgo)))
    ]);

    const totalExpenseRecords = expenseCountSnap.data().count;
    const totalExpensesAmount = Math.round(expenseSumSnap.data().totalAmount || 0);
    const totalUsers = userCountSnap.data().count;
    const recordsThisMonth = monthCountSnap.data().count;
    const recordsLast30Days = thirtyDaySnap.data().count;

    return {
      totalUsers,
      totalExpenseRecords,
      totalExpensesAmount,
      recordsThisMonth,
      recordsLast30Days,
      currency: 'INR',
      timezone: 'Asia/Kolkata',
      lastUpdated: new Date().toISOString(),
      source: 'firestore_live_aggregates'
    };
  } catch (err: any) {
    console.warn('[StatsServer] Firestore query error:', err.message);
    return null;
  }
}

// Bot user agents filter
const BOT_REGEX = /bot|spider|crawl|slurp|lighthouse|headless|curl|wget|python|postman/i;

// In-memory rate limiting map: ip -> timestamps
const rateLimits: Record<string, number[]> = {};

function isRateLimited(ip: string, maxPerMin = 30): boolean {
  const now = Date.now();
  const windowStart = now - 60000;
  const hits = (rateLimits[ip] || []).filter(t => t > windowStart);
  if (hits.length >= maxPerMin) {
    return true;
  }
  hits.push(now);
  rateLimits[ip] = hits;
  return false;
}

function parseJsonBody(req: IncomingMessage): Promise<any> {
  return new Promise((resolve) => {
    if ((req as any).body && typeof (req as any).body === 'object') {
      return resolve((req as any).body);
    }

    const chunks: any[] = [];
    req.on('data', chunk => {
      chunks.push(chunk);
    });
    req.on('end', () => {
      try {
        const raw = Buffer.concat(chunks).toString('utf-8');
        resolve(raw ? JSON.parse(raw) : {});
      } catch {
        resolve({});
      }
    });
    req.on('error', (err) => {
      console.error('[parseJsonBody error]', err);
      resolve({});
    });
    if (req.isPaused()) {
      req.resume();
    }
  });
}

function sendJson(res: ServerResponse, status: number, data: any, headers: Record<string, string> = {}): boolean {
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    ...headers
  });
  res.end(JSON.stringify(data));
  return true;
}

export async function handleApiRequest(req: IncomingMessage, res: ServerResponse): Promise<boolean> {
  const url = req.url || '';
  const pathname = url.split('?')[0];

  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
    res.end();
    return true;
  }

  const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0] || req.socket.remoteAddress || 'unknown';

  // 1. GET /api/stats -> Public aggregated product stats from real database
  if (pathname === '/api/stats' && req.method === 'GET') {
    const data = loadStats();
    const now = Date.now();

    // Re-sync with real Firestore if cache is older than DB_SYNC_INTERVAL
    if (now - lastDatabaseSyncTime > DB_SYNC_INTERVAL || data.metrics.totalExpenseRecords === 0) {
      const liveMetrics = await fetchLiveFirestoreMetrics();
      if (liveMetrics) {
        data.metrics = liveMetrics;
        lastDatabaseSyncTime = now;
        saveStats(data);
      }
    }

    // Safeguard: expose ONLY safe aggregate numbers, no user details, emails, or personal descriptions
    sendJson(res, 200, {
      success: true,
      stats: data.metrics,
      boundaries: {
        currentMonth: getCurrentMonthPrefix(),
        timezone: 'Asia/Kolkata (IST)',
        currency: 'INR (₹)',
        note: 'Derived strictly from authentic recorded trip data in Firestore. Personal identifiers, locations, and individual logs are excluded from public statistics.'
      }
    }, {
      'Cache-Control': 'public, max-age=30, s-maxage=30'
    });
    return true;
  }

  // 2. GET /api/visitor -> Read-only current visitor count
  if (pathname === '/api/visitor' && req.method === 'GET') {
    const data = loadStats();
    sendJson(res, 200, {
      success: true,
      totalVisits: data.visitors.totalVisits,
      countingUnit: data.visitors.countingUnit,
      sinceDate: data.visitors.sinceDate,
      action: 'read'
    }, {
      'Cache-Control': 'public, max-age=15, s-maxage=15'
    });
    return true;
  }

  // 3. POST /api/visitor -> Session-deduplicated atomic visit increment
  if (pathname === '/api/visitor' && req.method === 'POST') {
    if (isRateLimited(clientIp, 15)) {
      return sendJson(res, 429, { error: 'Too many requests' });
    }

    const userAgent = req.headers['user-agent'] || '';
    const isBot = BOT_REGEX.test(userAgent);
    const body = await parseJsonBody(req);
    const searchParams = new URL(url, 'http://localhost').searchParams;
    const rawSid = body?.sessionId || searchParams.get('sessionId') || '';
    const sessionId = typeof rawSid === 'string' ? rawSid.trim().slice(0, 64) : '';

    const data = loadStats();

    // Clean up stale sessions older than 24 hours to prevent memory/file bloating
    const now = Date.now();
    const oneDayAgo = now - 24 * 60 * 60 * 1000;
    for (const [sid, timestamp] of Object.entries(data.visitors.sessions)) {
      if (timestamp < oneDayAgo) {
        delete data.visitors.sessions[sid];
      }
    }

    let incremented = false;
    // Disallow bots and require a valid session id
    if (!isBot && sessionId && sessionId.length >= 8) {
      if (!data.visitors.sessions[sessionId]) {
        data.visitors.sessions[sessionId] = now;
        data.visitors.totalVisits = (data.visitors.totalVisits || 0) + 1;
        incremented = true;
        saveStats(data);
      }
    }

    sendJson(res, 200, {
      success: true,
      totalVisits: data.visitors.totalVisits,
      countingUnit: data.visitors.countingUnit,
      sinceDate: data.visitors.sinceDate,
      incremented,
      action: incremented ? 'recorded' : 'already_counted'
    });
    return true;
  }

  // 4. POST /api/stats/sync-expense -> Sync newly added expense aggregate
  if (pathname === '/api/stats/sync-expense' && req.method === 'POST') {
    if (isRateLimited(clientIp, 60)) {
      return sendJson(res, 429, { error: 'Rate limit exceeded' });
    }

    const searchParams = new URL(url, 'http://localhost').searchParams;
    const body = await parseJsonBody(req);
    const data = loadStats();

    const expenseId = body?.expenseId || searchParams.get('expenseId');
    const rawAmount = body?.amount !== undefined ? body.amount : searchParams.get('amount');
    const amount = typeof rawAmount === 'number' ? rawAmount : Number(rawAmount);
    const date = body?.date || searchParams.get('date') || new Date().toISOString().slice(0, 10);
    const userIdHash = body?.userIdHash || searchParams.get('userIdHash') || '';
    const rawCreatedAt = body?.createdAt || searchParams.get('createdAt');
    const createdAt = typeof rawCreatedAt === 'number' ? rawCreatedAt : (Number(rawCreatedAt) || Date.now());

    if (!expenseId || isNaN(amount) || amount < 0) {
      return sendJson(res, 400, { error: 'Invalid expense payload' });
    }

    if (userIdHash && typeof userIdHash === 'string') {
      data.users[userIdHash.slice(0, 32)] = true;
    }

    data.expenseIds[String(expenseId).slice(0, 48)] = {
      amount: Math.min(amount, 100000),
      date: typeof date === 'string' ? date.slice(0, 10) : new Date().toISOString().slice(0, 10),
      createdAt
    };

    // Trigger asynchronous live sync with Firestore
    fetchLiveFirestoreMetrics().then(live => {
      if (live) {
        data.metrics = live;
        saveStats(data);
      }
    }).catch(() => {});

    saveStats(data);

    sendJson(res, 200, {
      success: true,
      stats: data.metrics
    });
    return true;
  }

  return false;
}
