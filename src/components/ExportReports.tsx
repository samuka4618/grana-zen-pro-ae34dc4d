import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Download, FileText, FileSpreadsheet, Calendar as CalendarIcon, Loader2 } from "lucide-react";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useTransactionsStore } from "@/hooks/useTransactionsStore";
import { useCreditCardsStore } from "@/hooks/useCreditCardsStore";
import { useCreditCardPurchasesStore } from "@/hooks/useCreditCardPurchasesStore";
import { exportToCSV, exportToExcel, exportToPDF, ExportData } from "@/lib/exportUtils";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ExportReportsProps {
  chartsElementId?: string;
}

export function ExportReports({ chartsElementId }: ExportReportsProps) {
  const [startDate, setStartDate] = useState<Date>(startOfMonth(new Date()));
  const [endDate, setEndDate] = useState<Date>(endOfMonth(new Date()));
  const [exporting, setExporting] = useState<string | null>(null);
  
  const { allTransactions } = useTransactionsStore(new Date());
  const { cards } = useCreditCardsStore();
  const { purchases } = useCreditCardPurchasesStore();

  const getFilteredData = (): ExportData => {
    const filtered = allTransactions.filter(
      t => t.date >= startDate && t.date <= endDate
    );

    const income = filtered
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const expenses = filtered
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      transactions: filtered,
      period: { start: startDate, end: endDate },
      stats: {
        income,
        expenses,
        balance: income - expenses,
      },
      creditCards: cards,
      creditCardPurchases: purchases,
    };
  };

  const handleExport = async (type: 'csv' | 'excel' | 'pdf') => {
    setExporting(type);
    
    try {
      const data = getFilteredData();
      
      if (data.transactions.length === 0) {
        toast.error("Nenhuma transação encontrada no período selecionado");
        setExporting(null);
        return;
      }

      switch (type) {
        case 'csv':
          exportToCSV(data);
          toast.success("Relatório CSV exportado com sucesso!");
          break;
        case 'excel':
          exportToExcel(data);
          toast.success("Relatório Excel exportado com sucesso!");
          break;
        case 'pdf':
          await exportToPDF(data, chartsElementId);
          toast.success("Relatório PDF exportado com sucesso!");
          break;
      }
    } catch (error) {
      console.error("Error exporting report:", error);
      toast.error("Erro ao exportar relatório");
    } finally {
      setExporting(null);
    }
  };

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2 mb-2">
            <Download className="h-5 w-5 text-primary" />
            Exportar Relatórios
          </h3>
          <p className="text-sm text-muted-foreground">
            Gere relatórios personalizados em diferentes formatos
          </p>
        </div>

        {/* Seleção de Período */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Data Início</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal text-sm truncate",
                    !startDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
                  <span className="truncate">
                    {startDate ? format(startDate, "PPP", { locale: ptBR }) : "Selecione"}
                  </span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 z-50 bg-popover border border-border rounded-md shadow-md" align="start">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={(date) => date && setStartDate(date)}
                  locale={ptBR}
                  initialFocus
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label>Data Fim</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal text-sm truncate",
                    !endDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
                  <span className="truncate">
                    {endDate ? format(endDate, "PPP", { locale: ptBR }) : "Selecione"}
                  </span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 z-50 bg-popover border border-border rounded-md shadow-md" align="start">
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={(date) => date && setEndDate(date)}
                  locale={ptBR}
                  initialFocus
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Botões de Exportação */}
        <div className="grid gap-3 sm:grid-cols-3">
          <Button
            onClick={() => handleExport('pdf')}
            disabled={exporting !== null}
            className="gap-2"
          >
            {exporting === 'pdf' ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Gerando...
              </>
            ) : (
              <>
                <FileText className="h-4 w-4" />
                PDF
              </>
            )}
          </Button>

          <Button
            onClick={() => handleExport('excel')}
            disabled={exporting !== null}
            variant="outline"
            className="gap-2"
          >
            {exporting === 'excel' ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Gerando...
              </>
            ) : (
              <>
                <FileSpreadsheet className="h-4 w-4" />
                Excel
              </>
            )}
          </Button>

          <Button
            onClick={() => handleExport('csv')}
            disabled={exporting !== null}
            variant="outline"
            className="gap-2"
          >
            {exporting === 'csv' ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Gerando...
              </>
            ) : (
              <>
                <FileSpreadsheet className="h-4 w-4" />
                CSV
              </>
            )}
          </Button>
        </div>

        <div className="text-xs text-muted-foreground space-y-1">
          <p>• <strong>PDF</strong>: Relatório formatado com gráficos e resumos</p>
          <p>• <strong>Excel</strong>: Planilha completa com múltiplas abas</p>
          <p>• <strong>CSV</strong>: Arquivo simples para importação em outras ferramentas</p>
        </div>
      </div>
    </Card>
  );
}
