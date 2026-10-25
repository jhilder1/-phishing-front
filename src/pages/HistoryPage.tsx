import { useCallback, useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { DataTable } from '@/lib/../components/DataTable';
import { ChevronLeftIcon, ChevronRightIcon } from '@/lib/../components/Icons';
import { EmptyState, ErrorState, LoadingState } from '@/lib/../components/StateView';
import { VerdictBadge } from '@/lib/../components/VerdictBadge';
import { listAnalyses } from '@/lib/api';
import { ApiError } from '@/lib/errors';
import { formatDateTime, formatResultCount, truncateText } from '@/lib/format';
import { routes } from '@/lib/routes';
import type { AnalisisListItem, Veredicto } from '@/lib/types';

const ALL_VEREDICTOS: Veredicto[] = ['malicioso', 'sospechoso', 'sin_indicadores'];
const PAGE_SIZE = 20;

/**
 * P05 · Historial (§4.4).
 */
export function HistoryPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Leer estado de la URL (§4.4)
  const veredictoParam = searchParams.get('veredicto');
  const paginaParam = parseInt(searchParams.get('pagina') ?? '1', 10);
  const activePage = Number.isNaN(paginaParam) || paginaParam < 1 ? 1 : paginaParam;

  const selectedVeredictos: Veredicto[] =
    veredictoParam !== null
      ? (veredictoParam
          .split(',')
          .filter((v) => ALL_VEREDICTOS.includes(v as Veredicto)) as Veredicto[])
      : ALL_VEREDICTOS;

  const [items, setItems] = useState<AnalisisListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const veredictos =
        veredictoParam !== null
          ? (veredictoParam
              .split(',')
              .filter((v) => ALL_VEREDICTOS.includes(v as Veredicto)) as Veredicto[])
          : ALL_VEREDICTOS;

      const response = await listAnalyses({
        veredicto: veredictos.length === 3 ? undefined : veredictos,
        pagina: activePage,
        limite: PAGE_SIZE,
      });
      setItems(Array.isArray(response?.items) ? response.items : []);
      setTotal(response?.total ?? 0);
      setTotalPages(response?.paginas ?? 1);
    } catch (err: unknown) {
      if (
        err instanceof ApiError &&
        (err.status === 503 ||
          err.status === 502 ||
          err.status === 504 ||
          err.codigo === 'BACKEND_NO_DISPONIBLE')
      ) {
        setError(
          'El backend no responde. Verifique la conexión con el servidor o active el Modo demo.',
        );
      } else {
        setError('No se pudo cargar el historial.');
      }
    } finally {
      setLoading(false);
    }
  }, [veredictoParam, activePage]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  // Manejo de cambio de filtros (AC-HIST-02, AC-HIST-03: reinicia pagina a 1)
  const handleCheckboxChange = (veredicto: Veredicto) => {
    const isCurrentlySelected = selectedVeredictos.includes(veredicto);
    let updated: Veredicto[];

    if (isCurrentlySelected) {
      updated = selectedVeredictos.filter((v) => v !== veredicto);
    } else {
      updated = [...selectedVeredictos, veredicto];
    }

    const nextParams = new URLSearchParams(searchParams);
    // AC-HIST-03: Reiniciar a página 1 al cambiar el filtro
    nextParams.delete('pagina');

    if (updated.length === 0) {
      // Si desmarca todas, se pasa parámetro vacío o sin resultados
      nextParams.set('veredicto', 'ninguno');
    } else if (updated.length === ALL_VEREDICTOS.length) {
      nextParams.delete('veredicto');
    } else {
      nextParams.set('veredicto', updated.join(','));
    }

    setSearchParams(nextParams);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages || newPage === activePage) return;
    const nextParams = new URLSearchParams(searchParams);
    if (newPage === 1) {
      nextParams.delete('pagina');
    } else {
      nextParams.set('pagina', String(newPage));
    }
    setSearchParams(nextParams);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Columnas para P05-T1 (§4.4: Fecha, Asunto, Remitente, Veredicto, Score)
  const columns = [
    {
      key: 'fecha',
      header: 'Fecha',
      render: (item: AnalisisListItem) => formatDateTime(item.creado_en),
    },
    {
      key: 'asunto',
      header: 'Asunto',
      render: (item: AnalisisListItem) => (
        <Link to={routes.detail(item.id)} className="analysis-link">
          {truncateText(item.correo.asunto, 60)}
        </Link>
      ),
    },
    {
      key: 'remitente',
      header: 'Remitente',
      render: (item: AnalisisListItem) => (
        <span className="analysis-data-value--mono">{item.correo.remitente}</span>
      ),
    },
    {
      key: 'veredicto',
      header: 'Veredicto',
      render: (item: AnalisisListItem) => (
        <VerdictBadge veredicto={item.resultado.veredicto} size="sm" />
      ),
    },
    {
      key: 'score',
      header: 'Score',
      render: (item: AnalisisListItem) => (
        <span className="score-value">{item.resultado.score}</span>
      ),
    },
  ];

  return (
    <section className="history-page">
      <header className="page-header">
        {/* P05-E1 */}
        <h1>Historial de análisis</h1>
      </header>

      {/* P05-E2: Filtro por casillas */}
      <fieldset className="history-filters" data-testid="p05-e2">
        <legend className="history-filters__legend">Filtrar por veredicto</legend>
        <div className="history-filters__checkboxes">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={selectedVeredictos.includes('malicioso')}
              onChange={() => handleCheckboxChange('malicioso')}
              data-testid="filter-malicioso"
            />
            <span>Malicioso</span>
          </label>
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={selectedVeredictos.includes('sospechoso')}
              onChange={() => handleCheckboxChange('sospechoso')}
              data-testid="filter-sospechoso"
            />
            <span>Sospechoso</span>
          </label>
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={selectedVeredictos.includes('sin_indicadores')}
              onChange={() => handleCheckboxChange('sin_indicadores')}
              data-testid="filter-sin_indicadores"
            />
            <span>Sin indicadores</span>
          </label>
        </div>
      </fieldset>

      {/* Estados y contenido */}
      {loading ? (
        <LoadingState message="Cargando historial…" />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchHistory} />
      ) : total === 0 ? (
        /* P05-E5: Estado vacío */
        <EmptyState
          message="No hay análisis con estos filtros."
          className="history-empty"
          action={
            selectedVeredictos.length < 3 ? (
              <button
                type="button"
                className="btn btn--secondary btn--sm"
                onClick={() => {
                  const nextParams = new URLSearchParams(searchParams);
                  nextParams.delete('veredicto');
                  nextParams.delete('pagina');
                  setSearchParams(nextParams);
                }}
              >
                Restablecer filtros
              </button>
            ) : undefined
          }
        />
      ) : (
        <>
          {/* P05-E3: Contador */}
          <div className="history-summary" data-testid="p05-e3">
            <span className="results-count">{formatResultCount(total)}</span>
          </div>

          {/* P05-T1: Tabla */}
          <DataTable
            columns={columns}
            data={items}
            keyExtractor={(item) => item.id}
            caption="Historial completo de análisis"
          />

          {/* P05-E4: Paginador */}
          <nav
            className="history-pagination"
            aria-label="Paginación del historial"
            data-testid="p05-e4"
          >
            <button
              type="button"
              className="btn btn--secondary btn--sm"
              disabled={activePage <= 1}
              onClick={() => handlePageChange(activePage - 1)}
              data-testid="pagination-prev"
            >
              <ChevronLeftIcon size={16} />
              <span>Anterior</span>
            </button>

            <span className="pagination-info" data-testid="pagination-info">
              Página {activePage} de {totalPages}
            </span>

            <button
              type="button"
              className="btn btn--secondary btn--sm"
              disabled={activePage >= totalPages}
              onClick={() => handlePageChange(activePage + 1)}
              data-testid="pagination-next"
            >
              <span>Siguiente</span>
              <ChevronRightIcon size={16} />
            </button>
          </nav>
        </>
      )}
    </section>
  );
}
