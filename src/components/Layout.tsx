import { useEffect } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { ShieldIcon } from '@/components/Icons';
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
          <NavLink to={routes.home} className="app-brand" end>
            <span className="app-brand__icon-wrap" aria-hidden="true">
              <ShieldIcon size={20} />
            </span>
            <span>Detector de Phishing</span>
          </NavLink>
          <nav className="app-nav" aria-label="Principal">
            <NavLink to={routes.home} end>
              Inicio
            </NavLink>
            <NavLink to={routes.dashboard}>Tablero</NavLink>
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
      <footer className="app-footer">
        <div className="container app-footer__inner">
          <div className="app-footer__brand">
            <span className="app-footer__icon" aria-hidden="true">
              <ShieldIcon size={16} />
            </span>
            <span>Detector de Phishing · SOC Inteligencia de Amenazas</span>
          </div>
          <div className="app-footer__privacy">
            <span>
              Privacidad Blindada · Análisis en memoria sin almacenamiento de credenciales
            </span>
          </div>
          <div className="app-footer__status">
            <span className="app-footer__status-dot" aria-hidden="true" />
            <span>Sistema en línea v2.0</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
