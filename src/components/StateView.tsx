import type { ReactNode } from 'react';
import { RefreshIcon, SpinnerIcon } from './Icons';

interface LoadingStateProps {
  message?: string;
  className?: string;
}

export function LoadingState({ message = 'Cargando…', className = '' }: LoadingStateProps) {
  return (
    <div
      className={`state-view state-view--loading ${className}`.trim()}
      role="status"
      aria-live="polite"
    >
      <SpinnerIcon size={32} className="state-view__spinner" />
      <p className="state-view__message">{message}</p>
    </div>
  );
}

interface EmptyStateProps {
  message: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({ message, action, className = '' }: EmptyStateProps) {
  return (
    <div className={`state-view state-view--empty ${className}`.trim()}>
      <p className="state-view__message">{message}</p>
      {action && <div className="state-view__action">{action}</div>}
    </div>
  );
}

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({ message, onRetry, className = '' }: ErrorStateProps) {
  return (
    <div
      className={`state-view state-view--error ${className}`.trim()}
      role="alert"
      aria-live="assertive"
    >
      <p className="state-view__message">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="btn btn--outline"
          data-testid="retry-button"
        >
          <RefreshIcon size={16} />
          <span>Reintentar</span>
        </button>
      )}
    </div>
  );
}
