import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Installment } from "@/hooks/useInstallmentsStore";
import { CreditCard, Trash2, Calendar } from "lucide-react";
import { format, addMonths } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { EditCategoryDialog } from "./EditCategoryDialog";

interface InstallmentsListProps {
  installments: Installment[];
  onDelete: (id: string) => void;
  onUpdateCategory?: (id: string, category: string) => void;
}

export function InstallmentsList({ installments, onDelete, onUpdateCategory }: InstallmentsListProps) {
  const activeInstallments = installments.filter(
    (i) => i.currentInstallment <= i.installmentCount
  );

  if (activeInstallments.length === 0) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <CreditCard className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Financiamentos Ativos</h3>
        </div>
        <p className="text-center text-muted-foreground py-8">
          Nenhum financiamento ativo
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <CreditCard className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">Financiamentos Ativos</h3>
        <Badge variant="secondary" className="ml-auto">
          {activeInstallments.length}
        </Badge>
      </div>

      <div className="space-y-4">
        {activeInstallments.map((installment) => {
          const progress = (installment.currentInstallment / installment.installmentCount) * 100;
          const remainingInstallments = installment.installmentCount - installment.currentInstallment + 1;
          const remainingAmount = installment.installmentAmount * remainingInstallments;
          const nextPaymentDate = addMonths(installment.startDate, installment.currentInstallment - 1);

          return (
            <div
              key={installment.id}
              className="p-4 rounded-lg border bg-card space-y-3"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold">{installment.description}</p>
                    <div className="flex items-center gap-1">
                      <Badge
                        variant="outline"
                        className={cn(
                          installment.type === "income"
                            ? "bg-success/10 text-success border-success/20"
                            : "bg-danger/10 text-danger border-danger/20"
                        )}
                      >
                        {installment.category}
                      </Badge>
                      {onUpdateCategory && (
                        <EditCategoryDialog
                          currentCategory={installment.category}
                          type={installment.type}
                          onUpdate={(newCategory) => onUpdateCategory(installment.id, newCategory)}
                        />
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    <span>
                      Próxima: {format(nextPaymentDate, "dd/MM/yyyy", { locale: ptBR })}
                    </span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDelete(installment.id)}
                  className="hover:bg-destructive/20"
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    Parcela {installment.currentInstallment}/{installment.installmentCount}
                  </span>
                  <span className="font-semibold">
                    R$ {installment.installmentAmount.toFixed(2)}/mês
                  </span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>

              <div className="flex items-center justify-between pt-2 border-t">
                <div>
                  <p className="text-xs text-muted-foreground">Faltam</p>
                  <p className="font-semibold">{remainingInstallments} parcelas</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Total restante</p>
                  <p className={cn(
                    "font-semibold",
                    installment.type === "income" ? "text-success" : "text-danger"
                  )}>
                    R$ {remainingAmount.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
