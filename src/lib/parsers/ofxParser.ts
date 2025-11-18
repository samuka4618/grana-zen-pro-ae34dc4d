import { ParsedTransaction } from './csvParser';

export function parseOFX(ofxContent: string): ParsedTransaction[] {
  const transactions: ParsedTransaction[] = [];
  
  // Extract transaction blocks
  const transactionRegex = /<STMTTRN>([\s\S]*?)<\/STMTTRN>/g;
  let match;

  while ((match = transactionRegex.exec(ofxContent)) !== null) {
    const transactionBlock = match[1];
    
    const dateMatch = transactionBlock.match(/<DTPOSTED>(\d{8})/);
    const amountMatch = transactionBlock.match(/<TRNAMT>([-\d.]+)/);
    const memoMatch = transactionBlock.match(/<MEMO>(.*?)(?:<|$)/);
    const nameMatch = transactionBlock.match(/<NAME>(.*?)(?:<|$)/);

    if (dateMatch && amountMatch) {
      const dateStr = dateMatch[1];
      const year = dateStr.substring(0, 4);
      const month = dateStr.substring(4, 6);
      const day = dateStr.substring(6, 8);
      const date = `${year}-${month}-${day}`;

      const amount = parseFloat(amountMatch[1]);
      const description = (memoMatch?.[1] || nameMatch?.[1] || 'Transação').trim();

      transactions.push({
        date,
        description,
        amount: Math.abs(amount),
        type: amount < 0 ? 'expense' : 'income',
        category: 'Outros',
      });
    }
  }

  return transactions;
}
