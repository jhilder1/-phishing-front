import { Link } from 'react-router-dom';
import {
  ArrowRightIcon,
  BarChartIcon,
  CheckIcon,
  CpuIcon,
  LockIcon,
  ShieldIcon,
  WarningIcon,
  ZapIcon,
} from '@/components/Icons';
import { ScoreMeter } from '@/components/ScoreMeter';
import { VerdictBadge } from '@/components/VerdictBadge';
import { routes } from '@/lib/routes';

/**
 * Página de Entrada / Landing Page corporativa.
 * Diseñada bajo estándares de producto SaaS y marketing digital moderno.
 * Estructura jerárquica con consola interactiva estilo ventana SOC,
 * pipeline forense en 4 fases y llamadas a la acción pulidas.
 */
export function LandingPage() {
  return (
    <div className="landing-page" data-testid="landing-page">
      {/* 1. Hero Principal de Entrada */}
      <section className="lp-hero">
        <div className="lp-hero__glow-sphere" aria-hidden="true" />

        <div className="lp-hero__badge">
          <span className="lp-hero__badge-dot" aria-hidden="true" />
          <span className="lp-hero__badge-text">
            PLATAFORMA SOC EMPRESARIAL · DEFENSA CONTRA PHISHING v2.0
          </span>
        </div>

        <h1 className="lp-hero__title">
          Detección Inteligente de Phishing con Agentes IA y Triaje Heurístico
        </h1>

        <p className="lp-hero__subtitle">
          Proteja la infraestructura corporativa frente a campañas avanzadas de suplantación BEC,
          ingeniería social y fraude de credenciales. Triaje sintáctico en menos de 50 milisegundos
          y razonamiento semántico profundo con privacidad blindada.
        </p>

        <div className="lp-hero__cta-group">
          <Link
            to={routes.dashboard}
            className="btn btn--lp-primary"
            data-testid="gateway-enter-btn"
          >
            <BarChartIcon size={20} />
            <span>Ingresar a la Aplicación · Acceder al Tablero</span>
            <ArrowRightIcon size={18} className="btn-arrow" />
          </Link>

          <Link to={routes.analyze} className="btn btn--lp-secondary">
            <ShieldIcon size={18} />
            <span>Analizar un correo ahora</span>
          </Link>

          <Link to={routes.history} className="lp-hero__link-history">
            <span>Ver historial de incidentes</span>
            <ArrowRightIcon size={14} />
          </Link>
        </div>

        {/* Chips de Telemetría */}
        <div className="lp-hero__telemetry" aria-label="Telemetría institucional">
          <div className="lp-telemetry-chip">
            <span className="lp-telemetry-chip__dot" aria-hidden="true" />
            <span className="lp-telemetry-chip__label">Triaje Heurístico:</span>
            <strong className="lp-telemetry-chip__val">&lt;50ms</strong>
          </div>
          <div className="lp-telemetry-chip">
            <span
              className="lp-telemetry-chip__dot lp-telemetry-chip__dot--blue"
              aria-hidden="true"
            />
            <span className="lp-telemetry-chip__label">Motor IA:</span>
            <strong className="lp-telemetry-chip__val">LLM Contextual Activo</strong>
          </div>
          <div className="lp-telemetry-chip">
            <span
              className="lp-telemetry-chip__dot lp-telemetry-chip__dot--green"
              aria-hidden="true"
            />
            <span className="lp-telemetry-chip__label">Privacidad:</span>
            <strong className="lp-telemetry-chip__val">Zero-Retention (PII Sanitized)</strong>
          </div>
          <div className="lp-telemetry-chip">
            <span
              className="lp-telemetry-chip__dot lp-telemetry-chip__dot--purple"
              aria-hidden="true"
            />
            <span className="lp-telemetry-chip__label">Estado:</span>
            <strong className="lp-telemetry-chip__val">100% Operativo</strong>
          </div>
        </div>
      </section>

      {/* 2. Showcase / Consola Forense Estilo Ventana SOC */}
      <section className="lp-showcase-section" aria-label="Demostración forense">
        <div className="lp-section-header">
          <span className="lp-section-eyebrow">DEMOSTRACIÓN FORENSE</span>
          <h2 className="lp-section-title">Cómo analiza el sistema un correo sospechoso</h2>
          <p className="lp-section-desc">
            Vea en tiempo real cómo el motor heurístico y el agente IA descomponen un correo
            malicioso, analizan cabeceras y evalúan riesgos sin retener información confidencial.
          </p>
        </div>

        <div className="soc-console-window">
          {/* Barra superior estilo macOS / terminal de seguridad */}
          <div className="soc-console-window__topbar">
            <div className="soc-window-dots" aria-hidden="true">
              <span className="dot dot--red" />
              <span className="dot dot--amber" />
              <span className="dot dot--green" />
            </div>
            <div className="soc-window-title">
              soc-threat-inspector · email-sample-phishing-credenciales.eml
            </div>
            <div className="soc-window-status">
              <span className="status-live-indicator" aria-hidden="true" />
              <span>LIVE INSPECTION</span>
            </div>
          </div>

          <div className="soc-console-window__body">
            {/* Panel Izquierdo: Vista del Correo Analizado */}
            <div className="soc-email-preview">
              <div className="soc-email-header">
                <span className="email-type-tag">Amenaza Detectada</span>
                <h3 className="soc-email-subject">
                  URGENTE: Actualización inmediata de credenciales bancarias requerida
                </h3>
                <div className="soc-email-meta-grid">
                  <div>
                    <span className="meta-label">De:</span>
                    <span className="meta-value">
                      soporte@banco-seguridad-portal.com <code>[SPF: Fail]</code>
                    </span>
                  </div>
                  <div>
                    <span className="meta-label">Para:</span>
                    <span className="meta-value">usuario_corporativo@empresa.com</span>
                  </div>
                  <div>
                    <span className="meta-label">Fecha:</span>
                    <span className="meta-value">Hoy, 14:32 COT · Prioridad Alta</span>
                  </div>
                </div>
              </div>

              <div className="soc-email-content">
                <p>
                  Estimado cliente, detectamos accesos anómalos en su cuenta corporativa. Para
                  evitar la suspensión de sus operaciones financieras en las próximas 24 horas, es
                  mandatorio verificar su identidad y actualizar su contraseña en nuestro servidor
                  seguro.
                </p>
                <div className="soc-email-alert-box">
                  <strong>⚠️ Enlace sospechoso interceptado:</strong>
                  <code>https://portal-seguridad-banco-falso.com/login?token=masked</code>
                </div>
              </div>
            </div>

            {/* Panel Derecho: Dictamen Forense y Medidor de Riesgo */}
            <div className="soc-forensics-panel">
              <div className="soc-verdict-row">
                <div className="soc-verdict-title">
                  <span className="verdict-label">Dictamen de Seguridad:</span>
                  <VerdictBadge veredicto="malicioso" size="md" />
                </div>
              </div>

              <div className="soc-meter-wrap">
                <ScoreMeter score={94} />
              </div>

              <div className="soc-signals-block">
                <h4 className="soc-signals-title">Indicadores Forenses Clave:</h4>
                <ul className="soc-signals-list">
                  <li className="soc-signal soc-signal--danger">
                    <WarningIcon size={16} />
                    <span>
                      <strong>Typosquatting:</strong> El dominio de envío suplanta a una entidad
                      financiera oficial.
                    </span>
                  </li>
                  <li className="soc-signal soc-signal--danger">
                    <WarningIcon size={16} />
                    <span>
                      <strong>Urgencia Psicológica:</strong> Coerción de tiempo (&lt;24h) y amenaza
                      de suspensión.
                    </span>
                  </li>
                  <li className="soc-signal soc-signal--warning">
                    <WarningIcon size={16} />
                    <span>
                      <strong>Alineación DMARC Nula:</strong> Servidor no autenticado en registros
                      DNS.
                    </span>
                  </li>
                  <li className="soc-signal soc-signal--success">
                    <CheckIcon size={16} />
                    <span>
                      <strong>PII Sanitizada:</strong> Contraseñas y nombres enmascarados antes del
                      análisis.
                    </span>
                  </li>
                </ul>
              </div>

              <div className="soc-panel-action">
                <Link to={routes.analyze} className="btn btn--primary btn--sm">
                  <span>Probar Caso en el Analizador</span>
                  <ArrowRightIcon size={16} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Pipeline Forense en Cuatro Fases */}
      <section className="lp-pipeline-section" aria-label="Pipeline forense">
        <div className="lp-section-header">
          <span className="lp-section-eyebrow">ARQUITECTURA DE DEFENSA</span>
          <h2 className="lp-section-title">Pipeline Forense en Cuatro Fases</h2>
          <p className="lp-section-desc">
            Diseño por capas para máxima precisión, mínima latencia y cero retención de datos
            sensibles.
          </p>
        </div>

        <div className="lp-pipeline-grid">
          <div className="lp-pipeline-card">
            <div className="lp-card-step">01</div>
            <div className="lp-card-icon lp-card-icon--lock">
              <LockIcon size={24} />
            </div>
            <h3 className="lp-card-title">Ingesta y Sanitización PII</h3>
            <p className="lp-card-desc">
              Anonimización irreversible en memoria de correos, nombres y credenciales antes de
              cualquier procesamiento.
            </p>
          </div>

          <div className="lp-pipeline-card">
            <div className="lp-card-step">02</div>
            <div className="lp-card-icon lp-card-icon--zap">
              <ZapIcon size={24} />
            </div>
            <h3 className="lp-card-title">Triaje Heurístico (&lt;50ms)</h3>
            <p className="lp-card-desc">
              Filtro sintáctico inmediato de SPF, DKIM, alineación DMARC y dominios homoglíficos sin
              costo de tokens LLM.
            </p>
          </div>

          <div className="lp-pipeline-card">
            <div className="lp-card-step">03</div>
            <div className="lp-card-icon lp-card-icon--cpu">
              <CpuIcon size={24} />
            </div>
            <h3 className="lp-card-title">Agente IA Autónomo</h3>
            <p className="lp-card-desc">
              Razonamiento semántico contextual sobre el cuerpo: identifica coerción psicológica,
              pretexting y tácticas BEC.
            </p>
          </div>

          <div className="lp-pipeline-card">
            <div className="lp-card-step">04</div>
            <div className="lp-card-icon lp-card-icon--shield">
              <ShieldIcon size={24} />
            </div>
            <h3 className="lp-card-title">Veredicto y Recomendaciones</h3>
            <p className="lp-card-desc">
              Puntuación de 0 a 100, veredicto forense estandarizado, lista de evidencias técnicas y
              guía paso a paso de mitigación.
            </p>
          </div>
        </div>
      </section>

      {/* 4. Capacidades Clave del Sistema */}
      <section className="lp-capabilities-section" aria-label="Capacidades del sistema">
        <div className="lp-capabilities-grid">
          <div className="lp-capability-box">
            <div className="lp-capability-icon lp-capability-icon--zap">
              <ZapIcon size={26} />
            </div>
            <h3 className="lp-capability-title">Ahorro y Eficiencia de LLM</h3>
            <p className="lp-capability-desc">
              Más del 60 % de las solicitudes rutinarias se resuelven mediante reglas heurísticas
              estáticas, reduciendo costes y tiempos de respuesta drásticamente.
            </p>
          </div>

          <div className="lp-capability-box">
            <div className="lp-capability-icon lp-capability-icon--cpu">
              <CpuIcon size={26} />
            </div>
            <h3 className="lp-capability-title">IA Explicable y Transparente</h3>
            <p className="lp-capability-desc">
              Cada dictamen incluye la justificación textual del agente y los indicadores
              específicos que motivaron el veredicto, sin cajas negras.
            </p>
          </div>

          <div className="lp-capability-box">
            <div className="lp-capability-icon lp-capability-icon--lock">
              <LockIcon size={26} />
            </div>
            <h3 className="lp-capability-title">Modo Demo / Producción Instantáneo</h3>
            <p className="lp-capability-desc">
              Alterne con un solo clic entre un servidor simulado en memoria y una API de producción
              en vivo sin necesidad de recargar la aplicación.
            </p>
          </div>
        </div>
      </section>

      {/* 5. Banner de Cierre / Conversión */}
      <section className="lp-cta-banner">
        <div className="lp-cta-banner__inner">
          <h2 className="lp-cta-banner__title">
            Comience a proteger su organización contra ataques de ingeniería social
          </h2>
          <p className="lp-cta-banner__desc">
            Explore la telemetría en el tablero de control o cargue una muestra sospechosa para un
            diagnóstico instantáneo.
          </p>
          <div className="lp-cta-banner__actions">
            <Link to={routes.dashboard} className="btn btn--lp-primary">
              <BarChartIcon size={20} />
              <span>Explorar el Tablero de Detección</span>
            </Link>
            <Link to={routes.analyze} className="btn btn--lp-outline-white">
              <ShieldIcon size={18} />
              <span>Analizar un Correo Sospechoso</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
