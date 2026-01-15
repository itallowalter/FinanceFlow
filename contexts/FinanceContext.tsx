import React, { createContext, useContext, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { isSameMonth, isPast, isToday, endOfMonth, eachDayOfInterval, format, isSameDay } from 'date-fns';
import usePersistedState from '../hooks/usePersistedState';
import { Account, Transaction, Goal, Debt, FinanceContextData } from '../types';

// Extended interface for new helpers
interface ExtendedFinanceContextData extends FinanceContextData {
  getDailyCashflow: (month: Date) => { day: string; income: number; expense: number }[];
  getExpensesByCategory: (month: Date) => { name: string; value: number; color: string }[];
}

const FinanceContext = createContext<ExtendedFinanceContextData>({} as ExtendedFinanceContextData);

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [accounts, setAccounts] = usePersistedState<Account[]>('@finance:accounts', []);
  const [transactions, setTransactions] = usePersistedState<Transaction[]>('@finance:transactions', []);
  const [goals, setGoals] = usePersistedState<Goal[]>('@finance:goals', []);
  const [debts, setDebts] = usePersistedState<Debt[]>('@finance:debts', []);

  // --- Actions ---

  const addAccount = useCallback((newAccount: Omit<Account, 'id' | 'balance'> & { balance: number }) => {
    const account: Account = {
      id: uuidv4(),
      ...newAccount,
    };
    setAccounts(prev => [...prev, account]);
  }, [setAccounts]);

  const deleteAccount = useCallback((id: string) => {
    setAccounts(prev => prev.filter(acc => acc.id !== id));
  }, [setAccounts]);

  const addTransaction = useCallback((newTx: Omit<Transaction, 'id'>) => {
    const transaction: Transaction = {
      id: uuidv4(),
      ...newTx,
    };

    setTransactions(prev => [transaction, ...prev]);

    // Atomic Balance Updates
    setAccounts(prevAccounts => {
      return prevAccounts.map(acc => {
        if (newTx.type === 'income' && acc.id === newTx.accountId) {
          return { ...acc, balance: acc.balance + newTx.amount };
        }
        if (newTx.type === 'expense' && acc.id === newTx.accountId) {
          return { ...acc, balance: acc.balance - newTx.amount };
        }
        if (newTx.type === 'transfer') {
          if (acc.id === newTx.accountId) {
            // Source account (Sending money out)
            return { ...acc, balance: acc.balance - newTx.amount };
          }
          if (acc.id === newTx.relatedAccountId) {
            // Destination account (Receiving money)
            return { ...acc, balance: acc.balance + newTx.amount };
          }
        }
        return acc;
      });
    });

    if (newTx.type === 'transfer' && newTx.relatedAccountId) {
        setGoals(prevGoals => prevGoals.map(goal => {
            if (goal.linkedReserveAccountId === newTx.relatedAccountId) {
                return { ...goal, currentAmount: goal.currentAmount + newTx.amount };
            }
            return goal;
        }));
    }

  }, [setAccounts, setTransactions, setGoals]);

  const deleteTransaction = useCallback((id: string) => {
    const tx = transactions.find(t => t.id === id);
    if (!tx) return;

    setTransactions(prev => prev.filter(t => t.id !== id));

    // Revert Balance
    setAccounts(prevAccounts => {
      return prevAccounts.map(acc => {
        if (tx.type === 'income' && acc.id === tx.accountId) {
          return { ...acc, balance: acc.balance - tx.amount };
        }
        if (tx.type === 'expense' && acc.id === tx.accountId) {
          return { ...acc, balance: acc.balance + tx.amount };
        }
        if (tx.type === 'transfer') {
          if (acc.id === tx.accountId) {
            return { ...acc, balance: acc.balance + tx.amount };
          }
          if (acc.id === tx.relatedAccountId) {
            return { ...acc, balance: acc.balance - tx.amount };
          }
        }
        return acc;
      });
    });
  }, [transactions, setAccounts, setTransactions]);

  const addGoal = useCallback((newGoal: Omit<Goal, 'id' | 'currentAmount'>) => {
    let initialAmount = 0;
    if (newGoal.linkedReserveAccountId) {
        const linkedAccount = accounts.find(a => a.id === newGoal.linkedReserveAccountId);
        if (linkedAccount) initialAmount = linkedAccount.balance;
    }

    setGoals(prev => [...prev, { id: uuidv4(), currentAmount: initialAmount, ...newGoal }]);
  }, [setGoals, accounts]);

  const updateGoal = useCallback((id: string, amount: number) => {
    setGoals(prev => prev.map(g => g.id === id ? { ...g, currentAmount: amount } : g));
  }, [setGoals]);

  const deleteGoal = useCallback((id: string) => {
    setGoals(prev => prev.filter(g => g.id !== id));
  }, [setGoals]);

  const addDebt = useCallback((newDebt: Omit<Debt, 'id' | 'status'>) => {
    setDebts(prev => [...prev, { id: uuidv4(), status: 'pending', ...newDebt }]);
  }, [setDebts]);

  const payDebt = useCallback((debtId: string, accountId: string) => {
    const debt = debts.find(d => d.id === debtId);
    if (!debt || debt.status === 'paid') return;

    addTransaction({
      accountId,
      type: 'expense',
      amount: debt.totalAmount,
      category: 'Dívidas',
      date: new Date().toISOString(),
      description: `Pagamento: ${debt.name}`,
    });

    setDebts(prev => prev.map(d => d.id === debtId ? { ...d, status: 'paid' } : d));
  }, [debts, addTransaction, setDebts]);

  const deleteDebt = useCallback((id: string) => {
    setDebts(prev => prev.filter(d => d.id !== id));
  }, [setDebts]);

  // --- Getters ---

  const getSpendingBalance = useCallback(() => {
    return accounts
      .filter(acc => acc.role === 'spending')
      .reduce((acc, curr) => acc + curr.balance, 0);
  }, [accounts]);

  const getReserveBalance = useCallback(() => {
    return accounts
      .filter(acc => acc.role === 'reserve')
      .reduce((acc, curr) => acc + curr.balance, 0);
  }, [accounts]);

  const getMonthlyCashflow = useCallback((date: Date) => {
    const txs = transactions.filter(t => 
      isSameMonth(new Date(t.date), date) && t.type !== 'transfer'
    );

    const income = txs
      .filter(t => t.type === 'income')
      .reduce((acc, curr) => acc + curr.amount, 0);
    
    const expense = txs
      .filter(t => t.type === 'expense')
      .reduce((acc, curr) => acc + curr.amount, 0);

    return { income, expense, balance: income - expense };
  }, [transactions]);

  // Chart Data: Daily Cashflow for Bar Chart
  const getDailyCashflow = useCallback((month: Date) => {
    const start = new Date(month.getFullYear(), month.getMonth(), 1);
    const end = endOfMonth(month);
    const days = eachDayOfInterval({ start, end });

    return days.map(day => {
      const dayTxs = transactions.filter(t => 
        isSameDay(new Date(t.date), day) && t.type !== 'transfer'
      );

      const income = dayTxs
        .filter(t => t.type === 'income')
        .reduce((acc, curr) => acc + curr.amount, 0);

      const expense = dayTxs
        .filter(t => t.type === 'expense')
        .reduce((acc, curr) => acc + curr.amount, 0);

      return {
        day: format(day, 'dd'),
        income,
        expense
      };
    });
  }, [transactions]);

  // Chart Data: Expenses by Category for Pie Chart
  const getExpensesByCategory = useCallback((month: Date) => {
    const txs = transactions.filter(t => 
      isSameMonth(new Date(t.date), month) && t.type === 'expense'
    );

    const categories: Record<string, number> = {};
    txs.forEach(tx => {
      categories[tx.category] = (categories[tx.category] || 0) + tx.amount;
    });

    const colors = ['#a855f7', '#ec4899', '#f43f5e', '#f59e0b', '#10b981', '#3b82f6', '#6366f1'];
    
    return Object.entries(categories).map(([name, value], index) => ({
      name,
      value,
      color: colors[index % colors.length]
    })).sort((a, b) => b.value - a.value);
  }, [transactions]);

  // Check Debt Statuses on Load/Change
  React.useEffect(() => {
    setDebts(prevDebts => prevDebts.map(debt => {
        if (debt.status === 'paid') return debt;
        
        const due = new Date(debt.dueDate);

        if (isPast(due) && !isToday(due)) {
            return { ...debt, status: 'overdue' };
        }
        return debt;
    }));
  }, [setDebts]);


  return (
    <FinanceContext.Provider value={{
      accounts,
      transactions,
      goals,
      debts,
      addAccount,
      deleteAccount,
      addTransaction,
      deleteTransaction,
      addGoal,
      updateGoal,
      deleteGoal,
      addDebt,
      payDebt,
      deleteDebt,
      getSpendingBalance,
      getReserveBalance,
      getMonthlyCashflow,
      getDailyCashflow,
      getExpensesByCategory
    }}>
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => useContext(FinanceContext);