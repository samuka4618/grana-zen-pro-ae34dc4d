import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useCreditCardPurchasesStore } from "@/hooks/useCreditCardPurchasesStore";
import { PieChart as PieChartIcon } from "lucide-react";
import { useMemo } from "react";

interface CategorySpendingCardProps {
  currentMonth: Date;
}

export function CategorySpendingCard({ currentMonth }: CategorySpendingCardProps) {
  const { purchases } = useCreditCardPurchasesStore();

  const categoryData = useMemo(() => {
    const categoryTotals: Record<string, number> = {};

    purchases.forEach(purchase => {
      // Calcular se alguma parcela cai no mês atual
      const purchaseMonth = purchase.purchaseDate;
      const monthsDiff = (currentMonth.getFullYear() - purchaseMonth.getFullYear()) * 12 + 
                        (currentMonth.getMonth() - purchaseMonth.getMonth());

      if (monthsDiff >= 0 && monthsDiff < purchase.installments) {
        categoryTotals[purchase.category] = (categoryTotals[purchase.category] || 0) + purchase.installmentAmount;
      }
    });

    const sorted = Object.entries(categoryTotals)
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);

    const total = sorted.reduce((sum, item) => sum + item.amount, 0);

    return sorted.map(item => ({
      ...item,
      percentage: total > 0 ? ((item.amount / total) * 100).toFixed(1) : "0",
    }));
  }, [purchases, currentMonth]);

  const COLORS = [
    "hsl(var(--primary))",
    "hsl(var(--success))",
    "hsl(var(--warning))",
    "hsl(var(--danger))",
    "hsl(var(--muted-foreground))",
  ];

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <PieChartIcon className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">Gastos por Categoria</h3>
      </div>

      {categoryData.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">
          Nenhum gasto neste período
        </p>
      ) : (
        <div className="space-y-3">
          {categoryData.map((item, index) => (
            <div key={item.category} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: COLORS[index] }}
                  />
                  <Badge variant="outline">{item.category}</Badge>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold">R$ {item.amount.toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground">{item.percentage}%</p>
                </div>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="h-2 rounded-full transition-all"
                  style={{ 
                    width: `${item.percentage}%`,
                    backgroundColor: COLORS[index]
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
