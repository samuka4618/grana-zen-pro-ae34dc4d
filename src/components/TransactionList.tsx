import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ArrowDownCircle, ArrowUpCircle, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Transaction } from "@/hooks/useTransactionsStore";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { EditCategoryDialog } from "./EditCategoryDialog";
import { AttachmentViewer } from "./AttachmentViewer";
import { formatCurrency } from "@/lib/currency";

interface TransactionListProps {
  transactions: Transaction[];
  onUpdateCategory?: (id: string, category: string) => void;
  onDelete?: (id: string) => void;
}

export function TransactionList({ transactions, onUpdateCategory, onDelete }: TransactionListProps) {
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
              <div className="flex items-center gap-3 flex-1">
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
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{transaction.description}</p>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
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
                    {transaction.attachmentUrl && (
                      <AttachmentViewer attachmentUrl={transaction.attachmentUrl} />
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <p className={cn(
                  "text-lg font-semibold tabular-nums whitespace-nowrap",
                  transaction.type === "income" ? "text-success" : "text-danger"
                )}>
                  {transaction.type === "income" ? "+" : "-"}
                  {formatCurrency(transaction.amount).replace('R$', '').trim()}
                </p>
                
                {onDelete && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Excluir Transação</AlertDialogTitle>
                        <AlertDialogDescription>
                          Tem certeza que deseja excluir a transação <strong>"{transaction.description}"</strong> de{" "}
                          <strong>{formatCurrency(transaction.amount)}</strong>?
                          <br />
                          Esta ação não pode ser desfeita.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => onDelete(transaction.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Excluir
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
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
