import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { CheckIcon, ShieldIcon, WarningIcon } from '@/lib/../components/Icons';
import { ScoreMeter } from '@/lib/../components/ScoreMeter';
import { ErrorState, LoadingState } from '@/lib/../components/StateView';
import { getAnalysis } from '@/lib/api';
import { ApiError } from '@/lib/errors';
import {
  formatDateTime,
  formatDurationSeconds,
  formatPesoIndicador,
  getRutaLabel,
  getVeredictoLabel,
} from '@/lib/format';
import { routes } from '@/lib/routes';
import type { Analisis } from '@/lib/types';
import { NotFoundPage } from './NotFoundPage';

const OBJECT_ID_REGEX = /^[a-f0-9]{24}$/i;
const PREVIEW_CHAR_LIMIT = 2000;

/**
 * P04 · Detalle de análisis (§4.3).
 */
export function AnalysisDetailPage() {
  const { id = '' } = useParams<{ id: string }>();

  const isIdFormatValid = OBJECT_ID_REGEX.test(id);

  const [analysis, setAnalysis] = useState<Analisis | null>(null);
  const [loading, setLoading] = useState(true);
  const [isNotFound, setIsNotFound] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showFullEmail, setShowFullEmail] = useState(false);

  const fetchAnalysis = async (analysisId: string) => {
    setLoading(true);
    setError(null);
    setIsNotFound(false);

    try {
      const data = await getAnalysis(analysisId);
      setAnalysis(data);
    } catch (err: unknown) {
      if (err instanceof ApiError && err.status === 404) {
        setIsNotFound(true);
      } else {
        setError('No se pudo cargar el análisis.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isIdFormatValid) {
      fetchAnalysis(id);
    } else {
      setLoading(false);
      setIsNotFound(true);
    }
  }, [id, isIdFormatValid]);

  // AC-DET-05: id inválido o recurso inexistente en la API muestra G01
  if (!isIdFormatValid || isNotFound) {
    return <NotFoundPage />;
  }

  if (loading) {
    return (
      <section className="analysis-detail-page" aria-busy="true">
        <LoadingState message="Cargando análisis…" />
      </section>
    );
  }

  if (error || !analysis) {
    return (
      <section className="analysis-detail-page">
        <ErrorState
          message={error ?? 'No se pudo cargar el análisis.'}
          onRetry={() => fetchAnalysis(id)}
        />
      </section>
    );
  }

  const veredicto = analysis.resultado.veredicto;
  const veredictoLabel = getVeredictoLabel(veredicto);

  let VerdictIcon = CheckIcon;
  let verdictClass = 'verdict-heading--clean';
  if (veredicto === 'malicioso') {
    VerdictIcon = ShieldIcon;
    verdictClass = 'verdict-heading--malicious';
  } else if (veredicto === 'sospechoso') {
    VerdictIcon = WarningIcon;
    verdictClass = 'verdict-heading--suspicious';
  }

  const emailBody = analysis.correo.cuerpo_enmascarado || '';
  const isEmailLong = emailBody.length > PREVIEW_CHAR_LIMIT;
  const displayedEmail =
    !showFullEmail && isEmailLong ? `${emailBody.slice(0, PREVIEW_CHAR_LIMIT)}…` : emailBody;

  return (
    <article className="analysis-detail-page" data-testid="analysis-detail">
      {/* P04-E1: Migas */}
      <nav className="breadcrumbs" aria-label="Miga de pan">
        <Link to={routes.history}>Historial</Link>
        <span aria-hidden="true" className="breadcrumbs__separator">
          {' '}
          /{' '}
        </span>
        <span className="breadcrumbs__current">Análisis {id.slice(0, 8)}</span>
      </nav>

      <header className="analysis-detail-header">
        {/* P04-E2: Veredicto (h1 con color e icono) */}
        <h1 className={`verdict-heading ${verdictClass}`} data-testid="verdict-heading">
          <VerdictIcon size={32} className="verdict-heading__icon" />
          <span>{veredictoLabel}</span>
        </h1>

        {/* Metadatos de severidad y ruta */}
        <div className="analysis-meta-tags">
          {/* P04-E4: Severidad */}
          <span
            className={`meta-pill meta-pill--sev-${analysis.resultado.nivel_severidad.toLowerCase()}`}
            data-testid="p04-e4"
          >
            Severidad: {analysis.resultado.nivel_severidad}
          </span>
          {/* P04-E5: Ruta */}
          <span className="meta-pill meta-pill--route" data-testid="p04-e5">
            {getRutaLabel(analysis.resultado.ruta)}
          </span>
        </div>
      </header>

      {/* P04-E3: Medidor de score con marcas en 30 y 75 */}
      <section className="analysis-section" aria-label="Puntaje de riesgo">
        <ScoreMeter score={analysis.resultado.score} />
      </section>

      {/* P04-E6: Datos del correo */}
      <section className="analysis-section" aria-label="Datos del correo">
        <div className="analysis-data-card" data-testid="p04-e6">
          <div className="analysis-data-item">
            <span className="analysis-data-label">Remitente</span>
            <span className="analysis-data-value analysis-data-value--mono">
              {analysis.correo.remitente}
            </span>
          </div>
          <div className="analysis-data-item">
            <span className="analysis-data-label">Asunto</span>
            <span className="analysis-data-value">{analysis.correo.asunto}</span>
          </div>
          <div className="analysis-data-item">
            <span className="analysis-data-label">Fecha</span>
            <span className="analysis-data-value">{formatDateTime(analysis.creado_en)}</span>
          </div>
          <div className="analysis-data-item">
            <span className="analysis-data-label">Duración</span>
            <span className="analysis-data-value">
              {formatDurationSeconds(analysis.duracion_ms)}
            </span>
          </div>
        </div>
      </section>

      {/* P04-E7: Resumen */}
      <section className="analysis-section analysis-card">
        <h2 className="analysis-card__title">Resumen</h2>
        <p className="analysis-card__text" data-testid="p04-e7">
          {analysis.resultado.resumen}
        </p>
      </section>

      {/* P04-E8: Indicadores detectados */}
      <section className="analysis-section analysis-card">
        <h2 className="analysis-card__title">Indicadores detectados</h2>
        {analysis.resultado.indicadores.length === 0 ? (
          <p className="analysis-empty-text" data-testid="p04-e8-empty">
            No se activaron indicadores.
          </p>
        ) : (
          <ul className="indicators-list" data-testid="p04-e8-list">
            {analysis.resultado.indicadores.map((ind) => {
              const pesoFormateado = formatPesoIndicador(ind.peso);
              return (
                <li key={ind.codigo} className="indicator-row">
                  <span className="indicator-desc">{ind.descripcion}</span>
                  {pesoFormateado !== null && (
                    <span className="indicator-weight" aria-label={`Peso: ${pesoFormateado}`}>
                      {pesoFormateado}
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* P04-E9: Análisis técnico */}
      <section className="analysis-section analysis-card">
        <h2 className="analysis-card__title">Análisis técnico</h2>
        <p className="analysis-card__text" data-testid="p04-e9">
          {analysis.resultado.analisis_tecnico}
        </p>
      </section>

      {/* P04-E10: Justificación del veredicto */}
      <section className="analysis-section analysis-card">
        <h2 className="analysis-card__title">Justificación del veredicto</h2>
        <p className="analysis-card__text" data-testid="p04-e10">
          {analysis.resultado.justificacion_veredicto}
        </p>
      </section>

      {/* P04-E11: Vista previa del correo */}
      <section className="analysis-section analysis-card">
        <div className="section-title-row">
          <h2 className="analysis-card__title">Vista previa del correo</h2>
          {isEmailLong && (
            <button
              type="button"
              className="btn btn--secondary btn--sm"
              onClick={() => setShowFullEmail((prev) => !prev)}
              data-testid="toggle-full-email"
            >
              {showFullEmail ? 'Ver menos' : 'Ver todo'}
            </button>
          )}
        </div>
        <pre className="email-preview-pre" data-testid="p04-e11">
          {displayedEmail}
        </pre>
      </section>

      {/* P04-E12: Aviso siempre visible */}
      <aside className="notice-box notice-box--warning" role="note" data-testid="p04-e12">
        Este resultado es una ayuda para el análisis. Ante la duda, no abra enlaces ni adjuntos y
        consulte al equipo de seguridad.
      </aside>
    </article>
  );
}
