import { createRequire } from 'module';
const require = createRequire("C:/Users/PRADEEP/AppData/Local/npm-cache/_npx/702923228c2ce1e6/node_modules/dummy.js");
const puppeteer = require('puppeteer-core');
import fs from 'fs';
import path from 'path';

const OUT_DIR = 'brag-output-2026-10-04-102500/composition/assets';

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  console.log("Launching Chrome...");
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 1 });

  // 1. Landing Page Thermal Receipt & Hero
  console.log("Navigating to Landing Page...");
  await page.goto('http://localhost:3000/?view=landing', { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => {
    localStorage.setItem('theme', 'light');
    document.documentElement.classList.remove('dark');
  });
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: path.join(OUT_DIR, 'real-landing-hero.png') });
  console.log("Saved real-landing-hero.png");

  // Inject Seed Commute Data into LocalStorage for TrackerView
  console.log("Seeding realistic commute expenses...");
  await page.goto('http://localhost:3000/app', { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => {
    const userId = "demo_commuter_2026";
    localStorage.setItem("theme", "light");
    document.documentElement.classList.remove("dark");
    localStorage.setItem("daily_auto_expense_user_id", userId);

    const now = new Date();
    const dStr = (offsetDays) => {
      const d = new Date(now);
      d.setDate(d.getDate() - offsetDays);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${day}`;
    };

    const seedExpenses = [
      { id: "e1", userId, amount: 40, route: "Morning Chai & Bun", date: dStr(0), createdAt: Date.now() - 3600000 },
      { id: "e2", userId, amount: 120, route: "Auto: Station → Campus", date: dStr(0), createdAt: Date.now() - 7200000 },
      { id: "e3", userId, amount: 145, route: "UPI: Canteen Lunch Split", date: dStr(0), createdAt: Date.now() - 14400000 },
      { id: "e4", userId, amount: 80, route: "Auto: Return Leg (Home)", date: dStr(1), createdAt: Date.now() - 86400000 },
      { id: "e5", userId, amount: 25, route: "College → Home", date: dStr(1), createdAt: Date.now() - 90000000 },
      { id: "e6", userId, amount: 40, route: "Shared Auto (Station)", date: dStr(2), createdAt: Date.now() - 172800000 },
      { id: "e7", userId, amount: 50, route: "Campus Metro", date: dStr(3), createdAt: Date.now() - 259200000 },
      { id: "e8", userId, amount: 25, route: "Home to College", date: dStr(4), createdAt: Date.now() - 345600000 },
      { id: "e9", userId, amount: 25, route: "College to Home", date: dStr(5), createdAt: Date.now() - 432000000 },
      { id: "e10", userId, amount: 120, route: "Auto: Station → Campus", date: dStr(6), createdAt: Date.now() - 518400000 },
      { id: "e11", userId, amount: 750, route: "Monthly Metro SmartCard Reload", date: dStr(7), createdAt: Date.now() - 604800000 }
    ];

    localStorage.setItem("daily_auto_expenses_local", JSON.stringify(seedExpenses));
    localStorage.setItem("daily_auto_settings_local", JSON.stringify([{
      userId,
      monthlyBudget: 2000,
      defaultFare: "25",
      defaultRoute: "College → Home",
      autoFillEnabled: true
    }]));
  });

  // 2. Real Dashboard Tab
  console.log("Capturing Dashboard Tab...");
  await page.goto('http://localhost:3000/app?tab=dashboard', { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: path.join(OUT_DIR, 'real-dashboard.png') });
  console.log("Saved real-dashboard.png");

  // 3. Quick Log Modal Tab
  console.log("Capturing Quick Log Modal...");
  await page.goto('http://localhost:3000/app?action=quick-add', { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 1200));
  await page.screenshot({ path: path.join(OUT_DIR, 'real-entry-modal.png') });
  console.log("Saved real-entry-modal.png");

  // 4. Real History Tab
  console.log("Capturing History Tab...");
  await page.goto('http://localhost:3000/app?tab=history', { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 1200));
  await page.screenshot({ path: path.join(OUT_DIR, 'real-history.png') });
  console.log("Saved real-history.png");

  // 5. Real Analytics Tab
  console.log("Capturing Analytics Tab...");
  await page.goto('http://localhost:3000/app?tab=analytics', { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 1200));
  await page.screenshot({ path: path.join(OUT_DIR, 'real-analytics.png') });
  console.log("Saved real-analytics.png");

  // 6. Real Portal Tab
  console.log("Capturing Portal Tab...");
  await page.goto('http://localhost:3000/app?tab=portal', { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 1200));
  await page.screenshot({ path: path.join(OUT_DIR, 'real-portal.png') });
  console.log("Saved real-portal.png");

  await browser.close();
  console.log("All screenshots captured successfully!");
}

main().catch(err => {
  console.error("Error capturing screenshots:", err);
  process.exit(1);
});
