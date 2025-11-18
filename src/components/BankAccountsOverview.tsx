import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useBankAccountsStore } from "@/hooks/useBankAccountsStore";
import { Building2, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function BankAccountsOverview() {
  const navigate = useNavigate();
  const { accounts, getTotalBalance } = useBankAccountsStore();
  
  const activeAccounts = accounts.filter((a) => a.active);
  const totalBalance = getTotalBalance();

  if (activeAccounts.length === 0) {
    return null;
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Building2 className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Minhas Contas</h3>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/bank-accounts")}
          className="gap-2"
        >
          Ver todas
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-3">
        <div className="p-4 rounded-lg bg-muted/50">
          <p className="text-sm text-muted-foreground">Saldo Total</p>
          <p className="text-2xl font-bold text-primary">
            R$ {totalBalance.toFixed(2)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {activeAccounts.length} conta{activeAccounts.length !== 1 ? 's' : ''} ativa{activeAccounts.length !== 1 ? 's' : ''}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {activeAccounts.slice(0, 4).map((account) => (
            <div key={account.id} className="p-3 rounded-lg border bg-card">
              <div className="flex items-center gap-2 mb-1">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: account.color }}
                />
                <p className="text-xs font-medium truncate">{account.name}</p>
              </div>
              <p className="text-sm font-semibold">
                R$ {account.currentBalance.toFixed(2)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
