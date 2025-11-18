import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2 } from "lucide-react";
import { Transaction } from "@/hooks/useTransactionsStore";
import { RecurringContract } from "@/hooks/useRecurringContractsStore";
import { Installment } from "@/hooks/useInstallmentsStore";
import { CreditCard } from "@/hooks/useCreditCardsStore";
import { CreditCardPurchase } from "@/hooks/useCreditCardPurchasesStore";
import { toast } from "sonner";

interface AIInsightsProps {
  transactions: Transaction[];
  contracts: RecurringContract[];
  installments: Installment[];
  creditCards: CreditCard[];
  creditCardPurchases: CreditCardPurchase[];
}

export function AIInsights({ transactions, contracts, installments, creditCards, creditCardPurchases }: AIInsightsProps) {
  const [insights, setInsights] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const generateInsights = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/financial-insights`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            transactions: transactions.slice(0, 50),
            recurringContracts: contracts,
            installments: installments,
            creditCards: creditCards,
            creditCardPurchases: creditCardPurchases,
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erro ao gerar insights");
      }

      const data = await response.json();
      setInsights(data.insights);
    } catch (error) {
      console.error("Error generating insights:", error);
      toast.error(error instanceof Error ? error.message : "Erro ao gerar insights");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Insights Inteligentes com IA</h3>
        </div>
        <Button
          onClick={generateInsights}
          disabled={loading}
          size="sm"
          className="gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Analisando...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              Gerar Análise
            </>
          )}
        </Button>
      </div>

      {insights ? (
        <div className="prose prose-sm max-w-none">
          <div className="whitespace-pre-wrap text-sm text-muted-foreground bg-muted/50 p-4 rounded-lg">
            {insights}
          </div>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground text-center py-8">
          Clique em "Gerar Análise" para obter insights inteligentes sobre suas finanças usando IA
        </p>
      )}
    </Card>
  );
}
