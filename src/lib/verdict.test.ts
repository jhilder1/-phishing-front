import { describe, expect, it } from 'vitest';
import { calcularVeredicto, normalizarSeveridad } from './verdict';

describe('Veredicto y severidad (§6.1, AC-TEST-02)', () => {
  it('AC-TEST-02: calcula veredicto malicioso si es_phishing = true independientemente del score', () => {
    expect(calcularVeredicto(true, 0)).toBe('malicioso');
    expect(calcularVeredicto(true, 29)).toBe('malicioso');
    expect(calcularVeredicto(true, 30)).toBe('malicioso');
    expect(calcularVeredicto(true, 75)).toBe('malicioso');
    expect(calcularVeredicto(true, 100)).toBe('malicioso');
  });

  it('AC-TEST-02: evalúa el límite inferior 29 (sin_indicadores) vs 30 (sospechoso)', () => {
    // Límite 29
    expect(calcularVeredicto(false, 29)).toBe('sin_indicadores');
    expect(calcularVeredicto(false, 0)).toBe('sin_indicadores');

    // Límite exacto 30
    expect(calcularVeredicto(false, 30)).toBe('sospechoso');
    expect(calcularVeredicto(false, 31)).toBe('sospechoso');
  });

  it('AC-TEST-02: evalúa el límite visual 75 (sigue siendo sospechoso si es_phishing=false)', () => {
    expect(calcularVeredicto(false, 74)).toBe('sospechoso');
    expect(calcularVeredicto(false, 75)).toBe('sospechoso');
    expect(calcularVeredicto(false, 76)).toBe('sospechoso');
    expect(calcularVeredicto(false, 100)).toBe('sospechoso');
  });

  it('normaliza severidad permitida o asigna Medio por defecto', () => {
    expect(normalizarSeveridad('Bajo')).toBe('Bajo');
    expect(normalizarSeveridad('Medio')).toBe('Medio');
    expect(normalizarSeveridad('Alto')).toBe('Alto');
    expect(normalizarSeveridad('Crítico')).toBe('Crítico');
    expect(normalizarSeveridad('desconocido')).toBe('Medio');
    expect(normalizarSeveridad('')).toBe('Medio');
    expect(normalizarSeveridad(undefined)).toBe('Medio');
  });
});
