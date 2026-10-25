import { describe, expect, it } from 'vitest';
import { ApiError, getAnalizarErrorMessage } from './errors';

describe('Manejo de errores de API (§4.2 y §5.1)', () => {
  it('instancia ApiError desde la respuesta JSON', () => {
    const error = ApiError.fromResponseBody(422, {
      error: {
        codigo: 'VALIDACION',
        mensaje: 'Error de prueba',
        detalles: [{ campo: 'asunto', mensaje: 'Muy corto' }],
      },
    });

    expect(error.status).toBe(422);
    expect(error.codigo).toBe('VALIDACION');
    expect(error.detalles).toHaveLength(1);
    expect(error.detalles[0]?.campo).toBe('asunto');
  });

  it('traduce código 422 con mensaje exacto', () => {
    const err = new ApiError(422, 'VALIDACION', 'Error', [
      { campo: 'asunto', mensaje: 'Obligatorio' },
    ]);
    expect(getAnalizarErrorMessage(err)).toBe('Revise los datos: asunto: Obligatorio.');
  });

  it('traduce código 429 con mensaje exacto (§4.2)', () => {
    const err = new ApiError(429, 'DEMASIADAS_SOLICITUDES', 'Rate limit');
    expect(getAnalizarErrorMessage(err)).toBe('Demasiadas solicitudes. Espere 1 minuto.');
  });

  it('traduce códigos 502 y 504 con mensaje exacto (§4.2)', () => {
    const err502 = new ApiError(502, 'MOTOR_ERROR', 'Error motor');
    const err504 = new ApiError(504, 'MOTOR_TIMEOUT', 'Timeout motor');

    expect(getAnalizarErrorMessage(err502)).toBe(
      'El motor de análisis no respondió. Intente de nuevo.',
    );
    expect(getAnalizarErrorMessage(err504)).toBe(
      'El motor de análisis no respondió. Intente de nuevo.',
    );
  });

  it('traduce código 500 con mensaje exacto (§4.2)', () => {
    const err500 = new ApiError(500, 'ERROR_INTERNO', 'Error interno');
    expect(getAnalizarErrorMessage(err500)).toBe('Ocurrió un error inesperado. Intente de nuevo.');
  });

  it('maneja cancelación de petición por el usuario', () => {
    const abortErr = new DOMException('Aborted', 'AbortError');
    expect(getAnalizarErrorMessage(abortErr)).toBe('Análisis cancelado por el usuario.');
  });
});
