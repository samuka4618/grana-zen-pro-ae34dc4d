import { useState } from "react";
import { Button } from "@/components/ui/button";
import { BankAccountsManager } from "@/components/BankAccountsManager";
import { TransferBetweenAccounts } from "@/components/TransferBetweenAccounts";
import { NotificationsCenter } from "@/components/NotificationsCenter";
import { useBankAccountsStore } from "@/hooks/useBankAccountsStore";
import { ArrowLeft, Building2, TrendingUp, Wallet } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";

const BankAccounts = () => {
  const navigate = useNavigate();
  const { accounts, getTotalBalance } = useBankAccountsStore();

  const activeAccounts = accounts.filter((a) => a.active);
  const totalBalance = getTotalBalance();

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
                <NotificationsCenter />
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                Contas Bancárias
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground">
                Gerencie suas contas e transfira valores entre elas
              </p>
            </div>
            <Building2 className="h-12 w-12 text-primary hidden sm:block" />
          </div>
        </header>

        {/* Stats Cards */}
        <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-3">
          <Card className="p-4 sm:p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Contas Ativas</p>
              <Wallet className="h-4 w-4 text-primary" />
            </div>
            <p className="text-2xl sm:text-3xl font-bold">{activeAccounts.length}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {accounts.length} total
            </p>
          </Card>

          <Card className="p-4 sm:p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Saldo Total</p>
              <TrendingUp className="h-4 w-4 text-success" />
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-success">
              R$ {totalBalance.toFixed(2)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Todas as contas ativas
            </p>
          </Card>

          <Card className="p-4 sm:p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Maior Saldo</p>
              <Building2 className="h-4 w-4 text-primary" />
            </div>
            <p className="text-2xl sm:text-3xl font-bold">
              R${" "}
              {activeAccounts.length > 0
                ? Math.max(...activeAccounts.map((a) => a.currentBalance)).toFixed(2)
                : "0.00"}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {activeAccounts.length > 0
                ? activeAccounts.reduce((prev, curr) =>
                    prev.currentBalance > curr.currentBalance ? prev : curr
                  ).name
                : "Nenhuma conta"}
            </p>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid gap-4 sm:gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <BankAccountsManager />
          </div>
          <div>
            <TransferBetweenAccounts />
          </div>
        </div>
      </div>
    </div>
  );
};

export default BankAccounts;
