import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Transaction } from "@/hooks/useTransactionsStore";
import { useMemo } from "react";
import { ArrowUpCircle, ArrowDownCircle, TrendingUp } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { formatCurrency } from "@/lib/currency";

interface TopTransactionsProps {
  transactions: Transaction[];
}

export function TopTransactions({ transactions }: TopTransactionsProps) {
  const topExpenses = useMemo(() => {
    return transactions
      .filter((t) => t.type === "expense")
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);
  }, [transactions]);

  const topIncomes = useMemo(() => {
    return transactions
      .filter((t) => t.type === "income")
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);
  }, [transactions]);

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <ArrowDownCircle className="h-5 w-5 text-danger" />
          <h3 className="text-lg font-semibold">Maiores Despesas</h3>
        </div>
        
        <div className="space-y-3">
          {topExpenses.length > 0 ? (
            topExpenses.map((transaction, index) => (
              <div key={transaction.id} className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center gap-3 flex-1">
                  <div className="flex items-center justify-center w-6 h-6 rounded-full bg-danger/10 text-danger text-xs font-bold">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{transaction.description}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {transaction.category}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {format(transaction.date, "dd/MM", { locale: ptBR })}
                      </span>
                    </div>
                  </div>
                </div>
                <span className="font-semibold text-danger tabular-nums">
                  {formatCurrency(transaction.amount)}
                </span>
              </div>
            ))
          ) : (
            <p className="text-center text-muted-foreground py-4 text-sm">
              Nenhuma despesa neste período
            </p>
          )}
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <ArrowUpCircle className="h-5 w-5 text-success" />
          <h3 className="text-lg font-semibold">Maiores Receitas</h3>
        </div>
        
        <div className="space-y-3">
          {topIncomes.length > 0 ? (
            topIncomes.map((transaction, index) => (
              <div key={transaction.id} className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center gap-3 flex-1">
                  <div className="flex items-center justify-center w-6 h-6 rounded-full bg-success/10 text-success text-xs font-bold">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{transaction.description}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {transaction.category}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {format(transaction.date, "dd/MM", { locale: ptBR })}
                      </span>
                    </div>
                  </div>
                </div>
                <span className="font-semibold text-success tabular-nums">
                  {formatCurrency(transaction.amount)}
                </span>
              </div>
            ))
          ) : (
            <p className="text-center text-muted-foreground py-4 text-sm">
              Nenhuma receita neste período
            </p>
          )}
        </div>
      </Card>
    </div>
  );
}
