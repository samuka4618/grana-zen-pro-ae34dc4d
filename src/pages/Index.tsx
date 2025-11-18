import { useState } from "react";
import { Wallet, TrendingUp, TrendingDown, DollarSign, BarChart3 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/StatCard";
import { TransactionList } from "@/components/TransactionList";
import { QuickAddTransaction } from "@/components/QuickAddTransaction";
import { CategoryManager } from "@/components/CategoryManager";
import { MonthPicker } from "@/components/MonthPicker";
import { ExpensesByCategory } from "@/components/ExpensesByCategory";
import { IncomeVsExpenses } from "@/components/IncomeVsExpenses";
import { TopTransactions } from "@/components/TopTransactions";
import { FinancialInsights } from "@/components/FinancialInsights";
import { AddInstallment } from "@/components/AddInstallment";
import { InstallmentsList } from "@/components/InstallmentsList";
import { FutureProjection } from "@/components/FutureProjection";
import { AddRecurringContract } from "@/components/AddRecurringContract";
import { RecurringContractsList } from "@/components/RecurringContractsList";
import { useTransactionsStore } from "@/hooks/useTransactionsStore";
import { useInstallmentsStore } from "@/hooks/useInstallmentsStore";
import { useRecurringContractsStore } from "@/hooks/useRecurringContractsStore";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const Index = () => {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const { transactions, stats, addTransaction, updateTransactionCategory } = useTransactionsStore(selectedDate);
  const {
    installments,
    addInstallment,
    deleteInstallment,
    updateInstallmentCategory,
    getActiveInstallments,
    getProjection,
  } = useInstallmentsStore();
  const {
    contracts,
    addContract,
    toggleContract,
    deleteContract,
    updateContractCategory,
    getActiveContracts,
    getMonthlyTotal,
  } = useRecurringContractsStore();

  const monthYear = format(selectedDate, "MMMM 'de' yyyy", { locale: ptBR });
  const projections = getProjection(5, selectedDate);
  const recurringExpenses = getMonthlyTotal("expense");
  const recurringIncome = getMonthlyTotal("income");
  
  // Calcular parcelas do mês atual
  const currentMonthInstallments = projections[0]?.installments || [];
  const installmentExpenses = currentMonthInstallments
    .filter(i => i.type === "expense")
    .reduce((sum, i) => sum + i.installmentAmount, 0);
  const installmentIncome = currentMonthInstallments
    .filter(i => i.type === "income")
    .reduce((sum, i) => sum + i.installmentAmount, 0);
  
  // Ajustar stats com contratos e parcelas do mês
  const adjustedStats = {
    income: stats.income + recurringIncome + installmentIncome,
    expenses: stats.expenses + recurringExpenses + installmentExpenses,
    balance: (stats.income + recurringIncome + installmentIncome) - (stats.expenses + recurringExpenses + installmentExpenses),
    savings: (stats.income + recurringIncome + installmentIncome) - (stats.expenses + recurringExpenses + installmentExpenses),
    savingsRate: stats.savingsRate,
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-3 sm:p-6 space-y-4 sm:space-y-8">
        {/* Header */}
        <header className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="space-y-2">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                Controle Financeiro
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground">
                Gerencie suas finanças de forma simples e poderosa
              </p>
            </div>
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <Button
                variant="default"
                size="sm"
                onClick={() => navigate("/analytics")}
                className="gap-2"
              >
                <BarChart3 className="h-4 w-4" />
                Análise Avançada
              </Button>
              <CategoryManager />
              <Button variant="outline" size="sm" onClick={() => supabase.auth.signOut()}>
                Sair
              </Button>
            </div>
          </div>
          
          {/* Month Picker */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 p-3 sm:p-4 rounded-lg border bg-card">
            <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">
              Período:
            </span>
            <MonthPicker selectedDate={selectedDate} onDateChange={setSelectedDate} />
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid gap-3 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Saldo"
            value={`R$ ${adjustedStats.balance.toFixed(2)}`}
            icon={Wallet}
            trend={monthYear}
            variant={adjustedStats.balance >= 0 ? "default" : "danger"}
          />
          <StatCard
            title="Receitas"
            value={`R$ ${adjustedStats.income.toFixed(2)}`}
            icon={TrendingUp}
            trend={monthYear}
            variant="success"
          />
          <StatCard
            title="Despesas"
            value={`R$ ${adjustedStats.expenses.toFixed(2)}`}
            icon={TrendingDown}
            trend={monthYear}
            variant="danger"
          />
          <StatCard
            title="Economia"
            value={`R$ ${adjustedStats.savings.toFixed(2)}`}
            icon={DollarSign}
            trend={`${adjustedStats.savingsRate} do total`}
            variant="success"
          />
        </div>

        {/* Main Content */}
        <div className="grid gap-4 sm:gap-6 lg:grid-cols-3">
          {/* Left Column - Charts and Lists */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
              <ExpensesByCategory transactions={transactions} />
              <FinancialInsights transactions={transactions} />
            </div>
            
            <IncomeVsExpenses transactions={transactions} selectedMonth={selectedDate} />
            
            <RecurringContractsList
              contracts={contracts}
              onToggle={toggleContract}
              onDelete={deleteContract}
              onUpdateCategory={updateContractCategory}
            />
            
            <InstallmentsList
              installments={getActiveInstallments()}
              onDelete={deleteInstallment}
              onUpdateCategory={updateInstallmentCategory}
            />
            
            <TopTransactions transactions={transactions} />
            
            <TransactionList 
              transactions={transactions} 
              onUpdateCategory={updateTransactionCategory}
            />
          </div>

          {/* Right Column - Quick Actions */}
          <div className="space-y-4 sm:space-y-6">
            <QuickAddTransaction onAdd={addTransaction} />
            <AddRecurringContract onAdd={addContract} />
            <AddInstallment onAdd={addInstallment} />
            <FutureProjection
              projections={projections}
              recurringExpenses={recurringExpenses}
              recurringIncome={recurringIncome}
              contracts={getActiveContracts()}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
