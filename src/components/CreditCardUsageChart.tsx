import { Card } from "@/components/ui/card";
import { useCreditCardsStore } from "@/hooks/useCreditCardsStore";
import { useCreditCardPurchasesStore } from "@/hooks/useCreditCardPurchasesStore";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { TrendingUp } from "lucide-react";
import { formatCurrency } from "@/lib/currency";
import { useState, useEffect } from "react";

export function CreditCardUsageChart() {
  const { cards } = useCreditCardsStore();
  const { getUsedLimit } = useCreditCardPurchasesStore();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 640);
  
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const chartData = cards
    .filter(c => c.active)
    .map(card => {
      const used = getUsedLimit(card.id);
      const available = card.creditLimit - used;
      const usagePercentage = (used / card.creditLimit) * 100;

      return {
        name: card.name,
        used,
        available,
        usagePercentage: usagePercentage.toFixed(1),
        limit: card.creditLimit,
      };
    });

  const COLORS = [
    "hsl(var(--primary))",
    "hsl(var(--success))",
    "hsl(var(--warning))",
    "hsl(var(--danger))",
    "hsl(var(--muted-foreground))",
  ];

  if (chartData.length === 0) {
    return (
      <Card className="p-4 sm:p-6 overflow-hidden">
        <div className="flex items-center gap-2 mb-3 sm:mb-4">
          <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
          <h3 className="text-base sm:text-lg font-semibold">Uso por Cartão</h3>
        </div>
        <p className="text-xs sm:text-sm text-muted-foreground text-center py-6 sm:py-8">
          Nenhum cartão ativo
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-4 sm:p-6 overflow-hidden">
      <div className="flex items-center gap-2 mb-3 sm:mb-4">
        <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
        <h3 className="text-base sm:text-lg font-semibold">Uso por Cartão</h3>
      </div>

      <ResponsiveContainer width="100%" height={250} className="sm:h-[300px]">
        <PieChart>
          <Pie
            data={chartData}
            dataKey="used"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={isMobile ? 60 : 80}
            label={({ name, usagePercentage }) => `${name}: ${usagePercentage}%`}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number) => formatCurrency(value)}
            contentStyle={{
              backgroundColor: "hsl(var(--background))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "8px",
            }}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>

      <div className="mt-3 sm:mt-4 space-y-2">
        {chartData.map((card, index) => (
          <div key={index} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2 rounded bg-muted/50">
            <div className="flex items-center gap-2 min-w-0">
              <div
                className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              />
              <span className="text-xs sm:text-sm font-medium truncate">{card.name}</span>
            </div>
            <div className="text-left sm:text-right flex-shrink-0">
              <p className="text-xs sm:text-sm font-semibold break-words">{formatCurrency(card.used)} / {formatCurrency(card.limit)}</p>
              <p className="text-xs text-muted-foreground">{card.usagePercentage}% usado</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
