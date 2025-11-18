import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useCreditCardPurchasesStore } from "@/hooks/useCreditCardPurchasesStore";
import { Clock, Calendar } from "lucide-react";
import { format, addMonths } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useMemo } from "react";

export function PendingInstallmentsCard() {
  const { purchases } = useCreditCardPurchasesStore();

  const pendingData = useMemo(() => {
    const now = new Date();
    
    return purchases
      .map(purchase => {
        const monthsSincePurchase = Math.floor(
          (now.getTime() - purchase.purchaseDate.getTime()) / (1000 * 60 * 60 * 24 * 30)
        );
        const paidInstallments = Math.max(0, Math.min(monthsSincePurchase, purchase.installments));
        const remainingInstallments = purchase.installments - paidInstallments;
        const remainingAmount = purchase.installmentAmount * remainingInstallments;
        const nextPaymentDate = addMonths(purchase.purchaseDate, paidInstallments);
        const progress = (paidInstallments / purchase.installments) * 100;

        return {
          ...purchase,
          paidInstallments,
          remainingInstallments,
          remainingAmount,
          nextPaymentDate,
          progress,
        };
      })
      .filter(item => item.remainingInstallments > 0)
      .sort((a, b) => b.remainingAmount - a.remainingAmount)
      .slice(0, 5);
  }, [purchases]);

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <Clock className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">Parcelamentos Pendentes</h3>
      </div>

      {pendingData.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">
          Nenhum parcelamento pendente
        </p>
      ) : (
        <div className="space-y-4">
          {pendingData.map((item) => (
            <div key={item.id} className="p-3 border rounded-lg space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="font-medium text-sm">{item.description}</p>
                  <Badge variant="outline" className="mt-1 text-xs">
                    {item.category}
                  </Badge>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-danger">
                    R$ {item.remainingAmount.toFixed(2)}
                  </p>
                  <p className="text-xs text-muted-foreground">restante</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">
                    {item.paidInstallments}/{item.installments} pagas
                  </span>
                  <span className="font-medium">
                    {item.remainingInstallments}x de R$ {item.installmentAmount.toFixed(2)}
                  </span>
                </div>
                <Progress value={item.progress} className="h-2" />
              </div>

              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                <span>Próxima: {format(item.nextPaymentDate, "dd/MM/yyyy", { locale: ptBR })}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
