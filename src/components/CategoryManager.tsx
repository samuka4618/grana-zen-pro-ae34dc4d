import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, Plus, Trash2 } from "lucide-react";
import { useCategoriesStore } from "@/hooks/useCategoriesStore";
import { toast } from "sonner";
import { categorySchema } from "@/lib/validations";

export function CategoryManager() {
  const { categories, addCategory, deleteCategory, getCategoriesByType } = useCategoriesStore();
  const [newCategoryName, setNewCategoryName] = useState("");
  const [activeTab, setActiveTab] = useState<"income" | "expense">("expense");
  const [open, setOpen] = useState(false);

  const handleAddCategory = () => {
    // Validação com Zod
    const validation = categorySchema.safeParse({
      name: newCategoryName,
      type: activeTab,
    });

    if (!validation.success) {
      const firstError = validation.error.errors[0];
      toast.error(firstError.message);
      return;
    }

    addCategory(newCategoryName.trim(), activeTab);
    toast.success("Categoria adicionada!");
    setNewCategoryName("");
  };

  const handleDeleteCategory = (id: string, name: string) => {
    deleteCategory(id);
    toast.success(`Categoria "${name}" removida`);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          <Settings className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Gerenciar Categorias</DialogTitle>
          <DialogDescription>
            Adicione ou remova categorias personalizadas
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "income" | "expense")}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="expense">Despesas</TabsTrigger>
            <TabsTrigger value="income">Receitas</TabsTrigger>
          </TabsList>

          <TabsContent value="expense" className="space-y-4">
            <div className="space-y-2">
              <Label>Nova Categoria de Despesa</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Ex: Lazer, Pets..."
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddCategory()}
                  maxLength={100}
                />
                <Button onClick={handleAddCategory} size="icon">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Categorias de Despesa</Label>
              <div className="flex flex-wrap gap-2">
                {getCategoriesByType("expense").map((cat) => (
                  <Badge
                    key={cat.id}
                    variant="outline"
                    className="gap-2 pr-1 py-1.5"
                  >
                    {cat.name}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5 hover:bg-destructive/20"
                      onClick={() => handleDeleteCategory(cat.id, cat.name)}
                    >
                      <Trash2 className="h-3 w-3 text-destructive" />
                    </Button>
                  </Badge>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="income" className="space-y-4">
            <div className="space-y-2">
              <Label>Nova Categoria de Receita</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Ex: Vendas, Aluguel..."
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddCategory()}
                  maxLength={100}
                />
                <Button onClick={handleAddCategory} size="icon">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Categorias de Receita</Label>
              <div className="flex flex-wrap gap-2">
                {getCategoriesByType("income").map((cat) => (
                  <Badge
                    key={cat.id}
                    variant="outline"
                    className="gap-2 pr-1 py-1.5"
                  >
                    {cat.name}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5 hover:bg-destructive/20"
                      onClick={() => handleDeleteCategory(cat.id, cat.name)}
                    >
                      <Trash2 className="h-3 w-3 text-destructive" />
                    </Button>
                  </Badge>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
