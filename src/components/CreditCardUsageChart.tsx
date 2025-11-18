import { Card } from "@/components/ui/card";
import { useCreditCardsStore } from "@/hooks/useCreditCardsStore";
import { useCreditCardPurchasesStore } from "@/hooks/useCreditCardPurchasesStore";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { TrendingUp } from "lucide-react";

export function CreditCardUsageChart() {
  const { cards } = useCreditCardsStore();
  const { getUsedLimit } = useCreditCardPurchasesStore();

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
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Uso por Cartão</h3>
        </div>
        <p className="text-sm text-muted-foreground text-center py-8">
          Nenhum cartão ativo
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">Uso por Cartão</h3>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={chartData}
            dataKey="used"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={80}
            label={({ name, usagePercentage }) => `${name}: ${usagePercentage}%`}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number) => `R$ ${value.toFixed(2)}`}
            contentStyle={{
              backgroundColor: "hsl(var(--background))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "8px",
            }}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>

      <div className="mt-4 space-y-2">
        {chartData.map((card, index) => (
          <div key={index} className="flex items-center justify-between p-2 rounded bg-muted/50">
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              />
              <span className="text-sm font-medium">{card.name}</span>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold">R$ {card.used.toFixed(2)} / R$ {card.limit.toFixed(2)}</p>
              <p className="text-xs text-muted-foreground">{card.usagePercentage}% usado</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
