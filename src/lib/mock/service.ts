import { ApiError } from '../errors';
import type {
  Analisis,
  AnalisisListItem,
  AnalisisListParams,
  AnalisisListResponse,
  AnalizarPayload,
  MetricasPorDia,
  MetricasResumen,
  MuestraCaso,
  TopIndicador,
  Veredicto,
} from '../types';
import { MOCK_SAMPLES } from './samples';
import { generateSeedAnalyses } from './seed';

// Estado simulado en memoria
let mockAnalyses: Analisis[] = generateSeedAnalyses();

export function resetMockAnalyses(): void {
  mockAnalyses = generateSeedAnalyses();
}

/**
 * Enmascara datos personales según las reglas de §6.3.
 */
export function maskPersonalInfo(text: string): string {
  if (!text) return '';
  // Correo: primera letra + ***@dominio.com
  let masked = text.replace(
    /\b([a-zA-Z0-9])([^@\s]+)@([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})\b/g,
    '$1***@$3',
  );
  // Secuencia de 13 a 19 dígitos (con o sin espacios o guiones)
  masked = masked.replace(/\b(?:\d[ -]*?){13,19}\b/g, '[NÚMERO_OCULTO]');
  return masked;
}

export function mockGetSamples(): Promise<MuestraCaso[]> {
  return Promise.resolve([...MOCK_SAMPLES]);
}

export function mockGetMetricsSummary(): Promise<MetricasResumen> {
  const total = mockAnalyses.length;

  const por_veredicto = {
    malicioso: mockAnalyses.filter((a) => a.resultado.veredicto === 'malicioso').length,
    sospechoso: mockAnalyses.filter((a) => a.resultado.veredicto === 'sospechoso').length,
    sin_indicadores: mockAnalyses.filter((a) => a.resultado.veredicto === 'sin_indicadores').length,
  };

  const heuristicCount = mockAnalyses.filter((a) => a.resultado.ruta === 'heuristica').length;
  const pct_sin_llm = total > 0 ? Number(((heuristicCount / total) * 100).toFixed(1)) : 0;

  const totalDuration = mockAnalyses.reduce((acc, a) => acc + a.duracion_ms, 0);
  const duracion_media_ms = total > 0 ? Math.round(totalDuration / total) : 0;

  // Generar exactamente 30 días (§4.1 P02-G1, §5.6)
  const now = new Date();
  const por_dia: MetricasPorDia[] = [];

  for (let d = 29; d >= 0; d--) {
    const dayDate = new Date(now.getTime() - d * 24 * 60 * 60 * 1000);
    const dayStr = dayDate.toISOString().slice(0, 10);

    const itemsOnDay = mockAnalyses.filter((a) => a.creado_en.slice(0, 10) === dayStr);

    por_dia.push({
      fecha: dayStr,
      malicioso: itemsOnDay.filter((a) => a.resultado.veredicto === 'malicioso').length,
      sospechoso: itemsOnDay.filter((a) => a.resultado.veredicto === 'sospechoso').length,
      sin_indicadores: itemsOnDay.filter((a) => a.resultado.veredicto === 'sin_indicadores').length,
    });
  }

  // Top indicadores (§6.2: conteo en maliciosos o sospechosos, desc por conteo, asc por código, máx 5)
  const countMap = new Map<string, { descripcion: string; conteo: number }>();

  for (const a of mockAnalyses) {
    if (a.resultado.veredicto === 'malicioso' || a.resultado.veredicto === 'sospechoso') {
      for (const ind of a.resultado.indicadores) {
        const prev = countMap.get(ind.codigo) ?? { descripcion: ind.descripcion, conteo: 0 };
        prev.conteo += 1;
        countMap.set(ind.codigo, prev);
      }
    }
  }

  const top_indicadores: TopIndicador[] = Array.from(countMap.entries())
    .map(([codigo, data]) => ({
      codigo,
      descripcion: data.descripcion,
      conteo: data.conteo,
    }))
    .sort((a, b) => {
      if (b.conteo !== a.conteo) return b.conteo - a.conteo;
      return a.codigo.localeCompare(b.codigo);
    })
    .slice(0, 5);

  const desde = por_dia[0]?.fecha ?? '';
  const hasta = por_dia[por_dia.length - 1]?.fecha ?? '';

  return Promise.resolve({
    desde,
    hasta,
    total,
    por_veredicto,
    pct_sin_llm,
    duracion_media_ms,
    por_dia,
    top_indicadores,
  });
}

export function mockListAnalyses(params: AnalisisListParams = {}): Promise<AnalisisListResponse> {
  const { veredicto, pagina = 1, limite = 20 } = params;

  let filtered = [...mockAnalyses];

  if (veredicto && veredicto.length > 0) {
    const allowed = new Set<Veredicto>(veredicto);
    filtered = filtered.filter((a) => allowed.has(a.resultado.veredicto));
  }

  const total = filtered.length;
  const paginas = Math.ceil(total / limite) || 1;
  const validPagina = Math.max(1, Math.min(pagina, paginas));

  const start = (validPagina - 1) * limite;
  const pagedItems = filtered.slice(start, start + limite);

  const items: AnalisisListItem[] = pagedItems.map((a) => ({
    id: a.id,
    creado_en: a.creado_en,
    correo: {
      asunto: a.correo.asunto,
      remitente: a.correo.remitente,
    },
    resultado: {
      veredicto: a.resultado.veredicto,
      score: a.resultado.score,
    },
  }));

  return Promise.resolve({
    items,
    total,
    pagina: validPagina,
    limite,
    paginas,
  });
}

