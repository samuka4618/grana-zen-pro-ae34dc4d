import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import * as XLSX from 'xlsx';
import { Transaction } from '@/hooks/useTransactionsStore';
import { CreditCard } from '@/hooks/useCreditCardsStore';
import { CreditCardPurchase } from '@/hooks/useCreditCardPurchasesStore';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export interface ExportData {
  transactions: Transaction[];
  period: { start: Date; end: Date };
  stats: {
    income: number;
    expenses: number;
    balance: number;
  };
  creditCards?: CreditCard[];
  creditCardPurchases?: CreditCardPurchase[];
}

// Exportar para CSV
export function exportToCSV(data: ExportData) {
  const csvRows = [
    ['Data', 'Descrição', 'Tipo', 'Categoria', 'Valor'],
    ...data.transactions.map(t => [
      format(t.date, 'dd/MM/yyyy'),
      t.description,
      t.type === 'income' ? 'Receita' : 'Despesa',
      t.category,
      t.amount.toFixed(2)
    ])
  ];

  const csvContent = csvRows.map(row => row.join(',')).join('\n');
  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `relatorio_${format(data.period.start, 'yyyy-MM')}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

// Exportar para Excel
export function exportToExcel(data: ExportData) {
  const wb = XLSX.utils.book_new();

  // Aba de Transações
  const transactionsData = [
    ['Data', 'Descrição', 'Tipo', 'Categoria', 'Valor'],
    ...data.transactions.map(t => [
      format(t.date, 'dd/MM/yyyy'),
      t.description,
      t.type === 'income' ? 'Receita' : 'Despesa',
      t.category,
      t.amount
    ])
  ];
  const wsTransactions = XLSX.utils.aoa_to_sheet(transactionsData);
  XLSX.utils.book_append_sheet(wb, wsTransactions, 'Transações');

  // Aba de Resumo
  const summaryData = [
    ['Período', `${format(data.period.start, 'dd/MM/yyyy')} - ${format(data.period.end, 'dd/MM/yyyy')}`],
    [''],
    ['Receitas', data.stats.income],
    ['Despesas', data.stats.expenses],
    ['Saldo', data.stats.balance],
  ];
  const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Resumo');

  // Aba de Cartões (se disponível)
  if (data.creditCards && data.creditCards.length > 0) {
    const cardsData = [
      ['Cartão', 'Limite', 'Status', 'Dia Fechamento', 'Dia Vencimento'],
      ...data.creditCards.map(c => [
        c.name,
        c.creditLimit,
        c.active ? 'Ativo' : 'Inativo',
        c.closingDay,
        c.dueDay
      ])
    ];
    const wsCards = XLSX.utils.aoa_to_sheet(cardsData);
    XLSX.utils.book_append_sheet(wb, wsCards, 'Cartões');
  }

  // Aba de Compras no Cartão (se disponível)
  if (data.creditCardPurchases && data.creditCardPurchases.length > 0) {
    const purchasesData = [
      ['Data', 'Descrição', 'Valor Total', 'Parcelas', 'Valor Parcela', 'Categoria'],
      ...data.creditCardPurchases.map(p => [
        format(p.purchaseDate, 'dd/MM/yyyy'),
        p.description,
        p.totalAmount,
        p.installments,
        p.installmentAmount,
        p.category
      ])
    ];
    const wsPurchases = XLSX.utils.aoa_to_sheet(purchasesData);
    XLSX.utils.book_append_sheet(wb, wsPurchases, 'Compras Cartão');
  }

  XLSX.writeFile(wb, `relatorio_${format(data.period.start, 'yyyy-MM')}.xlsx`);
}

// Exportar para PDF
export async function exportToPDF(data: ExportData, chartsElementId?: string) {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  let yPosition = 20;

  // Cabeçalho
  pdf.setFontSize(20);
  pdf.setTextColor(59, 130, 246); // primary color
  pdf.text('Relatório Financeiro', pageWidth / 2, yPosition, { align: 'center' });
  
  yPosition += 10;
  pdf.setFontSize(12);
  pdf.setTextColor(100, 100, 100);
  pdf.text(
    `Período: ${format(data.period.start, 'dd/MM/yyyy', { locale: ptBR })} - ${format(data.period.end, 'dd/MM/yyyy', { locale: ptBR })}`,
    pageWidth / 2,
    yPosition,
    { align: 'center' }
  );

  yPosition += 15;

  // Resumo Financeiro
  pdf.setFontSize(14);
  pdf.setTextColor(0, 0, 0);
  pdf.text('Resumo Financeiro', 20, yPosition);
  
  yPosition += 8;
  pdf.setFontSize(10);
  
  // Box de resumo
  pdf.setFillColor(249, 250, 251);
  pdf.rect(20, yPosition, pageWidth - 40, 30, 'F');
  
  yPosition += 7;
  pdf.text(`Receitas: R$ ${data.stats.income.toFixed(2)}`, 25, yPosition);
  yPosition += 6;
  pdf.text(`Despesas: R$ ${data.stats.expenses.toFixed(2)}`, 25, yPosition);
  yPosition += 6;
  
  if (data.stats.balance >= 0) {
    pdf.setTextColor(34, 197, 94);
  } else {
    pdf.setTextColor(239, 68, 68);
  }
  pdf.setFontSize(11);
  pdf.text(`Saldo: R$ ${data.stats.balance.toFixed(2)}`, 25, yPosition);
  pdf.setTextColor(0, 0, 0);
  pdf.setFontSize(10);
  
  yPosition += 15;

  // Capturar gráficos se existirem
  if (chartsElementId) {
    const chartsElement = document.getElementById(chartsElementId);
    if (chartsElement) {
      try {
        const canvas = await html2canvas(chartsElement, {
          scale: 2,
          backgroundColor: '#ffffff',
          logging: false,
        });
        
        const imgData = canvas.toDataURL('image/png');
        const imgWidth = pageWidth - 40;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        
        // Adicionar nova página se necessário
        if (yPosition + imgHeight > pageHeight - 20) {
          pdf.addPage();
          yPosition = 20;
        }
        
        pdf.addImage(imgData, 'PNG', 20, yPosition, imgWidth, imgHeight);
        yPosition += imgHeight + 10;
      } catch (error) {
        console.error('Error capturing charts:', error);
      }
    }
  }

  // Transações
  if (data.transactions.length > 0) {
    // Adicionar nova página para transações
    pdf.addPage();
    yPosition = 20;
    
    pdf.setFontSize(14);
    pdf.text('Transações Detalhadas', 20, yPosition);
    yPosition += 10;
    
    pdf.setFontSize(9);
    
    // Cabeçalho da tabela
    pdf.setFillColor(59, 130, 246);
    pdf.setTextColor(255, 255, 255);
    pdf.rect(20, yPosition, pageWidth - 40, 7, 'F');
    pdf.text('Data', 22, yPosition + 5);
    pdf.text('Descrição', 45, yPosition + 5);
    pdf.text('Categoria', 110, yPosition + 5);
    pdf.text('Tipo', 145, yPosition + 5);
    pdf.text('Valor', 165, yPosition + 5);
    
    yPosition += 7;
    pdf.setTextColor(0, 0, 0);
    
    // Linhas de transações
    data.transactions.forEach((transaction, index) => {
      if (yPosition > pageHeight - 20) {
        pdf.addPage();
        yPosition = 20;
        
        // Repetir cabeçalho
        pdf.setFillColor(59, 130, 246);
        pdf.setTextColor(255, 255, 255);
        pdf.rect(20, yPosition, pageWidth - 40, 7, 'F');
        pdf.text('Data', 22, yPosition + 5);
        pdf.text('Descrição', 45, yPosition + 5);
        pdf.text('Categoria', 110, yPosition + 5);
        pdf.text('Tipo', 145, yPosition + 5);
        pdf.text('Valor', 165, yPosition + 5);
        yPosition += 7;
        pdf.setTextColor(0, 0, 0);
      }
      
      // Zebra striping
      if (index % 2 === 0) {
        pdf.setFillColor(249, 250, 251);
        pdf.rect(20, yPosition, pageWidth - 40, 6, 'F');
      }
      
      pdf.text(format(transaction.date, 'dd/MM/yy'), 22, yPosition + 4);
      pdf.text(transaction.description.substring(0, 25), 45, yPosition + 4);
      pdf.text(transaction.category.substring(0, 15), 110, yPosition + 4);
      pdf.text(transaction.type === 'income' ? 'Receita' : 'Despesa', 145, yPosition + 4);
      
      if (transaction.type === 'income') {
        pdf.setTextColor(34, 197, 94);
      } else {
        pdf.setTextColor(239, 68, 68);
      }
      pdf.text(`R$ ${transaction.amount.toFixed(2)}`, 165, yPosition + 4);
      pdf.setTextColor(0, 0, 0);
      
      yPosition += 6;
    });
  }

  // Rodapé
  const totalPages = pdf.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    pdf.setPage(i);
    pdf.setFontSize(8);
    pdf.setTextColor(150, 150, 150);
    pdf.text(
      `Página ${i} de ${totalPages} - Gerado em ${format(new Date(), 'dd/MM/yyyy HH:mm')}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    );
  }

  pdf.save(`relatorio_${format(data.period.start, 'yyyy-MM')}.pdf`);
}
