import { useState } from "react";
import { Button } from "@/components/ui/button";
import { MonthPicker } from "@/components/MonthPicker";
import { CreditCardsManager } from "@/components/CreditCardsManager";
import { AddCreditCardPurchase } from "@/components/AddCreditCardPurchase";
import { CreditCardInvoice } from "@/components/CreditCardInvoice";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ArrowLeft, CreditCard } from "lucide-react";
import { useNavigate } from "react-router-dom";

const CreditCards = () => {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(new Date());

  const monthYear = format(selectedDate, "MMMM 'de' yyyy", { locale: ptBR });

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-3 sm:p-6 space-y-4 sm:space-y-8">
        {/* Header */}
        <header className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate("/")}
                  className="gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Voltar
                </Button>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                Cartões de Crédito
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground">
                Gerencie seus cartões, faturas e compras parceladas
              </p>
            </div>
            <CreditCard className="h-12 w-12 text-primary hidden sm:block" />
          </div>

          {/* Month Picker */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 p-3 sm:p-4 rounded-lg border bg-card">
            <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">
              Período da Fatura:
            </span>
            <MonthPicker selectedDate={selectedDate} onDateChange={setSelectedDate} />
          </div>
        </header>

        {/* Content Grid */}
        <div className="grid gap-4 sm:gap-6 lg:grid-cols-3">
          {/* Left Column - Cards Manager */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            <CreditCardsManager />
          </div>

          {/* Right Column - Actions & Invoice */}
          <div className="space-y-4 sm:space-y-6">
            <AddCreditCardPurchase />
            <CreditCardInvoice currentMonth={selectedDate} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreditCards;
