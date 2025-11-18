import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlusCircle } from "lucide-react";
import { toast } from "sonner";
import { useCategoriesStore } from "@/hooks/useCategoriesStore";
import { useBankAccountsStore } from "@/hooks/useBankAccountsStore";
import { transactionSchema } from "@/lib/validations";
import { AttachmentUpload } from "./AttachmentUpload";
import { AccountSelector } from "./AccountSelector";

interface QuickAddTransactionProps {
  onAdd: (description: string, amount: number, category: string, type: "income" | "expense", dateOrAttachmentUrl?: string | Date, attachmentUrl?: string, bankAccountId?: string) => void;
}

export function QuickAddTransaction({ onAdd }: QuickAddTransactionProps) {
  const { getCategoriesByType } = useCategoriesStore();
  const { getActiveAccounts } = useBankAccountsStore();
  const [type, setType] = useState<"income" | "expense">("expense");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [bankAccountId, setBankAccountId] = useState("");
  const [attachmentUrl, setAttachmentUrl] = useState<string | undefined>();

  const activeAccounts = getActiveAccounts();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const numAmount = parseFloat(amount);
    
    // Validação com Zod
    const validation = transactionSchema.safeParse({
      description,
      amount: numAmount,
      category,
      type,
    });

    if (!validation.success) {
      const firstError = validation.error.errors[0];
      toast.error(firstError.message);
      return;
    }

    onAdd(description, numAmount, category, type, attachmentUrl, undefined, bankAccountId || undefined);
    toast.success(`Transação de ${type === "income" ? "receita" : "despesa"} adicionada!`);
    
    // Reset form
    setDescription("");
    setAmount("");
    setCategory("");
    setBankAccountId("");
    setAttachmentUrl(undefined);
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
            maxLength={200}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="amount">Valor</Label>
          <Input
            id="amount"
            type="number"
            step="0.01"
            min="0.01"
            max="999999999.99"
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

        {activeAccounts.length > 0 && (
          <div className="space-y-2">
            <Label htmlFor="account">Conta (opcional)</Label>
            <AccountSelector
              value={bankAccountId}
              onChange={setBankAccountId}
              placeholder="Selecione a conta"
            />
          </div>
        )}

        <AttachmentUpload
          onUploadComplete={(url) => setAttachmentUrl(url)}
          currentAttachment={attachmentUrl}
          onRemove={() => setAttachmentUrl(undefined)}
        />

        <Button type="submit" className="w-full gap-2">
          <PlusCircle className="h-4 w-4" />
          Adicionar Transação
        </Button>
      </form>
    </Card>
  );
}
