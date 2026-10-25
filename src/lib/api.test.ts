import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createAnalysis, getAnalysis, getMetricsSummary, getSamples, listAnalyses } from './api';
import { setMockApiOverride } from './config';
import { ApiError } from './errors';

describe('API client con backend no disponible', () => {
  beforeEach(() => {
    // Forzar modo producción/no-mock para ejercitar safeFetch y handleResponse
    setMockApiOverride(false);
  });

  afterEach(() => {
    setMockApiOverride(null);
    vi.restoreAllMocks();
  });

  it('lanza ApiError(503) cuando el endpoint devuelve HTML en vez de JSON (ej. SPA fallback de Cloudflare)', async () => {
    // Simular que Cloudflare Pages devuelve index.html con status 200 para /api/samples
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response('<!DOCTYPE html><html><body>Spa Fallback</body></html>', {
        status: 200,
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      }),
    );

    await expect(getSamples()).rejects.toThrow(ApiError);
    await expect(getSamples()).rejects.toThrow(/El backend no responde/i);
  });

  it('lanza ApiError(503) cuando fetch sufre error de conexión/red', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValueOnce(new TypeError('Failed to fetch'));

    await expect(getMetricsSummary()).rejects.toThrow(ApiError);
  });

  it('lanza ApiError(503) cuando getAnalysis recibe respuesta 200 no JSON', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response('<html>Error</html>', {
        status: 200,
        headers: { 'Content-Type': 'text/html' },
      }),
    );

    await expect(getAnalysis('672012345678901234567890')).rejects.toThrow(ApiError);
  });

  it('lanza ApiError(503) cuando listAnalyses falla por red', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValueOnce(new TypeError('NetworkError'));

    await expect(listAnalyses()).rejects.toThrow(ApiError);
  });

  it('lanza ApiError(503) cuando createAnalysis falla por red', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValueOnce(new TypeError('NetworkError'));

    await expect(
      createAnalysis({ modo: 'muestra', muestra_id: 'phishing-credenciales' }),
    ).rejects.toThrow(ApiError);
  });
});
