import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Transaction } from "@/hooks/useTransactionsStore";
import { useMemo } from "react";
import { TrendingUp, TrendingDown, Calendar, Target, AlertCircle } from "lucide-react";

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
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <Target className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">Insights Financeiros</h3>
      </div>
      
      <div className="space-y-4">
        <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
          <Calendar className="h-5 w-5 text-primary mt-0.5" />
          <div>
            <p className="font-medium text-sm">Total de Transações</p>
            <p className="text-2xl font-bold text-primary">{insights.totalTransactions}</p>
          </div>
        </div>

        <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
          <TrendingDown className="h-5 w-5 text-danger mt-0.5" />
          <div className="flex-1">
            <p className="font-medium text-sm">Gasto Médio por Transação</p>
            <p className="text-2xl font-bold text-danger">
              R$ {insights.avgExpense.toFixed(2)}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
          <TrendingUp className="h-5 w-5 text-success mt-0.5" />
          <div className="flex-1">
            <p className="font-medium text-sm">Receita Média por Transação</p>
            <p className="text-2xl font-bold text-success">
              R$ {insights.avgIncome.toFixed(2)}
            </p>
          </div>
        </div>

        {insights.topCategory && (
          <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
            <AlertCircle className="h-5 w-5 text-warning mt-0.5" />
            <div className="flex-1">
              <p className="font-medium text-sm">Categoria com Mais Gastos</p>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline">{insights.topCategory.name}</Badge>
                <span className="text-lg font-bold text-danger">
                  R$ {insights.topCategory.amount.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        )}

        <div className="p-4 rounded-lg border-2 border-primary/20 bg-primary/5">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-sm text-muted-foreground">Taxa de Economia</p>
              <p className={`text-3xl font-bold ${insights.savingsRate >= 0 ? 'text-success' : 'text-danger'}`}>
                {insights.savingsRate.toFixed(1)}%
              </p>
            </div>
            <Badge
              variant={insights.isPositive ? "default" : "destructive"}
              className="text-sm"
            >
              {insights.isPositive ? "Positivo" : "Negativo"}
            </Badge>
          </div>
        </div>
      </div>
    </Card>
  );
}
