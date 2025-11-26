import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { PlusCircle, CalendarIcon } from "lucide-react";
import { toast } from "sonner";
import { useCategoriesStore } from "@/hooks/useCategoriesStore";
import { useBankAccountsStore } from "@/hooks/useBankAccountsStore";
import { transactionSchema } from "@/lib/validations";
import { AttachmentUpload } from "./AttachmentUpload";
import { AccountSelector } from "./AccountSelector";
import { CurrencyInput } from "./CurrencyInput";
import { parseCurrency } from "@/lib/currency";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

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
  const [date, setDate] = useState<Date>(new Date());

  const activeAccounts = getActiveAccounts();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Parse do valor formatado em BRL
    const numAmount = parseCurrency(amount);
    
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

    onAdd(description, numAmount, category, type, date, attachmentUrl, bankAccountId || undefined);
    toast.success(`Transação de ${type === "income" ? "receita" : "despesa"} adicionada!`);
    
    // Reset form
    setDescription("");
    setAmount("");
    setCategory("");
    setBankAccountId("");
    setAttachmentUrl(undefined);
    setDate(new Date()); // Reset para data atual
  };

  return (
    <Card className="p-4 sm:p-6 overflow-hidden">
      <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Adicionar Transação</h2>
      
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
          <Label htmlFor="amount">Valor (R$)</Label>
          <CurrencyInput
            id="amount"
            value={amount}
            onChange={setAmount}
            placeholder="0,00"
            required
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

        <div className="space-y-2">
          <Label htmlFor="date">Data da Transação</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "dd/MM/yyyy", { locale: ptBR }) : "Selecione a data"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={date}
                onSelect={(selectedDate) => {
                  if (selectedDate) {
                    setDate(selectedDate);
                  }
                }}
                locale={ptBR}
                initialFocus
                className={cn("p-3 pointer-events-auto")}
              />
            </PopoverContent>
          </Popover>
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
