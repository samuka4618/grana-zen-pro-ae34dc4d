import { Card } from "@/components/ui/card";
import { Transaction } from "@/hooks/useTransactionsStore";
import { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { format, startOfMonth, eachDayOfInterval, endOfMonth, isSameDay } from "date-fns";
import { ptBR } from "date-fns/locale";

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
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Receitas vs Despesas</h3>
      
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis
            dataKey="day"
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            tickLine={false}
          />
          <YAxis
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            tickLine={false}
            tickFormatter={(value) => `R$ ${value}`}
          />
          <Tooltip
            formatter={(value: number) => `R$ ${value.toFixed(2)}`}
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
