import { config } from './config';
import type { RutaAnalisis, Veredicto } from './types';

/**
 * Formatea un número según la configuración regional es-CO (§4.1 P02-K1).
 */
export function formatNumber(value: number): string {
  return new Intl.NumberFormat(config.locale).format(value);
}

/**
 * Formatea un porcentaje con 1 decimal y el símbolo % (§4.1 P02-K2, P02-K3).
 * Ejemplo: 60 -> "60,0 %"
 */
export function formatPercent(value: number): string {
  const formatted = new Intl.NumberFormat(config.locale, {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(value);
  return `${formatted} %`;
}

/**
 * Convierte una duración en milisegundos a segundos con 1 decimal y coma (§4.1 P02-K4, §4.3 P04-E6).
 * Ejemplo: 4200 -> "4,2 s"
 */
export function formatDurationSeconds(ms: number): string {
  const seconds = ms / 1000;
  const formatted = new Intl.NumberFormat(config.locale, {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(seconds);
  return `${formatted} s`;
}

/**
 * Formatea una fecha ISO a `dd/MM/yyyy HH:mm` en la zona horaria America/Bogota (§4.3 P04-E6).
 */
export function formatDateTime(isoString: string): string {
  try {
    const date = new Date(isoString);
    if (Number.isNaN(date.getTime())) return isoString;

    const formatter = new Intl.DateTimeFormat(config.locale, {
      timeZone: config.timeZone,
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });

    const parts = formatter.formatToParts(date);
    const getPart = (type: string) => parts.find((p) => p.type === type)?.value ?? '';

    return `${getPart('day')}/${getPart('month')}/${getPart('year')} ${getPart('hour')}:${getPart('minute')}`;
  } catch {
    return isoString;
  }
}

/**
 * Formatea una fecha YYYY-MM-DD o ISO a `dd/MM` directamente sin desplazamiento por zona horaria (§4.1 P02-G1).
 * Ejemplo: "2026-09-22" -> "22/09"
 */
export function formatDayMonth(dateStr: string): string {
  if (!dateStr) return '';
  const match = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (match && match[2] && match[3]) {
    return `${match[3]}/${match[2]}`;
  }
  return dateStr;
}

/**
 * Trunca un texto a un máximo de caracteres añadiendo "…" si se excede (§4.1 P02-T1).
 * Máximo 60 caracteres.
 */
export function truncateText(text: string, maxLength = 60): string {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}…`;
}

/**
 * Formatea el contador de resultados (§4.4 P05-E3).
 * Ejemplo: 1 -> "1 resultado", 5 -> "5 resultados"
 */
export function formatResultCount(total: number): string {
  if (total === 1) {
    return '1 resultado';
  }
  return `${formatNumber(total)} resultados`;
}

/**
 * Retorna el texto exacto correspondiente al veredicto (§6.1, §4.3 P04-E2).
 * NUNCA debe retornar "Seguro".
 */
export function getVeredictoLabel(veredicto: Veredicto): string {
  switch (veredicto) {
    case 'malicioso':
      return 'Malicioso';
    case 'sospechoso':
      return 'Sospechoso';
    case 'sin_indicadores':
      return 'Sin indicadores';
    default:
      return 'Sin indicadores';
  }
}

/**
 * Retorna el texto para la ruta de análisis (§4.3 P04-E5).
 */
export function getRutaLabel(ruta: RutaAnalisis): string {
  return ruta === 'heuristica' ? 'Resuelto por heurística' : 'Analizado con IA';
}

/**
 * Formatea el peso de un indicador con signo y 2 decimales (§4.3 P04-E8).
 * Ejemplo: 1.25 -> "+1,25", -0.5 -> "-0,50"
 */
export function formatPesoIndicador(peso: number | null): string | null {
  if (peso === null || peso === undefined) return null;
  const abs = Math.abs(peso);
  const formatted = new Intl.NumberFormat(config.locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(abs);
  const sign = peso >= 0 ? '+' : '-';
  return `${sign}${formatted}`;
}
