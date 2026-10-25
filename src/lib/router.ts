/**
 * Flags de React Router v6 que adelantan el comportamiento de v7.
 * Se comparten entre la app y las pruebas para que se comporten igual.
 */
export const routerFuture = {
  v7_startTransition: true,
  v7_relativeSplatPath: true,
} as const;
