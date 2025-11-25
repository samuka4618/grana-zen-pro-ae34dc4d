import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import * as XLSX from 'xlsx';
import ExcelJS from 'exceljs';
import { Transaction } from '@/hooks/useTransactionsStore';
import { CreditCard } from '@/hooks/useCreditCardsStore';
import { CreditCardPurchase } from '@/hooks/useCreditCardPurchasesStore';
import { Installment } from '@/hooks/useInstallmentsStore';
import { RecurringContract } from '@/hooks/useRecurringContractsStore';
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
  installments?: Installment[];
  recurringContracts?: RecurringContract[];
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

// Exportar para Excel com ExcelJS - Versão Profissional Completa
export async function exportToExcel(data: ExportData) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Grana Zen Pro';
  workbook.created = new Date();
  workbook.modified = new Date();

  // Cores profissionais
  const colors = {
    primary: { argb: 'FF3B82F6' }, // Azul
    success: { argb: 'FF22C55E' }, // Verde
    danger: { argb: 'FFEF4444' }, // Vermelho
    warning: { argb: 'FFF59E0B' }, // Laranja
    dark: { argb: 'FF1F2937' }, // Cinza escuro
    light: { argb: 'FFF9FAFB' }, // Cinza claro
    border: { argb: 'FFE5E7EB' }, // Borda
    text: { argb: 'FF111827' }, // Texto escuro
    textLight: { argb: 'FF6B7280' }, // Texto claro
  };

  // Estilo de cabeçalho
  const headerStyle = {
    font: { bold: true, size: 12, color: { argb: 'FFFFFFFF' } },
    fill: { type: 'pattern', pattern: 'solid', fgColor: colors.primary },
    alignment: { horizontal: 'center', vertical: 'middle' },
    border: {
      top: { style: 'thin', color: { argb: 'FF1E40AF' } },
      bottom: { style: 'thin', color: { argb: 'FF1E40AF' } },
      left: { style: 'thin', color: { argb: 'FF1E40AF' } },
      right: { style: 'thin', color: { argb: 'FF1E40AF' } },
    },
  };

  // Estilo de título
  const titleStyle = {
    font: { bold: true, size: 16, color: colors.text },
    alignment: { horizontal: 'left', vertical: 'middle' },
  };

  // Estilo de subtítulo
  const subtitleStyle = {
    font: { bold: true, size: 12, color: colors.textLight },
    alignment: { horizontal: 'left', vertical: 'middle' },
  };

  // ========== ABA 1: RESUMO EXECUTIVO ==========
  const summarySheet = workbook.addWorksheet('📊 Resumo Executivo');
  
  // Título
  summarySheet.mergeCells('A1:F1');
  const titleCell = summarySheet.getCell('A1');
  titleCell.value = 'RELATÓRIO FINANCEIRO - RESUMO EXECUTIVO';
  titleCell.style = { ...titleStyle, font: { ...titleStyle.font, size: 18 } };
  summarySheet.getRow(1).height = 30;

  // Período
  summarySheet.mergeCells('A2:F2');
  const periodCell = summarySheet.getCell('A2');
  periodCell.value = `Período: ${format(data.period.start, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })} até ${format(data.period.end, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}`;
  periodCell.style = { font: { size: 11, color: colors.textLight }, alignment: { horizontal: 'left' } };
  summarySheet.getRow(2).height = 20;

  summarySheet.getRow(3).height = 10;

  // Cards de resumo
  const summaryCards = [
    { label: 'TOTAL DE RECEITAS', value: data.stats.income, color: colors.success, icon: '💰' },
    { label: 'TOTAL DE DESPESAS', value: data.stats.expenses, color: colors.danger, icon: '💸' },
    { label: 'SALDO FINAL', value: data.stats.balance, color: data.stats.balance >= 0 ? colors.success : colors.danger, icon: '📈' },
    { label: 'TOTAL DE TRANSAÇÕES', value: data.transactions.length, color: colors.primary, icon: '📋' },
  ];

  summaryCards.forEach((card, index) => {
    const colLetter = String.fromCharCode(65 + index); // A, B, C, D
    const row = 4;
    
    // Card background
    summarySheet.mergeCells(`${colLetter}${row}:${colLetter}${row + 1}`);
    const cardCell = summarySheet.getCell(`${colLetter}${row}`);
    cardCell.style = {
      fill: { type: 'pattern', pattern: 'solid', fgColor: card.color },
      font: { bold: true, size: 11, color: { argb: 'FFFFFFFF' } },
      alignment: { horizontal: 'center', vertical: 'middle' },
      border: {
        top: { style: 'thin', color: { argb: 'FFFFFFFF' } },
        bottom: { style: 'thin', color: { argb: 'FFFFFFFF' } },
        left: { style: 'thin', color: { argb: 'FFFFFFFF' } },
        right: { style: 'thin', color: { argb: 'FFFFFFFF' } },
      },
    };
    cardCell.value = `${card.icon} ${card.label}`;
    
    const valueCell = summarySheet.getCell(`${colLetter}${row + 1}`);
    valueCell.style = {
      fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFFFF' } },
      font: { bold: true, size: 14, color: card.color },
      alignment: { horizontal: 'center', vertical: 'middle' },
      border: {
        top: { style: 'thin', color: colors.border },
        bottom: { style: 'thin', color: colors.border },
        left: { style: 'thin', color: colors.border },
        right: { style: 'thin', color: colors.border },
      },
    };
    if (card.label.includes('TRANSAÇÕES')) {
      valueCell.value = card.value;
    } else {
      valueCell.value = card.value;
      valueCell.numFmt = '"R$" #,##0.00';
    }
    
    summarySheet.getRow(row).height = 25;
    summarySheet.getRow(row + 1).height = 35;
    summarySheet.getColumn(colLetter).width = 30;
  });

  // Análise por categoria
  summarySheet.getRow(10).height = 15;
  const categoryTitle = summarySheet.getCell('A10');
  categoryTitle.value = 'ANÁLISE POR CATEGORIA';
  categoryTitle.style = subtitleStyle;
  summarySheet.getRow(10).height = 25;

  // Agrupar por categoria
  const categoryAnalysis: Record<string, { income: number; expense: number }> = {};
  data.transactions.forEach(t => {
    if (!categoryAnalysis[t.category]) {
      categoryAnalysis[t.category] = { income: 0, expense: 0 };
    }
    if (t.type === 'income') {
      categoryAnalysis[t.category].income += t.amount;
    } else {
      categoryAnalysis[t.category].expense += t.amount;
    }
  });

  // Cabeçalho da tabela de categorias
  summarySheet.getRow(11).values = ['Categoria', 'Receitas', 'Despesas', 'Saldo', 'Total'];
  summarySheet.getRow(11).eachCell((cell, colNumber) => {
    cell.style = headerStyle;
  });
  summarySheet.getRow(11).height = 25;

  // Dados das categorias
  let rowNum = 12;
  Object.entries(categoryAnalysis)
    .sort((a, b) => (b[1].income + b[1].expense) - (a[1].income + a[1].expense))
    .forEach(([category, amounts]) => {
      const total = amounts.income - amounts.expense;
      summarySheet.getRow(rowNum).values = [
        category,
        amounts.income > 0 ? amounts.income : '',
        amounts.expense > 0 ? amounts.expense : '',
        total,
        amounts.income + amounts.expense,
      ];
      
      summarySheet.getRow(rowNum).eachCell((cell, colNumber) => {
        if (colNumber === 1) {
          cell.style = { font: { bold: true }, border: { bottom: { style: 'thin', color: colors.border } } };
        } else if (colNumber === 4) {
          cell.style = {
            font: { bold: true, color: total >= 0 ? colors.success : colors.danger },
            border: { bottom: { style: 'thin', color: colors.border } },
            numFmt: '"R$" #,##0.00',
          };
        } else {
          cell.style = {
            border: { bottom: { style: 'thin', color: colors.border } },
            numFmt: colNumber === 5 ? '"R$" #,##0.00' : '"R$" #,##0.00',
          };
        }
      });
      rowNum++;
    });

  // Total
  summarySheet.getRow(rowNum).values = [
    'TOTAL',
    data.stats.income,
    data.stats.expenses,
    data.stats.balance,
    data.stats.income + data.stats.expenses,
  ];
  summarySheet.getRow(rowNum).eachCell((cell, colNumber) => {
    cell.style = {
      font: { bold: true, size: 11 },
      fill: { type: 'pattern', pattern: 'solid', fgColor: colors.light },
      border: {
        top: { style: 'medium', color: colors.primary },
        bottom: { style: 'medium', color: colors.primary },
      },
      numFmt: colNumber === 1 ? '' : '"R$" #,##0.00',
    };
  });
  summarySheet.getRow(rowNum).height = 25;

  // Ajustar larguras das colunas
  summarySheet.getColumn('A').width = 25;
  summarySheet.getColumn('B').width = 18;
  summarySheet.getColumn('C').width = 18;
  summarySheet.getColumn('D').width = 18;
  summarySheet.getColumn('E').width = 18;

  // ========== ABA 2: TRANSAÇÕES DETALHADAS ==========
  const transactionsSheet = workbook.addWorksheet('💳 Transações');
  
  transactionsSheet.getRow(1).values = ['Data', 'Descrição', 'Categoria', 'Tipo', 'Valor'];
  transactionsSheet.getRow(1).eachCell((cell) => {
    cell.style = headerStyle;
  });
  transactionsSheet.getRow(1).height = 25;

  data.transactions
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .forEach((transaction, index) => {
      const row = transactionsSheet.getRow(index + 2);
      row.values = [
        format(transaction.date, 'dd/MM/yyyy'),
        transaction.description,
        transaction.category,
        transaction.type === 'income' ? 'Receita' : 'Despesa',
        transaction.amount,
      ];
      
      row.eachCell((cell, colNumber) => {
        if (colNumber === 1) {
          cell.style = {
            border: { bottom: { style: 'thin', color: colors.border } },
            numFmt: 'dd/mm/yyyy',
          };
        } else if (colNumber === 4) {
          cell.style = {
            font: { color: transaction.type === 'income' ? colors.success : colors.danger },
            border: { bottom: { style: 'thin', color: colors.border } },
            alignment: { horizontal: 'center' },
          };
        } else if (colNumber === 5) {
          cell.style = {
            font: { bold: true, color: transaction.type === 'income' ? colors.success : colors.danger },
            border: { bottom: { style: 'thin', color: colors.border } },
            numFmt: '"R$" #,##0.00',
            alignment: { horizontal: 'right' },
          };
        } else {
          cell.style = {
            border: { bottom: { style: 'thin', color: colors.border } },
          };
        }
        
        // Zebra striping
        if (index % 2 === 0) {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: colors.light };
        }
      });
      row.height = 20;
    });

  transactionsSheet.getColumn('A').width = 12;
  transactionsSheet.getColumn('B').width = 40;
  transactionsSheet.getColumn('C').width = 20;
  transactionsSheet.getColumn('D').width = 12;
  transactionsSheet.getColumn('E').width = 15;

  // ========== ABA 3: ANÁLISE TEMPORAL ==========
  const temporalSheet = workbook.addWorksheet('📅 Análise Temporal');
  
  // Agrupar por mês
  const monthlyData: Record<string, { income: number; expense: number; count: number }> = {};
  data.transactions.forEach(t => {
    const monthKey = format(t.date, 'MM/yyyy');
    if (!monthlyData[monthKey]) {
      monthlyData[monthKey] = { income: 0, expense: 0, count: 0 };
    }
    if (t.type === 'income') {
      monthlyData[monthKey].income += t.amount;
    } else {
      monthlyData[monthKey].expense += t.amount;
    }
    monthlyData[monthKey].count++;
  });

  temporalSheet.getRow(1).values = ['Mês', 'Receitas', 'Despesas', 'Saldo', 'Nº Transações', 'Taxa de Economia'];
  temporalSheet.getRow(1).eachCell((cell) => {
    cell.style = headerStyle;
  });
  temporalSheet.getRow(1).height = 25;

  let tempRow = 2;
  Object.entries(monthlyData)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .forEach(([month, amounts]) => {
      const balance = amounts.income - amounts.expense;
      const savingsRate = amounts.income > 0 ? (balance / amounts.income) * 100 : 0;
      
      temporalSheet.getRow(tempRow).values = [
        month,
        amounts.income,
        amounts.expense,
        balance,
        amounts.count,
        savingsRate,
      ];
      
      temporalSheet.getRow(tempRow).eachCell((cell, colNumber) => {
        if (colNumber === 1) {
          cell.style = { font: { bold: true }, border: { bottom: { style: 'thin', color: colors.border } } };
        } else if (colNumber === 3) {
          cell.style = {
            font: { color: colors.danger },
            border: { bottom: { style: 'thin', color: colors.border } },
            numFmt: '"R$" #,##0.00',
          };
        } else if (colNumber === 4) {
          cell.style = {
            font: { bold: true, color: balance >= 0 ? colors.success : colors.danger },
            border: { bottom: { style: 'thin', color: colors.border } },
            numFmt: '"R$" #,##0.00',
          };
        } else if (colNumber === 6) {
          cell.style = {
            font: { color: savingsRate >= 20 ? colors.success : savingsRate >= 10 ? colors.warning : colors.danger },
            border: { bottom: { style: 'thin', color: colors.border } },
            numFmt: '0.00"%"',
          };
        } else {
          cell.style = {
            border: { bottom: { style: 'thin', color: colors.border } },
            numFmt: colNumber === 5 ? '0' : '"R$" #,##0.00',
          };
        }
      });
      tempRow++;
    });

  temporalSheet.getColumn('A').width = 15;
  temporalSheet.getColumn('B').width = 15;
  temporalSheet.getColumn('C').width = 15;
  temporalSheet.getColumn('D').width = 15;
  temporalSheet.getColumn('E').width = 15;
  temporalSheet.getColumn('F').width = 18;

  // ========== ABA 4: FINANCIAMENTOS E PARCELAS ==========
  if (data.installments && data.installments.length > 0) {
    const installmentsSheet = workbook.addWorksheet('💳 Financiamentos');
    
    installmentsSheet.getRow(1).values = ['Descrição', 'Valor Total', 'Parcelas', 'Parcela Atual', 'Valor Parcela', 'Categoria', 'Tipo', 'Data Início'];
    installmentsSheet.getRow(1).eachCell((cell) => {
      cell.style = headerStyle;
    });
    installmentsSheet.getRow(1).height = 25;

    data.installments.forEach((inst, index) => {
      const row = installmentsSheet.getRow(index + 2);
      row.values = [
        inst.description,
        inst.totalAmount,
        inst.installmentCount,
        inst.currentInstallment,
        inst.installmentAmount,
        inst.category,
        inst.type === 'income' ? 'Receita' : 'Despesa',
        format(inst.startDate, 'dd/MM/yyyy'),
      ];
      
      row.eachCell((cell, colNumber) => {
        if (colNumber === 1) {
          cell.style = { font: { bold: true }, border: { bottom: { style: 'thin', color: colors.border } } };
        } else if ([2, 5].includes(colNumber)) {
          cell.style = {
            border: { bottom: { style: 'thin', color: colors.border } },
            numFmt: '"R$" #,##0.00',
          };
        } else if (colNumber === 7) {
          cell.style = {
            font: { color: inst.type === 'income' ? colors.success : colors.danger },
            border: { bottom: { style: 'thin', color: colors.border } },
            alignment: { horizontal: 'center' },
          };
        } else {
          cell.style = {
            border: { bottom: { style: 'thin', color: colors.border } },
            alignment: colNumber === 8 ? 'center' : 'left',
          };
        }
      });
      row.height = 20;
    });

    installmentsSheet.getColumn('A').width = 30;
    installmentsSheet.getColumn('B').width = 15;
    installmentsSheet.getColumn('C').width = 12;
    installmentsSheet.getColumn('D').width = 12;
    installmentsSheet.getColumn('E').width = 15;
    installmentsSheet.getColumn('F').width = 20;
    installmentsSheet.getColumn('G').width = 12;
    installmentsSheet.getColumn('H').width = 15;
  }

  // ========== ABA 5: CONTRATOS RECORRENTES ==========
  if (data.recurringContracts && data.recurringContracts.length > 0) {
    const contractsSheet = workbook.addWorksheet('🔄 Contratos Recorrentes');
    
    contractsSheet.getRow(1).values = ['Descrição', 'Valor Mensal', 'Dia Vencimento', 'Categoria', 'Tipo', 'Status'];
    contractsSheet.getRow(1).eachCell((cell) => {
      cell.style = headerStyle;
    });
    contractsSheet.getRow(1).height = 25;

    data.recurringContracts.forEach((contract, index) => {
      const row = contractsSheet.getRow(index + 2);
      row.values = [
        contract.description,
        contract.amount,
        contract.dueDay,
        contract.category,
        contract.type === 'income' ? 'Receita' : 'Despesa',
        contract.active ? 'Ativo' : 'Inativo',
      ];
      
      row.eachCell((cell, colNumber) => {
        if (colNumber === 1) {
          cell.style = { font: { bold: true }, border: { bottom: { style: 'thin', color: colors.border } } };
        } else if (colNumber === 2) {
          cell.style = {
            border: { bottom: { style: 'thin', color: colors.border } },
            numFmt: '"R$" #,##0.00',
          };
        } else if (colNumber === 5) {
          cell.style = {
            font: { color: contract.type === 'income' ? colors.success : colors.danger },
            border: { bottom: { style: 'thin', color: colors.border } },
            alignment: { horizontal: 'center' },
          };
        } else if (colNumber === 6) {
          cell.style = {
            font: { color: contract.active ? colors.success : colors.textLight },
            border: { bottom: { style: 'thin', color: colors.border } },
            alignment: { horizontal: 'center' },
          };
        } else {
          cell.style = {
            border: { bottom: { style: 'thin', color: colors.border } },
            alignment: colNumber === 3 ? 'center' : 'left',
          };
        }
      });
      row.height = 20;
    });

    contractsSheet.getColumn('A').width = 30;
    contractsSheet.getColumn('B').width = 18;
    contractsSheet.getColumn('C').width = 15;
    contractsSheet.getColumn('D').width = 20;
    contractsSheet.getColumn('E').width = 12;
    contractsSheet.getColumn('F').width = 12;
  }

  // ========== ABA 6: CARTÕES DE CRÉDITO ==========
  if (data.creditCards && data.creditCards.length > 0) {
    const cardsSheet = workbook.addWorksheet('💳 Cartões de Crédito');
    
    cardsSheet.getRow(1).values = ['Cartão', 'Limite', 'Dia Fechamento', 'Dia Vencimento', 'Status'];
    cardsSheet.getRow(1).eachCell((cell) => {
      cell.style = headerStyle;
    });
    cardsSheet.getRow(1).height = 25;

    data.creditCards.forEach((card, index) => {
      const row = cardsSheet.getRow(index + 2);
      row.values = [
        card.name,
        card.creditLimit,
        card.closingDay,
        card.dueDay,
        card.active ? 'Ativo' : 'Inativo',
      ];
      
      row.eachCell((cell, colNumber) => {
        if (colNumber === 1) {
          cell.style = { font: { bold: true }, border: { bottom: { style: 'thin', color: colors.border } } };
        } else if (colNumber === 2) {
          cell.style = {
            border: { bottom: { style: 'thin', color: colors.border } },
            numFmt: '"R$" #,##0.00',
          };
        } else if (colNumber === 5) {
          cell.style = {
            font: { color: card.active ? colors.success : colors.textLight },
            border: { bottom: { style: 'thin', color: colors.border } },
            alignment: { horizontal: 'center' },
          };
        } else {
          cell.style = {
            border: { bottom: { style: 'thin', color: colors.border } },
            alignment: 'center',
          };
        }
      });
      row.height = 20;
    });

    cardsSheet.getColumn('A').width = 25;
    cardsSheet.getColumn('B').width = 18;
    cardsSheet.getColumn('C').width = 18;
    cardsSheet.getColumn('D').width = 18;
    cardsSheet.getColumn('E').width = 12;
  }

  // ========== ABA 7: COMPRAS NO CARTÃO ==========
  if (data.creditCardPurchases && data.creditCardPurchases.length > 0) {
    const purchasesSheet = workbook.addWorksheet('🛒 Compras no Cartão');
    
    purchasesSheet.getRow(1).values = ['Data', 'Descrição', 'Valor Total', 'Parcelas', 'Valor Parcela', 'Categoria'];
    purchasesSheet.getRow(1).eachCell((cell) => {
      cell.style = headerStyle;
    });
    purchasesSheet.getRow(1).height = 25;

    data.creditCardPurchases.forEach((purchase, index) => {
      const row = purchasesSheet.getRow(index + 2);
      row.values = [
        format(purchase.purchaseDate, 'dd/MM/yyyy'),
        purchase.description,
        purchase.totalAmount,
        purchase.installments,
        purchase.installmentAmount,
        purchase.category,
      ];
      
      row.eachCell((cell, colNumber) => {
        if (colNumber === 1) {
          cell.style = {
            border: { bottom: { style: 'thin', color: colors.border } },
            numFmt: 'dd/mm/yyyy',
          };
        } else if ([3, 5].includes(colNumber)) {
          cell.style = {
            border: { bottom: { style: 'thin', color: colors.border } },
            numFmt: '"R$" #,##0.00',
          };
        } else if (colNumber === 4) {
          cell.style = {
            border: { bottom: { style: 'thin', color: colors.border } },
            alignment: { horizontal: 'center' },
          };
        } else {
          cell.style = {
            border: { bottom: { style: 'thin', color: colors.border } },
          };
        }
      });
      row.height = 20;
    });

    purchasesSheet.getColumn('A').width = 12;
    purchasesSheet.getColumn('B').width = 35;
    purchasesSheet.getColumn('C').width = 15;
    purchasesSheet.getColumn('D').width = 12;
    purchasesSheet.getColumn('E').width = 15;
    purchasesSheet.getColumn('F').width = 20;
  }

  // Gerar arquivo
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `Relatorio_Financeiro_${format(data.period.start, 'yyyy-MM')}.xlsx`;
  link.click();
  URL.revokeObjectURL(url);
}

// Exportar para PDF (mantido original)
export async function exportToPDF(data: ExportData, chartsElementId?: string) {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  let yPosition = 20;

  // Cabeçalho
  pdf.setFontSize(20);
  pdf.setTextColor(59, 130, 246);
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
    
    data.transactions.forEach((transaction, index) => {
      if (yPosition > pageHeight - 20) {
        pdf.addPage();
        yPosition = 20;
        
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
