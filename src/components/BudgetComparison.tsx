import { useEffect, useState } from 'react';
import { TrendingDown, TrendingUp, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { useBudgetsStore } from '@/hooks/useBudgetsStore';
import { useTransactionsStore } from '@/hooks/useTransactionsStore';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { formatCurrency } from '@/lib/currency';

interface BudgetComparisonProps {
  selectedDate: Date;
}

export const BudgetComparison = ({ selectedDate }: BudgetComparisonProps) => {
  const { budgets, fetchBudgets } = useBudgetsStore();
  const { transactions } = useTransactionsStore(selectedDate);
  const [comparisonData, setComparisonData] = useState<any[]>([]);

  useEffect(() => {
    fetchBudgets(selectedDate);
  }, [selectedDate, fetchBudgets]);

  useEffect(() => {
    if (budgets.length === 0) return;

    const monthStart = startOfMonth(selectedDate);
    const monthEnd = endOfMonth(selectedDate);

    const comparison = budgets.map((budget) => {
      const spent = transactions
        .filter(
          (t) =>
            t.category === budget.category &&
            t.type === 'expense' &&
            new Date(t.date) >= monthStart &&
            new Date(t.date) <= monthEnd
        )
        .reduce((sum, t) => sum + t.amount, 0);

      const percentage = (spent / budget.planned_amount) * 100;
      const remaining = budget.planned_amount - spent;
      const status =
        percentage >= 100
          ? 'over'
          : percentage >= 80
          ? 'warning'
          : 'good';

      return {
        category: budget.category,
        planned: budget.planned_amount,
        spent,
        remaining,
        percentage: Math.min(percentage, 100),
        status,
      };
    });

    setComparisonData(comparison);
  }, [budgets, transactions, selectedDate]);

  const totalPlanned = comparisonData.reduce((sum, item) => sum + item.planned, 0);
  const totalSpent = comparisonData.reduce((sum, item) => sum + item.spent, 0);
  const totalPercentage = totalPlanned > 0 ? (totalSpent / totalPlanned) * 100 : 0;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'over':
        return 'bg-red-500';
      case 'warning':
        return 'bg-yellow-500';
      default:
        return 'bg-green-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'over':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <TrendingUp className="h-4 w-4 text-yellow-500" />;
      default:
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    }
  };

  const monthName = format(selectedDate, "MMMM 'de' yyyy", { locale: ptBR });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingDown className="h-5 w-5" />
          Orçado vs Realizado
        </CardTitle>
        <CardDescription>
          Acompanhe seus gastos em relação ao planejado - {monthName}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {comparisonData.length === 0 ? (
          <p className="text-center text-muted-foreground py-4">
            Defina orçamentos para ver a comparação
          </p>
        ) : (
          <>
            {/* Total Summary */}
            <div className="p-4 border rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold">Total Geral</span>
                <Badge variant={totalPercentage >= 100 ? 'destructive' : 'secondary'}>
                  {totalPercentage.toFixed(0)}%
                </Badge>
              </div>
              <Progress value={Math.min(totalPercentage, 100)} className="h-2" />
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground tabular-nums">
                  Planejado: {formatCurrency(totalPlanned)}
                </span>
                <span className={`tabular-nums ${totalSpent > totalPlanned ? 'text-red-500 font-semibold' : ''}`}>
                  Gasto: {formatCurrency(totalSpent)}
                </span>
              </div>
            </div>

            {/* Category Details */}
            <div className="space-y-4">
              {comparisonData.map((item) => (
                <div key={item.category} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(item.status)}
                      <span className="font-medium">{item.category}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className={item.status === 'over' ? 'border-red-500 text-red-500' : ''}
                      >
                        {item.percentage.toFixed(0)}%
                      </Badge>
                      {item.status === 'over' && (
                        <span className="text-xs text-red-500 font-semibold tabular-nums">
                          +{formatCurrency(item.spent - item.planned).replace('R$', '').trim()}
                        </span>
                      )}
                    </div>
                  </div>
                  <Progress value={item.percentage} className={`h-2 ${getStatusColor(item.status)}`} />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span className="tabular-nums">{formatCurrency(item.spent)} de {formatCurrency(item.planned)}</span>
                    <span className={`tabular-nums ${item.remaining < 0 ? 'text-red-500' : 'text-green-600'}`}>
                      {item.remaining >= 0 ? 'Restam' : 'Excedeu'} {formatCurrency(Math.abs(item.remaining)).replace('R$', '').trim()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
