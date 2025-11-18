import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlusCircle } from "lucide-react";
import { toast } from "sonner";
import { useCategoriesStore } from "@/hooks/useCategoriesStore";

export function QuickAddTransaction() {
  const { getCategoriesByType } = useCategoriesStore();
  const [type, setType] = useState<"income" | "expense">("expense");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!description || !amount || !category) {
      toast.error("Preencha todos os campos");
      return;
    }

    toast.success(`Transação de ${type === "income" ? "receita" : "despesa"} adicionada!`);
    
    // Reset form
    setDescription("");
    setAmount("");
    setCategory("");
  };

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4">Adicionar Transação</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex gap-2">
          <Button
            type="button"
            variant={type === "expense" ? "default" : "outline"}
            onClick={() => setType("expense")}
            className="flex-1"
          >
            Despesa
          </Button>
          <Button
            type="button"
            variant={type === "income" ? "default" : "outline"}
            onClick={() => setType("income")}
            className="flex-1"
          >
            Receita
          </Button>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Descrição</Label>
          <Input
            id="description"
            placeholder="Ex: Mercado, Salário..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="amount">Valor</Label>
          <Input
            id="amount"
            type="number"
            step="0.01"
            placeholder="0,00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">Categoria</Label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione uma categoria" />
            </SelectTrigger>
            <SelectContent>
              {getCategoriesByType(type).map((cat) => (
                <SelectItem key={cat.id} value={cat.name}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button type="submit" className="w-full gap-2">
          <PlusCircle className="h-4 w-4" />
          Adicionar Transação
        </Button>
      </form>
    </Card>
  );
}
