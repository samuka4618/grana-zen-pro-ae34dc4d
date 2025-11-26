import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCreditCardsStore } from "@/hooks/useCreditCardsStore";
import { useCreditCardPurchasesStore } from "@/hooks/useCreditCardPurchasesStore";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Line, ComposedChart, Cell } from "recharts";
import { Activity } from "lucide-react";
import { useState, useMemo } from "react";
import { format, subMonths, addMonths } from "date-fns";
import { ptBR } from "date-fns/locale";
import { formatCurrency, formatCurrencyForChart } from "@/lib/currency";

export function InvoiceTrendChart() {
  const { getActiveCards } = useCreditCardsStore();
  const { getInvoiceData } = useCreditCardPurchasesStore();
  const [selectedCardId, setSelectedCardId] = useState("");

  const activeCards = getActiveCards();
  const selectedCard = activeCards.find(c => c.id === selectedCardId);

  const chartData = useMemo(() => {
    if (!selectedCard) return [];

    const months = [];
    const now = new Date();

    // Últimos 6 meses
    for (let i = 5; i >= 0; i--) {
      const monthDate = subMonths(now, i);
      const invoiceData = getInvoiceData(selectedCard.id, monthDate, selectedCard.closingDay);
      
      months.push({
        month: format(monthDate, "MMM/yy", { locale: ptBR }),
        total: invoiceData.total,
        purchases: invoiceData.purchases.length,
      });
    }

    // Próximos 3 meses (previsão)
    for (let i = 1; i <= 3; i++) {
      const monthDate = addMonths(now, i);
      const invoiceData = getInvoiceData(selectedCard.id, monthDate, selectedCard.closingDay);
      
      months.push({
        month: format(monthDate, "MMM/yy", { locale: ptBR }),
        total: invoiceData.total,
        purchases: invoiceData.purchases.length,
        isFuture: true,
      });
    }

    return months;
  }, [selectedCard, getInvoiceData]);

  if (activeCards.length === 0) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Activity className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Evolução das Faturas</h3>
        </div>
        <p className="text-sm text-muted-foreground text-center py-8">
          Nenhum cartão ativo
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Evolução das Faturas</h3>
        </div>
        <Select value={selectedCardId} onValueChange={setSelectedCardId}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Selecione o cartão" />
          </SelectTrigger>
          <SelectContent>
            {activeCards.map((card) => (
              <SelectItem key={card.id} value={card.id}>
                {card.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedCard && chartData.length > 0 ? (
        <>
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="month" 
                className="text-xs"
              />
              <YAxis 
                className="text-xs"
                tickFormatter={(value) => `R$ ${formatCurrencyForChart(value, 0)}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--background))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
                formatter={(value: number, name: string) => {
                  if (name === "total") return [formatCurrency(value), "Total da Fatura"];
                  return [value, "Lançamentos"];
                }}
              />
              <Bar 
                dataKey="total" 
                radius={[8, 8, 0, 0]}
              >
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.isFuture ? "hsl(var(--primary) / 0.5)" : "hsl(var(--primary))"}
                  />
                ))}
              </Bar>
              <Line
                type="monotone"
                dataKey="purchases"
                stroke="hsl(var(--success))"
                strokeWidth={2}
                dot={{ r: 4 }}
              />
            </ComposedChart>
          </ResponsiveContainer>

          <div className="mt-4 flex items-center justify-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-primary" />
              <span>Valor da Fatura</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-success" />
              <span>Quantidade de Lançamentos</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-primary/50" />
              <span>Previsão</span>
            </div>
          </div>
        </>
      ) : (
        <p className="text-sm text-muted-foreground text-center py-8">
          Selecione um cartão para ver a evolução
        </p>
      )}
    </Card>
  );
}
