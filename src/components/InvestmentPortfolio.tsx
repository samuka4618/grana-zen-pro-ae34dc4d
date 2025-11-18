import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { useInvestmentsStore } from "@/hooks/useInvestmentsStore";
import { TrendingUp, TrendingDown, DollarSign, Percent } from "lucide-react";
import { formatCurrency } from "@/lib/currency";

export const InvestmentPortfolio = () => {
  const { user } = useAuth();
  const { investments, loading, fetchInvestments } = useInvestmentsStore();

  useEffect(() => {
    if (user) {
      fetchInvestments(user.id);
    }
  }, [user]);

  const totalInvested = investments.reduce(
    (sum, inv) => sum + inv.quantity * inv.purchase_price,
    0
  );

  const currentValue = investments.reduce(
    (sum, inv) => sum + inv.quantity * inv.current_price,
    0
  );

  const profitLoss = currentValue - totalInvested;
  const profitLossPercent = totalInvested > 0 ? (profitLoss / totalInvested) * 100 : 0;

  if (loading) {
    return <div>Carregando carteira...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Investido</p>
              <p className="text-2xl font-bold tabular-nums">
                {formatCurrency(totalInvested)}
              </p>
            </div>
            <DollarSign className="h-8 w-8 text-muted-foreground" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Valor Atual</p>
              <p className="text-2xl font-bold tabular-nums">
                {formatCurrency(currentValue)}
              </p>
            </div>
            <DollarSign className="h-8 w-8 text-muted-foreground" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Lucro/Prejuízo</p>
              <p
                className={`text-2xl font-bold tabular-nums ${
                  profitLoss >= 0 ? "text-green-500" : "text-red-500"
                }`}
              >
                {formatCurrency(profitLoss)}
              </p>
            </div>
            {profitLoss >= 0 ? (
              <TrendingUp className="h-8 w-8 text-green-500" />
            ) : (
              <TrendingDown className="h-8 w-8 text-red-500" />
            )}
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Rentabilidade</p>
              <p
                className={`text-2xl font-bold ${
                  profitLossPercent >= 0 ? "text-green-500" : "text-red-500"
                }`}
              >
                {profitLossPercent.toFixed(2)}%
              </p>
            </div>
            <Percent
              className={`h-8 w-8 ${
                profitLossPercent >= 0 ? "text-green-500" : "text-red-500"
              }`}
            />
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Detalhes da Carteira</h3>
        <div className="space-y-4">
          {investments.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              Nenhum investimento cadastrado ainda.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-4">Nome</th>
                    <th className="text-left py-2 px-4">Tipo</th>
                    <th className="text-right py-2 px-4">Quantidade</th>
                    <th className="text-right py-2 px-4">Preço Compra</th>
                    <th className="text-right py-2 px-4">Preço Atual</th>
                    <th className="text-right py-2 px-4">Rentabilidade</th>
                  </tr>
                </thead>
                <tbody>
                  {investments.map((inv) => {
                    const invested = inv.quantity * inv.purchase_price;
                    const current = inv.quantity * inv.current_price;
                    const profit = current - invested;
                    const profitPercent = (profit / invested) * 100;

                    return (
                      <tr key={inv.id} className="border-b hover:bg-muted/50">
                        <td className="py-3 px-4">
                          <div>
                            <p className="font-medium">{inv.name}</p>
                            {inv.ticker_symbol && (
                              <p className="text-xs text-muted-foreground">
                                {inv.ticker_symbol}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4">{inv.type}</td>
                        <td className="text-right py-3 px-4 tabular-nums">
                          {inv.quantity}
                        </td>
                        <td className="text-right py-3 px-4 tabular-nums">
                          {formatCurrency(inv.purchase_price)}
                        </td>
                        <td className="text-right py-3 px-4 tabular-nums">
                          {formatCurrency(inv.current_price)}
                        </td>
                        <td
                          className={`text-right py-3 px-4 font-medium ${
                            profitPercent >= 0
                              ? "text-green-500"
                              : "text-red-500"
                          }`}
                        >
                          {profitPercent >= 0 ? "+" : ""}
                          {profitPercent.toFixed(2)}%
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};
