import type { NivelSeveridad, Veredicto } from './types';

/**
 * Calcula el veredicto del análisis según la regla de negocio §6.1:
 * 1. es_phishing = true -> malicioso ("Malicioso")
 * 2. es_phishing = false y score >= 30 -> sospechoso ("Sospechoso")
 * 3. es_phishing = false y score < 30 -> sin_indicadores ("Sin indicadores")
 *
 * CRÍTICO: La palabra "Seguro" está PROHIBIDA en la interfaz (§6.1).
 */
export function calcularVeredicto(esPhishing: boolean, score: number): Veredicto {
  if (esPhishing) {
    return 'malicioso';
  }
  if (score >= 30) {
    return 'sospechoso';
  }
  return 'sin_indicadores';
}

/**
 * Normaliza y valida el nivel de severidad (§6.1):
 * Permitidos: Bajo, Medio, Alto, Crítico.
 * Cualquier otro valor se guarda como Medio.
 */
export function normalizarSeveridad(severidad?: string): NivelSeveridad {
  const permitidos: NivelSeveridad[] = ['Bajo', 'Medio', 'Alto', 'Crítico'];
  if (severidad && permitidos.includes(severidad as NivelSeveridad)) {
    return severidad as NivelSeveridad;
  }
  return 'Medio';
}
