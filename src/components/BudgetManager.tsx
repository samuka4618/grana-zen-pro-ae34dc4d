import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, TrendingUp, Sparkles } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { useBudgetsStore } from '@/hooks/useBudgetsStore';
import { useCategoriesStore } from '@/hooks/useCategoriesStore';

interface BudgetManagerProps {
  selectedDate: Date;
}

export const BudgetManager = ({ selectedDate }: BudgetManagerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [amount, setAmount] = useState('');
  const [suggestedAmount, setSuggestedAmount] = useState<number | null>(null);

  const { budgets, loading, fetchBudgets, addBudget, updateBudget, deleteBudget, suggestBudget } = useBudgetsStore();
  const { categories } = useCategoriesStore();

  const expenseCategories = categories.filter(c => c.type === 'expense');

  useEffect(() => {
    fetchBudgets(selectedDate);
  }, [selectedDate, fetchBudgets]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    
    if (!selectedCategory || numAmount <= 0) {
      return;
    }

    if (editingId) {
      await updateBudget(editingId, numAmount);
    } else {
      await addBudget(selectedCategory, selectedDate, numAmount);
    }

    resetForm();
  };

  const handleSuggest = async () => {
    if (!selectedCategory) return;
    
    const suggested = await suggestBudget(selectedCategory, selectedDate);
    if (suggested) {
      setSuggestedAmount(suggested);
      setAmount(suggested.toString());
    }
  };

  const resetForm = () => {
    setSelectedCategory('');
    setAmount('');
    setSuggestedAmount(null);
    setEditingId(null);
    setIsOpen(false);
  };

  const handleEdit = (budget: any) => {
    setEditingId(budget.id);
    setSelectedCategory(budget.category);
    setAmount(budget.planned_amount.toString());
    setIsOpen(true);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Orçamento Mensal
            </CardTitle>
            <CardDescription>
              Planeje seus gastos por categoria
            </CardDescription>
          </div>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => resetForm()}>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingId ? 'Editar Orçamento' : 'Adicionar Orçamento'}
                </DialogTitle>
                <DialogDescription>
                  Defina o valor planejado para uma categoria
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Categoria</Label>
                  <Select
                    value={selectedCategory}
                    onValueChange={setSelectedCategory}
                    disabled={!!editingId}
                  >
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {expenseCategories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.name}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="amount">Valor Planejado</Label>
                    {!editingId && selectedCategory && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleSuggest}
                        className="h-auto py-1 px-2 text-xs"
                      >
                        <Sparkles className="h-3 w-3 mr-1" />
                        Sugerir
                      </Button>
                    )}
                  </div>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    step="0.01"
                    min="0"
                    required
                  />
                  {suggestedAmount && (
                    <p className="text-xs text-muted-foreground">
                      Sugestão baseada nos últimos 3 meses: R$ {suggestedAmount.toFixed(2)}
                    </p>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button type="submit" className="flex-1">
                    {editingId ? 'Atualizar' : 'Adicionar'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={resetForm}
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-center text-muted-foreground py-4">Carregando...</p>
        ) : budgets.length === 0 ? (
          <p className="text-center text-muted-foreground py-4">
            Nenhum orçamento definido para este mês
          </p>
        ) : (
          <div className="space-y-2">
            {budgets.map((budget) => (
              <div
                key={budget.id}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div>
                  <p className="font-medium">{budget.category}</p>
                  <p className="text-sm text-muted-foreground">
                    R$ {budget.planned_amount.toFixed(2)}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEdit(budget)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteBudget(budget.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
