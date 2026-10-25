import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { RefreshIcon, ShieldIcon, SpinnerIcon } from '@/components/Icons';
import { TabPanel, Tabs } from '@/lib/../components/Tabs';
import { createAnalysis, getSamples } from '@/lib/api';
import { getAnalizarErrorMessage } from '@/lib/errors';
import { routes } from '@/lib/routes';
import type { MuestraCaso } from '@/lib/types';
import {
  CASOS_MUESTRA_VALIDOS,
  validateModoMuestra,
  validateModoPegar,
  type FormErrorsModoPegar,
} from '@/lib/validation';

type TabMode = 'pegar' | 'muestra';

const TABS = [
  { id: 'pegar', label: 'Pegar contenido' },
  { id: 'muestra', label: 'Caso de ejemplo' },
];

/**
 * P03 · Analizar correo (§4.2).
 */
export function AnalyzePage() {
  const navigate = useNavigate();

  // Modo activo (AC-ANAL-01: conserva lo digitado al alternar)
  const [activeTab, setActiveTab] = useState<TabMode>('pegar');

  // Formulario Modo Pegar
  const [remitente, setRemitente] = useState('');
  const [asunto, setAsunto] = useState('');
  const [cuerpo, setCuerpo] = useState('');
  const [cabeceras, setCabeceras] = useState('');
  const [pegarErrors, setPegarErrors] = useState<FormErrorsModoPegar>({});
  const [pegarTouched, setPegarTouched] = useState(false);

  // Formulario Modo Muestra
  const [samples, setSamples] = useState<MuestraCaso[]>([]);
  const [selectedSampleId, setSelectedSampleId] = useState<string>('phishing-credenciales');

  // Estado de envío / progreso (§4.2 P03-E6)
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [apiError, setApiError] = useState<string | null>(null);
  const [canRetry, setCanRetry] = useState(false);

  // Referencias para accesibilidad y cancelación
  const abortControllerRef = useRef<AbortController | null>(null);
  const timerRef = useRef<number | null>(null);
  const remitenteInputRef = useRef<HTMLInputElement>(null);
  const asuntoInputRef = useRef<HTMLInputElement>(null);
  const cuerpoTextareaRef = useRef<HTMLTextAreaElement>(null);
  const cabecerasTextareaRef = useRef<HTMLTextAreaElement>(null);

  // Cargar casos de ejemplo
  useEffect(() => {
    getSamples()
      .then((data) => {
        setSamples(data);
      })
      .catch(() => {
        // En caso de fallo de red, se mantiene el estado
      });
  }, []);

  // Validación en vivo de Modo Pegar
  const validationResult = validateModoPegar({
    remitente,
    asunto,
    cuerpo,
    cabeceras,
  });

  const isFormValid =
    activeTab === 'pegar'
      ? validationResult.isValid
      : validateModoMuestra(selectedSampleId).isValid;

  const handleBlurField = () => {
    setPegarTouched(true);
    setPegarErrors(validationResult.errors);
  };

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId as TabMode);
    setApiError(null);
  };

  const handleCancel = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  const executeAnalysis = async () => {
    setApiError(null);
    setCanRetry(false);

    if (activeTab === 'pegar') {
      const check = validateModoPegar({ remitente, asunto, cuerpo, cabeceras });
      if (!check.isValid) {
        setPegarErrors(check.errors);
        setPegarTouched(true);
        // Foco al primer campo con error (§4.2)
        if (check.firstErrorField === 'remitente') remitenteInputRef.current?.focus();
        else if (check.firstErrorField === 'asunto') asuntoInputRef.current?.focus();
        else if (check.firstErrorField === 'cuerpo') cuerpoTextareaRef.current?.focus();
        else if (check.firstErrorField === 'cabeceras') cabecerasTextareaRef.current?.focus();
        return;
      }
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    setIsSubmitting(true);
    setElapsedSeconds(0);

    // Cronómetro P03-E6
    const startTime = Date.now();
    timerRef.current = window.setInterval(() => {
      const secs = Math.floor((Date.now() - startTime) / 1000);
      setElapsedSeconds(secs);
    }, 1000);

    try {
      let result;
      if (activeTab === 'pegar') {
        result = await createAnalysis(
          {
            modo: 'pegar',
            remitente: remitente.trim(),
            asunto: asunto.trim(),
            cuerpo: cuerpo.trim(),
            cabeceras: cabeceras.trim() || undefined,
          },
          controller.signal,
        );
      } else {
        result = await createAnalysis(
          {
            modo: 'muestra',
            muestra_id: selectedSampleId,
          },
          controller.signal,
        );
      }

      // Éxito: redirección a /analisis/:id (§4.2)
      navigate(routes.detail(result.id));
    } catch (err: unknown) {
      const msg = getAnalizarErrorMessage(err);
      setApiError(msg);
      // Habilitar reintento para errores de motor 502/504
      if (msg.includes('El motor de análisis no respondió')) {
        setCanRetry(true);
      }
    } finally {
      setIsSubmitting(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      abortControllerRef.current = null;
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!isSubmitting) {
      executeAnalysis();
    }
  };

  const selectedSample =
    samples.find((s) => s.id === selectedSampleId) ??
    ((CASOS_MUESTRA_VALIDOS as readonly string[]).includes(selectedSampleId)
      ? samples[0]
      : undefined);

  return (
    <section className="analyze-page">
      <header className="page-header">
        {/* P03-E1 */}
        <h1>Analizar un correo</h1>
        {/* P03-E2 */}
        <p className="page-subtitle">
          Pegue el contenido del correo o elija un caso de ejemplo. El análisis tarda hasta 60
          segundos.
        </p>
      </header>

      {/* P03-E4: Aviso de privacidad */}
      <div className="notice-box" role="note" data-testid="p03-e4">
        No ingrese datos reales de clientes. Los correos y números largos se enmascaran antes de
        guardarse.
      </div>

      {/* P03-E3: Pestañas */}
      <Tabs items={TABS} activeId={activeTab} onChange={handleTabChange} />

      <form onSubmit={handleSubmit} noValidate>
        {/* Modo A: Pegar contenido */}
        <TabPanel id="pegar" activeId={activeTab}>
          <div className="form-group">
            <label htmlFor="remitente-input" className="form-label">
              Remitente <span aria-hidden="true">*</span>
            </label>
            <input
              ref={remitenteInputRef}
              id="remitente-input"
              type="email"
              maxLength={254}
              value={remitente}
              disabled={isSubmitting}
              onChange={(e) => setRemitente(e.target.value)}
              onBlur={handleBlurField}
              placeholder="nombre@dominio.com"
              className={`form-input ${pegarTouched && pegarErrors.remitente ? 'form-input--error' : ''}`}
              aria-describedby={pegarErrors.remitente ? 'remitente-error' : undefined}
              aria-invalid={!!pegarErrors.remitente}
              required
            />
            {pegarTouched && pegarErrors.remitente && (
              <p id="remitente-error" className="form-error" role="alert">
                {pegarErrors.remitente}
              </p>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="asunto-input" className="form-label">
              Asunto <span aria-hidden="true">*</span>
            </label>
            <input
              ref={asuntoInputRef}
              id="asunto-input"
              type="text"
              maxLength={300}
              value={asunto}
              disabled={isSubmitting}
              onChange={(e) => setAsunto(e.target.value)}
              onBlur={handleBlurField}
              placeholder="Asunto del correo"
              className={`form-input ${pegarTouched && pegarErrors.asunto ? 'form-input--error' : ''}`}
              aria-describedby={pegarErrors.asunto ? 'asunto-error' : undefined}
              aria-invalid={!!pegarErrors.asunto}
              required
            />
            {pegarTouched && pegarErrors.asunto && (
              <p id="asunto-error" className="form-error" role="alert">
                {pegarErrors.asunto}
              </p>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="cuerpo-input" className="form-label">
              Cuerpo <span aria-hidden="true">*</span>
            </label>
            <textarea
              ref={cuerpoTextareaRef}
              id="cuerpo-input"
              rows={8}
              maxLength={20000}
              value={cuerpo}
              disabled={isSubmitting}
              onChange={(e) => setCuerpo(e.target.value)}
              onBlur={handleBlurField}
              placeholder="Pegue aquí el texto completo del correo..."
              className={`form-textarea ${pegarTouched && pegarErrors.cuerpo ? 'form-textarea--error' : ''}`}
              aria-describedby="cuerpo-count cuerpo-error"
              aria-invalid={!!pegarErrors.cuerpo}
              required
            />
            <div className="form-helper">
              <span id="cuerpo-count">{cuerpo.length} / 20 000</span>
            </div>
            {pegarTouched && pegarErrors.cuerpo && (
              <p id="cuerpo-error" className="form-error" role="alert">
                {pegarErrors.cuerpo}
              </p>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="cabeceras-input" className="form-label">
              Cabeceras (opcional)
            </label>
            <textarea
              ref={cabecerasTextareaRef}
              id="cabeceras-input"
              rows={4}
              maxLength={10000}
              value={cabeceras}
              disabled={isSubmitting}
              onChange={(e) => setCabeceras(e.target.value)}
              placeholder="Received: from mail.example.com..."
              className={`form-textarea ${pegarTouched && pegarErrors.cabeceras ? 'form-textarea--error' : ''}`}
              aria-describedby={pegarErrors.cabeceras ? 'cabeceras-error' : undefined}
            />
            {pegarTouched && pegarErrors.cabeceras && (
              <p id="cabeceras-error" className="form-error" role="alert">
                {pegarErrors.cabeceras}
              </p>
            )}
          </div>
        </TabPanel>

        {/* Modo B: Caso de ejemplo */}
        <TabPanel id="muestra" activeId={activeTab}>
          <div
            className="sample-cards-grid"
            role="radiogroup"
            aria-label="Casos de ejemplo disponibles"
          >
            {samples.map((sample) => {
              const isSelected = selectedSampleId === sample.id;
              return (
                <div
                  key={sample.id}
                  role="radio"
                  aria-checked={isSelected}
                  tabIndex={isSelected ? 0 : -1}
                  className={`sample-card ${isSelected ? 'sample-card--selected' : ''}`}
                  onClick={() => !isSubmitting && setSelectedSampleId(sample.id)}
                  onKeyDown={(e) => {
                    if (e.key === ' ' || e.key === 'Enter') {
                      e.preventDefault();
                      if (!isSubmitting) setSelectedSampleId(sample.id);
                    }
                  }}
                >
                  <div className="sample-card__header">
                    <span className="sample-card__radio" aria-hidden="true" />
                    <h3 className="sample-card__title">{sample.titulo}</h3>
                  </div>
                  <p className="sample-card__desc">{sample.descripcion}</p>
                </div>
              );
            })}
          </div>

          {/* Vista previa de solo lectura (§4.2) */}
          {selectedSample && (
            <div className="sample-preview" data-testid="sample-preview">
              <h3 className="sample-preview__title">Vista previa del caso</h3>
              <div className="sample-preview__row">
                <strong>Remitente:</strong> <span>{selectedSample.remitente}</span>
              </div>
              <div className="sample-preview__row">
                <strong>Asunto:</strong> <span>{selectedSample.asunto}</span>
              </div>
              <div className="sample-preview__body">
                <strong>Cuerpo:</strong>
                <pre>{selectedSample.cuerpo}</pre>
              </div>
            </div>
          )}
        </TabPanel>

        {/* Mensaje de error en línea sin perder lo digitado (§4.2) */}
        {apiError && (
          <div className="analyze-error-box" role="alert" data-testid="analyze-error">
            <p>{apiError}</p>
            {canRetry && (
              <button type="button" onClick={executeAnalysis} className="btn btn--outline btn--sm">
                <RefreshIcon size={14} />
                <span>Reintentar</span>
              </button>
            )}
          </div>
        )}

        {/* Controles principales y P03-E6 (Progreso con simulador de escaneo forense) */}
        <div className="analyze-actions">
          {isSubmitting ? (
            <div className="cyber-scanner-wrapper" data-testid="p03-e6">
              <div className="cyber-scanner-card">
                <div className="cyber-scanner-card__header">
                  <div className="cyber-scanner-card__status">
                    <span className="cyber-scanner-dot" aria-hidden="true" />
                    <span>ESCANEANDO AMENAZAS EN TIEMPO REAL</span>
                  </div>
                  <span className="cyber-scanner-time">Analizando… {elapsedSeconds} s</span>
                </div>

                <div className="cyber-scanner-card__body">
                  <div className="cyber-scanner-laser" aria-hidden="true" />
                  <div className="cyber-scanner-phase">
                    <SpinnerIcon size={18} className="icon-spin text-cyan" />
                    <span className="cyber-scanner-phase-text">
                      {elapsedSeconds < 1 &&
                        'Fase 1/4: Desensibilizando PII y entidades en memoria…'}
                      {elapsedSeconds >= 1 &&
                        elapsedSeconds < 2 &&
                        'Fase 2/4: Evaluando sintaxis SPF, DKIM y dominios homoglíficos…'}
                      {elapsedSeconds >= 2 &&
                        elapsedSeconds < 3 &&
                        'Fase 3/4: Agente IA examinando intencionalidad y coerción BEC…'}
                      {elapsedSeconds >= 3 &&
                        'Fase 4/4: Sintetizando evidencias forenses y calculando score…'}
                    </span>
                  </div>

                  <div className="cyber-scanner-meter" aria-hidden="true">
                    <div
                      className="cyber-scanner-meter__bar"
                      style={{
                        width: `${Math.min(96, Math.max(22, (elapsedSeconds + 1) * 26))}%`,
                      }}
                    />
                  </div>
                </div>

                <div className="cyber-scanner-card__footer">
                  <span className="cyber-scanner-security-note">
                    🔒 Protección activa · Cero persistencia de credenciales
                  </span>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="btn btn--secondary btn--sm"
                    data-testid="cancel-analysis"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <button
              type="submit"
              disabled={!isFormValid || isSubmitting}
              className="btn btn--primary btn--lg btn--analyze-glow"
              data-testid="p03-e5"
            >
              <ShieldIcon size={20} />
              <span>Analizar Correo</span>
            </button>
          )}
        </div>
      </form>
    </section>
  );
}
