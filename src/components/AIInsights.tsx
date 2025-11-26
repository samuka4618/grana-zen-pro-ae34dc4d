import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2 } from "lucide-react";
import { Transaction } from "@/hooks/useTransactionsStore";
import { RecurringContract } from "@/hooks/useRecurringContractsStore";
import { Installment } from "@/hooks/useInstallmentsStore";
import { CreditCard } from "@/hooks/useCreditCardsStore";
import { CreditCardPurchase } from "@/hooks/useCreditCardPurchasesStore";
import { toast } from "sonner";
import { format, startOfMonth, endOfMonth, subMonths } from "date-fns";
import { formatCurrency } from "@/lib/currency";

interface AIInsightsProps {
  transactions: Transaction[];
  contracts: RecurringContract[];
  installments: Installment[];
  creditCards: CreditCard[];
  creditCardPurchases: CreditCardPurchase[];
}

export function AIInsights({ transactions, contracts, installments, creditCards, creditCardPurchases }: AIInsightsProps) {
  const [insights, setInsights] = useState<string>("");
  const [loading, setLoading] = useState(false);

  // Calcular estatísticas prévias para melhorar a análise
  const financialStats = useMemo(() => {
    const now = new Date();
    const currentMonthStart = startOfMonth(now);
    const currentMonthEnd = endOfMonth(now);
    const lastMonthStart = startOfMonth(subMonths(now, 1));
    const lastMonthEnd = endOfMonth(subMonths(now, 1));

    // Transações do mês atual
    const currentMonthTransactions = transactions.filter(
      t => t.date >= currentMonthStart && t.date <= currentMonthEnd
    );
    
    // Transações do mês anterior
    const lastMonthTransactions = transactions.filter(
      t => t.date >= lastMonthStart && t.date <= lastMonthEnd
    );

    // Estatísticas do mês atual
    const currentIncome = currentMonthTransactions
      .filter(t => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);
    const currentExpenses = currentMonthTransactions
      .filter(t => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);
    const currentBalance = currentIncome - currentExpenses;

    // Estatísticas do mês anterior
    const lastIncome = lastMonthTransactions
      .filter(t => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);
    const lastExpenses = lastMonthTransactions
      .filter(t => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);
    const lastBalance = lastIncome - lastExpenses;

    // Gastos por categoria (últimos 3 meses)
    const threeMonthsAgo = subMonths(now, 3);
    const recentTransactions = transactions.filter(t => t.date >= threeMonthsAgo);
    const categorySpending: Record<string, number> = {};
    recentTransactions
      .filter(t => t.type === "expense")
      .forEach(t => {
        categorySpending[t.category] = (categorySpending[t.category] || 0) + t.amount;
      });

    // Top 5 categorias de gasto
    const topCategories = Object.entries(categorySpending)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([category, amount]) => ({ category, amount }));

    // Análise de cartões de crédito
    const totalCreditLimit = creditCards.reduce((sum, card) => sum + card.limit, 0);
    const totalCreditUsed = creditCards.reduce((sum, card) => sum + card.currentBalance, 0);
    const creditUsagePercent = totalCreditLimit > 0 ? (totalCreditUsed / totalCreditLimit) * 100 : 0;

    // Parcelas ativas
    const activeInstallments = installments.filter(i => {
      const endDate = new Date(i.startDate);
      endDate.setMonth(endDate.getMonth() + i.installmentCount);
      return endDate >= now;
    });
    const totalInstallmentAmount = activeInstallments.reduce((sum, i) => {
      const remaining = i.installmentCount - i.currentInstallment;
      return sum + (i.installmentAmount * remaining);
    }, 0);

    // Contratos recorrentes
    const activeContracts = contracts.filter(c => c.active);
    const monthlyRecurringExpenses = activeContracts
      .filter(c => c.type === "expense")
      .reduce((sum, c) => sum + c.amount, 0);
    const monthlyRecurringIncome = activeContracts
      .filter(c => c.type === "income")
      .reduce((sum, c) => sum + c.amount, 0);

    return {
      currentMonth: {
        income: currentIncome,
        expenses: currentExpenses,
        balance: currentBalance,
        transactionCount: currentMonthTransactions.length,
      },
      lastMonth: {
        income: lastIncome,
        expenses: lastExpenses,
        balance: lastBalance,
        transactionCount: lastMonthTransactions.length,
      },
      trends: {
        incomeChange: lastIncome > 0 ? ((currentIncome - lastIncome) / lastIncome) * 100 : 0,
        expensesChange: lastExpenses > 0 ? ((currentExpenses - lastExpenses) / lastExpenses) * 100 : 0,
        balanceChange: currentBalance - lastBalance,
      },
      topCategories,
      creditCards: {
        totalLimit: totalCreditLimit,
        totalUsed: totalCreditUsed,
        usagePercent: creditUsagePercent,
        cardCount: creditCards.length,
      },
      installments: {
        activeCount: activeInstallments.length,
        totalRemaining: totalInstallmentAmount,
      },
      recurring: {
        monthlyExpenses: monthlyRecurringExpenses,
        monthlyIncome: monthlyRecurringIncome,
        activeContracts: activeContracts.length,
      },
      totalTransactions: transactions.length,
    };
  }, [transactions, creditCards, installments, contracts]);

  const generateInsights = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/financial-insights`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            transactions: transactions, // Enviar todas as transações, não apenas 50
            recurringContracts: contracts,
            installments: installments,
            creditCards: creditCards,
            creditCardPurchases: creditCardPurchases,
            financialStats: financialStats, // Estatísticas pré-calculadas
            analysisDate: format(new Date(), "dd/MM/yyyy"),
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erro ao gerar insights");
      }

      const data = await response.json();
      setInsights(data.insights);
    } catch (error) {
      console.error("Error generating insights:", error);
      toast.error(error instanceof Error ? error.message : "Erro ao gerar insights");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Insights Inteligentes com IA</h3>
        </div>
        <Button
          onClick={generateInsights}
          disabled={loading}
          size="sm"
          className="gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Analisando...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              Gerar Análise
            </>
          )}
        </Button>
      </div>

      {insights ? (
        <div className="space-y-4">
          <div className="whitespace-pre-wrap text-sm text-foreground bg-gradient-to-br from-muted/50 to-muted/30 p-6 rounded-lg border border-primary/10 leading-relaxed">
            {insights}
          </div>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Análise gerada em {format(new Date(), "dd/MM/yyyy 'às' HH:mm")}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={generateInsights}
              disabled={loading}
              className="h-7 text-xs"
            >
              Atualizar Análise
            </Button>
          </div>
        </div>
      ) : (
        <div className="text-center py-8 space-y-2">
          <p className="text-sm text-muted-foreground">
            Clique em "Gerar Análise" para obter insights inteligentes e detalhados sobre suas finanças
          </p>
          <p className="text-xs text-muted-foreground/70">
            A análise incluirá comparações mensais, tendências, análise de categorias, cartões de crédito e recomendações personalizadas
          </p>
        </div>
      )}
    </Card>
  );
}
