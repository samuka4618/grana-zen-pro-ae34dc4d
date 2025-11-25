import { useEffect } from "react";
import { useNotificationsStore } from "./useNotificationsStore";
import { useTransactionsStore } from "./useTransactionsStore";
import { useRecurringContractsStore } from "./useRecurringContractsStore";
import { useInstallmentsStore } from "./useInstallmentsStore";
import { useCreditCardsStore } from "./useCreditCardsStore";
import { useCreditCardPurchasesStore } from "./useCreditCardPurchasesStore";
import { useFinancialGoalsStore } from "./useFinancialGoalsStore";
import { useCategoriesStore } from "./useCategoriesStore";
import { addDays, isWithinInterval, startOfMonth, endOfMonth, format, addMonths, differenceInMonths, startOfMonth as startOfMonthFn } from "date-fns";
import { ptBR } from "date-fns/locale";

export function useNotificationChecker() {
  const { addNotification, notifications } = useNotificationsStore();
  const { allTransactions } = useTransactionsStore(new Date());
  const { contracts } = useRecurringContractsStore();
  const { installments } = useInstallmentsStore();
  const { cards } = useCreditCardsStore();
  const { getInvoiceData } = useCreditCardPurchasesStore();
  const { goals } = useFinancialGoalsStore();
  const { categories } = useCategoriesStore();

  /**
   * Calcula a parcela atual baseada na data de início
   */
  const calculateCurrentInstallment = (startDate: Date, totalInstallments: number): number => {
    const now = new Date();
    const start = startOfMonthFn(startDate);
    const current = startOfMonthFn(now);
    const monthsDiff = differenceInMonths(current, start);
    const currentInstallment = Math.min(monthsDiff + 1, totalInstallments);
    return Math.max(1, currentInstallment);
  };

  /**
   * Verifica se já existe uma notificação para esta parcela específica
   * Verifica apenas notificações não lidas criadas nas últimas 24 horas
   */
  const notificationExists = (installmentId: string, installmentNumber: number): boolean => {
    const oneDayAgo = new Date();
    oneDayAgo.setHours(oneDayAgo.getHours() - 24);
    
    return notifications.some(
      (n) =>
        n.type === "due_date" &&
        n.metadata?.installmentId === installmentId &&
        n.metadata?.installmentNumber === installmentNumber &&
        !n.read &&
        n.createdAt >= oneDayAgo
    );
  };

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

    // Check installments - apenas a próxima parcela
    installments.forEach((inst) => {
      // Calcula a parcela atual
      const currentInstallment = calculateCurrentInstallment(inst.startDate, inst.installmentCount);
      
      // Se já passou todas as parcelas, não precisa notificar
      if (currentInstallment > inst.installmentCount) {
        return;
      }
      
      // Calcula a data da próxima parcela (currentInstallment)
      const dayOfMonth = inst.startDate.getDate();
      const nextPaymentMonth = addMonths(inst.startDate, currentInstallment - 1);
      const nextPaymentDate = new Date(
        nextPaymentMonth.getFullYear(),
        nextPaymentMonth.getMonth(),
        dayOfMonth
      );
      
      // Se a parcela deste mês já passou, a próxima é do próximo mês
      const now = new Date();
      const currentMonthPayment = new Date(
        now.getFullYear(),
        now.getMonth(),
        dayOfMonth
      );
      
      let finalNextPaymentDate: Date;
      if (currentMonthPayment < now && 
          currentMonthPayment.getMonth() === nextPaymentDate.getMonth() &&
          currentMonthPayment.getFullYear() === nextPaymentDate.getFullYear()) {
        finalNextPaymentDate = addMonths(nextPaymentDate, 1);
      } else {
        finalNextPaymentDate = nextPaymentDate;
      }
      
      // Só cria notificação se estiver nos próximos 7 dias e não existir ainda
      if (isWithinInterval(finalNextPaymentDate, { start: today, end: next7Days })) {
        // Verifica se já existe notificação para esta parcela específica
        if (!notificationExists(inst.id, currentInstallment)) {
          addNotification(
            "Parcela Próxima",
            `Parcela ${currentInstallment}/${inst.installmentCount} de ${inst.description} vence em ${format(finalNextPaymentDate, "dd/MM", { locale: ptBR })}`,
            "due_date",
            undefined,
            { installmentId: inst.id, installmentNumber: currentInstallment }
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
