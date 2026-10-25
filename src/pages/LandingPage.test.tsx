import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { routerFuture } from '@/lib/router';
import { LandingPage } from './LandingPage';

describe('LandingPage · Página de Entrada', () => {
  it('muestra el hero con título principal h1 y botones de navegación', () => {
    render(
      <MemoryRouter future={routerFuture}>
        <LandingPage />
      </MemoryRouter>,
    );

    expect(
      screen.getByRole('heading', {
        level: 1,
        name: 'Detección Inteligente de Phishing con Agentes IA y Triaje Heurístico',
      }),
    ).toBeInTheDocument();

    expect(screen.getByRole('link', { name: /Acceder al Tablero/i })).toHaveAttribute(
      'href',
      '/tablero',
    );
    expect(screen.getByRole('link', { name: /Analizar un correo ahora/i })).toHaveAttribute(
      'href',
      '/analizar',
    );
    expect(screen.getByRole('link', { name: /Ver historial de incidentes/i })).toHaveAttribute(
      'href',
      '/historial',
    );
  });

  it('muestra la demostración forense y las 4 fases de la arquitectura', () => {
    render(
      <MemoryRouter future={routerFuture}>
        <LandingPage />
      </MemoryRouter>,
    );

    expect(screen.getByText('DEMOSTRACIÓN FORENSE')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 2, name: 'Pipeline Forense en Cuatro Fases' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Triaje Heurístico (<50ms)')).toBeInTheDocument();
  });
});
