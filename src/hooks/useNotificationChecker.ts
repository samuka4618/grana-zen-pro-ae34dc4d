import { useEffect } from "react";
import { useNotificationsStore } from "./useNotificationsStore";
import { useTransactionsStore } from "./useTransactionsStore";
import { useRecurringContractsStore } from "./useRecurringContractsStore";
import { useInstallmentsStore } from "./useInstallmentsStore";
import { useCreditCardsStore } from "./useCreditCardsStore";
import { useCreditCardPurchasesStore } from "./useCreditCardPurchasesStore";
import { useFinancialGoalsStore } from "./useFinancialGoalsStore";
import { useCategoriesStore } from "./useCategoriesStore";
import { addDays, isWithinInterval, startOfMonth, endOfMonth, format } from "date-fns";
import { ptBR } from "date-fns/locale";

export function useNotificationChecker() {
  const { addNotification } = useNotificationsStore();
  const { allTransactions } = useTransactionsStore(new Date());
  const { contracts } = useRecurringContractsStore();
  const { installments } = useInstallmentsStore();
  const { cards } = useCreditCardsStore();
  const { getInvoiceData } = useCreditCardPurchasesStore();
  const { goals } = useFinancialGoalsStore();
  const { categories } = useCategoriesStore();

  useEffect(() => {
    // Check every hour
    const intervalId = setInterval(() => {
      checkDueDates();
      checkBudgets();
      checkGoals();
    }, 60 * 60 * 1000); // 1 hour

    // Initial check
    checkDueDates();
    checkBudgets();
    checkGoals();

    return () => clearInterval(intervalId);
  }, [contracts, installments, cards, allTransactions, goals]);

  const checkDueDates = () => {
    const today = new Date();
    const next7Days = addDays(today, 7);

    // Check recurring contracts
    contracts
      .filter((c) => c.active)
      .forEach((contract) => {
        const dueDate = new Date(today.getFullYear(), today.getMonth(), contract.dueDay);
        
        if (isWithinInterval(dueDate, { start: today, end: next7Days })) {
          addNotification(
            "Vencimento Próximo",
            `${contract.description} vence em ${format(dueDate, "dd/MM", { locale: ptBR })}`,
            "due_date",
            undefined,
            { contractId: contract.id, dueDate: dueDate.toISOString() }
          );
        }
      });

    // Check credit card invoices
    cards
      .filter((c) => c.active)
      .forEach((card) => {
        const dueDate = new Date(today.getFullYear(), today.getMonth(), card.dueDay);
        
        if (isWithinInterval(dueDate, { start: today, end: next7Days })) {
          const invoiceData = getInvoiceData(card.id, today, card.closingDay);
          
          if (invoiceData.total > 0) {
            addNotification(
              "Fatura do Cartão",
              `Fatura do ${card.name} vence em ${format(dueDate, "dd/MM", { locale: ptBR })} - R$ ${invoiceData.total.toFixed(2)}`,
              "due_date",
              "/credit-cards",
              { cardId: card.id, amount: invoiceData.total }
            );
          }
        }
      });

    // Check installments
    const currentMonth = startOfMonth(today);
    const endMonth = endOfMonth(today);
    
    installments.forEach((inst) => {
      const installmentDate = new Date(inst.startDate);
      
      for (let i = 0; i < inst.installmentCount; i++) {
        const dueDate = new Date(
          installmentDate.getFullYear(),
          installmentDate.getMonth() + i,
          installmentDate.getDate()
        );
        
        if (isWithinInterval(dueDate, { start: today, end: next7Days })) {
          addNotification(
            "Parcela Próxima",
            `Parcela ${i + 1}/${inst.installmentCount} de ${inst.description} vence em ${format(dueDate, "dd/MM", { locale: ptBR })}`,
            "due_date",
            undefined,
            { installmentId: inst.id, installmentNumber: i + 1 }
          );
        }
      }
    });
  };

  const checkBudgets = () => {
    const currentMonth = new Date();
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);

    const monthTransactions = allTransactions.filter((t) =>
      isWithinInterval(t.date, { start, end })
    );

    // Group expenses by category
    const expensesByCategory: Record<string, number> = {};
    monthTransactions
      .filter((t) => t.type === "expense")
      .forEach((t) => {
        expensesByCategory[t.category] = (expensesByCategory[t.category] || 0) + t.amount;
      });

    // Check against goals
    goals.forEach((goal) => {
      const currentSpent = expensesByCategory[goal.category] || 0;
      const percentage = (currentSpent / goal.targetAmount) * 100;

      if (goal.goalType === "monthly_limit" && percentage >= 90 && percentage < 100) {
        addNotification(
          "Atenção: Orçamento",
          `Você já gastou ${percentage.toFixed(0)}% do limite de ${goal.category}`,
          "budget_exceeded",
          "/analytics",
          { category: goal.category, percentage }
        );
      } else if (goal.goalType === "monthly_limit" && percentage >= 100) {
        addNotification(
          "Orçamento Estourado!",
          `Você ultrapassou o limite de ${goal.category} em ${(percentage - 100).toFixed(0)}%`,
          "budget_exceeded",
          "/analytics",
          { category: goal.category, percentage }
        );
      }
    });
  };

  const checkGoals = () => {
    const currentMonth = new Date();
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);

    const monthTransactions = allTransactions.filter((t) =>
      isWithinInterval(t.date, { start, end })
    );

    const expensesByCategory: Record<string, number> = {};
    monthTransactions
      .filter((t) => t.type === "expense")
      .forEach((t) => {
        expensesByCategory[t.category] = (expensesByCategory[t.category] || 0) + t.amount;
      });

    goals.forEach((goal) => {
      if (goal.goalType === "savings_target") {
        const currentSpent = expensesByCategory[goal.category] || 0;
        const saved = goal.targetAmount - currentSpent;

        if (saved >= goal.targetAmount) {
          addNotification(
            "Meta Alcançada! 🎉",
            `Você conseguiu economizar em ${goal.category} este mês!`,
            "goal_achieved",
            "/analytics",
            { category: goal.category, saved }
          );
        }
      }
    });
  };

  return null;
}
