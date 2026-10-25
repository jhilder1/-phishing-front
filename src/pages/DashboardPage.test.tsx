import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import * as api from '@/lib/api';
import { routerFuture } from '@/lib/router';
import { DashboardPage } from './DashboardPage';

function renderDashboard() {
  return render(
    <MemoryRouter future={routerFuture}>
      <DashboardPage />
    </MemoryRouter>,
  );
}

describe('P02 · Tablero (§4.1)', () => {
  it('AC-DASH-01 y AC-DASH-02: muestra los 4 KPI con etiquetas exactas y valores de siembra', async () => {
    renderDashboard();

    // Esperar a que cargue el estado de éxito
    await screen.findByRole('heading', { level: 2, name: 'Correos analizados' });

    expect(screen.getByText('Últimos 30 días')).toBeInTheDocument();

    // AC-DASH-01: 4 etiquetas exactas
    expect(
      screen.getByRole('heading', { level: 2, name: 'Correos analizados' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 2, name: 'Maliciosos detectados' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: 'Resueltos sin IA' })).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 2, name: 'Tiempo medio de respuesta' }),
    ).toBeInTheDocument();

    // AC-DASH-02: Valores según siembra (100 total, 30 maliciosos -> 30,0 % del total, 60,0 % sin IA)
    expect(screen.getByText('100')).toBeInTheDocument();
    expect(screen.getByText('30')).toBeInTheDocument();
    expect(screen.getByText(/30[.,]0\s*%\s*del total/)).toBeInTheDocument();
    expect(screen.getByText(/60[.,]0\s*%/)).toBeInTheDocument();
    expect(screen.getByText('Ahorro de llamadas al modelo')).toBeInTheDocument();
  });

  it('AC-DASH-04: muestra los 10 análisis más recientes y cada fila enlaza al detalle', async () => {
    renderDashboard();

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { level: 2, name: 'Análisis recientes' }),
      ).toBeInTheDocument();
    });

    // Enlaces de la tabla apuntando a /analisis/:id
    const detailLinks = screen.getAllByRole('link', { name: /Revisión de seguridad/ });
    expect(detailLinks).toHaveLength(10);
    expect(detailLinks[0]?.getAttribute('href')).toMatch(/^\/analisis\/[a-f0-9]{24}$/);

    // Enlaces de navegación P02-B1 y P02-B2
    expect(screen.getByTestId('p02-b1')).toHaveAttribute('href', '/analizar');
    expect(screen.getByTestId('p02-b2')).toHaveAttribute('href', '/historial');
  });

  it('AC-DASH-05: maneja estado de error con botón Reintentar', async () => {
    vi.spyOn(api, 'getMetricsSummary').mockRejectedValueOnce(new Error('Network error'));
    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText('No se pudo cargar el tablero.')).toBeInTheDocument();
    });

    expect(screen.getByRole('button', { name: 'Reintentar' })).toBeInTheDocument();
  });

  it('AC-DASH-05: maneja estado vacío (total = 0)', async () => {
    vi.spyOn(api, 'getMetricsSummary').mockResolvedValueOnce({
      desde: '2026-09-22',
      hasta: '2026-10-21',
      total: 0,
      por_veredicto: { malicioso: 0, sospechoso: 0, sin_indicadores: 0 },
      pct_sin_llm: 0,
      duracion_media_ms: 0,
      por_dia: [],
      top_indicadores: [],
    });
    vi.spyOn(api, 'listAnalyses').mockResolvedValueOnce({
      items: [],
      total: 0,
      pagina: 1,
      limite: 10,
      paginas: 1,
    });

    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText('Aún no hay análisis.')).toBeInTheDocument();
    });

    expect(screen.getByRole('link', { name: 'Analizar un correo' })).toHaveAttribute(
      'href',
      '/analizar',
    );
  });
});
