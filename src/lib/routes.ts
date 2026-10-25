/** Mapa de rutas de la aplicación (§4.0). */
export const routes = {
  dashboard: '/',
  analyze: '/analizar',
  detail: (id: string) => `/analisis/${id}`,
  history: '/historial',
} as const;
