import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeftRight } from "lucide-react";
import { useBankAccountsStore } from "@/hooks/useBankAccountsStore";

export function TransferBetweenAccounts() {
  const { getActiveAccounts, transferBetweenAccounts } = useBankAccountsStore();
  const [fromAccountId, setFromAccountId] = useState("");
  const [toAccountId, setToAccountId] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");

  const activeAccounts = getActiveAccounts();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fromAccountId || !toAccountId || !amount) return;

    if (fromAccountId === toAccountId) {
      return;
    }

    await transferBetweenAccounts(
      fromAccountId,
      toAccountId,
      parseFloat(amount),
      description || "Transferência"
    );

    setFromAccountId("");
    setToAccountId("");
    setAmount("");
    setDescription("");
  };

  if (activeAccounts.length < 2) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <ArrowLeftRight className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Transferir entre Contas</h3>
        </div>
        <p className="text-sm text-muted-foreground text-center py-4">
          Você precisa ter pelo menos 2 contas ativas para fazer transferências
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <ArrowLeftRight className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">Transferir entre Contas</h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="fromAccount">De *</Label>
          <Select value={fromAccountId} onValueChange={setFromAccountId}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione a conta de origem" />
            </SelectTrigger>
            <SelectContent>
              {activeAccounts.map((account) => (
                <SelectItem key={account.id} value={account.id}>
                  {account.name} - R$ {account.currentBalance.toFixed(2)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="toAccount">Para *</Label>
          <Select value={toAccountId} onValueChange={setToAccountId}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione a conta de destino" />
            </SelectTrigger>
            <SelectContent>
              {activeAccounts
                .filter((account) => account.id !== fromAccountId)
                .map((account) => (
                  <SelectItem key={account.id} value={account.id}>
                    {account.name} - R$ {account.currentBalance.toFixed(2)}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="amount">Valor *</Label>
          <Input
            id="amount"
            type="number"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Descrição</Label>
          <Input
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Motivo da transferência"
          />
        </div>

        <Button type="submit" className="w-full gap-2">
          <ArrowLeftRight className="h-4 w-4" />
          Realizar Transferência
        </Button>
      </form>
    </Card>
  );
}
