import { apiUrl, config } from './config';
import { ApiError } from './errors';
import {
  mockCreateAnalysis,
  mockGetAnalysis,
  mockGetMetricsSummary,
  mockGetSamples,
  mockListAnalyses,
} from './mock/service';
import type {
  Analisis,
  AnalisisListParams,
  AnalisisListResponse,
  AnalizarPayload,
  MetricasResumen,
  MuestraCaso,
} from './types';

async function handleResponse<T>(response: Response): Promise<T> {
  const isJson = response.headers.get('content-type')?.includes('application/json');
  const data = isJson ? await response.json() : null;

  if (!response.ok) {
    throw ApiError.fromResponseBody(response.status, data);
  }

  return data as T;
}

/**
 * Obtiene las métricas consolidadas del tablero (§5.6).
 * GET /api/metrics/summary
 */
export async function getMetricsSummary(signal?: AbortSignal): Promise<MetricasResumen> {
  if (config.useMockApi) {
    return mockGetMetricsSummary();
  }

  const response = await fetch(apiUrl('/metrics/summary'), {
    method: 'GET',
    headers: { Accept: 'application/json' },
    signal,
  });

  return handleResponse<MetricasResumen>(response);
}

/**
 * Lista los análisis con paginación y filtros opcionales (§5.5).
 * GET /api/analyses?veredicto=...&pagina=...&limite=...
 */
export async function listAnalyses(
  params: AnalisisListParams = {},
  signal?: AbortSignal,
): Promise<AnalisisListResponse> {
  if (config.useMockApi) {
    return mockListAnalyses(params);
  }

  const searchParams = new URLSearchParams();
  if (params.veredicto && params.veredicto.length > 0) {
    searchParams.set('veredicto', params.veredicto.join(','));
  }
  if (params.pagina && params.pagina > 1) {
    searchParams.set('pagina', String(params.pagina));
  }
  if (params.limite) {
    searchParams.set('limite', String(params.limite));
  }

  const query = searchParams.toString();
  const url = apiUrl(query ? `/analyses?${query}` : '/analyses');

  const response = await fetch(url, {
    method: 'GET',
    headers: { Accept: 'application/json' },
    signal,
  });

  return handleResponse<AnalisisListResponse>(response);
}

/**
 * Obtiene el detalle completo de un análisis por su id (§5.4).
 * GET /api/analyses/:id
 */
export async function getAnalysis(id: string, signal?: AbortSignal): Promise<Analisis> {
  if (config.useMockApi) {
    return mockGetAnalysis(id);
  }

  const response = await fetch(apiUrl(`/analyses/${encodeURIComponent(id)}`), {
    method: 'GET',
    headers: { Accept: 'application/json' },
    signal,
  });

  return handleResponse<Analisis>(response);
}

/**
 * Obtiene los 4 casos de muestra (§5.2).
 * GET /api/samples
 */
export async function getSamples(signal?: AbortSignal): Promise<MuestraCaso[]> {
  if (config.useMockApi) {
    return mockGetSamples();
  }

  const response = await fetch(apiUrl('/samples'), {
    method: 'GET',
    headers: { Accept: 'application/json' },
    signal,
  });

  return handleResponse<MuestraCaso[]>(response);
}

/**
 * Envía un correo a analizar (§5.3).
 * POST /api/analyses
 */
export async function createAnalysis(
  payload: AnalizarPayload,
  signal?: AbortSignal,
): Promise<Analisis> {
  if (config.useMockApi) {
    return mockCreateAnalysis(payload, signal);
  }

  const response = await fetch(apiUrl('/analyses'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(payload),
    signal,
  });

  return handleResponse<Analisis>(response);
}

/**
 * Consulta de estado y salud del backend (§5.2).
 * GET /api/health
 */
export async function getHealth(signal?: AbortSignal): Promise<{ estado: string; mongo?: string }> {
  const response = await fetch(apiUrl('/health'), {
    method: 'GET',
    headers: { Accept: 'application/json' },
    signal,
  });

  return handleResponse<{ estado: string; mongo?: string }>(response);
}