export function mockGetAnalysis(id: string): Promise<Analisis> {
  const found = mockAnalyses.find((a) => a.id === id);
  if (!found) {
    return Promise.reject(new ApiError(404, 'NO_ENCONTRADO', 'El análisis no fue encontrado.'));
  }
  return Promise.resolve({ ...found });
}

export async function mockCreateAnalysis(
  payload: AnalizarPayload,
  signal?: AbortSignal,
): Promise<Analisis> {
  if (signal?.aborted) {
    throw new DOMException('Solicitud cancelada', 'AbortError');
  }

  // Simular latencia de análisis (1.2 segundos) para ver el progreso del usuario
  await new Promise<void>((resolve, reject) => {
    const timer = setTimeout(() => resolve(), 1200);
    signal?.addEventListener('abort', () => {
      clearTimeout(timer);
      reject(new DOMException('Solicitud cancelada', 'AbortError'));
    });
  });

  let remitente: string;
  let asunto: string;
  let cuerpo: string;
  let veredicto: Veredicto;
  let score: number;

  if (payload.modo === 'muestra') {
    const sample = MOCK_SAMPLES.find((s) => s.id === payload.muestra_id);
    if (!sample) {
      throw new ApiError(422, 'VALIDACION', 'Muestra no encontrada.', [
        { campo: 'muestra_id', mensaje: 'Identificador de muestra no válido' },
      ]);
    }
    remitente = sample.remitente;
    asunto = sample.asunto;
    cuerpo = sample.cuerpo;

    if (sample.id === 'phishing-credenciales' || sample.id === 'bec-transferencia') {
      veredicto = 'malicioso';
      score = sample.id === 'phishing-credenciales' ? 88 : 94;
    } else if (sample.id === 'factura-adjunta') {
      veredicto = 'sospechoso';
      score = 64;
    } else {
      veredicto = 'sin_indicadores';
      score = 12;
    }
  } else {
    remitente = payload.remitente;
    asunto = payload.asunto;
    cuerpo = payload.cuerpo;

    // Regla heurística simple para demo interactiva
    const lower = `${asunto} ${cuerpo}`.toLowerCase();
    if (
      lower.includes('urgente') ||
      lower.includes('bloqueo') ||
      lower.includes('clave') ||
      lower.includes('credenciales') ||
      lower.includes('cuenta')
    ) {
      veredicto = 'malicioso';
      score = 85;
    } else if (lower.includes('factura') || lower.includes('adjunto') || lower.includes('pago')) {
      veredicto = 'sospechoso';
      score = 55;
    } else {
      veredicto = 'sin_indicadores';
      score = 8;
    }
  }

  const hexRandom = Math.random().toString(16).slice(2, 6).padStart(4, '0');
  const now = new Date();
  const id = `6720${Date.now().toString(16).slice(-8)}${hexRandom}`.padEnd(24, '0').slice(0, 24);

  const nuevoAnalisis: Analisis = {
    id,
    origen: 'usuario',
    modo: payload.modo,
    muestra_id: payload.modo === 'muestra' ? payload.muestra_id : undefined,
    creado_en: now.toISOString(),
    duracion_ms: 1200,
    correo: {
      remitente,
      asunto: maskPersonalInfo(asunto),
      cuerpo_enmascarado: maskPersonalInfo(cuerpo),
    },
    resultado: {
      score,
      ruta: veredicto === 'malicioso' ? 'ia' : 'heuristica',
      es_phishing: veredicto === 'malicioso',
      veredicto,
      nivel_severidad:
        veredicto === 'sin_indicadores'
          ? 'Bajo'
          : veredicto === 'sospechoso'
            ? 'Medio'
            : score >= 90
              ? 'Crítico'
              : 'Alto',
      resumen:
        veredicto === 'malicioso'
          ? 'El análisis detectó indicadores claros de suplantación y urgencia.'
          : veredicto === 'sospechoso'
            ? 'Se detectaron palabras y patrones que requieren comprobación.'
            : 'No se encontraron indicadores de riesgo en el correo analizado.',
      analisis_tecnico:
        'Revisión sintáctica de cabeceras, enlaces y coincidencia de dominio remitente.',
      justificacion_veredicto:
        veredicto === 'malicioso'
          ? 'Presencia de tácticas de ingeniería social para inducción a engaño.'
          : veredicto === 'sospechoso'
            ? 'Score medio por factores contextuales.'
            : 'Sin discrepancias encontradas.',
      indicadores:
        veredicto === 'sin_indicadores'
          ? []
          : [
              { codigo: 'urgencia', descripcion: 'Sentido de urgencia injustificado', peso: 1.5 },
              {
                codigo: 'dominio_externo',
                descripcion: 'Dominio remitente externo o no coincidente',
                peso: 1.2,
              },
            ],
    },
  };

  mockAnalyses.unshift(nuevoAnalisis);
  return nuevoAnalisis;
}
