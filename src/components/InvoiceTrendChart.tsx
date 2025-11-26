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
      <Card className="p-4 sm:p-6 overflow-hidden">
        <div className="flex items-center gap-2 mb-3 sm:mb-4">
          <Activity className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
          <h3 className="text-base sm:text-lg font-semibold">Evolução das Faturas</h3>
        </div>
        <p className="text-xs sm:text-sm text-muted-foreground text-center py-6 sm:py-8">
          Nenhum cartão ativo
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-4 sm:p-6 overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-3 sm:mb-4">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
          <h3 className="text-base sm:text-lg font-semibold">Evolução das Faturas</h3>
        </div>
        <Select value={selectedCardId} onValueChange={setSelectedCardId}>
          <SelectTrigger className="w-full sm:w-[200px]">
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
          <ResponsiveContainer width="100%" height={250} className="sm:h-[300px]">
            <ComposedChart data={chartData} margin={{ top: 5, right: 5, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="month" 
                fontSize={10}
                className="sm:text-xs"
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis 
                fontSize={10}
                className="sm:text-xs"
                width={50}
                tickFormatter={(value) => {
                  const formatted = formatCurrencyForChart(value, 0);
                  return formatted.length > 6 ? formatted.slice(0, 4) + 'k' : formatted;
                }}
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

          <div className="mt-3 sm:mt-4 flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-xs sm:text-sm">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div className="w-3 h-3 sm:w-4 sm:h-4 rounded bg-primary" />
              <span>Valor da Fatura</span>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-success" />
              <span className="whitespace-nowrap">Quantidade de Lançamentos</span>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div className="w-3 h-3 sm:w-4 sm:h-4 rounded bg-primary/50" />
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
