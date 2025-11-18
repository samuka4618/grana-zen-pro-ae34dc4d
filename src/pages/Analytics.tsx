import { useState } from "react";
import { Button } from "@/components/ui/button";
import { MonthPicker } from "@/components/MonthPicker";
import { TrendAnalysis } from "@/components/TrendAnalysis";
import { CategoryTrends } from "@/components/CategoryTrends";
import { PredictiveAnalysis } from "@/components/PredictiveAnalysis";
import { AIInsights } from "@/components/AIInsights";
import { FinancialGoalsManager } from "@/components/FinancialGoalsManager";
import { useTransactionsStore } from "@/hooks/useTransactionsStore";
import { useRecurringContractsStore } from "@/hooks/useRecurringContractsStore";
import { useInstallmentsStore } from "@/hooks/useInstallmentsStore";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ArrowLeft, BarChart3 } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Analytics = () => {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const { transactions, allTransactions } = useTransactionsStore(selectedDate);
  const { contracts, getMonthlyTotal } = useRecurringContractsStore();
  const { installments, getActiveInstallments } = useInstallmentsStore();

  const monthYear = format(selectedDate, "MMMM 'de' yyyy", { locale: ptBR });
  const recurringExpenses = getMonthlyTotal("expense");
  const recurringIncome = getMonthlyTotal("income");

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-3 sm:p-6 space-y-4 sm:space-y-8">
        {/* Header */}
        <header className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate("/")}
                  className="gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Voltar
                </Button>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                Análise Financeira Avançada
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground">
                Insights profundos e previsões sobre suas finanças
              </p>
            </div>
            <BarChart3 className="h-12 w-12 text-primary hidden sm:block" />
          </div>

          {/* Month Picker */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 p-3 sm:p-4 rounded-lg border bg-card">
            <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">
              Período de Análise:
            </span>
            <MonthPicker selectedDate={selectedDate} onDateChange={setSelectedDate} />
          </div>
        </header>

        {/* Analytics Grid */}
        <div className="grid gap-4 sm:gap-6 lg:grid-cols-3">
          {/* Left Column - Charts */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            <TrendAnalysis allTransactions={allTransactions} />
            <CategoryTrends allTransactions={allTransactions} />
            <AIInsights
              transactions={allTransactions}
              contracts={contracts}
              installments={getActiveInstallments()}
            />
          </div>

          {/* Right Column - Predictions & Goals */}
          <div className="space-y-4 sm:space-y-6">
            <PredictiveAnalysis
              allTransactions={allTransactions}
              recurringExpenses={recurringExpenses}
              recurringIncome={recurringIncome}
            />
            <FinancialGoalsManager
              transactions={transactions}
              currentMonth={selectedDate}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
