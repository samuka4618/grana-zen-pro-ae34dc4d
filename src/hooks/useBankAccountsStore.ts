import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

export interface BankAccount {
  id: string;
  name: string;
  bankName?: string;
  accountType: string;
  initialBalance: number;
  currentBalance: number;
  color?: string;
  active: boolean;
}

export function useBankAccountsStore() {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchAccounts();
    }
  }, [user]);

  const fetchAccounts = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("bank_accounts")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      if (data) {
        setAccounts(
          data.map((a) => ({
            id: a.id,
            name: a.name,
            bankName: a.bank_name || undefined,
            accountType: a.account_type,
            initialBalance: Number(a.initial_balance),
            currentBalance: Number(a.current_balance),
            color: a.color || undefined,
            active: a.active,
          }))
        );
      }
    } catch (error) {
      console.error("Error fetching bank accounts:", error);
      toast.error("Erro ao carregar contas bancárias");
    } finally {
      setLoading(false);
    }
  };

  const addAccount = async (
    name: string,
    bankName: string,
    accountType: string,
    initialBalance: number,
    color?: string
  ) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("bank_accounts")
        .insert([
          {
            user_id: user.id,
            name,
            bank_name: bankName,
            account_type: accountType,
            initial_balance: initialBalance,
            current_balance: initialBalance,
            color,
            active: true,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      if (data) {
        setAccounts((prev) => [
          {
            id: data.id,
            name: data.name,
            bankName: data.bank_name || undefined,
            accountType: data.account_type,
            initialBalance: Number(data.initial_balance),
            currentBalance: Number(data.current_balance),
            color: data.color || undefined,
            active: data.active,
          },
          ...prev,
        ]);
        toast.success("Conta adicionada com sucesso");
      }
    } catch (error) {
      console.error("Error adding bank account:", error);
      toast.error("Erro ao adicionar conta");
    }
  };

  const toggleAccount = async (id: string) => {
    const account = accounts.find((a) => a.id === id);
    if (!account) return;

    try {
      const { error } = await supabase
        .from("bank_accounts")
        .update({ active: !account.active })
        .eq("id", id);

      if (error) throw error;

      setAccounts((prev) =>
        prev.map((a) =>
          a.id === id ? { ...a, active: !a.active } : a
        )
      );
      toast.success(
        account.active ? "Conta desativada" : "Conta ativada"
      );
    } catch (error) {
      console.error("Error toggling bank account:", error);
      toast.error("Erro ao atualizar conta");
    }
  };

  const deleteAccount = async (id: string) => {
    try {
      const { error } = await supabase
        .from("bank_accounts")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setAccounts((prev) => prev.filter((a) => a.id !== id));
      toast.success("Conta removida com sucesso");
    } catch (error) {
      console.error("Error deleting bank account:", error);
      toast.error("Erro ao remover conta");
    }
  };

  const transferBetweenAccounts = async (
    fromAccountId: string,
    toAccountId: string,
    amount: number,
    description: string
  ) => {
    if (!user) return;

    try {
      // Create withdrawal transaction
      const { error: withdrawError } = await supabase
        .from("transactions")
        .insert([
          {
            user_id: user.id,
            description: `Transferência para ${description}`,
            amount,
            category: "Transferência",
            type: "expense",
            bank_account_id: fromAccountId,
            date: new Date().toISOString(),
          },
        ]);

      if (withdrawError) throw withdrawError;

      // Create deposit transaction
      const { error: depositError } = await supabase
        .from("transactions")
        .insert([
          {
            user_id: user.id,
            description: `Transferência de ${description}`,
            amount,
            category: "Transferência",
            type: "income",
            bank_account_id: toAccountId,
            date: new Date().toISOString(),
          },
        ]);

      if (depositError) throw depositError;

      await fetchAccounts();
      toast.success("Transferência realizada com sucesso");
    } catch (error) {
      console.error("Error transferring between accounts:", error);
      toast.error("Erro ao realizar transferência");
    }
  };

  const getActiveAccounts = () => accounts.filter((a) => a.active);

  const getTotalBalance = () =>
    getActiveAccounts().reduce((sum, a) => sum + a.currentBalance, 0);

  return {
    accounts,
    loading,
    addAccount,
    toggleAccount,
    deleteAccount,
    transferBetweenAccounts,
    getActiveAccounts,
    getTotalBalance,
  };
}
