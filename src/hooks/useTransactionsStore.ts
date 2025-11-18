import { useState, useEffect, useMemo } from "react";
import { startOfMonth, endOfMonth, isWithinInterval } from "date-fns";

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  category: string;
  type: "income" | "expense";
  date: Date;
}

const STORAGE_KEY = "financial-transactions";

const MOCK_TRANSACTIONS: Transaction[] = [
  { id: "1", description: "Salário", amount: 5000, category: "Salário", type: "income", date: new Date(2025, 0, 5) },
  { id: "2", description: "Freelance", amount: 1500, category: "Freelance", type: "income", date: new Date(2025, 0, 15) },
  { id: "3", description: "Investimentos", amount: 2000, category: "Investimentos", type: "income", date: new Date(2025, 0, 20) },
  { id: "4", description: "Mercado", amount: 450, category: "Alimentação", type: "expense", date: new Date(2025, 0, 8) },
  { id: "5", description: "Uber", amount: 120, category: "Transporte", type: "expense", date: new Date(2025, 0, 10) },
  { id: "6", description: "Aluguel", amount: 1200, category: "Moradia", type: "expense", date: new Date(2025, 0, 1) },
  { id: "7", description: "Farmácia", amount: 80, category: "Saúde", type: "expense", date: new Date(2025, 0, 12) },
  { id: "8", description: "Netflix", amount: 55, category: "Entretenimento", type: "expense", date: new Date(2025, 0, 15) },
  { id: "9", description: "Curso online", amount: 200, category: "Educação", type: "expense", date: new Date(2025, 0, 18) },
  { id: "10", description: "Roupas", amount: 350, category: "Compras", type: "expense", date: new Date(2025, 0, 22) },
  { id: "11", description: "Restaurante", amount: 180, category: "Alimentação", type: "expense", date: new Date(2025, 0, 25) },
  { id: "12", description: "Gasolina", amount: 250, category: "Transporte", type: "expense", date: new Date(2025, 0, 28) },
  // Dezembro 2024
  { id: "13", description: "Salário", amount: 5000, category: "Salário", type: "income", date: new Date(2024, 11, 5) },
  { id: "14", description: "Mercado", amount: 400, category: "Alimentação", type: "expense", date: new Date(2024, 11, 10) },
  { id: "15", description: "Aluguel", amount: 1200, category: "Moradia", type: "expense", date: new Date(2024, 11, 1) },
];

export function useTransactionsStore(selectedMonth?: Date) {
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return parsed.map((t: any) => ({ ...t, date: new Date(t.date) }));
    }
    return MOCK_TRANSACTIONS;
  });

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(transactions)
    );
  }, [transactions]);

  const filteredTransactions = useMemo(() => {
    if (!selectedMonth) return transactions;

    const start = startOfMonth(selectedMonth);
    const end = endOfMonth(selectedMonth);

    return transactions.filter((t) =>
      isWithinInterval(t.date, { start, end })
    );
  }, [transactions, selectedMonth]);

  const stats = useMemo(() => {
    const income = filteredTransactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);

    const expenses = filteredTransactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);

    const balance = income - expenses;
    const savingsRate = income > 0 ? ((balance / income) * 100).toFixed(1) : "0.0";

    return {
      balance,
      income,
      expenses,
      savings: balance,
      savingsRate: `${savingsRate}%`,
    };
  }, [filteredTransactions]);

  const addTransaction = (
    description: string,
    amount: number,
    category: string,
    type: "income" | "expense"
  ) => {
    const newTransaction: Transaction = {
      id: Date.now().toString(),
      description,
      amount,
      category,
      type,
      date: new Date(),
    };
    setTransactions((prev) => [newTransaction, ...prev]);
  };

  return {
    transactions: filteredTransactions,
    allTransactions: transactions,
    stats,
    addTransaction,
  };
}
