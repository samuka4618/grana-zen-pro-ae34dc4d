import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";
import { startOfMonth, endOfMonth, addMonths, isSameMonth } from "date-fns";

export interface CreditCardPurchase {
  id: string;
  creditCardId: string;
  description: string;
  totalAmount: number;
  installments: number;
  installmentAmount: number;
  purchaseDate: Date;
  category: string;
}

export function useCreditCardPurchasesStore() {
  const { user } = useAuth();
  const [purchases, setPurchases] = useState<CreditCardPurchase[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchPurchases();
    }
  }, [user]);

  const fetchPurchases = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("credit_card_purchases")
        .select("*")
        .eq("user_id", user.id)
        .order("purchase_date", { ascending: false });

      if (error) throw error;

      if (data) {
        setPurchases(data.map(p => ({
          id: p.id,
          creditCardId: p.credit_card_id,
          description: p.description,
          totalAmount: Number(p.total_amount),
          installments: p.installments,
          installmentAmount: Number(p.installment_amount),
          purchaseDate: new Date(p.purchase_date),
          category: p.category,
        })));
      }
    } catch (error) {
      console.error("Error fetching purchases:", error);
      toast.error("Erro ao carregar compras");
    } finally {
      setLoading(false);
    }
  };

  const addPurchase = async (
    creditCardId: string,
    description: string,
    totalAmount: number,
    installments: number,
    category: string
  ) => {
    if (!user) return;

    const installmentAmount = totalAmount / installments;

    try {
      const { data, error } = await supabase
        .from("credit_card_purchases")
        .insert([{
          credit_card_id: creditCardId,
          description,
          total_amount: totalAmount,
          installments,
          installment_amount: installmentAmount,
          category,
          user_id: user.id,
          purchase_date: new Date().toISOString(),
        }])
        .select()
        .single();

      if (error) throw error;

      if (data) {
        setPurchases(prev => [{
          id: data.id,
          creditCardId: data.credit_card_id,
          description: data.description,
          totalAmount: Number(data.total_amount),
          installments: data.installments,
          installmentAmount: Number(data.installment_amount),
          purchaseDate: new Date(data.purchase_date),
          category: data.category,
        }, ...prev]);
        toast.success("Compra adicionada");
      }
    } catch (error) {
      console.error("Error adding purchase:", error);
      toast.error("Erro ao adicionar compra");
    }
  };

  const deletePurchase = async (id: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from("credit_card_purchases")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);

      if (error) throw error;

      setPurchases(prev => prev.filter(p => p.id !== id));
      toast.success("Compra removida");
    } catch (error) {
      console.error("Error deleting purchase:", error);
      toast.error("Erro ao remover compra");
    }
  };

  const getInvoiceData = (cardId: string, month: Date, closingDay: number) => {
    const invoiceStart = new Date(month.getFullYear(), month.getMonth(), closingDay + 1);
    invoiceStart.setMonth(invoiceStart.getMonth() - 1);
    const invoiceEnd = new Date(month.getFullYear(), month.getMonth(), closingDay);

    const relevantPurchases = purchases.filter(p => {
      if (p.creditCardId !== cardId) return false;

      // Calcular quais parcelas caem nesta fatura
      const purchaseMonth = p.purchaseDate;
      for (let i = 0; i < p.installments; i++) {
        const installmentMonth = addMonths(purchaseMonth, i);
        if (isSameMonth(installmentMonth, month)) {
          return true;
        }
      }
      return false;
    });

    const installmentsInInvoice = relevantPurchases.flatMap(p => {
      const results = [];
      for (let i = 0; i < p.installments; i++) {
        const installmentMonth = addMonths(p.purchaseDate, i);
        if (isSameMonth(installmentMonth, month)) {
          results.push({
            ...p,
            currentInstallment: i + 1,
          });
        }
      }
      return results;
    });

    const total = installmentsInInvoice.reduce((sum, item) => sum + item.installmentAmount, 0);

    return {
      purchases: installmentsInInvoice,
      total,
    };
  };

  const getUsedLimit = (cardId: string) => {
    const now = new Date();
    // Calcular o total de parcelas futuras deste cartão
    let usedLimit = 0;

    purchases
      .filter(p => p.creditCardId === cardId)
      .forEach(p => {
        const monthsSincePurchase = Math.floor(
          (now.getTime() - p.purchaseDate.getTime()) / (1000 * 60 * 60 * 24 * 30)
        );
        const remainingInstallments = Math.max(0, p.installments - monthsSincePurchase);
        usedLimit += p.installmentAmount * remainingInstallments;
      });

    return usedLimit;
  };

  return {
    purchases,
    addPurchase,
    deletePurchase,
    getInvoiceData,
    getUsedLimit,
    loading,
  };
}
