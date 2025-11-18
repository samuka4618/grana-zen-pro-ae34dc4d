import { Card } from "@/components/ui/card";
import { useCreditCardsStore } from "@/hooks/useCreditCardsStore";
import { useCreditCardPurchasesStore } from "@/hooks/useCreditCardPurchasesStore";
import { CreditCard, TrendingUp, DollarSign, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMemo } from "react";
import { addMonths } from "date-fns";

interface CreditCardStatsCardsProps {
  currentMonth: Date;
}

export function CreditCardStatsCards({ currentMonth }: CreditCardStatsCardsProps) {
  const { cards } = useCreditCardsStore();
  const { getInvoiceData, getUsedLimit } = useCreditCardPurchasesStore();

  const stats = useMemo(() => {
    const activeCards = cards.filter(c => c.active);
    const totalLimit = activeCards.reduce((sum, card) => sum + card.creditLimit, 0);
    const totalUsed = activeCards.reduce((sum, card) => sum + getUsedLimit(card.id), 0);
    const totalAvailable = totalLimit - totalUsed;

    // Fatura do mês atual
    const currentMonthTotal = activeCards.reduce((sum, card) => {
      const invoiceData = getInvoiceData(card.id, currentMonth, card.closingDay);
      return sum + invoiceData.total;
    }, 0);

    // Próxima fatura (mês seguinte)
    const nextMonth = addMonths(currentMonth, 1);
    const nextMonthTotal = activeCards.reduce((sum, card) => {
      const invoiceData = getInvoiceData(card.id, nextMonth, card.closingDay);
      return sum + invoiceData.total;
    }, 0);

    const usagePercentage = totalLimit > 0 ? (totalUsed / totalLimit) * 100 : 0;

    return {
      totalCards: activeCards.length,
      totalLimit,
      totalUsed,
      totalAvailable,
      currentMonthTotal,
      nextMonthTotal,
      usagePercentage,
    };
  }, [cards, currentMonth, getInvoiceData, getUsedLimit]);

  return (
    <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
      <Card className="p-4 sm:p-6">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm text-muted-foreground">Cartões Ativos</p>
          <CreditCard className="h-4 w-4 text-primary" />
        </div>
        <p className="text-2xl sm:text-3xl font-bold">{stats.totalCards}</p>
        <p className="text-xs text-muted-foreground mt-1">
          Total cadastrados: {cards.length}
        </p>
      </Card>

      <Card className="p-4 sm:p-6">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm text-muted-foreground">Limite Disponível</p>
          <DollarSign className="h-4 w-4 text-success" />
        </div>
        <p className="text-2xl sm:text-3xl font-bold text-success">
          R$ {stats.totalAvailable.toFixed(0)}
        </p>
        <div className="flex items-center gap-2 mt-1">
          <div className="flex-1 bg-muted rounded-full h-1.5">
            <div
              className={cn(
                "h-1.5 rounded-full transition-all",
                stats.usagePercentage > 80 ? "bg-danger" : "bg-success"
              )}
              style={{ width: `${Math.min(stats.usagePercentage, 100)}%` }}
            />
          </div>
          <span className="text-xs text-muted-foreground">
            {stats.usagePercentage.toFixed(0)}%
          </span>
        </div>
      </Card>

      <Card className="p-4 sm:p-6">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm text-muted-foreground">Fatura Atual</p>
          <Calendar className="h-4 w-4 text-danger" />
        </div>
        <p className="text-2xl sm:text-3xl font-bold text-danger">
          R$ {stats.currentMonthTotal.toFixed(0)}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Vencimentos este mês
        </p>
      </Card>

      <Card className="p-4 sm:p-6">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm text-muted-foreground">Próxima Fatura</p>
          <TrendingUp className="h-4 w-4 text-warning" />
        </div>
        <p className="text-2xl sm:text-3xl font-bold text-warning">
          R$ {stats.nextMonthTotal.toFixed(0)}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Previsão mês seguinte
        </p>
      </Card>
    </div>
  );
}
