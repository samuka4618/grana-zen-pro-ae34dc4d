import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Transaction } from "@/hooks/useTransactionsStore";
import { useMemo } from "react";
import { TrendingUp, TrendingDown, Calendar, Target, AlertCircle } from "lucide-react";
import { formatCurrency } from "@/lib/currency";

interface FinancialInsightsProps {
  transactions: Transaction[];
}

export function FinancialInsights({ transactions }: FinancialInsightsProps) {
  const insights = useMemo(() => {
    const expenses = transactions.filter((t) => t.type === "expense");
    const income = transactions.filter((t) => t.type === "income");
    
    const totalExpenses = expenses.reduce((sum, t) => sum + t.amount, 0);
    const totalIncome = income.reduce((sum, t) => sum + t.amount, 0);
    
    const avgExpense = expenses.length > 0 ? totalExpenses / expenses.length : 0;
    const avgIncome = income.length > 0 ? totalIncome / income.length : 0;
    
    // Categoria com mais gastos
    const expensesByCategory = expenses.reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);
    
    const topCategory = Object.entries(expensesByCategory)
      .sort(([, a], [, b]) => b - a)[0];
    
    const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0;
    
    return {
      totalTransactions: transactions.length,
      avgExpense,
      avgIncome,
      topCategory: topCategory ? { name: topCategory[0], amount: topCategory[1] } : null,
      savingsRate,
      isPositive: totalIncome > totalExpenses,
    };
  }, [transactions]);

  return (
    <Card className="p-4 sm:p-6 overflow-hidden">
      <div className="flex items-center gap-2 mb-3 sm:mb-4">
        <Target className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
        <h3 className="text-base sm:text-lg font-semibold">Insights Financeiros</h3>
      </div>
      
      <div className="space-y-3 sm:space-y-4">
        <div className="flex items-start gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-lg bg-muted/50">
          <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-primary mt-0.5 flex-shrink-0" />
          <div className="min-w-0">
            <p className="font-medium text-xs sm:text-sm">Total de Transações</p>
            <p className="text-xl sm:text-2xl font-bold text-primary">{insights.totalTransactions}</p>
          </div>
        </div>

        <div className="flex items-start gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-lg bg-muted/50">
          <TrendingDown className="h-4 w-4 sm:h-5 sm:w-5 text-danger mt-0.5 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="font-medium text-xs sm:text-sm">Gasto Médio por Transação</p>
            <p className="text-xl sm:text-2xl font-bold text-danger break-words">
              {formatCurrency(insights.avgExpense)}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-lg bg-muted/50">
          <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-success mt-0.5 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="font-medium text-xs sm:text-sm">Receita Média por Transação</p>
            <p className="text-xl sm:text-2xl font-bold text-success break-words">
              {formatCurrency(insights.avgIncome)}
            </p>
          </div>
        </div>

        {insights.topCategory && (
          <div className="flex items-start gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-lg bg-muted/50">
            <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-warning mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-xs sm:text-sm">Categoria com Mais Gastos</p>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <Badge variant="outline" className="text-xs">{insights.topCategory.name}</Badge>
                <span className="text-base sm:text-lg font-bold text-danger break-words">
                  {formatCurrency(insights.topCategory.amount)}
                </span>
              </div>
            </div>
          </div>
        )}

        <div className="p-3 sm:p-4 rounded-lg border-2 border-primary/20 bg-primary/5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <p className="font-medium text-xs sm:text-sm text-muted-foreground">Taxa de Economia</p>
              <p className={`text-2xl sm:text-3xl font-bold ${insights.savingsRate >= 0 ? 'text-success' : 'text-danger'}`}>
                {insights.savingsRate.toFixed(1)}%
              </p>
            </div>
            <Badge
              variant={insights.isPositive ? "default" : "destructive"}
              className="text-xs sm:text-sm w-fit"
            >
              {insights.isPositive ? "Positivo" : "Negativo"}
            </Badge>
          </div>
        </div>
      </div>
    </Card>
  );
}
