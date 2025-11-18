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
 * @param value - String formatada (R$ 1.234,56 ou 1.234,56 ou 1234,56)
 * @returns Número decimal
 */
export function parseCurrency(value: string): number {
  // Remove tudo exceto números, vírgula e pontos
  const cleaned = value.replace(/[^\d,.-]/g, '');
  
  // Trata formato brasileiro (vírgula como decimal)
  const normalized = cleaned
    .replace(/\./g, '') // Remove pontos de milhar
    .replace(',', '.'); // Converte vírgula decimal para ponto
  
  const parsed = parseFloat(normalized);
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Formata input de moeda enquanto o usuário digita
 * @param value - Valor digitado
 * @returns Valor formatado
 */
export function formatCurrencyInput(value: string): string {
  // Remove tudo exceto números
  const numbers = value.replace(/\D/g, '');
  
  if (!numbers) return '';
  
  // Converte para centavos
  const cents = parseInt(numbers, 10);
  const amount = cents / 100;
  
  // Formata
  return new Intl.NumberFormat('pt-BR', {
    style: 'decimal',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
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
