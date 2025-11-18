import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { format, startOfMonth, endOfMonth, isSameDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

// Mock de transações por dia
const mockTransactionsByDate: Record<string, Array<{ description: string; amount: number; type: "income" | "expense" }>> = {
  "2025-01-15": [
    { description: "Mercado", amount: 250.00, type: "expense" },
    { description: "Salário", amount: 5000.00, type: "income" },
  ],
  "2025-01-16": [
    { description: "Uber", amount: 25.50, type: "expense" },
  ],
  "2025-01-18": [
    { description: "Almoço", amount: 45.00, type: "expense" },
    { description: "Freelance", amount: 800.00, type: "income" },
  ],
};

export function MonthlyCalendar() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const dateKey = format(selectedDate, "yyyy-MM-dd");
  const dayTransactions = mockTransactionsByDate[dateKey] || [];

  const getDayBalance = (date: Date) => {
    const key = format(date, "yyyy-MM-dd");
    const transactions = mockTransactionsByDate[key] || [];
    return transactions.reduce((acc, t) => {
      return acc + (t.type === "income" ? t.amount : -t.amount);
    }, 0);
  };

  const previousMonth = () => {
    const newDate = new Date(currentMonth);
    newDate.setMonth(newDate.getMonth() - 1);
    setCurrentMonth(newDate);
  };

  const nextMonth = () => {
    const newDate = new Date(currentMonth);
    newDate.setMonth(newDate.getMonth() + 1);
    setCurrentMonth(newDate);
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentMonth(today);
    setSelectedDate(today);
  };

  return (
    <Card className="p-6">
      <div className="space-y-4">
        {/* Header com navegação */}
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            {format(currentMonth, "MMMM 'de' yyyy", { locale: ptBR })}
          </h2>
          <div className="flex gap-2">
            <Button variant="outline" size="icon" onClick={previousMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={goToToday}>
              <CalendarIcon className="h-4 w-4 mr-2" />
              Hoje
            </Button>
            <Button variant="outline" size="icon" onClick={nextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Calendário */}
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={(date) => date && setSelectedDate(date)}
          month={currentMonth}
          onMonthChange={setCurrentMonth}
          locale={ptBR}
          className="rounded-md border pointer-events-auto"
          modifiers={{
            hasTransactions: (date) => {
              const key = format(date, "yyyy-MM-dd");
              return !!mockTransactionsByDate[key];
            },
          }}
          modifiersClassNames={{
            hasTransactions: "font-bold relative after:content-[''] after:absolute after:bottom-1 after:left-1/2 after:-translate-x-1/2 after:w-1 after:h-1 after:rounded-full after:bg-primary",
          }}
          components={{
            DayContent: ({ date }) => {
              const balance = getDayBalance(date);
              const hasBalance = balance !== 0;
              
              return (
                <div className="relative w-full h-full flex flex-col items-center justify-center">
                  <span>{format(date, "d")}</span>
                  {hasBalance && (
                    <span
                      className={cn(
                        "text-[10px] font-semibold mt-0.5",
                        balance > 0 ? "text-success" : "text-danger"
                      )}
                    >
                      {balance > 0 ? "+" : ""}
                      {balance.toFixed(0)}
                    </span>
                  )}
                </div>
              );
            },
          }}
        />

        {/* Transações do dia selecionado */}
        <div className="space-y-2">
          <h3 className="font-semibold">
            {format(selectedDate, "dd 'de' MMMM", { locale: ptBR })}
          </h3>
          {dayTransactions.length > 0 ? (
            <div className="space-y-2">
              {dayTransactions.map((transaction, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 rounded-lg border bg-card"
                >
                  <div className="flex-1">
                    <p className="font-medium">{transaction.description}</p>
                  </div>
                  <Badge
                    variant={transaction.type === "income" ? "default" : "outline"}
                    className={cn(
                      transaction.type === "income"
                        ? "bg-success/10 text-success border-success/20"
                        : "bg-danger/10 text-danger border-danger/20"
                    )}
                  >
                    {transaction.type === "income" ? "+" : "-"}
                    R$ {transaction.amount.toFixed(2)}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              Nenhuma transação neste dia
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}
