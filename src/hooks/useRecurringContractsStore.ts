import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

export interface RecurringContract {
  id: string;
  description: string;
  amount: number;
  dueDay: number;
  category: string;
  type: "expense" | "income";
  active: boolean;
  startDate: Date;
}

export function useRecurringContractsStore() {
  const { user } = useAuth();
  const [contracts, setContracts] = useState<RecurringContract[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchContracts();
    }
  }, [user]);

  const fetchContracts = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from("recurring_contracts")
        .select("*")
        .eq("user_id", user.id);

      if (error) throw error;

      if (data) {
        setContracts(data.map(c => ({ 
          id: c.id,
          description: c.description,
          amount: Number(c.amount),
          dueDay: c.due_day,
          category: c.category,
          type: c.type as "expense" | "income",
          active: c.active,
          startDate: new Date(c.start_date),
        })));
      }
    } catch (error) {
      console.error("Error fetching contracts:", error);
      toast.error("Erro ao carregar contratos");
    } finally {
      setLoading(false);
    }
  };

  const addContract = async (
    description: string,
    amount: number,
    dueDay: number,
    category: string,
    type: "expense" | "income"
  ) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("recurring_contracts")
        .insert([{
          description,
          amount,
          due_day: dueDay,
          category,
          type,
          user_id: user.id,
        }])
        .select()
        .single();

      if (error) throw error;
      
      if (data) {
        setContracts((prev) => [...prev, {
          id: data.id,
          description: data.description,
          amount: Number(data.amount),
          dueDay: data.due_day,
          category: data.category,
          type: data.type as "expense" | "income",
          active: data.active,
          startDate: new Date(data.start_date),
        }]);
        toast.success("Contrato adicionado");
      }
    } catch (error) {
      console.error("Error adding contract:", error);
      toast.error("Erro ao adicionar contrato");
    }
  };

  const toggleContract = async (id: string) => {
    if (!user) return;

    const contract = contracts.find(c => c.id === id);
    if (!contract) return;

    try {
      const { error } = await supabase
        .from("recurring_contracts")
        .update({ active: !contract.active })
        .eq("id", id)
        .eq("user_id", user.id);

      if (error) throw error;
      
      setContracts((prev) =>
        prev.map((c) => (c.id === id ? { ...c, active: !c.active } : c))
      );
      toast.success(contract.active ? "Contrato desativado" : "Contrato ativado");
    } catch (error) {
      console.error("Error toggling contract:", error);
      toast.error("Erro ao atualizar contrato");
    }
  };

  const deleteContract = async (id: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from("recurring_contracts")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);

      if (error) throw error;
      
      setContracts((prev) => prev.filter((c) => c.id !== id));
      toast.success("Contrato removido");
    } catch (error) {
      console.error("Error deleting contract:", error);
      toast.error("Erro ao remover contrato");
    }
  };

  const updateContractCategory = async (id: string, category: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from("recurring_contracts")
        .update({ category })
        .eq("id", id)
        .eq("user_id", user.id);

      if (error) throw error;

      setContracts((prev) =>
        prev.map((c) => (c.id === id ? { ...c, category } : c))
      );
      toast.success("Categoria atualizada");
    } catch (error) {
      console.error("Error updating contract:", error);
      toast.error("Erro ao atualizar categoria");
    }
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
    updateContractCategory,
    getActiveContracts,
    getMonthlyTotal,
    loading,
  };
}
