/**
 * Configuración de ejecución del frontend.
 * Solo contiene valores públicos: el navegador NUNCA conoce la URL ni la clave de n8n (§3.2).
 */

function normalizeBaseUrl(raw: string | undefined): string {
  const value = (raw ?? '').trim();
  return value.endsWith('/') ? value.slice(0, -1) : value;
}

export const config = {
  /** Base de la API. Vacío = mismo origen (`/api/*`), recomendado por §3.1. */
  apiBaseUrl: normalizeBaseUrl(import.meta.env.VITE_API_BASE_URL),
  /** Usa la API simulada del navegador (supuesto S1). */
  useMockApi: import.meta.env.VITE_API_MOCK === 'true',
  /** Zona horaria de presentación de fechas (§4.3 P04-E6, §5.6). */
  timeZone: 'America/Bogota',
  /** Configuración regional de la interfaz. */
  locale: 'es-CO',
} as const;

/** Construye la URL de un endpoint de la API, p. ej. `apiUrl('/analyses')`. */
export function apiUrl(path: string): string {
  const clean = path.startsWith('/') ? path : `/${path}`;
  return `${config.apiBaseUrl}/api${clean}`;
}
