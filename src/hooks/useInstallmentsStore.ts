import { useState, useEffect } from "react";
import { addMonths, startOfMonth, endOfMonth, isWithinInterval, differenceInMonths } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

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

export function useInstallmentsStore() {
  const { user } = useAuth();
  const [installments, setInstallments] = useState<Installment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchInstallments();
    }
  }, [user]);

  /**
   * Calcula a parcela atual baseada na data de início e na data atual
   * @param startDate - Data de início do financiamento
   * @param totalInstallments - Total de parcelas
   * @returns Número da parcela atual (1-indexed)
   */
  const calculateCurrentInstallment = (startDate: Date, totalInstallments: number): number => {
    const now = new Date();
    const start = startOfMonth(startDate);
    const current = startOfMonth(now);
    
    // Calcula a diferença em meses
    const monthsDiff = differenceInMonths(current, start);
    
    // A parcela atual é a diferença + 1 (se começou há 1 mês, está na parcela 2)
    // Mas não pode ser maior que o total de parcelas
    const currentInstallment = Math.min(monthsDiff + 1, totalInstallments);
    
    // Não pode ser menor que 1
    return Math.max(1, currentInstallment);
  };

  const fetchInstallments = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from("installments")
        .select("*")
        .eq("user_id", user.id);

      if (error) throw error;

      if (data) {
        setInstallments(data.map(i => {
          const startDate = new Date(i.start_date);
          const calculatedCurrentInstallment = calculateCurrentInstallment(
            startDate,
            i.installment_count
          );
          
          return {
            id: i.id,
            description: i.description,
            totalAmount: Number(i.total_amount),
            installmentCount: i.installment_count,
            currentInstallment: calculatedCurrentInstallment,
            installmentAmount: Number(i.installment_amount),
            startDate: startDate,
            category: i.category,
            type: i.type as "expense" | "income",
          };
        }));
      }
    } catch (error) {
      console.error("Error fetching installments:", error);
      toast.error("Erro ao carregar parcelas");
    } finally {
      setLoading(false);
    }
  };

  const addInstallment = async (
    description: string,
    totalAmount: number,
    installmentCount: number,
    startDate: Date,
    category: string,
    type: "expense" | "income"
  ) => {
    if (!user) return;

    const installmentAmount = totalAmount / installmentCount;

    try {
      const { data, error } = await supabase
        .from("installments")
        .insert([{
          description,
          total_amount: totalAmount,
          installment_count: installmentCount,
          installment_amount: installmentAmount,
          start_date: startDate.toISOString(),
          category,
          type,
          user_id: user.id,
        }])
        .select()
        .single();

      if (error) throw error;
      
      if (data) {
        const startDate = new Date(data.start_date);
        const calculatedCurrentInstallment = calculateCurrentInstallment(
          startDate,
          data.installment_count
        );
        
        setInstallments((prev) => [...prev, {
          id: data.id,
          description: data.description,
          totalAmount: Number(data.total_amount),
          installmentCount: data.installment_count,
          currentInstallment: calculatedCurrentInstallment,
          installmentAmount: Number(data.installment_amount),
          startDate: startDate,
          category: data.category,
          type: data.type as "expense" | "income",
        }]);
        toast.success("Parcela adicionada");
      }
    } catch (error) {
      console.error("Error adding installment:", error);
      toast.error("Erro ao adicionar parcela");
    }
  };

  const deleteInstallment = async (id: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from("installments")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);

      if (error) throw error;
      
      setInstallments((prev) => prev.filter((i) => i.id !== id));
      toast.success("Parcela removida");
    } catch (error) {
      console.error("Error deleting installment:", error);
      toast.error("Erro ao remover parcela");
    }
  };

  const updateInstallmentCategory = async (id: string, category: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from("installments")
        .update({ category })
        .eq("id", id)
        .eq("user_id", user.id);

      if (error) throw error;

      setInstallments((prev) =>
        prev.map((i) => (i.id === id ? { ...i, category } : i))
      );
      toast.success("Categoria atualizada");
    } catch (error) {
      console.error("Error updating installment:", error);
      toast.error("Erro ao atualizar categoria");
    }
  };

  const getActiveInstallments = () => {
    // Recalcula a parcela atual para cada installment baseado na data atual
    const now = new Date();
    return installments
      .map(i => {
        const calculatedCurrent = calculateCurrentInstallment(i.startDate, i.installmentCount);
        return {
          ...i,
          currentInstallment: calculatedCurrent,
        };
      })
      .filter((i) => i.currentInstallment <= i.installmentCount);
  };

  const getInstallmentsForMonth = (month: Date) => {
    const start = startOfMonth(month);
    const end = endOfMonth(month);

    return installments.filter((installment) => {
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
    updateInstallmentCategory,
    getActiveInstallments,
    getInstallmentsForMonth,
    getProjection,
    loading,
  };
}
