import { useState, useEffect } from "react";

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

const STORAGE_KEY = "financial-categories";

export function useCategoriesStore() {
  const [categories, setCategories] = useState<Category[]>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : DEFAULT_CATEGORIES;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(categories));
  }, [categories]);

  const addCategory = (name: string, type: "income" | "expense") => {
    const newCategory: Category = {
      id: Date.now().toString(),
      name,
      type,
    };
    setCategories((prev) => [...prev, newCategory]);
  };

  const deleteCategory = (id: string) => {
    setCategories((prev) => prev.filter((cat) => cat.id !== id));
  };

  const getCategoriesByType = (type: "income" | "expense") => {
    return categories.filter((cat) => cat.type === type);
  };

  return {
    categories,
    addCategory,
    deleteCategory,
    getCategoriesByType,
  };
}
