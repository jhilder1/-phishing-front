import { ApiError } from './errors';
import type { IndicadorAnalisis, ResultadoAnalisis, RutaAnalisis } from './types';
import { calcularVeredicto, normalizarSeveridad } from './verdict';

export interface RawEngineResponse {
  score?: unknown;
  ruta?: unknown;
  es_phishing?: unknown;
  nivel_severidad?: unknown;
  resumen?: unknown;
  analisis_tecnico?: unknown;
  justificacion_veredicto?: unknown;
  indicadores_phishing?: unknown;
  output?: Partial<RawEngineResponse>;
}

function toSlug(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

function toHumanTitle(code: string): string {
  const words = code.replace(/_+/g, ' ').trim();
  if (!words) return '';
  return words.charAt(0).toUpperCase() + words.slice(1);
}

function truncate5000(text: unknown): string {
  if (typeof text !== 'string') return '';
  return text.length > 5000 ? text.slice(0, 5000) : text;
}

/**
 * Normaliza la respuesta del motor de análisis conforme a las reglas de §7.3 (AC-TEST-01).
 */
export function normalizarRespuestaMotor(raw: RawEngineResponse): ResultadoAnalisis {
  if (!raw || typeof raw !== 'object') {
    throw new ApiError(502, 'MOTOR_ERROR', 'Respuesta no válida del motor.');
  }

  // 1. Forma actual del flujo: si trae output, se usa respuesta.output
  // y se leen score y ruta del nivel superior si existen.
  const topScore = raw.score;
  const topRuta = raw.ruta;

  const data = raw.output ? { ...raw.output } : { ...raw };

  const rawScore = topScore !== undefined ? topScore : data.score;
  const rawRuta = topRuta !== undefined ? topRuta : data.ruta;

  // 4. Validación: score numérico entre 0 y 100, es_phishing booleano
  if (typeof rawScore !== 'number' || Number.isNaN(rawScore) || rawScore < 0 || rawScore > 100) {
    throw new ApiError(502, 'MOTOR_ERROR', 'El puntaje devuelto por el motor no es válido.');
  }
  const score = Math.round(rawScore);

  if (typeof data.es_phishing !== 'boolean') {
    throw new ApiError(502, 'MOTOR_ERROR', 'El campo es_phishing debe ser booleano.');
  }
  const es_phishing = data.es_phishing;

  const resumen = truncate5000(data.resumen);
  const analisis_tecnico = truncate5000(data.analisis_tecnico);
  const justificacion_veredicto = truncate5000(data.justificacion_veredicto);

  // 3. ruta ausente: "ia" si justificacion_veredicto supera 400 caracteres, si no "heuristica"
  let ruta: RutaAnalisis;
  if (rawRuta === 'ia' || rawRuta === 'heuristica') {
    ruta = rawRuta;
  } else {
    ruta = justificacion_veredicto.length > 400 ? 'ia' : 'heuristica';
  }

  // 2. indicadores_phishing
  const rawIndicadores = data.indicadores_phishing;
  const indicadores: IndicadorAnalisis[] = [];

  if (Array.isArray(rawIndicadores)) {
    for (const item of rawIndicadores) {
      if (typeof item === 'string') {
        indicadores.push({
          codigo: toSlug(item),
          descripcion: item,
          peso: null,
        });
      } else if (item && typeof item === 'object') {
        const itemObj = item as Record<string, unknown>;
        const caracteristica = String(itemObj.caracteristica || itemObj.codigo || '');
        const peso = typeof itemObj.peso === 'number' ? itemObj.peso : null;
        indicadores.push({
          codigo: toSlug(caracteristica),
          descripcion: toHumanTitle(caracteristica),
          peso,
        });
      }
    }
  }

  const veredicto = calcularVeredicto(es_phishing, score);
  const nivel_severidad = normalizarSeveridad(
    typeof data.nivel_severidad === 'string' ? data.nivel_severidad : undefined,
  );

  return {
    score,
    ruta,
    es_phishing,
    veredicto,
    nivel_severidad,
    resumen,
    analisis_tecnico,
    justificacion_veredicto,
    indicadores,
  };
}
