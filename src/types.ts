export interface Expense {
  id: string;
  userId: string;
  amount: number;
  route: string;
  date: string; // YYYY-MM-DD
  createdAt: number; // timestamp
}

export interface UserSettings {
  userId: string;
  monthlyBudget: number;
}
