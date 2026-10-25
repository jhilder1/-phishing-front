import { useEffect } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useDemoMode } from '@/context/DemoModeContext';
import { routes } from '@/lib/routes';

/**
 * Cabecera global (§4.0): marca enlazada a "/", enlaces en orden fijo
 * e interruptor interactivo de "Modo demo" / "Producción".
 */
export function Layout() {
  const { pathname } = useLocation();
  const { isDemoMode, toggleDemoMode } = useDemoMode();

  // Al cambiar de pantalla, volver al inicio de la página.
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="app-shell">
      <a className="skip-link" href="#contenido">
        Saltar al contenido
      </a>
      <header className="app-header">
        <div className="container app-header__inner">
          <NavLink to={routes.dashboard} className="app-brand" end>
            Detector de Phishing
          </NavLink>
          <nav className="app-nav" aria-label="Principal">
            <NavLink to={routes.dashboard} end>
              Tablero
            </NavLink>
            <NavLink to={routes.analyze}>Analizar correo</NavLink>
            <NavLink to={routes.history}>Historial</NavLink>
          </nav>

          <button
            type="button"
            className={`app-mode-switch ${isDemoMode ? 'app-mode-switch--demo' : 'app-mode-switch--prod'}`}
            onClick={toggleDemoMode}
            title={
              isDemoMode
                ? 'Modo Demo activo (datos simulados en memoria). Clic para cambiar a Producción (API real).'
                : 'Modo Producción activo (API real). Clic para cambiar a Modo Demo (simulador).'
            }
            aria-label={
              isDemoMode
                ? 'Modo actual: Demo con servidor simulado. Clic para cambiar a Producción.'
                : 'Modo actual: Producción con API real. Clic para cambiar a Modo Demo.'
            }
          >
            <span className="app-mode-switch__dot" aria-hidden="true" />
            <span className="app-demo-tag">{isDemoMode ? 'Modo demo' : 'Producción'}</span>
          </button>
        </div>
      </header>
      <main id="contenido" className="container app-main" tabIndex={-1} key={String(isDemoMode)}>
        <Outlet />
      </main>
    </div>
  );
}
