import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

export interface Category {
  id: string;
  name: string;
  type: "income" | "expense";
  icon?: string;
}

const DEFAULT_CATEGORIES: Category[] = [
  // Income
  { id: "1", name: "Salário", type: "income" },
  { id: "2", name: "Freelance", type: "income" },
  { id: "3", name: "Investimentos", type: "income" },
  { id: "4", name: "Renda Extra", type: "income" },
  // Expense
  { id: "5", name: "Alimentação", type: "expense" },
  { id: "6", name: "Transporte", type: "expense" },
  { id: "7", name: "Moradia", type: "expense" },
  { id: "8", name: "Saúde", type: "expense" },
  { id: "9", name: "Entretenimento", type: "expense" },
  { id: "10", name: "Educação", type: "expense" },
  { id: "11", name: "Compras", type: "expense" },
];

export function useCategoriesStore() {
  const { user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchCategories();
    }
  }, [user]);

  const fetchCategories = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .eq("user_id", user.id);

      if (error) throw error;

      if (data && data.length > 0) {
        setCategories(data.map(cat => ({
          id: cat.id,
          name: cat.name,
          type: cat.type as "income" | "expense",
        })));
      } else {
        // First time user - insert default categories
        await insertDefaultCategories();
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error("Erro ao carregar categorias");
    } finally {
      setLoading(false);
    }
  };

  const insertDefaultCategories = async () => {
    if (!user) return;

    try {
      const categoriesToInsert = DEFAULT_CATEGORIES.map(cat => ({
        name: cat.name,
        type: cat.type,
        user_id: user.id,
      }));

      const { data, error } = await supabase
        .from("categories")
        .insert(categoriesToInsert)
        .select();

      if (error) throw error;
      if (data) {
        setCategories(data.map(cat => ({
          id: cat.id,
          name: cat.name,
          type: cat.type as "income" | "expense",
        })));
      }
    } catch (error) {
      console.error("Error inserting default categories:", error);
    }
  };

  const addCategory = async (name: string, type: "income" | "expense") => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("categories")
        .insert([{ name, type, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;
      if (data) {
        setCategories((prev) => [...prev, {
          id: data.id,
          name: data.name,
          type: data.type as "income" | "expense",
        }]);
        toast.success("Categoria adicionada");
      }
    } catch (error) {
      console.error("Error adding category:", error);
      toast.error("Erro ao adicionar categoria");
    }
  };

  const deleteCategory = async (id: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from("categories")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);

      if (error) throw error;
      
      setCategories((prev) => prev.filter((cat) => cat.id !== id));
      toast.success("Categoria removida");
    } catch (error) {
      console.error("Error deleting category:", error);
      toast.error("Erro ao remover categoria");
    }
  };

  const getCategoriesByType = (type: "income" | "expense") => {
    return categories.filter((cat) => cat.type === type);
  };

  return {
    categories,
    addCategory,
    deleteCategory,
    getCategoriesByType,
    loading,
  };
}
