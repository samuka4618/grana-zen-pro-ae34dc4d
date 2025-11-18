import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, CreditCard } from "lucide-react";
import { toast } from "sonner";
import { useCategoriesStore } from "@/hooks/useCategoriesStore";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { installmentSchema } from "@/lib/validations";

interface AddInstallmentProps {
  onAdd: (
    description: string,
    totalAmount: number,
    installmentCount: number,
    startDate: Date,
    category: string,
    type: "expense" | "income"
  ) => void;
}

export function AddInstallment({ onAdd }: AddInstallmentProps) {
  const { getCategoriesByType } = useCategoriesStore();
  const [type, setType] = useState<"income" | "expense">("expense");
  const [description, setDescription] = useState("");
  const [totalAmount, setTotalAmount] = useState("");
  const [installmentCount, setInstallmentCount] = useState("");
  const [category, setCategory] = useState("");
  const [startDate, setStartDate] = useState<Date>();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const numTotalAmount = parseFloat(totalAmount);
    const numInstallmentCount = parseInt(installmentCount);
    
    // Validação com Zod
    const validation = installmentSchema.safeParse({
      description,
      totalAmount: numTotalAmount,
      installmentCount: numInstallmentCount,
      category,
      type,
      startDate,
    });

    if (!validation.success) {
      const firstError = validation.error.errors[0];
      toast.error(firstError.message);
      return;
    }

    onAdd(description, numTotalAmount, numInstallmentCount, startDate!, category, type);
    toast.success(`Financiamento de ${numInstallmentCount}x adicionado!`);

    // Reset form
    setDescription("");
    setTotalAmount("");
    setInstallmentCount("");
    setCategory("");
    setStartDate(undefined);
  };

  const installmentValue = totalAmount && installmentCount
    ? (parseFloat(totalAmount) / parseInt(installmentCount)).toFixed(2)
    : "0.00";

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <CreditCard className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-semibold">Adicionar Financiamento</h2>
      </div>

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
            placeholder="Ex: Carro, Celular..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={200}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="totalAmount">Valor Total</Label>
          <Input
            id="totalAmount"
            type="number"
            step="0.01"
            min="0.01"
            max="999999999.99"
            placeholder="0,00"
            value={totalAmount}
            onChange={(e) => setTotalAmount(e.target.value)}
          />
        </div>

          <div className="space-y-2">
            <Label htmlFor="installmentCount">Parcelas</Label>
            <Input
              id="installmentCount"
              type="number"
              min="2"
              max="999"
              placeholder="12"
              value={installmentCount}
              onChange={(e) => setInstallmentCount(e.target.value)}
            />
          </div>
        </div>

        {totalAmount && installmentCount && (
          <div className="p-3 rounded-lg bg-muted/50">
            <p className="text-sm text-muted-foreground">Valor por parcela</p>
            <p className="text-2xl font-bold text-primary">
              {installmentCount}x de R$ {installmentValue}
            </p>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="startDate">Data da Primeira Parcela</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !startDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {startDate ? format(startDate, "dd/MM/yyyy", { locale: ptBR }) : "Selecione a data"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={startDate}
                onSelect={setStartDate}
                locale={ptBR}
                initialFocus
                className={cn("p-3 pointer-events-auto")}
              />
            </PopoverContent>
          </Popover>
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
          <CreditCard className="h-4 w-4" />
          Adicionar Financiamento
        </Button>
      </form>
    </Card>
  );
}
