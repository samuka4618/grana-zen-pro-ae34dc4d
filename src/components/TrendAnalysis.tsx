import { Card } from "@/components/ui/card";
import { Transaction } from "@/hooks/useTransactionsStore";
import { useMemo } from "react";
import { format, subMonths, startOfMonth, endOfMonth, isWithinInterval } from "date-fns";
import { ptBR } from "date-fns/locale";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { TrendingUp } from "lucide-react";
import { formatCurrency, formatCurrencyForChart } from "@/lib/currency";

interface TrendAnalysisProps {
  allTransactions: Transaction[];
}

export function TrendAnalysis({ allTransactions }: TrendAnalysisProps) {
  const chartData = useMemo(() => {
    const months = [];
    const now = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const monthDate = subMonths(now, i);
      const start = startOfMonth(monthDate);
      const end = endOfMonth(monthDate);
      
      const monthTransactions = allTransactions.filter(t =>
        isWithinInterval(t.date, { start, end })
      );
      
      const income = monthTransactions
        .filter(t => t.type === "income")
        .reduce((sum, t) => sum + t.amount, 0);
      
      const expenses = monthTransactions
        .filter(t => t.type === "expense")
        .reduce((sum, t) => sum + t.amount, 0);
      
      const balance = income - expenses;
      
      months.push({
        month: format(monthDate, "MMM/yy", { locale: ptBR }),
        receitas: income,
        despesas: expenses,
        saldo: balance,
      });
    }
    
    return months;
  }, [allTransactions]);

  return (
    <Card className="p-4 sm:p-6 overflow-hidden">
      <div className="flex items-center gap-2 mb-4 sm:mb-6">
        <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
        <h3 className="text-base sm:text-lg font-semibold">Evolução dos Últimos 6 Meses</h3>
      </div>

      <ResponsiveContainer width="100%" height={250} className="sm:h-[300px]">
        <LineChart data={chartData} margin={{ top: 5, right: 5, left: -10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis 
            dataKey="month" 
            fontSize={10}
            className="sm:text-xs"
          />
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
          <Line
            type="monotone"
            dataKey="receitas"
            stroke="hsl(var(--success))"
            strokeWidth={2}
            name="Receitas"
          />
          <Line
            type="monotone"
            dataKey="despesas"
            stroke="hsl(var(--danger))"
            strokeWidth={2}
            name="Despesas"
          />
          <Line
            type="monotone"
            dataKey="saldo"
            stroke="hsl(var(--primary))"
            strokeWidth={2}
            name="Saldo"
          />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
}
