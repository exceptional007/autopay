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
import { Expense } from "./types";

// Local Storage keys for offline/fallback mode
const LOCAL_EXPENSES_KEY = "daily_auto_expenses_local";
const LOCAL_BUDGET_KEY = "daily_auto_budget_local";

// Helper: load local expenses
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

// Helper: save to local storage
function saveLocalExpenses(userId: string, expenses: Expense[]): void {
  try {
    const raw = localStorage.getItem(LOCAL_EXPENSES_KEY);
    let all: Expense[] = [];
    if (raw) {
      // Merge with existing expenses for other users
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

    // Cache locally
    saveLocalExpenses(userId, expenses);
    return expenses;
  } catch (error) {
    console.warn("Firestore fetch error, falling back to localStorage:", error);
    return getLocalExpenses(userId);
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

    // Update local cache
    const currentLocal = getLocalExpenses(userId);
    saveLocalExpenses(userId, [newExpense, ...currentLocal]);

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
    return newExpense;
  }
}

export async function deleteExpense(userId: string, expenseId: string): Promise<void> {
  try {
    // If it's a local expense, just remove from local storage
    if (expenseId.startsWith("local_")) {
      const currentLocal = getLocalExpenses(userId);
      const filtered = currentLocal.filter(e => e.id !== expenseId);
      saveLocalExpenses(userId, filtered);
      return;
    }

    const db = getFirestoreDb();
    const docRef = doc(db, "expenses", expenseId);
    await deleteDoc(docRef);

    // Update local cache
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

export async function fetchMonthlyBudget(userId: string): Promise<number> {
  try {
    const db = getFirestoreDb();
    const docRef = doc(db, "settings", userId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      const budget = Number(data.monthlyBudget) || 2000;
      localStorage.setItem(`${LOCAL_BUDGET_KEY}_${userId}`, budget.toString());
      return budget;
    } else {
      // Default is 2000
      localStorage.setItem(`${LOCAL_BUDGET_KEY}_${userId}`, "2000");
      return 2000;
    }
  } catch (error) {
    console.warn("Firestore fetch budget error, falling back to localStorage:", error);
    const cached = localStorage.getItem(`${LOCAL_BUDGET_KEY}_${userId}`);
    return cached ? Number(cached) : 2000;
  }
}

export async function saveMonthlyBudget(userId: string, budget: number): Promise<void> {
  try {
    const db = getFirestoreDb();
    const docRef = doc(db, "settings", userId);
    await setDoc(docRef, { monthlyBudget: budget }, { merge: true });
    localStorage.setItem(`${LOCAL_BUDGET_KEY}_${userId}`, budget.toString());
  } catch (error) {
    console.warn("Firestore save budget error, falling back to localStorage:", error);
    localStorage.setItem(`${LOCAL_BUDGET_KEY}_${userId}`, budget.toString());
  }
}
