import { Card } from "@/components/ui/card";
import { Transaction } from "@/hooks/useTransactionsStore";
import { useMemo, useState, useEffect } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { formatCurrency } from "@/lib/currency";

interface ExpensesByCategoryProps {
  transactions: Transaction[];
}

const COLORS = [
  "hsl(var(--danger))",
  "hsl(var(--warning))",
  "hsl(var(--primary))",
  "hsl(var(--success))",
  "hsl(var(--accent))",
  "hsl(var(--secondary))",
];

export function ExpensesByCategory({ transactions }: ExpensesByCategoryProps) {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 640);
  
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const data = useMemo(() => {
    const expenses = transactions.filter((t) => t.type === "expense");
    const byCategory = expenses.reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(byCategory)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [transactions]);

  const total = data.reduce((sum, item) => sum + item.value, 0);

  if (data.length === 0) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Despesas por Categoria</h3>
        <p className="text-center text-muted-foreground py-8">
          Nenhuma despesa neste período
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-4 sm:p-6 overflow-hidden">
      <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Despesas por Categoria</h3>
      
      <ResponsiveContainer width="100%" height={250} className="sm:h-[300px]">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            outerRadius={isMobile ? 60 : 80}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number) => formatCurrency(value)}
          />
        </PieChart>
      </ResponsiveContainer>

      <div className="mt-3 sm:mt-4 space-y-2">
        {data.map((item, index) => (
          <div key={item.name} className="flex items-center justify-between text-xs sm:text-sm gap-2">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <div
                className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              />
              <span className="truncate">{item.name}</span>
            </div>
            <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
              <span className="font-medium text-xs sm:text-sm">{formatCurrency(item.value)}</span>
              <span className="text-muted-foreground text-xs">
                ({((item.value / total) * 100).toFixed(1)}%)
              </span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
