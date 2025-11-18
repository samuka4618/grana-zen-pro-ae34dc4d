import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useInvestmentsStore } from "@/hooks/useInvestmentsStore";
import { useToast } from "@/hooks/use-toast";

const investmentTypes = [
  "Ações",
  "Fundos Imobiliários",
  "Renda Fixa",
  "Tesouro Direto",
  "Criptomoedas",
  "Fundos de Investimento",
  "ETF",
  "Outro",
];

export const InvestmentsManager = () => {
  const { user } = useAuth();
  const { addInvestment } = useInvestmentsStore();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    type: "",
    ticker_symbol: "",
    quantity: "",
    purchase_price: "",
    current_price: "",
    purchase_date: new Date().toISOString().split("T")[0],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      await addInvestment({
        user_id: user.id,
        name: formData.name,
        type: formData.type,
        ticker_symbol: formData.ticker_symbol || undefined,
        quantity: parseFloat(formData.quantity),
        purchase_price: parseFloat(formData.purchase_price),
        current_price: parseFloat(formData.current_price),
        purchase_date: new Date(formData.purchase_date).toISOString(),
      });

      toast({
        title: "Investimento adicionado",
        description: "O investimento foi adicionado com sucesso.",
      });

      setFormData({
        name: "",
        type: "",
        ticker_symbol: "",
        quantity: "",
        purchase_price: "",
        current_price: "",
        purchase_date: new Date().toISOString().split("T")[0],
      });
      setOpen(false);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível adicionar o investimento.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Investimento
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Adicionar Investimento</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome do Investimento</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Tipo</Label>
            <Select
              value={formData.type}
              onValueChange={(value) =>
                setFormData({ ...formData, type: value })
              }
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                {investmentTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="ticker">Código/Ticker (Opcional)</Label>
            <Input
              id="ticker"
              value={formData.ticker_symbol}
              onChange={(e) =>
                setFormData({ ...formData, ticker_symbol: e.target.value })
              }
              placeholder="Ex: PETR4, BTCUSD"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantidade</Label>
              <Input
                id="quantity"
                type="number"
                step="0.00000001"
                value={formData.quantity}
                onChange={(e) =>
                  setFormData({ ...formData, quantity: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="purchase_price">Preço de Compra</Label>
              <Input
                id="purchase_price"
                type="number"
                step="0.01"
                value={formData.purchase_price}
                onChange={(e) =>
                  setFormData({ ...formData, purchase_price: e.target.value })
                }
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="current_price">Preço Atual</Label>
              <Input
                id="current_price"
                type="number"
                step="0.01"
                value={formData.current_price}
                onChange={(e) =>
                  setFormData({ ...formData, current_price: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="purchase_date">Data de Compra</Label>
              <Input
                id="purchase_date"
                type="date"
                value={formData.purchase_date}
                onChange={(e) =>
                  setFormData({ ...formData, purchase_date: e.target.value })
                }
                required
              />
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Adicionando..." : "Adicionar Investimento"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
