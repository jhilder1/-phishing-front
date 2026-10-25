import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { DataTable } from '@/components/DataTable';
import {
  ArrowRightIcon,
  BarChartIcon,
  CpuIcon,
  LockIcon,
  ShieldIcon,
  ZapIcon,
} from '@/components/Icons';
import { KpiCard } from '@/components/KpiCard';
import { EmptyState, ErrorState, LoadingState } from '@/components/StateView';
import { VerdictBadge } from '@/components/VerdictBadge';
import { getMetricsSummary, listAnalyses } from '@/lib/api';
import {
  formatDateTime,
  formatDayMonth,
  formatDurationSeconds,
  formatNumber,
  formatPercent,
  truncateText,
} from '@/lib/format';
import { routes } from '@/lib/routes';
import type { AnalisisListItem, MetricasResumen } from '@/lib/types';

/**
 * P02 · Tablero (§4.1).
 * 4 tarjetas KPI, 2 gráficos (barras apiladas 30 días, barras horizontales top 5)
 * y tabla de 10 análisis recientes.
 */
export function DashboardPage() {
  const [metrics, setMetrics] = useState<MetricasResumen | null>(null);
  const [recentAnalyses, setRecentAnalyses] = useState<AnalisisListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [metricsData, analysesData] = await Promise.all([
        getMetricsSummary(),
        listAnalyses({ limite: 10 }),
      ]);
      setMetrics(metricsData);
      setRecentAnalyses(analysesData.items);
    } catch {
      setError('No se pudo cargar el tablero.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return (
      <section className="dashboard-page" aria-busy="true">
        <header className="page-header">
          <h1>Tablero de detección</h1>
          <p className="page-subtitle">Últimos 30 días</p>
        </header>
        <LoadingState message="Cargando tablero…" />
      </section>
    );
  }

  if (error || !metrics) {
    return (
      <section className="dashboard-page">
        <header className="page-header">
          <h1>Tablero de detección</h1>
          <p className="page-subtitle">Últimos 30 días</p>
        </header>
        <ErrorState message={error ?? 'No se pudo cargar el tablero.'} onRetry={loadData} />
      </section>
    );
  }

  // Estado vacío: total = 0 (§4.1)
  if (metrics.total === 0) {
    return (
      <section className="dashboard-page">
        <header className="page-header">
          <h1>Tablero de detección</h1>
          <p className="page-subtitle">Últimos 30 días</p>
        </header>
        <EmptyState
          message="Aún no hay análisis."
          action={
            <Link to={routes.analyze} className="btn btn--primary" data-testid="p02-b1">
              Analizar un correo
            </Link>
          }
        />
      </section>
    );
  }

  // Cálculos de KPI conforme a §4.1 y §6.2
  const pctMaliciosos =
    metrics.total === 0
      ? '0 %'
      : formatPercent((metrics.por_veredicto.malicioso / metrics.total) * 100);

  // Formatear datos para el gráfico de barras apiladas (30 días exactos, dd/MM)
  const stackedDailyData = metrics.por_dia.map((d) => ({
    ...d,
    fechaFormatted: formatDayMonth(d.fecha),
  }));

  // Columnas para la tabla P02-T1 (§4.1)
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
    <section className="dashboard-page">
      {/* Hero Entry Section: Bienvenida, estado de defensa y accesos rápidos */}
      <div className="hero-entry" data-testid="hero-entry">
        <div className="hero-entry__header">
          <div className="hero-entry__status">
            <span className="hero-entry__status-dot" aria-hidden="true" />
            <span>CENTRO DE OPERACIONES DE SEGURIDAD · DEFENSA CONTRA PHISHING</span>
          </div>
          <h1 className="hero-entry__title">Tablero de detección</h1>
          <p className="page-subtitle hero-entry__subtitle">Últimos 30 días</p>
          <p className="hero-entry__description">
            Plataforma corporativa de inteligencia y mitigación de amenazas. Analice correos
            sospechosos en tiempo real, neutralice vectores de ingeniería social y monitoree la
            telemetría institucional.
          </p>
          <div className="hero-entry__actions">
            <Link to={routes.analyze} className="btn btn--hero-primary" data-testid="p02-b1">
              <ShieldIcon size={18} />
              <span>Analizar un correo</span>
              <ArrowRightIcon size={16} />
            </Link>
            <Link
              to={routes.history}
              className="btn btn--hero-secondary"
              data-testid="hero-history-btn"
            >
              <BarChartIcon size={18} />
              <span>Ver historial de incidentes</span>
            </Link>
          </div>

          <div className="hero-entry__telemetry-bar" aria-label="Telemetría de protección">
            <div className="telemetry-pill">
              <span className="telemetry-pill__dot" aria-hidden="true" />
              <span className="telemetry-pill__label">Motor:</span>
              <span className="telemetry-pill__val">Heurística v2.0 + LLM</span>
            </div>
            <div className="telemetry-pill">
              <span className="telemetry-pill__label">Triaje:</span>
              <span className="telemetry-pill__val">&lt; 50 ms</span>
            </div>
            <div className="telemetry-pill">
              <span className="telemetry-pill__label">Privacidad:</span>
              <span className="telemetry-pill__val">PII Blindada</span>
            </div>
            <div className="telemetry-pill">
              <span className="telemetry-pill__label">Defensa:</span>
              <span className="telemetry-pill__val telemetry-pill__val--live">Activa</span>
            </div>
          </div>
        </div>

        <div className="hero-entry__capabilities">
          <div className="capability-card">
            <div className="capability-card__icon capability-card__icon--zap">
              <ZapIcon size={20} />
            </div>
            <div className="capability-card__content">
              <h3 className="capability-card__title">Triaje Heurístico</h3>
              <p className="capability-card__text">
                Filtro sintáctico en milisegundos de cabeceras, SPF y dominios sin costo de LLM.
              </p>
            </div>
          </div>

          <div className="capability-card">
            <div className="capability-card__icon capability-card__icon--cpu">
              <CpuIcon size={20} />
            </div>
            <div className="capability-card__content">
              <h3 className="capability-card__title">Agente IA Autónomo</h3>
              <p className="capability-card__text">
                Detección contextual de suplantación BEC, fraude financiero y urgencia psicológica.
              </p>
            </div>
          </div>

          <div className="capability-card">
            <div className="capability-card__icon capability-card__icon--lock">
              <LockIcon size={20} />
            </div>
            <div className="capability-card__content">
              <h3 className="capability-card__title">Privacidad Blindada</h3>
              <p className="capability-card__text">
                Enmascaramiento irreversible de correos y credenciales antes de cualquier guardado.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 4 Tarjetas KPI (§4.1 P02-K1 a K4) */}
      <div className="kpi-grid" data-testid="kpi-grid">
        <KpiCard label="Correos analizados" value={formatNumber(metrics.total)} />
        <KpiCard
          label="Maliciosos detectados"
          value={formatNumber(metrics.por_veredicto.malicioso)}
          subtext={`${pctMaliciosos} del total`}
        />
        <KpiCard
          label="Resueltos sin IA"
          value={formatPercent(metrics.pct_sin_llm)}
          subtext="Ahorro de llamadas al modelo"
        />
        <KpiCard
          label="Tiempo medio de respuesta"
          value={formatDurationSeconds(metrics.duracion_media_ms)}
        />
      </div>

      {/* Gráficos P02-G1 y P02-G2 */}
      <div className="dashboard-charts-grid">
        {/* P02-G1: Barras apiladas por día (30 barras) */}
        <article className="chart-card" data-testid="chart-daily">
          <h2 className="chart-card__title">Análisis por día</h2>
          <div className="chart-card__container" style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={stackedDailyData}
                margin={{ top: 12, right: 12, left: -16, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#edf0f5" />
                <XAxis
                  dataKey="fechaFormatted"
                  tick={{ fontSize: 11, fill: '#525a66' }}
                  interval="preserveStartEnd"
                  angle={-45}
                  textAnchor="end"
                  height={45}
                />
                <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#525a66' }} />
                <Tooltip
                  cursor={{ fill: 'rgba(31, 56, 100, 0.04)' }}
                  formatter={(val: number, name: string) => [val, name]}
                  labelFormatter={(_label, payload) => {
                    const row = payload?.[0]?.payload as { fecha?: string } | undefined;
                    return row?.fecha ? formatDateTime(`${row.fecha}T00:00:00Z`).slice(0, 10) : '';
                  }}
                />
                <Legend
                  verticalAlign="top"
                  align="right"
                  wrapperStyle={{ paddingBottom: 10, fontSize: 12 }}
                />
                <Bar dataKey="malicioso" name="Malicioso" stackId="dia" fill="#c82333" />
                <Bar dataKey="sospechoso" name="Sospechoso" stackId="dia" fill="#f59e0b" />
                <Bar
                  dataKey="sin_indicadores"
                  name="Sin indicadores"
                  stackId="dia"
                  fill="#2e7d32"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>

        {/* P02-G2: Barras horizontales top 5 indicadores */}
        <article className="chart-card" data-testid="chart-indicators">
          <h2 className="chart-card__title">Indicadores más frecuentes</h2>
          {metrics.top_indicadores.length === 0 ? (
            <div className="chart-card__empty">
              <p>Sin indicadores en el periodo.</p>
            </div>
          ) : (
            <div className="chart-card__container" style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={metrics.top_indicadores}
                  layout="vertical"
                  margin={{ top: 12, right: 24, left: 24, bottom: 12 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#edf0f5" />
                  <XAxis
                    type="number"
                    allowDecimals={false}
                    tick={{ fontSize: 12, fill: '#525a66' }}
                  />
                  <YAxis
                    type="category"
                    dataKey="descripcion"
                    tick={{ fontSize: 12, fill: '#1a1a1a' }}
                    width={150}
                  />
                  <Tooltip
                    formatter={(val: number) => [val, 'Conteo']}
                    cursor={{ fill: 'rgba(31, 56, 100, 0.04)' }}
                  />
                  <Bar dataKey="conteo" name="Ocurrencias" fill="#1f3864" radius={[0, 4, 4, 0]}>
                    {metrics.top_indicadores.map((entry) => (
                      <Cell key={entry.codigo} fill="#1f3864" />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </article>
      </div>

      {/* Tabla P02-T1: 10 análisis recientes */}
      <section className="recent-analyses-section">
        <div className="section-header">
          <h2>Análisis recientes</h2>
        </div>

        <DataTable
          columns={columns}
          data={recentAnalyses}
          keyExtractor={(item) => item.id}
          caption="10 análisis más recientes"
        />

        <div className="recent-analyses-footer">
          <Link to={routes.history} className="history-link" data-testid="p02-b2">
            Ver historial completo
          </Link>
        </div>
      </section>
    </section>
  );
}
