import { Link } from 'react-router-dom';
import { routes } from '@/lib/routes';

/** G01 · No encontrado (§4.5). Textos literales (AC-ERR-01). */
export function NotFoundPage() {
  return (
    <section className="not-found">
      <h1>Página no encontrada</h1>
      <p>La dirección no existe o el análisis fue eliminado.</p>
      <Link to={routes.dashboard} className="btn btn--primary">
        Ir al tablero
      </Link>
    </section>
  );
}
