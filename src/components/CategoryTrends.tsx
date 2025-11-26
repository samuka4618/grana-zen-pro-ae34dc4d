import { Card } from "@/components/ui/card";
import { Transaction } from "@/hooks/useTransactionsStore";
import { useMemo } from "react";
import { format, subMonths, startOfMonth, endOfMonth, isWithinInterval } from "date-fns";
import { ptBR } from "date-fns/locale";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { PieChart } from "lucide-react";
import { formatCurrency, formatCurrencyForChart } from "@/lib/currency";

interface CategoryTrendsProps {
  allTransactions: Transaction[];
}

export function CategoryTrends({ allTransactions }: CategoryTrendsProps) {
  const chartData = useMemo(() => {
    const months = [];
    const now = new Date();
    const categories = new Set<string>();
    
    // Coletar todas as categorias
    allTransactions.forEach(t => {
      if (t.type === "expense") {
        categories.add(t.category);
      }
    });
    
    for (let i = 2; i >= 0; i--) {
      const monthDate = subMonths(now, i);
      const start = startOfMonth(monthDate);
      const end = endOfMonth(monthDate);
      
      const monthData: any = {
        month: format(monthDate, "MMM/yy", { locale: ptBR }),
      };
      
      categories.forEach(category => {
        const total = allTransactions
          .filter(t => 
            t.type === "expense" &&
            t.category === category &&
            isWithinInterval(t.date, { start, end })
          )
          .reduce((sum, t) => sum + t.amount, 0);
        
        monthData[category] = total;
      });
      
      months.push(monthData);
    }
    
    return { months, categories: Array.from(categories) };
  }, [allTransactions]);

  const colors = [
    "hsl(var(--primary))",
    "hsl(var(--success))",
    "hsl(var(--warning))",
    "hsl(var(--danger))",
    "hsl(var(--muted-foreground))",
  ];

  return (
    <Card className="p-4 sm:p-6 overflow-hidden">
      <div className="flex items-center gap-2 mb-4 sm:mb-6">
        <PieChart className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
        <h3 className="text-base sm:text-lg font-semibold">Gastos por Categoria (Últimos 3 Meses)</h3>
      </div>

      {chartData.categories.length > 0 ? (
        <ResponsiveContainer width="100%" height={250} className="sm:h-[300px]">
          <BarChart data={chartData.months} margin={{ top: 5, right: 5, left: -10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="month" fontSize={10} className="sm:text-xs" />
            <YAxis 
              fontSize={10}
              className="sm:text-xs"
              width={50}
              tickFormatter={(value) => {
                const formatted = formatCurrencyForChart(value, 0);
                return formatted.length > 6 ? formatted.slice(0, 4) + 'k' : formatted;
              }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--background))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
              }}
              formatter={(value: number) => formatCurrency(value)}
            />
            <Legend />
            {chartData.categories.map((category, index) => (
              <Bar
                key={category}
                dataKey={category}
                fill={colors[index % colors.length]}
                name={category}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <p className="text-sm text-muted-foreground text-center py-8">
          Sem dados de categorias para exibir
        </p>
      )}
    </Card>
  );
}
