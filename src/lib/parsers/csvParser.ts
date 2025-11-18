export interface ParsedTransaction {
  date: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
}

export function parseCSV(csvContent: string): ParsedTransaction[] {
  const lines = csvContent.split('\n').filter(line => line.trim());
  if (lines.length === 0) return [];

  // Remove header
  const dataLines = lines.slice(1);
  const transactions: ParsedTransaction[] = [];

  dataLines.forEach((line) => {
    const values = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''));
    
    if (values.length >= 3) {
      const [date, description, amountStr, category = 'Outros'] = values;
      const amount = parseFloat(amountStr.replace(/[^\d.-]/g, ''));
      
      if (!isNaN(amount) && date && description) {
        transactions.push({
          date: parseDateString(date),
          description,
          amount: Math.abs(amount),
          type: amount < 0 ? 'expense' : 'income',
          category,
        });
      }
    }
  });

  return transactions;
}

function parseDateString(dateStr: string): string {
  // Try various date formats
  const formats = [
    /(\d{4})-(\d{2})-(\d{2})/, // YYYY-MM-DD
    /(\d{2})\/(\d{2})\/(\d{4})/, // DD/MM/YYYY
    /(\d{2})-(\d{2})-(\d{4})/, // DD-MM-YYYY
  ];

  for (const format of formats) {
    const match = dateStr.match(format);
    if (match) {
      if (format === formats[0]) {
        // Already in ISO format
        return dateStr;
      } else {
        // Convert DD/MM/YYYY or DD-MM-YYYY to ISO
        const [, day, month, year] = match;
        return `${year}-${month}-${day}`;
      }
    }
  }

  // Fallback to current date if parsing fails
  return new Date().toISOString().split('T')[0];
}
