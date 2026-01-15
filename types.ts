export type AccountType = 'wallet' | 'bank' | 'investment';
export type AccountRole = 'spending' | 'reserve';

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  role: AccountRole;
  color: string;
  balance: number;
}

export type TransactionType = 'income' | 'expense' | 'transfer';

export interface Transaction {
  id: string;
  accountId: string;
  type: TransactionType;
  amount: number;
  category: string;
  date: string; // ISO string
  description: string;
  relatedAccountId?: string; // For transfers
}

export interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string; // ISO string
  linkedReserveAccountId?: string;
}

export type DebtStatus = 'pending' | 'paid' | 'overdue';

export interface Debt {
  id: string;
  name: string;
  totalAmount: number;
  dueDate: string; // ISO string
  status: DebtStatus;
  installments?: number;
}

// Helper types for Context
export interface FinanceContextData {
  accounts: Account[];
  transactions: Transaction[];
  goals: Goal[];
  debts: Debt[];
  
  // Actions
  addAccount: (account: Omit<Account, 'id' | 'balance'> & { balance: number }) => void;
  deleteAccount: (id: string) => void;
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  deleteTransaction: (id: string) => void;
  addGoal: (goal: Omit<Goal, 'id' | 'currentAmount'>) => void;
  updateGoal: (id: string, currentAmount: number) => void;
  deleteGoal: (id: string) => void;
  addDebt: (debt: Omit<Debt, 'id' | 'status'>) => void;
  payDebt: (debtId: string, accountId: string) => void;
  deleteDebt: (id: string) => void;
  
  // Getters
  getSpendingBalance: () => number;
  getReserveBalance: () => number;
  getMonthlyCashflow: (month: Date) => { income: number; expense: number; balance: number };
}
