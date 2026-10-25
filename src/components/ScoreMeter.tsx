interface ScoreMeterProps {
  score: number;
  className?: string;
}

/**
 * Medidor de score de riesgo según §4.3 (P04-E3) y AC-DET-03.
 * Exprime role="meter", aria-valuenow, aria-valuemin="0", aria-valuemax="100"
 * y contiene marcas visibles obligatorias en 30 y 75.
 */
export function ScoreMeter({ score, className = '' }: ScoreMeterProps) {
  // Asegurar rango 0 a 100
  const clampedScore = Math.max(0, Math.min(100, Math.round(score)));

  // Clase visual según tramo de severidad
  let toneClass = 'score-meter--clean';
  if (clampedScore >= 75) {
    toneClass = 'score-meter--malicious';
  } else if (clampedScore >= 30) {
    toneClass = 'score-meter--suspicious';
  }

  return (
    <div className={`score-meter-widget ${className}`.trim()}>
      <div className="score-meter-widget__header">
        <span className="score-meter-widget__title">Puntaje de riesgo</span>
        <span className="score-meter-widget__value">
          <strong>{clampedScore}</strong> / 100
        </span>
      </div>

      <div
        className={`score-meter-bar ${toneClass}`}
        role="meter"
        aria-valuenow={clampedScore}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Puntaje de riesgo"
      >
        <div
          className="score-meter-bar__fill"
          style={{ width: `${clampedScore}%` }}
          data-testid="score-meter-fill"
        />

        {/* Marcas requeridas por AC-DET-03 en 30 y 75 */}
        <div
          className="score-meter-mark score-meter-mark--30"
          style={{ left: '30%' }}
          data-testid="score-mark-30"
        >
          <span className="score-meter-mark__tick" />
          <span className="score-meter-mark__label">30</span>
        </div>

        <div
          className="score-meter-mark score-meter-mark--75"
          style={{ left: '75%' }}
          data-testid="score-mark-75"
        >
          <span className="score-meter-mark__tick" />
          <span className="score-meter-mark__label">75</span>
        </div>
      </div>

      <div className="score-meter-widget__legend" aria-hidden="true">
        <span>0 (Bajo)</span>
        <span>30 (Sospechoso)</span>
        <span>75 (Crítico)</span>
        <span>100</span>
      </div>
    </div>
  );
}
