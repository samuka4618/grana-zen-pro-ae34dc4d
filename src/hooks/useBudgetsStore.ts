import { create } from 'zustand';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { startOfMonth, format } from 'date-fns';

export interface Budget {
  id: string;
  user_id: string;
  category: string;
  month: string;
  planned_amount: number;
  created_at: string;
  updated_at: string;
}

interface BudgetsState {
  budgets: Budget[];
  loading: boolean;
  fetchBudgets: (month: Date) => Promise<void>;
  addBudget: (category: string, month: Date, plannedAmount: number) => Promise<void>;
  updateBudget: (id: string, plannedAmount: number) => Promise<void>;
  deleteBudget: (id: string) => Promise<void>;
  suggestBudget: (category: string, month: Date) => Promise<number | null>;
}

export const useBudgetsStore = create<BudgetsState>((set, get) => ({
  budgets: [],
  loading: false,

  fetchBudgets: async (month: Date) => {
    try {
      set({ loading: true });
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const monthStr = format(startOfMonth(month), 'yyyy-MM-dd');

      const { data, error } = await supabase
        .from('budgets')
        .select('*')
        .eq('month', monthStr)
        .order('category');

      if (error) throw error;
      set({ budgets: data || [] });
    } catch (error) {
      console.error('Error fetching budgets:', error);
      toast.error('Erro ao carregar orçamentos');
    } finally {
      set({ loading: false });
    }
  },

  addBudget: async (category: string, month: Date, plannedAmount: number) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const monthStr = format(startOfMonth(month), 'yyyy-MM-dd');

      const { error } = await supabase
        .from('budgets')
        .insert({
          user_id: user.id,
          category,
          month: monthStr,
          planned_amount: plannedAmount,
        });

      if (error) throw error;

      toast.success('Orçamento adicionado!');
      get().fetchBudgets(month);
    } catch (error: any) {
      console.error('Error adding budget:', error);
      if (error.code === '23505') {
        toast.error('Já existe um orçamento para esta categoria neste mês');
      } else {
        toast.error('Erro ao adicionar orçamento');
      }
    }
  },

  updateBudget: async (id: string, plannedAmount: number) => {
    try {
      const { error } = await supabase
        .from('budgets')
        .update({ planned_amount: plannedAmount })
        .eq('id', id);

      if (error) throw error;

      toast.success('Orçamento atualizado!');
      set((state) => ({
        budgets: state.budgets.map((b) =>
          b.id === id ? { ...b, planned_amount: plannedAmount } : b
        ),
      }));
    } catch (error) {
      console.error('Error updating budget:', error);
      toast.error('Erro ao atualizar orçamento');
    }
  },

  deleteBudget: async (id: string) => {
    try {
      const { error } = await supabase
        .from('budgets')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Orçamento removido!');
      set((state) => ({
        budgets: state.budgets.filter((b) => b.id !== id),
      }));
    } catch (error) {
      console.error('Error deleting budget:', error);
      toast.error('Erro ao remover orçamento');
    }
  },

  suggestBudget: async (category: string, month: Date) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      // Get last 3 months of transactions for this category
      const threeMonthsAgo = new Date(month);
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

      const { data, error } = await supabase
        .from('transactions')
        .select('amount, date')
        .eq('category', category)
        .eq('type', 'expense')
        .gte('date', threeMonthsAgo.toISOString())
        .lt('date', month.toISOString());

      if (error) throw error;

      if (!data || data.length === 0) return null;

      // Calculate average spending
      const total = data.reduce((sum, t) => sum + t.amount, 0);
      const average = total / 3;

      // Add 10% buffer
      return Math.round(average * 1.1);
    } catch (error) {
      console.error('Error suggesting budget:', error);
      return null;
    }
  },
}));
