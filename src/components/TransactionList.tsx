import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowDownCircle, ArrowUpCircle, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: "income" | "expense";
  category: string;
  date: string;
}

const mockTransactions: Transaction[] = [
  { id: "1", description: "Salário", amount: 5000, type: "income", category: "Salário", date: "2025-01-15" },
  { id: "2", description: "Mercado", amount: 350.50, type: "expense", category: "Alimentação", date: "2025-01-14" },
  { id: "3", description: "Netflix", amount: 39.90, type: "expense", category: "Entretenimento", date: "2025-01-13" },
  { id: "4", description: "Freelance", amount: 1500, type: "income", category: "Renda Extra", date: "2025-01-12" },
  { id: "5", description: "Uber", amount: 45.20, type: "expense", category: "Transporte", date: "2025-01-12" },
];

export function TransactionList() {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Transações Recentes</h2>
        <Badge variant="outline" className="gap-1">
          <Calendar className="h-3 w-3" />
          Jan 2025
        </Badge>
      </div>
      
      <div className="space-y-3">
        {mockTransactions.map((transaction) => (
          <div
            key={transaction.id}
            className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className={cn(
                "rounded-full p-2",
                transaction.type === "income" ? "bg-success-light" : "bg-danger-light"
              )}>
                {transaction.type === "income" ? (
                  <ArrowUpCircle className="h-5 w-5 text-success" />
                ) : (
                  <ArrowDownCircle className="h-5 w-5 text-danger" />
                )}
              </div>
              <div>
                <p className="font-medium">{transaction.description}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="secondary" className="text-xs">
                    {transaction.category}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {new Date(transaction.date).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              </div>
            </div>
            
            <p className={cn(
              "text-lg font-semibold",
              transaction.type === "income" ? "text-success" : "text-danger"
            )}>
              {transaction.type === "income" ? "+" : "-"}
              R$ {transaction.amount.toFixed(2)}
            </p>
          </div>
        ))}
      </div>
    </Card>
  );
}
