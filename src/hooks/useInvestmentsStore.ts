import { create } from "zustand";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface Investment {
  id: string;
  user_id: string;
  name: string;
  type: string;
  ticker_symbol?: string;
  quantity: number;
  purchase_price: number;
  current_price: number;
  purchase_date: string;
  created_at: string;
  updated_at: string;
}

interface InvestmentsStore {
  investments: Investment[];
  loading: boolean;
  fetchInvestments: (userId: string) => Promise<void>;
  addInvestment: (investment: Omit<Investment, "id" | "created_at" | "updated_at">) => Promise<void>;
  updateInvestment: (id: string, investment: Partial<Investment>) => Promise<void>;
  deleteInvestment: (id: string) => Promise<void>;
}

export const useInvestmentsStore = create<InvestmentsStore>((set, get) => ({
  investments: [],
  loading: false,

  fetchInvestments: async (userId: string) => {
    set({ loading: true });
    try {
      const { data, error } = await supabase
        .from("investments")
        .select("*")
        .eq("user_id", userId)
        .order("purchase_date", { ascending: false });

      if (error) throw error;
      set({ investments: data || [] });
    } catch (error: any) {
      console.error("Error fetching investments:", error);
    } finally {
      set({ loading: false });
    }
  },

  addInvestment: async (investment) => {
    try {
      const { data, error } = await supabase
        .from("investments")
        .insert([investment])
        .select()
        .single();

      if (error) throw error;

      set((state) => ({
        investments: [data, ...state.investments],
      }));
    } catch (error: any) {
      console.error("Error adding investment:", error);
      throw error;
    }
  },

  updateInvestment: async (id, investment) => {
    try {
      const { data, error } = await supabase
        .from("investments")
        .update(investment)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      set((state) => ({
        investments: state.investments.map((inv) =>
          inv.id === id ? data : inv
        ),
      }));
    } catch (error: any) {
      console.error("Error updating investment:", error);
      throw error;
    }
  },

  deleteInvestment: async (id) => {
    try {
      const { error } = await supabase
        .from("investments")
        .delete()
        .eq("id", id);

      if (error) throw error;

      set((state) => ({
        investments: state.investments.filter((inv) => inv.id !== id),
      }));
    } catch (error: any) {
      console.error("Error deleting investment:", error);
      throw error;
    }
  },
}));
