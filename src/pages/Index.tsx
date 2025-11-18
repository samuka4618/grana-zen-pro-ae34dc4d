import { useState } from "react";
import { Wallet, TrendingUp, TrendingDown, DollarSign } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { TransactionList } from "@/components/TransactionList";
import { QuickAddTransaction } from "@/components/QuickAddTransaction";
import { CategoryManager } from "@/components/CategoryManager";
import { MonthPicker } from "@/components/MonthPicker";
import { ExpensesByCategory } from "@/components/ExpensesByCategory";
import { IncomeVsExpenses } from "@/components/IncomeVsExpenses";
import { TopTransactions } from "@/components/TopTransactions";
import { FinancialInsights } from "@/components/FinancialInsights";
import { useTransactionsStore } from "@/hooks/useTransactionsStore";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const Index = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const { transactions, stats, addTransaction } = useTransactionsStore(selectedDate);

  const monthYear = format(selectedDate, "MMMM 'de' yyyy", { locale: ptBR });

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 space-y-8">
        {/* Header */}
        <header className="space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2">
              <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                Controle Financeiro
              </h1>
              <p className="text-muted-foreground">
                Gerencie suas finanças de forma simples e poderosa
              </p>
            </div>
            <CategoryManager />
          </div>
          
          {/* Month Picker */}
          <div className="flex items-center gap-4 p-4 rounded-lg border bg-card">
            <span className="text-sm font-medium text-muted-foreground">
              Período:
            </span>
            <MonthPicker selectedDate={selectedDate} onDateChange={setSelectedDate} />
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Saldo"
            value={`R$ ${stats.balance.toFixed(2)}`}
            icon={Wallet}
            trend={monthYear}
            variant={stats.balance >= 0 ? "default" : "danger"}
          />
          <StatCard
            title="Receitas"
            value={`R$ ${stats.income.toFixed(2)}`}
            icon={TrendingUp}
            trend={monthYear}
            variant="success"
          />
          <StatCard
            title="Despesas"
            value={`R$ ${stats.expenses.toFixed(2)}`}
            icon={TrendingDown}
            trend={monthYear}
            variant="danger"
          />
          <StatCard
            title="Economia"
            value={`R$ ${stats.savings.toFixed(2)}`}
            icon={DollarSign}
            trend={`${stats.savingsRate} do total`}
            variant="success"
          />
        </div>

        {/* Main Content */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column - Charts and Lists */}
          <div className="lg:col-span-2 space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <ExpensesByCategory transactions={transactions} />
              <FinancialInsights transactions={transactions} />
            </div>
            
            <IncomeVsExpenses transactions={transactions} selectedMonth={selectedDate} />
            
            <TopTransactions transactions={transactions} />
            
            <TransactionList transactions={transactions} />
          </div>

          {/* Right Column - Quick Actions */}
          <div className="space-y-6">
            <QuickAddTransaction onAdd={addTransaction} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
