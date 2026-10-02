import { 
  collection, 
  getDocs, 
  addDoc, 
  deleteDoc, 
  doc, 
  query, 
  where, 
  orderBy, 
  setDoc,
  getDoc
} from "firebase/firestore";
import { getFirestoreDb } from "./firebase";
import { Expense, UserSettings } from "./types";
import { syncExpenseToStats, syncExistingLocalExpenses } from "./services/statsService";
const LOCAL_EXPENSES_KEY = "daily_auto_expenses_local";
const LOCAL_SETTINGS_KEY = "daily_auto_settings_local";
function getLocalExpenses(userId: string): Expense[] {
  try {
    const raw = localStorage.getItem(LOCAL_EXPENSES_KEY);
    if (!raw) return [];
    const all = JSON.parse(raw) as Expense[];
    return all.filter(e => e.userId === userId);
  } catch (e) {
    console.error("Failed to parse local expenses:", e);
    return [];
  }
}
function saveLocalExpenses(userId: string, expenses: Expense[]): void {
  try {
    const raw = localStorage.getItem(LOCAL_EXPENSES_KEY);
    let all: Expense[] = [];
    if (raw) {
      all = JSON.parse(raw) as Expense[];
      all = all.filter(e => e.userId !== userId);
    }
    all.push(...expenses);
    localStorage.setItem(LOCAL_EXPENSES_KEY, JSON.stringify(all));
  } catch (e) {
    console.error("Failed to save local expenses:", e);
  }
}

export async function fetchExpenses(userId: string): Promise<Expense[]> {
  try {
    const db = getFirestoreDb();
    const expensesCol = collection(db, "expenses");
    const q = query(
      expensesCol, 
      where("userId", "==", userId),
      orderBy("date", "desc"),
      orderBy("createdAt", "desc")
    );
    const querySnapshot = await getDocs(q);
    
    const expenses: Expense[] = [];
    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      expenses.push({
        id: docSnap.id,
        userId: data.userId,
        amount: data.amount,
        route: data.route,
        date: data.date,
        createdAt: data.createdAt,
      });
    });
    saveLocalExpenses(userId, expenses);
    syncExistingLocalExpenses(userId, expenses);
    return expenses;
  } catch (error) {
    console.warn("Firestore fetch error, falling back to localStorage:", error);
    const local = getLocalExpenses(userId);
    syncExistingLocalExpenses(userId, local);
    return local;
  }
}

export async function addExpense(
  userId: string,
  amount: number,
  route: string,
  date: string
): Promise<Expense> {
  const newExpenseData = {
    userId,
    amount,
    route,
    date,
    createdAt: Date.now(),
  };

  try {
    const db = getFirestoreDb();
    const expensesCol = collection(db, "expenses");
    const docRef = await addDoc(expensesCol, newExpenseData);
    
    const newExpense: Expense = {
      id: docRef.id,
      ...newExpenseData
    };
    const currentLocal = getLocalExpenses(userId);
    saveLocalExpenses(userId, [newExpense, ...currentLocal]);

    syncExpenseToStats({
      userIdHash: userId,
      expenseId: newExpense.id,
      amount: newExpense.amount,
      date: newExpense.date,
      createdAt: newExpense.createdAt
    });

    return newExpense;
  } catch (error) {
    console.warn("Firestore write error, falling back to localStorage:", error);
    const mockId = `local_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newExpense: Expense = {
      id: mockId,
      ...newExpenseData
    };
    const currentLocal = getLocalExpenses(userId);
    saveLocalExpenses(userId, [newExpense, ...currentLocal]);

    syncExpenseToStats({
      userIdHash: userId,
      expenseId: newExpense.id,
      amount: newExpense.amount,
      date: newExpense.date,
      createdAt: newExpense.createdAt
    });

    return newExpense;
  }
}

export async function deleteExpense(userId: string, expenseId: string): Promise<void> {
  try {
    if (expenseId.startsWith("local_")) {
      const currentLocal = getLocalExpenses(userId);
      const filtered = currentLocal.filter(e => e.id !== expenseId);
      saveLocalExpenses(userId, filtered);
      return;
    }

    const db = getFirestoreDb();
    const docRef = doc(db, "expenses", expenseId);
    await deleteDoc(docRef);
    const currentLocal = getLocalExpenses(userId);
    const filtered = currentLocal.filter(e => e.id !== expenseId);
    saveLocalExpenses(userId, filtered);
  } catch (error) {
    console.warn("Firestore delete error, falling back to localStorage:", error);
    const currentLocal = getLocalExpenses(userId);
    const filtered = currentLocal.filter(e => e.id !== expenseId);
    saveLocalExpenses(userId, filtered);
  }
}

export async function fetchUserSettings(userId: string): Promise<UserSettings> {
  const defaultSettings: UserSettings = {
    userId,
    monthlyBudget: 2000,
    defaultFare: "25",
    defaultRoute: "College → Home",
    autoFillEnabled: false
  };

  try {
    const db = getFirestoreDb();
    const docRef = doc(db, "settings", userId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      const settings: UserSettings = {
        userId,
        monthlyBudget: Number(data.monthlyBudget) || 2000,
        defaultFare: data.defaultFare ?? "25",
        defaultRoute: data.defaultRoute ?? "College → Home",
        autoFillEnabled: data.autoFillEnabled ?? false
      };
      localStorage.setItem(`${LOCAL_SETTINGS_KEY}_${userId}`, JSON.stringify(settings));
      return settings;
    } else {
      localStorage.setItem(`${LOCAL_SETTINGS_KEY}_${userId}`, JSON.stringify(defaultSettings));
      return defaultSettings;
    }
  } catch (error) {
    console.warn("Firestore fetch settings error, falling back to localStorage:", error);
    const cached = localStorage.getItem(`${LOCAL_SETTINGS_KEY}_${userId}`);
    if (cached) {
      try {
        return { ...defaultSettings, ...JSON.parse(cached) };
      } catch (e) {
        return defaultSettings;
      }
    }
    const legacyBudget = localStorage.getItem(`daily_auto_budget_local_${userId}`);
    if (legacyBudget) {
      return { ...defaultSettings, monthlyBudget: Number(legacyBudget) || 2000 };
    }

    return defaultSettings;
  }
}

export async function saveUserSettings(userId: string, settings: UserSettings): Promise<void> {
  try {
    const db = getFirestoreDb();
    const docRef = doc(db, "settings", userId);
    await setDoc(docRef, { 
      monthlyBudget: settings.monthlyBudget,
      defaultFare: settings.defaultFare,
      defaultRoute: settings.defaultRoute,
      autoFillEnabled: settings.autoFillEnabled
    }, { merge: true });
    localStorage.setItem(`${LOCAL_SETTINGS_KEY}_${userId}`, JSON.stringify(settings));
  } catch (error) {
    console.warn("Firestore save settings error, falling back to localStorage:", error);
    localStorage.setItem(`${LOCAL_SETTINGS_KEY}_${userId}`, JSON.stringify(settings));
  }
}
