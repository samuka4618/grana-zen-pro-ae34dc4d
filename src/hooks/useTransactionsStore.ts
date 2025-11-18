import { useState, useEffect, useMemo } from "react";
import { startOfMonth, endOfMonth, isWithinInterval } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  category: string;
  type: "income" | "expense";
  date: Date;
  attachmentUrl?: string;
}

export function useTransactionsStore(selectedMonth?: Date) {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchTransactions();
    }
  }, [user]);

  const fetchTransactions = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", user.id)
        .order("date", { ascending: false });

      if (error) throw error;

      if (data) {
        setTransactions(data.map(t => ({ 
          id: t.id,
          description: t.description,
          amount: Number(t.amount),
          category: t.category,
          type: t.type as "income" | "expense",
          date: new Date(t.date),
          attachmentUrl: t.attachment_url || undefined,
        })));
      }
    } catch (error) {
      console.error("Error fetching transactions:", error);
      toast.error("Erro ao carregar transações");
    } finally {
      setLoading(false);
    }
  };

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

  const addTransaction = async (
    description: string,
    amount: number,
    category: string,
    type: "income" | "expense",
    dateOrAttachmentUrl?: string | Date,
    attachmentUrl?: string,
    bankAccountId?: string
  ) => {
    if (!user) return;

    // Handle overloaded parameters
    let date: Date;
    let attachment: string | undefined;

    if (typeof dateOrAttachmentUrl === 'string' && dateOrAttachmentUrl.startsWith('http')) {
      // Old API: attachmentUrl as 5th parameter
      date = new Date();
      attachment = dateOrAttachmentUrl;
    } else if (dateOrAttachmentUrl instanceof Date) {
      // New API: date as 5th parameter
      date = dateOrAttachmentUrl;
      attachment = attachmentUrl;
    } else if (typeof dateOrAttachmentUrl === 'string') {
      // Date string
      date = new Date(dateOrAttachmentUrl);
      attachment = attachmentUrl;
    } else {
      // No date provided
      date = new Date();
      attachment = attachmentUrl;
    }

    try {
      const { data, error } = await supabase
        .from("transactions")
        .insert([{
          description,
          amount,
          category,
          type,
          user_id: user.id,
          date: date.toISOString(),
          attachment_url: attachment || null,
          bank_account_id: bankAccountId || null,
        }])
        .select()
        .single();

      if (error) throw error;
      
      if (data) {
        setTransactions((prev) => [{
          id: data.id,
          description: data.description,
          amount: Number(data.amount),
          category: data.category,
          type: data.type as "income" | "expense",
          date: new Date(data.date),
          attachmentUrl: data.attachment_url || undefined,
        }, ...prev]);
        toast.success("Transação adicionada");
      }
    } catch (error) {
      console.error("Error adding transaction:", error);
      toast.error("Erro ao adicionar transação");
    }
  };

  const updateTransactionCategory = async (id: string, category: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from("transactions")
        .update({ category })
        .eq("id", id)
        .eq("user_id", user.id);

      if (error) throw error;

      setTransactions((prev) =>
        prev.map((t) => (t.id === id ? { ...t, category } : t))
      );
      toast.success("Categoria atualizada");
    } catch (error) {
      console.error("Error updating transaction:", error);
      toast.error("Erro ao atualizar categoria");
    }
  };

  return {
    transactions: filteredTransactions,
    allTransactions: transactions,
    stats,
    addTransaction,
    updateTransactionCategory,
    loading,
  };
}
