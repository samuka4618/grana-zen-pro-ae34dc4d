import { Card } from "@/components/ui/card";
import { Transaction } from "@/hooks/useTransactionsStore";
import { useMemo } from "react";
import { format, addMonths, subMonths, startOfMonth, endOfMonth, isWithinInterval } from "date-fns";
import { ptBR } from "date-fns/locale";
import { AlertTriangle, TrendingUp, Activity } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/currency";

interface PredictiveAnalysisProps {
  allTransactions: Transaction[];
  recurringExpenses: number;
  recurringIncome: number;
}

export function PredictiveAnalysis({ allTransactions, recurringExpenses, recurringIncome }: PredictiveAnalysisProps) {
  const predictions = useMemo(() => {
    const now = new Date();
    const lastThreeMonths = [];
    
    // Calcular média dos últimos 3 meses
    for (let i = 1; i <= 3; i++) {
      const monthDate = subMonths(now, i);
      const start = startOfMonth(monthDate);
      const end = endOfMonth(monthDate);
      
      const monthTransactions = allTransactions.filter(t =>
        isWithinInterval(t.date, { start, end })
      );
      
      const expenses = monthTransactions
        .filter(t => t.type === "expense")
        .reduce((sum, t) => sum + t.amount, 0);
      
      const income = monthTransactions
        .filter(t => t.type === "income")
        .reduce((sum, t) => sum + t.amount, 0);
      
      lastThreeMonths.push({ expenses, income });
    }
    
    const avgExpenses = lastThreeMonths.reduce((sum, m) => sum + m.expenses, 0) / 3;
    const avgIncome = lastThreeMonths.reduce((sum, m) => sum + m.income, 0) / 3;
    
    // Previsão para próximos 3 meses
    const nextMonths = [];
    for (let i = 1; i <= 3; i++) {
      const monthDate = addMonths(now, i);
      const predictedExpenses = avgExpenses + recurringExpenses;
      const predictedIncome = avgIncome + recurringIncome;
      const predictedBalance = predictedIncome - predictedExpenses;
      
      nextMonths.push({
        month: format(monthDate, "MMMM 'de' yyyy", { locale: ptBR }),
        expenses: predictedExpenses,
        income: predictedIncome,
        balance: predictedBalance,
      });
    }
    
    // Detectar tendências
    const expenseTrend = lastThreeMonths[0].expenses < lastThreeMonths[2].expenses ? "crescente" : "decrescente";
    const incomeTrend = lastThreeMonths[0].income < lastThreeMonths[2].income ? "crescente" : "decrescente";
    
    // Detectar gastos incomuns no último mês
    const currentMonthStart = startOfMonth(now);
    const currentMonthEnd = endOfMonth(now);
    const currentExpenses = allTransactions
      .filter(t => t.type === "expense" && isWithinInterval(t.date, { start: currentMonthStart, end: currentMonthEnd }))
      .reduce((sum, t) => sum + t.amount, 0);
    
    const unusualSpending = currentExpenses > avgExpenses * 1.3;
    
    return {
      nextMonths,
      expenseTrend,
      incomeTrend,
      unusualSpending,
      avgExpenses,
      avgIncome,
    };
  }, [allTransactions, recurringExpenses, recurringIncome]);

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <Activity className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">Análise Preditiva</h3>
      </div>

      <div className="space-y-6">
        {/* Tendências */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm">Tendências Detectadas</h4>
          <div className="flex flex-wrap gap-2">
            <Badge variant={predictions.expenseTrend === "crescente" ? "destructive" : "default"}>
              <TrendingUp className="h-3 w-3 mr-1" />
              Despesas {predictions.expenseTrend}
            </Badge>
            <Badge variant={predictions.incomeTrend === "crescente" ? "default" : "outline"}>
              <TrendingUp className="h-3 w-3 mr-1" />
              Receitas {predictions.incomeTrend}
            </Badge>
            {predictions.unusualSpending && (
              <Badge variant="destructive">
                <AlertTriangle className="h-3 w-3 mr-1" />
                Gastos acima da média
              </Badge>
            )}
          </div>
        </div>

        {/* Médias */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-muted/50 rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">Média de Despesas (3 meses)</p>
            <p className="text-lg font-bold text-danger">{formatCurrency(predictions.avgExpenses)}</p>
          </div>
          <div className="p-3 bg-muted/50 rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">Média de Receitas (3 meses)</p>
            <p className="text-lg font-bold text-success">{formatCurrency(predictions.avgIncome)}</p>
          </div>
        </div>

        {/* Previsões */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm">Projeção para os Próximos 3 Meses</h4>
          {predictions.nextMonths.map((month, idx) => (
            <div key={idx} className="p-3 border rounded-lg">
              <p className="font-medium text-sm mb-2">{month.month}</p>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div>
                  <p className="text-muted-foreground">Receitas</p>
                  <p className="font-medium text-success">{formatCurrency(month.income)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Despesas</p>
                  <p className="font-medium text-danger">{formatCurrency(month.expenses)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Saldo</p>
                  <p className={`font-medium ${month.balance >= 0 ? 'text-success' : 'text-danger'}`}>
                    {formatCurrency(month.balance)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
