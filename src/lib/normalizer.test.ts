import { describe, expect, it } from 'vitest';
import { ApiError } from './errors';
import { normalizarRespuestaMotor } from './normalizer';

describe('Normalizador del motor de análisis (§7.3, AC-TEST-01)', () => {
  it('AC-TEST-01: procesa forma actual con objeto dentro de output y lee score/ruta de nivel superior', () => {
    const raw = {
      score: 85,
      ruta: 'ia',
      output: {
        es_phishing: true,
        nivel_severidad: 'Alto',
        resumen: 'Alerta detectada',
        analisis_tecnico: 'Cabeceras sospechosas',
        justificacion_veredicto: 'Presencia de phishing bancario',
        indicadores_phishing: ['Urgencia'],
      },
    };

    const resultado = normalizarRespuestaMotor(raw);
    expect(resultado.score).toBe(85);
    expect(resultado.ruta).toBe('ia');
    expect(resultado.veredicto).toBe('malicioso');
    expect(resultado.nivel_severidad).toBe('Alto');
    expect(resultado.indicadores).toEqual([
      { codigo: 'urgencia', descripcion: 'Urgencia', peso: null },
    ]);
  });

  it('AC-TEST-01: convierte indicadores como cadena a slug y peso null', () => {
    const raw = {
      score: 45,
      ruta: 'heuristica',
      es_phishing: false,
      resumen: 'Sospechoso',
      analisis_tecnico: 'Texto',
      justificacion_veredicto: 'Corta',
      indicadores_phishing: ['Sentido de urgencia injustificado', 'Enlaces externos sospechosos!'],
    };

    const resultado = normalizarRespuestaMotor(raw);
    expect(resultado.veredicto).toBe('sospechoso');
    expect(resultado.indicadores[0]).toEqual({
      codigo: 'sentido_de_urgencia_injustificado',
      descripcion: 'Sentido de urgencia injustificado',
      peso: null,
    });
    expect(resultado.indicadores[1]?.codigo).toBe('enlaces_externos_sospechosos');
  });

  it('AC-TEST-01: convierte indicadores como objeto { caracteristica, peso }', () => {
    const raw = {
      score: 78,
      ruta: 'ia',
      es_phishing: true,
      resumen: 'Resumen',
      analisis_tecnico: 'Tecnico',
      justificacion_veredicto: 'Justificacion',
      indicadores_phishing: [
        { caracteristica: 'dominio_externo', peso: 1.25 },
        { caracteristica: 'remitente_suplantado', peso: -0.5 },
      ],
    };

    const resultado = normalizarRespuestaMotor(raw);
    expect(resultado.indicadores).toEqual([
      { codigo: 'dominio_externo', descripcion: 'Dominio externo', peso: 1.25 },
      { codigo: 'remitente_suplantado', descripcion: 'Remitente suplantado', peso: -0.5 },
    ]);
  });

  it('AC-TEST-01: infiere ruta si está ausente basada en longitud de justificacion_veredicto', () => {
    // Si justificacion_veredicto > 400 chars -> "ia"
    const longText = 'A'.repeat(401);
    const resultadoIa = normalizarRespuestaMotor({
      score: 20,
      es_phishing: false,
      justificacion_veredicto: longText,
    });
    expect(resultadoIa.ruta).toBe('ia');
    expect(resultadoIa.veredicto).toBe('sin_indicadores');

    // Si justificacion_veredicto <= 400 chars -> "heuristica"
    const shortText = 'A'.repeat(400);
    const resultadoHeuristica = normalizarRespuestaMotor({
      score: 20,
      es_phishing: false,
      justificacion_veredicto: shortText,
    });
    expect(resultadoHeuristica.ruta).toBe('heuristica');
  });

  it('AC-TEST-01: lanza ApiError 502 (MOTOR_ERROR) si score está fuera de rango o no es numérico', () => {
    expect(() =>
      normalizarRespuestaMotor({
        score: -5,
        es_phishing: false,
      }),
    ).toThrowError(ApiError);

    expect(() =>
      normalizarRespuestaMotor({
        score: 105,
        es_phishing: false,
      }),
    ).toThrowError(ApiError);

    expect(() =>
      normalizarRespuestaMotor({
        score: 'invalido',
        es_phishing: false,
      }),
    ).toThrowError(ApiError);

    expect(() =>
      normalizarRespuestaMotor({
        score: 50,
        es_phishing: 'no-booleano',
      }),
    ).toThrowError(ApiError);
  });

  it('trunca textos de más de 5000 caracteres según §7.3', () => {
    const superLong = 'Z'.repeat(6000);
    const res = normalizarRespuestaMotor({
      score: 10,
      es_phishing: false,
      resumen: superLong,
      analisis_tecnico: superLong,
    });

    expect(res.resumen).toHaveLength(5000);
    expect(res.analisis_tecnico).toHaveLength(5000);
  });
});
