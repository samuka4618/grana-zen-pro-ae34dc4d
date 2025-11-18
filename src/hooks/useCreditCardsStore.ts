import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

export interface CreditCard {
  id: string;
  name: string;
  lastFourDigits: string;
  creditLimit: number;
  closingDay: number;
  dueDay: number;
  active: boolean;
}

export function useCreditCardsStore() {
  const { user } = useAuth();
  const [cards, setCards] = useState<CreditCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchCards();
    }
  }, [user]);

  const fetchCards = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("credit_cards")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      if (data) {
        setCards(data.map(c => ({
          id: c.id,
          name: c.name,
          lastFourDigits: c.last_four_digits,
          creditLimit: Number(c.credit_limit),
          closingDay: c.closing_day,
          dueDay: c.due_day,
          active: c.active,
        })));
      }
    } catch (error) {
      console.error("Error fetching cards:", error);
      toast.error("Erro ao carregar cartões");
    } finally {
      setLoading(false);
    }
  };

  const addCard = async (
    name: string,
    lastFourDigits: string,
    creditLimit: number,
    closingDay: number,
    dueDay: number
  ) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("credit_cards")
        .insert([{
          name,
          last_four_digits: lastFourDigits,
          credit_limit: creditLimit,
          closing_day: closingDay,
          due_day: dueDay,
          user_id: user.id,
        }])
        .select()
        .single();

      if (error) throw error;

      if (data) {
        setCards(prev => [{
          id: data.id,
          name: data.name,
          lastFourDigits: data.last_four_digits,
          creditLimit: Number(data.credit_limit),
          closingDay: data.closing_day,
          dueDay: data.due_day,
          active: data.active,
        }, ...prev]);
        toast.success("Cartão adicionado");
      }
    } catch (error) {
      console.error("Error adding card:", error);
      toast.error("Erro ao adicionar cartão");
    }
  };

  const toggleCard = async (id: string) => {
    if (!user) return;

    const card = cards.find(c => c.id === id);
    if (!card) return;

    try {
      const { error } = await supabase
        .from("credit_cards")
        .update({ active: !card.active })
        .eq("id", id)
        .eq("user_id", user.id);

      if (error) throw error;

      setCards(prev =>
        prev.map(c => (c.id === id ? { ...c, active: !c.active } : c))
      );
      toast.success(card.active ? "Cartão desativado" : "Cartão ativado");
    } catch (error) {
      console.error("Error toggling card:", error);
      toast.error("Erro ao atualizar cartão");
    }
  };

  const deleteCard = async (id: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from("credit_cards")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);

      if (error) throw error;

      setCards(prev => prev.filter(c => c.id !== id));
      toast.success("Cartão removido");
    } catch (error) {
      console.error("Error deleting card:", error);
      toast.error("Erro ao remover cartão");
    }
  };

  const getActiveCards = () => {
    return cards.filter(c => c.active);
  };

  return {
    cards,
    addCard,
    toggleCard,
    deleteCard,
    getActiveCards,
    loading,
  };
}
