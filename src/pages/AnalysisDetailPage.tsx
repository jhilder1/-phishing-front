import { useParams } from 'react-router-dom';
import { NotFoundPage } from './NotFoundPage';

/** Un id válido es un ObjectId: 24 caracteres hexadecimales (§4.3, §5). */
const OBJECT_ID = /^[a-f0-9]{24}$/i;

/** P04 · Detalle de análisis (§4.3). Contenido completo en la etapa 6. */
export function AnalysisDetailPage() {
  const { id = '' } = useParams();

  // AC-DET-05: id inválido → G01, sin llamar a la API.
  if (!OBJECT_ID.test(id)) {
    return <NotFoundPage />;
  }

  return (
    <section>
      <p className="page-subtitle">Historial / Análisis {id.slice(0, 8)}</p>
      {/* El h1 definitivo es el veredicto (P04-E2); provisional hasta la etapa 6. */}
      <h1>Detalle de análisis</h1>
    </section>
  );
}
