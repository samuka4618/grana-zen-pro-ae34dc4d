import { useEffect } from "react";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { useInvestmentsStore } from "@/hooks/useInvestmentsStore";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

const COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

export const InvestmentDiversification = () => {
  const { user } = useAuth();
  const { investments, loading, fetchInvestments } = useInvestmentsStore();

  useEffect(() => {
    if (user) {
      fetchInvestments(user.id);
    }
  }, [user]);

  const diversificationData = investments.reduce((acc, inv) => {
    const value = inv.quantity * inv.current_price;
    const existing = acc.find((item) => item.name === inv.type);
    
    if (existing) {
      existing.value += value;
    } else {
      acc.push({ name: inv.type, value });
    }
    
    return acc;
  }, [] as { name: string; value: number }[]);

  const totalValue = diversificationData.reduce((sum, item) => sum + item.value, 0);

  const dataWithPercentage = diversificationData.map((item) => ({
    ...item,
    percentage: ((item.value / totalValue) * 100).toFixed(1),
  }));

  if (loading) {
    return <div>Carregando diversificação...</div>;
  }

  if (investments.length === 0) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Diversificação</h3>
        <p className="text-muted-foreground text-center py-8">
          Adicione investimentos para visualizar a diversificação da sua carteira.
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Diversificação por Tipo</h3>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={dataWithPercentage}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ percentage }) => `${percentage}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {dataWithPercentage.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) => `R$ ${value.toFixed(2)}`}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="space-y-4">
          {dataWithPercentage.map((item, index) => (
            <div key={item.name} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <span className="font-medium">{item.name}</span>
              </div>
              <div className="text-right">
                <p className="font-semibold">R$ {item.value.toFixed(2)}</p>
                <p className="text-sm text-muted-foreground">
                  {item.percentage}%
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};
