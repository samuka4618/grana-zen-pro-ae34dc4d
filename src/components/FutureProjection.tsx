import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Calendar } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface ProjectionMonth {
  month: Date;
  expenses: number;
  income: number;
  balance: number;
  installments: any[];
}

interface FutureProjectionProps {
  projections: ProjectionMonth[];
}

export function FutureProjection({ projections }: FutureProjectionProps) {
  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">Projeção de Parcelas</h3>
      </div>

      <div className="space-y-3">
        {projections.map((projection, index) => {
          const isPositive = projection.balance >= 0;
          const hasInstallments = projection.installments.length > 0;

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
                <Badge variant={hasInstallments ? "secondary" : "outline"} className="text-xs">
                  {projection.installments.length} parcela(s)
                </Badge>
              </div>

              {hasInstallments ? (
                <>
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div className="flex items-center gap-2 p-2 rounded-lg bg-success/10">
                      <TrendingUp className="h-4 w-4 text-success" />
                      <div>
                        <p className="text-xs text-muted-foreground">Receitas</p>
                        <p className="font-semibold text-success">
                          R$ {projection.income.toFixed(2)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 p-2 rounded-lg bg-danger/10">
                      <TrendingDown className="h-4 w-4 text-danger" />
                      <div>
                        <p className="text-xs text-muted-foreground">Despesas</p>
                        <p className="font-semibold text-danger">
                          R$ {projection.expenses.toFixed(2)}
                        </p>
                      </div>
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
                        {isPositive ? "+" : ""}R$ {projection.balance.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-2">
                  Nenhuma parcela prevista
                </p>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}
