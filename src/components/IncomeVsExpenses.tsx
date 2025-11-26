import { Card } from "@/components/ui/card";
import { Transaction } from "@/hooks/useTransactionsStore";
import { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { format, startOfMonth, eachDayOfInterval, endOfMonth, isSameDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { formatCurrency, formatCurrencyForChart } from "@/lib/currency";

interface IncomeVsExpensesProps {
  transactions: Transaction[];
  selectedMonth: Date;
}

export function IncomeVsExpenses({ transactions, selectedMonth }: IncomeVsExpensesProps) {
  const data = useMemo(() => {
    const start = startOfMonth(selectedMonth);
    const end = endOfMonth(selectedMonth);
    const days = eachDayOfInterval({ start, end });

    return days.map((day) => {
      const dayTransactions = transactions.filter((t) => isSameDay(t.date, day));
      
      const income = dayTransactions
        .filter((t) => t.type === "income")
        .reduce((sum, t) => sum + t.amount, 0);
      
      const expenses = dayTransactions
        .filter((t) => t.type === "expense")
        .reduce((sum, t) => sum + t.amount, 0);

      return {
        day: format(day, "dd/MM", { locale: ptBR }),
        receitas: income,
        despesas: expenses,
      };
    });
  }, [transactions, selectedMonth]);

  return (
    <Card className="p-4 sm:p-6 overflow-hidden">
      <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Receitas vs Despesas</h3>
      
      <ResponsiveContainer width="100%" height={250} className="sm:h-[300px]">
        <BarChart data={data} margin={{ top: 5, right: 5, left: -10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis
            dataKey="day"
            stroke="hsl(var(--muted-foreground))"
            fontSize={10}
            className="sm:text-xs"
            tickLine={false}
            angle={-45}
            textAnchor="end"
            height={60}
          />
          <YAxis
            stroke="hsl(var(--muted-foreground))"
            fontSize={10}
            className="sm:text-xs"
            tickLine={false}
            width={50}
            tickFormatter={(value) => {
              const formatted = formatCurrencyForChart(value, 0);
              return formatted.length > 6 ? formatted.slice(0, 4) + 'k' : formatted;
            }}
          />
          <Tooltip
            formatter={(value: number) => formatCurrency(value)}
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "8px",
            }}
          />
          <Legend />
          <Bar dataKey="receitas" fill="hsl(var(--success))" radius={[4, 4, 0, 0]} />
          <Bar dataKey="despesas" fill="hsl(var(--danger))" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}
