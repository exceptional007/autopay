import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
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

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

const DATA_DIR = path.resolve(__dirname, 'data');
const STATS_FILE = path.join(DATA_DIR, 'site_stats.json');

let lastDatabaseSyncTime = 0;
const DB_SYNC_INTERVAL = 45000;

async function fetchLiveFirestoreMetrics() {
  try {
    const configPath = path.resolve(__dirname, 'firebase-applet-config.json');
    if (!fs.existsSync(configPath)) return null;
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

    const fbApp = getApps().length === 0 ? initializeApp(config) : getApp();
    const auth = getAuth(fbApp);
    const db = getFirestore(fbApp);

    if (!auth.currentUser) {
      try {
        await signInWithEmailAndPassword(auth, 'stats-auditor@autopay.dev', 'AutoPay2026!Audit');
      } catch (err) {
        console.warn('[Server] Firestore auth failed:', err.code, err.message);
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

    return {
      totalUsers: userCountSnap.data().count,
      totalExpenseRecords: expenseCountSnap.data().count,
      totalExpensesAmount: Math.round(expenseSumSnap.data().totalAmount || 0),
      recordsThisMonth: monthCountSnap.data().count,
      recordsLast30Days: thirtyDaySnap.data().count,
      currency: 'INR',
      timezone: 'Asia/Kolkata',
      lastUpdated: new Date().toISOString(),
      source: 'firestore_live_aggregates'
    };
  } catch (err) {
    console.warn('[Server] Firestore live fetch error:', err.message);
    return null;
  }
}

function getCurrentMonthPrefix() {
  const now = new Date();
  const options = { timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit' };
  const formatter = new Intl.DateTimeFormat('en-CA', options);
  return formatter.format(now).slice(0, 7);
}

function getDefaultStats() {
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
      lastUpdated: new Date().toISOString()
    },
    users: {},
    expenseIds: {}
  };
}

let cachedStats = null;

function loadStats() {
  if (cachedStats) return cachedStats;
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(STATS_FILE)) {
      cachedStats = JSON.parse(fs.readFileSync(STATS_FILE, 'utf-8'));
      return cachedStats;
    }
  } catch (e) {
    console.error('[Server] Stats read error:', e);
  }
  cachedStats = getDefaultStats();
  saveStats(cachedStats);
  return cachedStats;
}

function saveStats(data) {
  cachedStats = data;
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    const tmp = `${STATS_FILE}.tmp.${Date.now()}`;
    fs.writeFileSync(tmp, JSON.stringify(data, null, 2), 'utf-8');
    fs.renameSync(tmp, STATS_FILE);
  } catch (e) {
    console.error('[Server] Stats write error:', e);
  }
}

function recalculateMetrics(data) {
  const currentMonth = getCurrentMonthPrefix();
  const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;

  let totalAmount = 0;
  let recordsThisMonth = 0;
  let recordsLast30Days = 0;
  const expenseEntries = Object.values(data.expenseIds || {});

  for (const exp of expenseEntries) {
    totalAmount += exp.amount;
    if (exp.date && exp.date.startsWith(currentMonth)) {
      recordsThisMonth++;
    }
    if (exp.createdAt >= thirtyDaysAgo) {
      recordsLast30Days++;
    }
  }

  data.metrics = {
    totalUsers: Object.keys(data.users || {}).length,
    totalExpenseRecords: expenseEntries.length,
    totalExpensesAmount: Math.round(totalAmount),
    recordsThisMonth,
    recordsLast30Days,
    currency: 'INR',
    timezone: 'Asia/Kolkata',
    lastUpdated: new Date().toISOString()
  };
}

const BOT_REGEX = /bot|spider|crawl|slurp|lighthouse|headless|curl|wget|python|postman/i;

