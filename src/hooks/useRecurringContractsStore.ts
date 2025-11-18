import { useState, useEffect } from "react";

export interface RecurringContract {
  id: string;
  description: string;
  amount: number;
  dueDay: number; // Dia do mês (1-31)
  category: string;
  type: "expense" | "income";
  active: boolean;
  startDate: Date;
}

const STORAGE_KEY = "financial-recurring-contracts";

export function useRecurringContractsStore() {
  const [contracts, setContracts] = useState<RecurringContract[]>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return parsed.map((c: any) => ({ ...c, startDate: new Date(c.startDate) }));
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(contracts));
  }, [contracts]);

  const addContract = (
    description: string,
    amount: number,
    dueDay: number,
    category: string,
    type: "expense" | "income"
  ) => {
    const newContract: RecurringContract = {
      id: Date.now().toString(),
      description,
      amount,
      dueDay,
      category,
      type,
      active: true,
      startDate: new Date(),
    };
    setContracts((prev) => [...prev, newContract]);
  };

  const toggleContract = (id: string) => {
    setContracts((prev) =>
      prev.map((c) => (c.id === id ? { ...c, active: !c.active } : c))
    );
  };

  const deleteContract = (id: string) => {
    setContracts((prev) => prev.filter((c) => c.id !== id));
  };

  const getActiveContracts = () => {
    return contracts.filter((c) => c.active);
  };

  const getMonthlyTotal = (type: "expense" | "income") => {
    return contracts
      .filter((c) => c.active && c.type === type)
      .reduce((sum, c) => sum + c.amount, 0);
  };

  return {
    contracts,
    addContract,
    toggleContract,
    deleteContract,
    getActiveContracts,
    getMonthlyTotal,
  };
}
