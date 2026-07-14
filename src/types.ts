export interface Expense {
  id: string;
  userId: string;
  amount: number;
  route: string;
  date: string;
  createdAt: number;
}

export interface UserSettings {
  userId: string;
  monthlyBudget: number;
  defaultFare?: string;
  defaultRoute?: string;
  autoFillEnabled?: boolean;
}
