import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Calendar } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { RecurringContract } from "@/hooks/useRecurringContractsStore";
import { formatCurrency } from "@/lib/currency";

interface ProjectionMonth {
  month: Date;
  expenses: number;
  income: number;
  balance: number;
  installments: any[];
}

interface FutureProjectionProps {
  projections: ProjectionMonth[];
  recurringExpenses: number;
  recurringIncome: number;
  contracts: RecurringContract[];
}

export function FutureProjection({ projections, recurringExpenses, recurringIncome, contracts }: FutureProjectionProps) {
  const activeContracts = contracts.filter((c) => c.active);
  
  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">Projeção Completa</h3>
      </div>

      {activeContracts.length > 0 && (
        <div className="mb-4 p-3 rounded-lg bg-primary/5 border border-primary/20">
          <p className="text-xs text-muted-foreground mb-2">Contratos Fixos Mensais</p>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-success" />
              <span className="font-semibold text-success">+{formatCurrency(recurringIncome)}</span>
            </div>
            <div className="flex items-center gap-1">
              <TrendingDown className="h-3 w-3 text-danger" />
              <span className="font-semibold text-danger">-{formatCurrency(recurringExpenses)}</span>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {projections.map((projection, index) => {
          const totalIncome = projection.income + recurringIncome;
          const totalExpenses = projection.expenses + recurringExpenses;
          const totalBalance = totalIncome - totalExpenses;
          const isPositive = totalBalance >= 0;
          const hasItems = projection.installments.length > 0 || activeContracts.length > 0;

          return (
            <div
              key={index}
              className={cn(
                "p-4 rounded-lg border transition-colors",
                index === 0 ? "bg-primary/5 border-primary/20" : "bg-card"
              )}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">
                    {format(projection.month, "MMMM 'de' yyyy", { locale: ptBR })}
                  </span>
                  {index === 0 && (
                    <Badge variant="default" className="text-xs">
                      Mês Atual
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {activeContracts.length > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      {activeContracts.length} contrato(s)
                    </Badge>
                  )}
                  {projection.installments.length > 0 && (
                    <Badge variant="outline" className="text-xs">
                      {projection.installments.length} parcela(s)
                    </Badge>
                  )}
                </div>
              </div>

              {hasItems ? (
                <>
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div className="p-3 rounded-lg bg-success/10">
                      <div className="flex items-center gap-2 mb-1">
                        <TrendingUp className="h-4 w-4 text-success" />
                        <p className="text-xs text-muted-foreground">Receitas</p>
                      </div>
                      <p className="font-semibold text-success">
                        {formatCurrency(totalIncome)}
                      </p>
                      {recurringIncome > 0 && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Fixo: {formatCurrency(recurringIncome)}
                        </p>
                      )}
                    </div>

                    <div className="p-3 rounded-lg bg-danger/10">
                      <div className="flex items-center gap-2 mb-1">
                        <TrendingDown className="h-4 w-4 text-danger" />
                        <p className="text-xs text-muted-foreground">Despesas</p>
                      </div>
                      <p className="font-semibold text-danger">
                        {formatCurrency(totalExpenses)}
                      </p>
                      {recurringExpenses > 0 && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Fixo: {formatCurrency(recurringExpenses)}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="pt-3 border-t">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Saldo Previsto</span>
                      <span
                        className={cn(
                          "text-lg font-bold",
                          isPositive ? "text-success" : "text-danger"
                        )}
                      >
                        {isPositive ? "+" : ""}{formatCurrency(totalBalance)}
                      </span>
                    </div>
                  </div>
                </>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-2">
                  Nenhuma movimentação prevista
                </p>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}
