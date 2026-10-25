import { describe, expect, it } from 'vitest';
import {
  formatDateTime,
  formatDayMonth,
  formatDurationSeconds,
  formatNumber,
  formatPercent,
  formatPesoIndicador,
  formatResultCount,
  getRutaLabel,
  getVeredictoLabel,
  truncateText,
} from './format';

describe('Funciones de formateo (lib/format.ts)', () => {
  it('formatea números según es-CO', () => {
    expect(formatNumber(100)).toBe('100');
    expect(formatNumber(1000)).toMatch(/1[.,\s]?000/);
  });

  it('formatea porcentajes con 1 decimal y % (§4.1 P02-K3)', () => {
    expect(formatPercent(60)).toMatch(/60[.,]0\s*%/);
    expect(formatPercent(15.24)).toMatch(/15[.,]2\s*%/);
  });

  it('convierte duración ms a segundos con 1 decimal y coma (§4.1 P02-K4, §4.3 P04-E6)', () => {
    expect(formatDurationSeconds(4200)).toMatch(/4[.,]2\s*s/);
    expect(formatDurationSeconds(800)).toMatch(/0[.,]8\s*s/);
    expect(formatDurationSeconds(0)).toMatch(/0[.,]0\s*s/);
  });

  it('formatea fechas a dd/MM/yyyy HH:mm en zona America/Bogota (§4.3 P04-E6)', () => {
    // 2026-10-21T17:00:00.000Z es 12:00 en Bogotá (UTC-5)
    const result = formatDateTime('2026-10-21T17:00:00.000Z');
    expect(result).toBe('21/10/2026 12:00');
  });

  it('formatea día y mes dd/MM sin desplazamiento por zona horaria (§4.1 P02-G1)', () => {
    expect(formatDayMonth('2026-09-22')).toBe('22/09');
    expect(formatDayMonth('2026-10-05T14:00:00.000Z')).toBe('05/10');
  });

  it('trunca asuntos largos a 60 caracteres con "…" (§4.1 P02-T1)', () => {
    const corto = 'Asunto breve';
    expect(truncateText(corto, 60)).toBe(corto);

    const exacto60 = 'A'.repeat(60);
    expect(truncateText(exacto60, 60)).toBe(exacto60);

    const largo65 = 'A'.repeat(65);
    expect(truncateText(largo65, 60)).toBe(`${'A'.repeat(60)}…`);
  });

  it('pluraliza el contador de resultados (§4.4 P05-E3)', () => {
    expect(formatResultCount(1)).toBe('1 resultado');
    expect(formatResultCount(0)).toBe('0 resultados');
    expect(formatResultCount(5)).toBe('5 resultados');
  });

  it('retorna las etiquetas de veredicto requeridas y nunca "Seguro" (§6.1)', () => {
    expect(getVeredictoLabel('malicioso')).toBe('Malicioso');
    expect(getVeredictoLabel('sospechoso')).toBe('Sospechoso');
    expect(getVeredictoLabel('sin_indicadores')).toBe('Sin indicadores');
    expect(getVeredictoLabel('malicioso')).not.toMatch(/seguro/i);
    expect(getVeredictoLabel('sin_indicadores')).not.toMatch(/seguro/i);
  });

  it('retorna las etiquetas de ruta de análisis (§4.3 P04-E5)', () => {
    expect(getRutaLabel('heuristica')).toBe('Resuelto por heurística');
    expect(getRutaLabel('ia')).toBe('Analizado con IA');
  });

  it('formatea pesos de indicador con signo y 2 decimales (§4.3 P04-E8)', () => {
    expect(formatPesoIndicador(1.25)).toMatch(/\+1[.,]25/);
    expect(formatPesoIndicador(-0.5)).toMatch(/-0[.,]50/);
    expect(formatPesoIndicador(null)).toBeNull();
  });
});
