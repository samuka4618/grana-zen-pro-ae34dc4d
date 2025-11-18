import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Edit } from "lucide-react";
import { useCategoriesStore } from "@/hooks/useCategoriesStore";

interface EditCategoryDialogProps {
  currentCategory: string;
  type: "income" | "expense";
  onUpdate: (newCategory: string) => void;
}

export function EditCategoryDialog({ currentCategory, type, onUpdate }: EditCategoryDialogProps) {
  const [open, setOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(currentCategory);
  const { getCategoriesByType } = useCategoriesStore();

  const categories = getCategoriesByType(type);

  const handleUpdate = () => {
    if (selectedCategory && selectedCategory !== currentCategory) {
      onUpdate(selectedCategory);
    }
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="h-6 px-2">
          <Edit className="h-3 w-3" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Editar Categoria</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label>Categoria Atual</Label>
            <p className="text-sm text-muted-foreground">{currentCategory}</p>
          </div>
          <div className="space-y-2">
            <Label>Nova Categoria</Label>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
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
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleUpdate}>
              Atualizar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
