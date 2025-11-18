import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";
import { startOfMonth } from "date-fns";

export interface FinancialGoal {
  id: string;
  category: string;
  goalType: "monthly_limit" | "savings_target" | "expense_reduction";
  targetAmount: number;
  currentMonth: Date;
}

export function useFinancialGoalsStore() {
  const { user } = useAuth();
  const [goals, setGoals] = useState<FinancialGoal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchGoals();
    }
  }, [user]);

  const fetchGoals = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("financial_goals")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      if (data) {
        setGoals(data.map(g => ({
          id: g.id,
          category: g.category,
          goalType: g.goal_type as "monthly_limit" | "savings_target" | "expense_reduction",
          targetAmount: Number(g.target_amount),
          currentMonth: new Date(g.current_month),
        })));
      }
    } catch (error) {
      console.error("Error fetching goals:", error);
      toast.error("Erro ao carregar metas");
    } finally {
      setLoading(false);
    }
  };

  const addGoal = async (
    category: string,
    goalType: "monthly_limit" | "savings_target" | "expense_reduction",
    targetAmount: number,
    currentMonth: Date
  ) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("financial_goals")
        .insert([{
          category,
          goal_type: goalType,
          target_amount: targetAmount,
          current_month: startOfMonth(currentMonth).toISOString(),
          user_id: user.id,
        }])
        .select()
        .single();

      if (error) throw error;

      if (data) {
        setGoals(prev => [{
          id: data.id,
          category: data.category,
          goalType: data.goal_type as "monthly_limit" | "savings_target" | "expense_reduction",
          targetAmount: Number(data.target_amount),
          currentMonth: new Date(data.current_month),
        }, ...prev]);
        toast.success("Meta adicionada");
      }
    } catch (error) {
      console.error("Error adding goal:", error);
      toast.error("Erro ao adicionar meta");
    }
  };

  const deleteGoal = async (id: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from("financial_goals")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);

      if (error) throw error;

      setGoals(prev => prev.filter(g => g.id !== id));
      toast.success("Meta removida");
    } catch (error) {
      console.error("Error deleting goal:", error);
      toast.error("Erro ao remover meta");
    }
  };

  return {
    goals,
    addGoal,
    deleteGoal,
    loading,
  };
}
