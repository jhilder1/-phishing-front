import { Component, type ErrorInfo, type ReactNode } from 'react';
import { RefreshIcon, WarningIcon } from './Icons';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error Boundary global para capturar excepciones en tiempo de renderizado
 * y evitar pantallas en blanco, mostrando una vista accesible y descriptiva.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // eslint-disable-next-line no-console
    console.error('ErrorBoundary capturó una excepción:', error, errorInfo);
  }

  handleReset = (): void => {
    this.setState({ hasError: false, error: null });
  };

  handleEnableDemo = (): void => {
    const url = new URL(window.location.href);
    url.searchParams.set('demo', 'true');
    window.location.href = url.toString();
  };

  handleGoHome = (): void => {
    window.location.href = '/';
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="error-boundary-screen" role="alert" aria-live="assertive">
          <div className="error-boundary-card">
            <div className="error-boundary-card__icon-wrap">
              <WarningIcon size={44} className="error-boundary-card__icon" />
            </div>

            <h1 className="error-boundary-card__title">
              El backend no responde o la vista no pudo cargarse
            </h1>

            <p className="error-boundary-card__text">
              No se pudo comunicar con el servidor o procesar la información del correo. Si el
              backend en producción se encuentra temporalmente inactivo, puede continuar explorando
              la aplicación con el Modo Demo.
            </p>

            {this.state.error && (
              <details className="error-boundary-details">
                <summary>Detalles del error técnico</summary>
                <code>{this.state.error.message}</code>
              </details>
            )}

            <div className="error-boundary-actions">
              <button
                type="button"
                onClick={this.handleReset}
                className="btn btn--primary"
                data-testid="error-boundary-retry"
              >
                <RefreshIcon size={16} />
                <span>Reintentar</span>
              </button>

              <button
                type="button"
                onClick={this.handleEnableDemo}
                className="btn btn--outline"
                data-testid="error-boundary-demo"
              >
                <span>Activar Modo Demo</span>
              </button>

              <button type="button" onClick={this.handleGoHome} className="btn btn--secondary">
                <span>Ir al inicio</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
