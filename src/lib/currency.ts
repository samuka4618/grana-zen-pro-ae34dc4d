/**
 * Formata um valor numérico para moeda brasileira (R$)
 * @param value - Valor numérico a ser formatado
 * @returns String formatada no padrão brasileiro (R$ 1.234,56)
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Remove formatação de moeda e converte para número
 * @param value - String formatada (R$ 1.234,56 ou 1.234,56 ou 1234,56 ou 2000)
 * @returns Número decimal
 */
export function parseCurrency(value: string): number {
  if (!value || value.trim() === '') return 0;
  
  // Remove tudo exceto números, vírgula e pontos
  const cleaned = value.replace(/[^\d,.-]/g, '');
  
  if (!cleaned) return 0;
  
  // Verifica se tem vírgula ou ponto
  const hasComma = cleaned.includes(',');
  const hasDot = cleaned.includes('.');
  
  let normalized: string;
  
  if (hasComma && hasDot) {
    // Tem ambos: vírgula é decimal, ponto é milhar (ex: 1.234,56)
    normalized = cleaned.replace(/\./g, '').replace(',', '.');
  } else if (hasComma) {
    // Só tem vírgula: pode ser decimal ou milhar
    // Se vírgula está nas últimas 3 posições, é decimal (ex: 1234,56)
    const commaIndex = cleaned.lastIndexOf(',');
    const afterComma = cleaned.substring(commaIndex + 1);
    if (afterComma.length <= 2) {
      // É decimal
      normalized = cleaned.replace(',', '.');
    } else {
      // É milhar, remove vírgula
      normalized = cleaned.replace(',', '');
    }
  } else if (hasDot) {
    // Só tem ponto: pode ser decimal ou milhar
    // Se ponto está nas últimas 3 posições, é decimal (ex: 1234.56)
    const dotIndex = cleaned.lastIndexOf('.');
    const afterDot = cleaned.substring(dotIndex + 1);
    if (afterDot.length <= 2) {
      // É decimal
      normalized = cleaned;
    } else {
      // É milhar, remove ponto
      normalized = cleaned.replace(/\./g, '');
    }
  } else {
    // Não tem vírgula nem ponto: valor inteiro
    normalized = cleaned;
  }
  
  const parsed = parseFloat(normalized);
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Formata input de moeda enquanto o usuário digita
 * @param value - Valor digitado
 * @returns Valor formatado
 */
export function formatCurrencyInput(value: string): string {
  // Remove tudo exceto números, vírgula e ponto
  const cleaned = value.replace(/[^\d,.]/g, '');
  
  if (!cleaned) return '';
  
  // Verifica se já tem vírgula ou ponto (formato decimal)
  const hasComma = cleaned.includes(',');
  const hasDot = cleaned.includes('.');
  
  if (hasComma || hasDot) {
    // Se já tem vírgula/ponto, trata como valor decimal
    let normalized: string;
    
    if (hasComma && hasDot) {
      // Tem ambos: vírgula é decimal, ponto é milhar (ex: 1.234,56)
      normalized = cleaned.replace(/\./g, '').replace(',', '.');
    } else if (hasComma) {
      // Só tem vírgula: verifica se é decimal ou milhar
      const commaIndex = cleaned.lastIndexOf(',');
      const afterComma = cleaned.substring(commaIndex + 1);
      if (afterComma.length <= 2) {
        // É decimal (ex: 1234,56)
        normalized = cleaned.replace(',', '.');
      } else {
        // É milhar, remove vírgula
        normalized = cleaned.replace(',', '');
      }
    } else {
      // Só tem ponto: verifica se é decimal ou milhar
      const dotIndex = cleaned.lastIndexOf('.');
      const afterDot = cleaned.substring(dotIndex + 1);
      if (afterDot.length <= 2) {
        // É decimal (ex: 1234.56)
        normalized = cleaned;
      } else {
        // É milhar, remove ponto
        normalized = cleaned.replace(/\./g, '');
      }
    }
    
    const amount = parseFloat(normalized);
    if (isNaN(amount)) return '';
    
    // Formata mantendo até 2 casas decimais
    return new Intl.NumberFormat('pt-BR', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  } else {
    // Se não tem vírgula/ponto, trata como valor inteiro em reais
    const numbers = cleaned.replace(/\D/g, '');
    if (!numbers) return '';
    
    const amount = parseInt(numbers, 10);
    if (isNaN(amount)) return '';
    
    // Formata como número inteiro com separadores de milhar
    return new Intl.NumberFormat('pt-BR', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }
}

/**
 * Formata porcentagem
 * @param value - Valor decimal (0.15 = 15%)
 * @returns String formatada (15%)
 */
export function formatPercentage(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(value / 100);
}

/**
 * Formata número sem moeda
 * @param value - Valor numérico
 * @returns String formatada (1.234,56)
 */
export function formatNumber(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}
