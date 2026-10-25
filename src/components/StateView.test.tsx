import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { EmptyState, ErrorState, LoadingState } from './StateView';

describe('StateView components (§4.1, §4.4)', () => {
  it('LoadingState expone role="status" y muestra el mensaje de carga', () => {
    render(<LoadingState message="Cargando análisis…" />);
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByText('Cargando análisis…')).toBeInTheDocument();
  });

  it('EmptyState renderiza el mensaje de estado vacío y acción opcional', () => {
    render(<EmptyState message="Aún no hay análisis." action={<button>Analizar</button>} />);
    expect(screen.getByText('Aún no hay análisis.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Analizar' })).toBeInTheDocument();
  });

  it('ErrorState expone role="alert" y ejecuta onRetry al hacer clic', () => {
    const handleRetry = vi.fn();
    render(<ErrorState message="No se pudo cargar el tablero." onRetry={handleRetry} />);

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('No se pudo cargar el tablero.')).toBeInTheDocument();

    const retryBtn = screen.getByRole('button', { name: 'Reintentar' });
    fireEvent.click(retryBtn);
    expect(handleRetry).toHaveBeenCalledTimes(1);
  });
});
