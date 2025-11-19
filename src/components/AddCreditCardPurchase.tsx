import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ShoppingCart } from "lucide-react";
import { useCreditCardsStore } from "@/hooks/useCreditCardsStore";
import { useCreditCardPurchasesStore } from "@/hooks/useCreditCardPurchasesStore";
import { useCategoriesStore } from "@/hooks/useCategoriesStore";
import { CurrencyInput } from "@/components/CurrencyInput";
import { parseCurrency, formatCurrency } from "@/lib/currency";
import { toast } from "sonner";

export function AddCreditCardPurchase() {
  const { getActiveCards } = useCreditCardsStore();
  const { addPurchase } = useCreditCardPurchasesStore();
  const { getCategoriesByType } = useCategoriesStore();
  const [cardId, setCardId] = useState("");
  const [description, setDescription] = useState("");
  const [totalAmount, setTotalAmount] = useState("");
  const [installments, setInstallments] = useState("1");
  const [category, setCategory] = useState("");

  const activeCards = getActiveCards();
  const categories = getCategoriesByType("expense");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!cardId || !description || !totalAmount || !installments || !category) {
      toast.error("Preencha todos os campos");
      return;
    }

    const amount = parseCurrency(totalAmount);
    const numInstallments = parseInt(installments);

    if (amount <= 0 || numInstallments <= 0) {
      toast.error("Valores inválidos");
      return;
    }

    addPurchase(cardId, description, amount, numInstallments, category);

    // Reset
    setDescription("");
    setTotalAmount("");
    setInstallments("1");
    setCategory("");
  };

  const installmentAmount = totalAmount ? formatCurrency(parseCurrency(totalAmount) / parseInt(installments || "1")) : "R$ 0,00";

  if (activeCards.length === 0) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <ShoppingCart className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Compra no Cartão</h3>
        </div>
        <p className="text-sm text-muted-foreground text-center py-4">
          Cadastre um cartão primeiro para lançar compras
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <ShoppingCart className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">Compra no Cartão</h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="card">Cartão</Label>
          <Select value={cardId} onValueChange={setCardId}>
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

        <div>
          <Label htmlFor="description">Descrição</Label>
          <Input
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Ex: Notebook, TV..."
            maxLength={200}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="totalAmount">Valor Total</Label>
            <CurrencyInput
              id="totalAmount"
              value={totalAmount}
              onChange={setTotalAmount}
              placeholder="0,00"
            />
          </div>

          <div>
            <Label htmlFor="installments">Parcelas</Label>
            <Input
              id="installments"
              type="number"
              min="1"
              max="48"
              value={installments}
              onChange={(e) => setInstallments(e.target.value)}
              placeholder="1"
            />
          </div>
        </div>

        {totalAmount && (
          <div className="p-3 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground">
              {installments}x de <span className="font-bold text-foreground">R$ {installmentAmount}</span>
            </p>
          </div>
        )}

        <div>
          <Label htmlFor="category">Categoria</Label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione uma categoria" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.name}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button type="submit" className="w-full">
          Lançar Compra
        </Button>
      </form>
    </Card>
  );
}
