import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ErrorBoundary } from './ErrorBoundary';

function ProblematicComponent({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) {
    throw new Error("TypeError: Cannot read properties of null (reading 'find')");
  }
  return <div>Componente sin problemas</div>;
}

describe('ErrorBoundary', () => {
  it('muestra el contenido hijo cuando no ocurre ningún error', () => {
    render(
      <ErrorBoundary>
        <ProblematicComponent shouldThrow={false} />
      </ErrorBoundary>,
    );

    expect(screen.getByText('Componente sin problemas')).toBeInTheDocument();
  });

  it('captura errores de renderizado y muestra la pantalla amigable sin pantalla en blanco', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <ErrorBoundary>
        <ProblematicComponent shouldThrow={true} />
      </ErrorBoundary>,
    );

    expect(
      screen.getByRole('heading', {
        name: /El backend no responde o la vista no pudo cargarse/i,
      }),
    ).toBeInTheDocument();

    expect(screen.getByTestId('error-boundary-retry')).toBeInTheDocument();
    expect(screen.getByTestId('error-boundary-demo')).toBeInTheDocument();

    consoleSpy.mockRestore();
  });
});
