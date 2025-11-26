import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Receipt, Calendar, Trash2 } from "lucide-react";
import { useCreditCardsStore } from "@/hooks/useCreditCardsStore";
import { useCreditCardPurchasesStore } from "@/hooks/useCreditCardPurchasesStore";
import { format, addMonths } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useState } from "react";
import { formatCurrency } from "@/lib/currency";

interface CreditCardInvoiceProps {
  currentMonth: Date;
}

export function CreditCardInvoice({ currentMonth }: CreditCardInvoiceProps) {
  const { getActiveCards } = useCreditCardsStore();
  const { getInvoiceData, deletePurchase } = useCreditCardPurchasesStore();
  const [selectedCardId, setSelectedCardId] = useState("");

  const activeCards = getActiveCards();
  const selectedCard = activeCards.find(c => c.id === selectedCardId);

  const invoiceData = selectedCard 
    ? getInvoiceData(selectedCard.id, currentMonth, selectedCard.closingDay)
    : { purchases: [], total: 0 };

  const dueDate = selectedCard 
    ? new Date(currentMonth.getFullYear(), currentMonth.getMonth(), selectedCard.dueDay)
    : null;

  if (activeCards.length === 0) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Receipt className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Fatura do Cartão</h3>
        </div>
        <p className="text-sm text-muted-foreground text-center py-4">
          Cadastre um cartão para visualizar faturas
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <Receipt className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">Fatura do Cartão</h3>
      </div>

      <div className="space-y-4">
        <div>
          <Select value={selectedCardId} onValueChange={setSelectedCardId}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o cartão" />
            </SelectTrigger>
            <SelectContent>
              {activeCards.map((card) => (
                <SelectItem key={card.id} value={card.id}>
                  {card.name} •••• {card.lastFourDigits}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedCard && (
          <>
            <div className="p-4 bg-primary/10 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Fatura de {format(currentMonth, "MMMM/yyyy", { locale: ptBR })}</span>
                {dueDate && (
                  <Badge variant="outline" className="gap-1">
                    <Calendar className="h-3 w-3" />
                    Vence {format(dueDate, "dd/MM", { locale: ptBR })}
                  </Badge>
                )}
              </div>
              <p className="text-3xl font-bold">{formatCurrency(invoiceData.total)}</p>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium text-sm">Lançamentos</h4>
              {invoiceData.purchases.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Nenhuma compra neste período
                </p>
              ) : (
                invoiceData.purchases.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{item.description}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {item.category}
                        </Badge>
                        {item.installments > 1 && (
                          <span className="text-xs text-muted-foreground">
                            Parcela {item.currentInstallment}/{item.installments}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-danger">
                        {formatCurrency(item.installmentAmount)}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deletePurchase(item.id)}
                        className="h-8 w-8"
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>
    </Card>
  );
}
