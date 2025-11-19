import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { CreditCard, Trash2, Plus, Eye, EyeOff } from "lucide-react";
import { useCreditCardsStore } from "@/hooks/useCreditCardsStore";
import { useCreditCardPurchasesStore } from "@/hooks/useCreditCardPurchasesStore";
import { CurrencyInput } from "@/components/CurrencyInput";
import { parseCurrency, formatCurrency } from "@/lib/currency";
import { cn } from "@/lib/utils";

export function CreditCardsManager() {
  const { cards, addCard, toggleCard, deleteCard } = useCreditCardsStore();
  const { getUsedLimit } = useCreditCardPurchasesStore();
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [lastFourDigits, setLastFourDigits] = useState("");
  const [creditLimit, setCreditLimit] = useState("");
  const [closingDay, setClosingDay] = useState("");
  const [dueDay, setDueDay] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !lastFourDigits || !creditLimit || !closingDay || !dueDay) return;

    addCard(
      name,
      lastFourDigits,
      parseCurrency(creditLimit),
      parseInt(closingDay),
      parseInt(dueDay)
    );

    setName("");
    setLastFourDigits("");
    setCreditLimit("");
    setClosingDay("");
    setDueDay("");
    setShowForm(false);
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Meus Cartões</h3>
        </div>
        <Button
          size="sm"
          onClick={() => setShowForm(!showForm)}
          variant={showForm ? "outline" : "default"}
        >
          <Plus className="h-4 w-4 mr-2" />
          {showForm ? "Cancelar" : "Novo Cartão"}
        </Button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="space-y-4 mb-6 p-4 bg-muted/50 rounded-lg">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label htmlFor="name">Nome do Cartão</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Nubank, Inter..."
                maxLength={100}
              />
            </div>

            <div>
              <Label htmlFor="lastFourDigits">4 Últimos Dígitos</Label>
              <Input
                id="lastFourDigits"
                value={lastFourDigits}
                onChange={(e) => setLastFourDigits(e.target.value.replace(/\D/g, ""))}
                placeholder="1234"
                maxLength={4}
              />
            </div>

            <div>
              <Label htmlFor="creditLimit">Limite Total</Label>
              <CurrencyInput
                id="creditLimit"
                value={creditLimit}
                onChange={setCreditLimit}
                placeholder="0,00"
              />
            </div>

            <div>
              <Label htmlFor="closingDay">Dia de Fechamento</Label>
              <Input
                id="closingDay"
                type="number"
                min="1"
                max="31"
                value={closingDay}
                onChange={(e) => setClosingDay(e.target.value)}
                placeholder="1-31"
              />
            </div>

            <div>
              <Label htmlFor="dueDay">Dia de Vencimento</Label>
              <Input
                id="dueDay"
                type="number"
                min="1"
                max="31"
                value={dueDay}
                onChange={(e) => setDueDay(e.target.value)}
                placeholder="1-31"
              />
            </div>
          </div>

          <Button type="submit" className="w-full">
            Adicionar Cartão
          </Button>
        </form>
      )}

      <div className="space-y-3">
        {cards.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            Nenhum cartão cadastrado
          </p>
        ) : (
          cards.map((card) => {
            const usedLimit = getUsedLimit(card.id);
            const availableLimit = card.creditLimit - usedLimit;
            const usagePercentage = (usedLimit / card.creditLimit) * 100;

            return (
              <div
                key={card.id}
                className={cn(
                  "p-4 rounded-lg border transition-opacity",
                  !card.active && "opacity-50"
                )}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold">{card.name}</h4>
                      <Badge variant="outline">•••• {card.lastFourDigits}</Badge>
                    </div>

                    <div className="space-y-2">
                      <div className="text-sm">
                        <span className="text-muted-foreground">Limite: </span>
                        <span className="font-medium">{formatCurrency(card.creditLimit)}</span>
                      </div>

                      <div className="text-sm">
                        <span className="text-muted-foreground">Disponível: </span>
                        <span className={cn(
                          "font-medium",
                          usagePercentage > 80 ? "text-danger" : "text-success"
                        )}>
                          {formatCurrency(availableLimit)}
                        </span>
                      </div>

                      <div className="flex gap-4 text-xs text-muted-foreground">
                        <span>Fecha dia {card.closingDay}</span>
                        <span>Vence dia {card.dueDay}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Switch
                      checked={card.active}
                      onCheckedChange={() => toggleCard(card.id)}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteCard(card.id)}
                      className="hover:bg-destructive/20"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>

                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className={cn(
                      "h-2 rounded-full transition-all",
                      usagePercentage > 80 ? "bg-danger" : "bg-primary"
                    )}
                    style={{ width: `${Math.min(usagePercentage, 100)}%` }}
                  />
                </div>
              </div>
            );
          })
        )}
      </div>
    </Card>
  );
}
