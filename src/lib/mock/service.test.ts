import { describe, expect, it } from 'vitest';
import {
  maskPersonalInfo,
  mockCreateAnalysis,
  mockGetAnalysis,
  mockGetMetricsSummary,
  mockGetSamples,
  mockListAnalyses,
  resetMockAnalyses,
} from './service';

describe('Servicio simulado de API (lib/mock/service.ts)', () => {
  it('AC-SEED-02 y AC-TEST-03: genera exactamente 100 documentos con distribuciones 55/15/30 y 60/40', async () => {
    resetMockAnalyses();
    const metrics = await mockGetMetricsSummary();

    expect(metrics.total).toBe(100);
    expect(metrics.por_veredicto.sin_indicadores).toBe(55);
    expect(metrics.por_veredicto.sospechoso).toBe(15);
    expect(metrics.por_veredicto.malicioso).toBe(30);

    // AC-TEST-03: pct_sin_llm debe ser 60.0 %
    expect(metrics.pct_sin_llm).toBe(60.0);

    // AC-DASH-03: por_dia debe tener exactamente 30 días
    expect(metrics.por_dia).toHaveLength(30);
  });

  it('enmascara correos y números largos de 13 a 19 dígitos (§6.3)', () => {
    const texto = 'Escriba a juan.perez@empresa.com o llame con la tarjeta 4532 8912 3456 7890.';
    const enmascarado = maskPersonalInfo(texto);

    expect(enmascarado).toContain('j***@empresa.com');
    expect(enmascarado).not.toContain('juan.perez');
    expect(enmascarado).toContain('[NÚMERO_OCULTO]');
    expect(enmascarado).not.toContain('4532 8912 3456 7890');
  });

  it('lista análisis con paginación de 20 elementos y filtrado (§5.5)', async () => {
    const page1 = await mockListAnalyses({ pagina: 1, limite: 20 });
    expect(page1.items).toHaveLength(20);
    expect(page1.total).toBe(100);
    expect(page1.paginas).toBe(5);

    // Filtrar solo maliciosos (hay 30)
    const soloMaliciosos = await mockListAnalyses({
      veredicto: ['malicioso'],
      pagina: 1,
      limite: 20,
    });
    expect(soloMaliciosos.total).toBe(30);
    expect(soloMaliciosos.items).toHaveLength(20);
    expect(soloMaliciosos.paginas).toBe(2);
    expect(soloMaliciosos.items.every((i) => i.resultado.veredicto === 'malicioso')).toBe(true);
  });

  it('obtiene un análisis existente o lanza 404', async () => {
    const list = await mockListAnalyses({ limite: 1 });
    const first = list.items[0];
    expect(first).toBeDefined();

    if (first) {
      const item = await mockGetAnalysis(first.id);
      expect(item.id).toBe(first.id);
    }

    await expect(mockGetAnalysis('6720ffffffffffffffffffff')).rejects.toMatchObject({
      status: 404,
      codigo: 'NO_ENCONTRADO',
    });
  });

  it('retorna los 4 casos de muestra oficiales (§9.1)', async () => {
    const samples = await mockGetSamples();
    expect(samples).toHaveLength(4);
    const ids = samples.map((s) => s.id);
    expect(ids).toEqual([
      'phishing-credenciales',
      'bec-transferencia',
      'factura-adjunta',
      'boletin-interno',
    ]);
  });

  it('crea un análisis y permite cancelación con AbortController', async () => {
    const controller = new AbortController();
    controller.abort();

    await expect(
      mockCreateAnalysis(
        {
          modo: 'pegar',
          remitente: 'alerta@banco-seguro.co',
          asunto: 'Verifique su cuenta',
          cuerpo: 'Contenido urgente',
        },
        controller.signal,
      ),
    ).rejects.toMatchObject({ name: 'AbortError' });
  });
});