// 1. GET /api/stats
app.get('/api/stats', async (req, res) => {
  const data = loadStats();
  const now = Date.now();

  if (now - lastDatabaseSyncTime > DB_SYNC_INTERVAL || data.metrics.totalExpenseRecords === 0) {
    const liveMetrics = await fetchLiveFirestoreMetrics();
    if (liveMetrics) {
      data.metrics = liveMetrics;
      lastDatabaseSyncTime = now;
      saveStats(data);
    }
  }

  res.setHeader('Cache-Control', 'public, max-age=30, s-maxage=30');
  res.json({
    success: true,
    stats: data.metrics,
    boundaries: {
      currentMonth: getCurrentMonthPrefix(),
      timezone: 'Asia/Kolkata (IST)',
      currency: 'INR (₹)',
      note: 'Derived strictly from authentic recorded trip data in Firestore. Personal identifiers, locations, and individual logs are excluded from public statistics.'
    }
  });
});

// 2. GET /api/visitor
app.get('/api/visitor', (req, res) => {
  const data = loadStats();
  res.setHeader('Cache-Control', 'public, max-age=15, s-maxage=15');
  res.json({
    success: true,
    totalVisits: data.visitors.totalVisits,
    countingUnit: data.visitors.countingUnit,
    sinceDate: data.visitors.sinceDate,
    action: 'read'
  });
});

// 3. POST /api/visitor
app.post('/api/visitor', (req, res) => {
  const userAgent = req.headers['user-agent'] || '';
  const isBot = BOT_REGEX.test(userAgent);
  const sessionId = req.body?.sessionId || req.query?.sessionId;

  const data = loadStats();
  const now = Date.now();
  const oneDayAgo = now - 24 * 60 * 60 * 1000;

  for (const [sid, timestamp] of Object.entries(data.visitors.sessions)) {
    if (timestamp < oneDayAgo) {
      delete data.visitors.sessions[sid];
    }
  }

  let incremented = false;
  if (!isBot && sessionId && typeof sessionId === 'string' && sessionId.length >= 8) {
    if (!data.visitors.sessions[sessionId]) {
      data.visitors.sessions[sessionId] = now;
      data.visitors.totalVisits = (data.visitors.totalVisits || 0) + 1;
      incremented = true;
      saveStats(data);
    }
  }

  res.json({
    success: true,
    totalVisits: data.visitors.totalVisits,
    countingUnit: data.visitors.countingUnit,
    sinceDate: data.visitors.sinceDate,
    incremented,
    action: incremented ? 'recorded' : 'already_counted'
  });
});

// 4. POST /api/stats/sync-expense
app.post('/api/stats/sync-expense', (req, res) => {
  const data = loadStats();
  const body = req.body;

  if (Array.isArray(body?.expenses)) {
    if (body.userIdHash && typeof body.userIdHash === 'string') {
      data.users[body.userIdHash.slice(0, 32)] = true;
    }
    for (const item of body.expenses) {
      if (item.expenseId && typeof item.amount === 'number' && item.amount >= 0) {
        data.expenseIds[String(item.expenseId).slice(0, 48)] = {
          amount: Math.min(item.amount, 100000),
          date: typeof item.date === 'string' ? item.date.slice(0, 10) : new Date().toISOString().slice(0, 10),
          createdAt: typeof item.createdAt === 'number' ? item.createdAt : Date.now()
        };
      }
    }
    recalculateMetrics(data);
    saveStats(data);
    return res.json({ success: true, stats: data.metrics });
  }

  const expenseId = body?.expenseId || req.query?.expenseId;
  const amount = Number(body?.amount !== undefined ? body.amount : req.query?.amount);
  const date = body?.date || req.query?.date || new Date().toISOString().slice(0, 10);
  const userIdHash = body?.userIdHash || req.query?.userIdHash || '';
  const createdAt = Number(body?.createdAt || req.query?.createdAt) || Date.now();

  if (!expenseId || isNaN(amount) || amount < 0) {
    return res.status(400).json({ error: 'Invalid expense payload' });
  }

  if (userIdHash) {
    data.users[String(userIdHash).slice(0, 32)] = true;
  }

  data.expenseIds[String(expenseId).slice(0, 48)] = {
    amount: Math.min(amount, 100000),
    date: String(date).slice(0, 10),
    createdAt
  };

  recalculateMetrics(data);
  saveStats(data);

  res.json({ success: true, stats: data.metrics });
});

// Serve frontend static build
app.use(express.static(path.join(__dirname, 'dist')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`AutoPay production server running on http://0.0.0.0:${PORT}`);
});
