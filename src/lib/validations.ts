import { z } from "zod";

// Validação para transações
export const transactionSchema = z.object({
  description: z
    .string()
    .trim()
    .min(1, { message: "Descrição é obrigatória" })
    .max(200, { message: "Descrição deve ter no máximo 200 caracteres" }),
  amount: z
    .number()
    .positive({ message: "Valor deve ser maior que zero" })
    .max(999999999.99, { message: "Valor muito alto" }),
  category: z
    .string()
    .trim()
    .min(1, { message: "Categoria é obrigatória" })
    .max(100, { message: "Categoria deve ter no máximo 100 caracteres" }),
  type: z.enum(["income", "expense"], { message: "Tipo deve ser receita ou despesa" }),
});

// Validação para categorias
export const categorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, { message: "Nome é obrigatório" })
    .max(100, { message: "Nome deve ter no máximo 100 caracteres" })
    .regex(/^[a-zA-ZÀ-ÿ0-9\s\-_]+$/, { 
      message: "Nome contém caracteres inválidos" 
    }),
  type: z.enum(["income", "expense"], { message: "Tipo deve ser receita ou despesa" }),
});

// Validação para contratos recorrentes
export const recurringContractSchema = z.object({
  description: z
    .string()
    .trim()
    .min(1, { message: "Descrição é obrigatória" })
    .max(200, { message: "Descrição deve ter no máximo 200 caracteres" }),
  amount: z
    .number()
    .positive({ message: "Valor deve ser maior que zero" })
    .max(999999999.99, { message: "Valor muito alto" }),
  dueDay: z
    .number()
    .int({ message: "Dia deve ser um número inteiro" })
    .min(1, { message: "Dia deve ser entre 1 e 31" })
    .max(31, { message: "Dia deve ser entre 1 e 31" }),
  category: z
    .string()
    .trim()
    .min(1, { message: "Categoria é obrigatória" })
    .max(100, { message: "Categoria deve ter no máximo 100 caracteres" }),
  type: z.enum(["income", "expense"], { message: "Tipo deve ser receita ou despesa" }),
});

// Validação para parcelas
export const installmentSchema = z.object({
  description: z
    .string()
    .trim()
    .min(1, { message: "Descrição é obrigatória" })
    .max(200, { message: "Descrição deve ter no máximo 200 caracteres" }),
  totalAmount: z
    .number()
    .positive({ message: "Valor total deve ser maior que zero" })
    .max(999999999.99, { message: "Valor muito alto" }),
  installmentCount: z
    .number()
    .int({ message: "Número de parcelas deve ser um número inteiro" })
    .min(2, { message: "Deve ter no mínimo 2 parcelas" })
    .max(999, { message: "Número de parcelas muito alto" }),
  category: z
    .string()
    .trim()
    .min(1, { message: "Categoria é obrigatória" })
    .max(100, { message: "Categoria deve ter no máximo 100 caracteres" }),
  type: z.enum(["income", "expense"], { message: "Tipo deve ser receita ou despesa" }),
  startDate: z.date({ message: "Data de início é obrigatória" }),
});

export type TransactionInput = z.infer<typeof transactionSchema>;
export type CategoryInput = z.infer<typeof categorySchema>;
export type RecurringContractInput = z.infer<typeof recurringContractSchema>;
export type InstallmentInput = z.infer<typeof installmentSchema>;
