/**
 * Configuración de ejecución del frontend.
 */

function normalizeBaseUrl(raw: string | undefined): string {
  const value = (raw ?? '').trim();
  return value.endsWith('/') ? value.slice(0, -1) : value;
}

let mockApiOverride: boolean | null = null;

export function setMockApiOverride(enabled: boolean | null): void {
  mockApiOverride = enabled;
}

export function isMockApiEnabled(): boolean {
  if (mockApiOverride !== null) {
    return mockApiOverride;
  }
  if (typeof window !== 'undefined') {
    const params = new URLSearchParams(window.location.search);
    const demoParam = params.get('demo');
    if (demoParam === 'true') return true;
    if (demoParam === 'false') return false;
  }
  return import.meta.env.VITE_API_MOCK === 'true' || import.meta.env.MODE === 'test';
}

export const config = {
  /** Base de la API. Vacío = mismo origen (`/api/*`), recomendado por §3.1. */
  apiBaseUrl: normalizeBaseUrl(import.meta.env.VITE_API_BASE_URL),
  /** Usa la API simulada del navegador (evaluado dinámicamente). */
  get useMockApi(): boolean {
    return isMockApiEnabled();
  },
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
