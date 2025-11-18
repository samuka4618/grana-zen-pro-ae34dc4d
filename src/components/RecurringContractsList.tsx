import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { RecurringContract } from "@/hooks/useRecurringContractsStore";
import { CalendarClock, Trash2, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { EditCategoryDialog } from "./EditCategoryDialog";

interface RecurringContractsListProps {
  contracts: RecurringContract[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onUpdateCategory?: (id: string, category: string) => void;
}

export function RecurringContractsList({
  contracts,
  onToggle,
  onDelete,
  onUpdateCategory,
}: RecurringContractsListProps) {
  const activeContracts = contracts.filter((c) => c.active);
  const totalExpenses = activeContracts
    .filter((c) => c.type === "expense")
    .reduce((sum, c) => sum + c.amount, 0);
  const totalIncome = activeContracts
    .filter((c) => c.type === "income")
    .reduce((sum, c) => sum + c.amount, 0);

  if (contracts.length === 0) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <CalendarClock className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Contratos Fixos</h3>
        </div>
        <p className="text-center text-muted-foreground py-8">
          Nenhum contrato fixo cadastrado
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <CalendarClock className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Contratos Fixos</h3>
        </div>
        <Badge variant="secondary">{activeContracts.length} ativos</Badge>
      </div>

      {/* Resumo mensal */}
      <div className="grid grid-cols-2 gap-3 mb-4 p-3 rounded-lg bg-muted/50">
        <div>
          <p className="text-xs text-muted-foreground">Total Receitas/mês</p>
          <p className="text-lg font-bold text-success">R$ {totalIncome.toFixed(2)}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Total Despesas/mês</p>
          <p className="text-lg font-bold text-danger">R$ {totalExpenses.toFixed(2)}</p>
        </div>
      </div>

      <div className="space-y-3">
        {contracts.map((contract) => (
          <div
            key={contract.id}
            className={cn(
              "p-4 rounded-lg border transition-opacity",
              !contract.active && "opacity-50"
            )}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-semibold">{contract.description}</p>
                  <div className="flex items-center gap-1">
                    <Badge
                      variant="outline"
                      className={cn(
                        contract.type === "income"
                          ? "bg-success/10 text-success border-success/20"
                          : "bg-danger/10 text-danger border-danger/20"
                      )}
                    >
                      {contract.category}
                    </Badge>
                    {onUpdateCategory && (
                      <EditCategoryDialog
                        currentCategory={contract.category}
                        type={contract.type}
                        onUpdate={(newCategory) => onUpdateCategory(contract.id, newCategory)}
                      />
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  <span>Vencimento dia {contract.dueDay}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={contract.active}
                  onCheckedChange={() => onToggle(contract.id)}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDelete(contract.id)}
                  className="hover:bg-destructive/20"
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t">
              <span className="text-sm text-muted-foreground">Valor mensal</span>
              <span
                className={cn(
                  "text-xl font-bold",
                  contract.type === "income" ? "text-success" : "text-danger"
                )}
              >
                {contract.type === "income" ? "+" : "-"}R$ {contract.amount.toFixed(2)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
