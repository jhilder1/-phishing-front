interface KpiCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  loading?: boolean;
  className?: string;
}

/**
 * Tarjeta de KPI para el tablero (§4.1 P02-K1 a P02-K4).
 */
export function KpiCard({ label, value, subtext, loading = false, className = '' }: KpiCardProps) {
  return (
    <article className={`kpi-card ${loading ? 'kpi-card--loading' : ''} ${className}`.trim()}>
      <h2 className="kpi-card__label">{label}</h2>
      <div className="kpi-card__value">
        {loading ? <span className="skeleton skeleton--text" style={{ width: '60%' }} /> : value}
      </div>
      {subtext && (
        <p className="kpi-card__subtext">
          {loading ? (
            <span className="skeleton skeleton--text" style={{ width: '80%' }} />
          ) : (
            subtext
          )}
        </p>
      )}
    </article>
  );
}
