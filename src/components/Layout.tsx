import { useEffect } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { routes } from '@/lib/routes';

/**
 * Cabecera global (§4.0): marca enlazada a "/", enlaces en orden fijo
 * y etiqueta "Modo demo". El estilo definitivo llega en la etapa 3.
 */
export function Layout() {
  const { pathname } = useLocation();

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
          <span className="app-demo-tag">Modo demo</span>
        </div>
      </header>
      <main id="contenido" className="container app-main" tabIndex={-1}>
        <Outlet />
      </main>
    </div>
  );
}
