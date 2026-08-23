/**
 * Formateador de moneda tradicional colombiano (Separador de millones: ', Separador de miles: .)
 * Ejemplo: 150000000 -> "$150'000.000"
 */
export function formatCOP(amount?: number | null, includeSymbol: boolean = true): string {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return includeSymbol ? '$0' : '0';
  }
  const num = Math.round(Number(amount));
  const isNegative = num < 0;
  const absStr = String(Math.abs(num));

  if (absStr.length <= 3) {
    return (isNegative ? '-' : '') + (includeSymbol ? '$' : '') + absStr;
  }

  const rev = absStr.split('').reverse();
  const parts: string[] = [];
  for (let i = 0; i < rev.length; i += 3) {
    parts.push(rev.slice(i, i + 3).reverse().join(''));
  }

  let formatted = parts[parts.length - 1];
  for (let i = parts.length - 2; i >= 0; i--) {
    const sep = i % 2 === 1 ? "'" : '.';
    formatted += sep + parts[i];
  }

  return (isNegative ? '-' : '') + (includeSymbol ? '$' : '') + formatted;
}

/**
 * Parsea un string formateado o crudo a número entero/decimal en COP.
 */
export function parseCOP(val: string | number | undefined | null): number {
  if (val === undefined || val === null) return 0;
  if (typeof val === 'number') return isNaN(val) ? 0 : val;
  const cleaned = val.toString().replace(/[\$\s'\.]/g, '').replace(',', '.');
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}

/**
 * Calcula el Dígito de Verificación (DV) de un NIT según el algoritmo Módulo 11 oficial de la DIAN.
 */
export function calculateDianDv(nit: string | number): number {
  const nitStr = nit.toString().replace(/\D/g, '');
  if (!nitStr) return 0;

  const weights = [3, 7, 13, 17, 19, 23, 29, 37, 41, 43, 47, 53, 59, 67, 71];
  let sum = 0;
  const len = nitStr.length;

  for (let i = 0; i < len; i++) {
    const digit = parseInt(nitStr[len - 1 - i], 10);
    const weight = weights[i] || 0;
    sum += digit * weight;
  }

  const remainder = sum % 11;
  if (remainder === 0) return 0;
  if (remainder === 1) return 1;
  return 11 - remainder;
}

/**
 * Formatea un porcentaje con precisión decimal opcional.
 */
export function formatPercent(val: number | undefined | null, decimals: number = 2): string {
  if (val === undefined || val === null || isNaN(val)) return '0%';
  return `${val.toFixed(decimals)}%`;
}

/**
 * Formatea un valor en UVT con separador de miles y hasta 2 decimales.
 */
export function formatUVT(uvt: number | undefined | null): string {
  if (uvt === undefined || uvt === null || isNaN(uvt)) return '0 UVT';
  return `${uvt.toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 2 })} UVT`;
}
