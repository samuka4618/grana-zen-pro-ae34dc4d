import { useState } from "react";
import { Wallet, TrendingUp, TrendingDown, DollarSign } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { TransactionList } from "@/components/TransactionList";
import { QuickAddTransaction } from "@/components/QuickAddTransaction";
import { CategoryManager } from "@/components/CategoryManager";
import { MonthPicker } from "@/components/MonthPicker";

const Index = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());

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
            title="Saldo Total"
            value="R$ 12.450,00"
            icon={Wallet}
            trend="+5,2% este mês"
            variant="default"
          />
          <StatCard
            title="Receitas"
            value="R$ 8.500,00"
            icon={TrendingUp}
            trend="Janeiro 2025"
            variant="success"
          />
          <StatCard
            title="Despesas"
            value="R$ 3.250,00"
            icon={TrendingDown}
            trend="Janeiro 2025"
            variant="danger"
          />
          <StatCard
            title="Economia"
            value="R$ 5.250,00"
            icon={DollarSign}
            trend="61,8% do total"
            variant="success"
          />
        </div>

        {/* Main Content */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <TransactionList />
          </div>
          <div>
            <QuickAddTransaction />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
