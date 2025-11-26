import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { Target, Trash2, Plus } from "lucide-react";
import { useFinancialGoalsStore } from "@/hooks/useFinancialGoalsStore";
import { Transaction } from "@/hooks/useTransactionsStore";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { startOfMonth, endOfMonth, isWithinInterval } from "date-fns";
import { formatCurrency } from "@/lib/currency";

interface FinancialGoalsManagerProps {
  transactions: Transaction[];
  currentMonth: Date;
}

export function FinancialGoalsManager({ transactions, currentMonth }: FinancialGoalsManagerProps) {
  const { goals, addGoal, deleteGoal } = useFinancialGoalsStore();
  const [category, setCategory] = useState("");
  const [goalType, setGoalType] = useState<"monthly_limit" | "savings_target" | "expense_reduction">("monthly_limit");
  const [targetAmount, setTargetAmount] = useState("");
  const [showForm, setShowForm] = useState(false);

  const handleAddGoal = () => {
    if (!category || !targetAmount) return;
    
    addGoal(category, goalType, parseFloat(targetAmount), currentMonth);
    setCategory("");
    setTargetAmount("");
    setShowForm(false);
  };

  const getGoalProgress = (goal: typeof goals[0]) => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    
    const spent = transactions
      .filter(t => 
        t.type === "expense" &&
        t.category === goal.category &&
        isWithinInterval(t.date, { start, end })
      )
      .reduce((sum, t) => sum + t.amount, 0);
    
    const percentage = (spent / goal.targetAmount) * 100;
    
    return {
      spent,
      percentage: Math.min(percentage, 100),
      status: percentage > 100 ? "danger" : percentage > 80 ? "warning" : "success"
    };
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Target className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Metas Financeiras</h3>
        </div>
        <Button
          size="sm"
          onClick={() => setShowForm(!showForm)}
          variant={showForm ? "outline" : "default"}
        >
          <Plus className="h-4 w-4 mr-2" />
          {showForm ? "Cancelar" : "Nova Meta"}
        </Button>
      </div>

      {showForm && (
        <div className="space-y-4 mb-6 p-4 bg-muted/50 rounded-lg">
          <div>
            <Label htmlFor="category">Categoria</Label>
            <Input
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Ex: Alimentação"
            />
          </div>

          <div>
            <Label htmlFor="goalType">Tipo de Meta</Label>
            <Select value={goalType} onValueChange={(v: any) => setGoalType(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly_limit">Limite Mensal</SelectItem>
                <SelectItem value="savings_target">Meta de Economia</SelectItem>
                <SelectItem value="expense_reduction">Redução de Gastos</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="targetAmount">Valor da Meta</Label>
            <Input
              id="targetAmount"
              type="number"
              step="0.01"
              value={targetAmount}
              onChange={(e) => setTargetAmount(e.target.value)}
              placeholder="0.00"
            />
          </div>

          <Button onClick={handleAddGoal} className="w-full">
            Adicionar Meta
          </Button>
        </div>
      )}

      <div className="space-y-4">
        {goals.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            Nenhuma meta definida ainda
          </p>
        ) : (
          goals.map((goal) => {
            const progress = getGoalProgress(goal);
            return (
              <div key={goal.id} className="p-4 border rounded-lg space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium">{goal.category}</h4>
                      <Badge variant="outline" className="text-xs">
                        {goal.goalType === "monthly_limit" && "Limite Mensal"}
                        {goal.goalType === "savings_target" && "Meta de Economia"}
                        {goal.goalType === "expense_reduction" && "Redução"}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Meta: {formatCurrency(goal.targetAmount)}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => deleteGoal(goal.id)}
                  >
                    <Trash2 className="h-4 w-4 text-danger" />
                  </Button>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Gasto: {formatCurrency(progress.spent)}</span>
                    <span className={
                      progress.status === "danger" ? "text-danger" :
                      progress.status === "warning" ? "text-warning" :
                      "text-success"
                    }>
                      {progress.percentage.toFixed(0)}%
                    </span>
                  </div>
                  <Progress 
                    value={progress.percentage} 
                    className={
                      progress.status === "danger" ? "[&>div]:bg-danger" :
                      progress.status === "warning" ? "[&>div]:bg-warning" :
                      "[&>div]:bg-success"
                    }
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
