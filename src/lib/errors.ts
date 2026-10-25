import type { ApiErrorBody, ApiErrorDetail } from './types';

/**
 * Representa un error retornado por la API REST conforme a §5.1.
 */
export class ApiError extends Error {
  readonly status: number;
  readonly codigo: string;
  readonly detalles: ApiErrorDetail[];

  constructor(status: number, codigo: string, mensaje: string, detalles: ApiErrorDetail[] = []) {
    super(mensaje);
    this.name = 'ApiError';
    this.status = status;
    this.codigo = codigo;
    this.detalles = detalles;
  }

  static fromResponseBody(status: number, body: unknown): ApiError {
    const errorBody = body as ApiErrorBody | undefined;
    const codigo = errorBody?.error?.codigo ?? 'ERROR_DESCONOCIDO';
    const mensaje = errorBody?.error?.mensaje ?? `Error de solicitud (HTTP ${status})`;
    const detalles = errorBody?.error?.detalles ?? [];
    return new ApiError(status, codigo, mensaje, detalles);
  }
}

/**
 * Traduce un error de análisis en los mensajes requeridos por la especificación (§4.2).
 */
export function getAnalizarErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 422) {
      if (error.detalles.length > 0) {
        const detalleTexto = error.detalles.map((d) => `${d.campo}: ${d.mensaje}`).join(', ');
        return `Revise los datos: ${detalleTexto}.`;
      }
      return `Revise los datos: ${error.message}.`;
    }
    if (error.status === 429) {
      return 'Demasiadas solicitudes. Espere 1 minuto.';
    }
    if (error.status === 502 || error.status === 504) {
      return 'El motor de análisis no respondió. Intente de nuevo.';
    }
    if (error.status === 500) {
      return 'Ocurrió un error inesperado. Intente de nuevo.';
    }
  }

  if (error instanceof DOMException && error.name === 'AbortError') {
    return 'Análisis cancelado por el usuario.';
  }

  return 'Ocurrió un error inesperado. Intente de nuevo.';
}
