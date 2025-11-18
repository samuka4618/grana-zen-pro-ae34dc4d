import { useState, useEffect, useMemo } from "react";
import { addMonths, isBefore, isAfter, startOfMonth, endOfMonth, isWithinInterval } from "date-fns";

export interface Installment {
  id: string;
  description: string;
  totalAmount: number;
  installmentCount: number;
  currentInstallment: number;
  installmentAmount: number;
  startDate: Date;
  category: string;
  type: "expense" | "income";
}

const STORAGE_KEY = "financial-installments";

export function useInstallmentsStore() {
  const [installments, setInstallments] = useState<Installment[]>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return parsed.map((i: any) => ({ ...i, startDate: new Date(i.startDate) }));
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(installments));
  }, [installments]);

  const addInstallment = (
    description: string,
    totalAmount: number,
    installmentCount: number,
    startDate: Date,
    category: string,
    type: "expense" | "income"
  ) => {
    const installmentAmount = totalAmount / installmentCount;
    const newInstallment: Installment = {
      id: Date.now().toString(),
      description,
      totalAmount,
      installmentCount,
      currentInstallment: 1,
      installmentAmount,
      startDate,
      category,
      type,
    };
    setInstallments((prev) => [...prev, newInstallment]);
  };

  const deleteInstallment = (id: string) => {
    setInstallments((prev) => prev.filter((i) => i.id !== id));
  };

  const getActiveInstallments = () => {
    return installments.filter(
      (i) => i.currentInstallment <= i.installmentCount
    );
  };

  const getInstallmentsForMonth = (month: Date) => {
    const start = startOfMonth(month);
    const end = endOfMonth(month);

    return installments.filter((installment) => {
      // Calculate which months this installment spans
      for (let i = 0; i < installment.installmentCount; i++) {
        const installmentDate = addMonths(installment.startDate, i);
        if (isWithinInterval(installmentDate, { start, end })) {
          return true;
        }
      }
      return false;
    });
  };

  const getProjection = (monthsAhead: number, currentMonth: Date) => {
    const projections = [];

    for (let i = 0; i <= monthsAhead; i++) {
      const targetMonth = addMonths(currentMonth, i);
      const monthInstallments = getInstallmentsForMonth(targetMonth);

      const totalExpenses = monthInstallments
        .filter((inst) => inst.type === "expense")
        .reduce((sum, inst) => sum + inst.installmentAmount, 0);

      const totalIncome = monthInstallments
        .filter((inst) => inst.type === "income")
        .reduce((sum, inst) => sum + inst.installmentAmount, 0);

      projections.push({
        month: targetMonth,
        expenses: totalExpenses,
        income: totalIncome,
        balance: totalIncome - totalExpenses,
        installments: monthInstallments,
      });
    }

    return projections;
  };

  return {
    installments,
    addInstallment,
    deleteInstallment,
    getActiveInstallments,
    getInstallmentsForMonth,
    getProjection,
  };
}
