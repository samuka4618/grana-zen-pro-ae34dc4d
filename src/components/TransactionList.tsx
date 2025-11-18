import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowDownCircle, ArrowUpCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Transaction } from "@/hooks/useTransactionsStore";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { EditCategoryDialog } from "./EditCategoryDialog";

interface TransactionListProps {
  transactions: Transaction[];
  onUpdateCategory?: (id: string, category: string) => void;
}

export function TransactionList({ transactions, onUpdateCategory }: TransactionListProps) {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Transações Recentes</h2>
      </div>
      
      <div className="space-y-3">
        {transactions.length > 0 ? (
          transactions.map((transaction) => (
            <div
              key={transaction.id}
              className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className={cn(
                  "rounded-full p-2",
                  transaction.type === "income" ? "bg-success/10" : "bg-danger/10"
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
                    <div className="flex items-center gap-1">
                      <Badge variant="secondary" className="text-xs">
                        {transaction.category}
                      </Badge>
                      {onUpdateCategory && (
                        <EditCategoryDialog
                          currentCategory={transaction.category}
                          type={transaction.type}
                          onUpdate={(newCategory) => onUpdateCategory(transaction.id, newCategory)}
                        />
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {format(transaction.date, "dd/MM/yyyy", { locale: ptBR })}
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
          ))
        ) : (
          <p className="text-center text-muted-foreground py-8">
            Nenhuma transação neste período
          </p>
        )}
      </div>
    </Card>
  );
}
