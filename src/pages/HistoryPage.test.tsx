import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import * as api from '@/lib/api';
import { routerFuture } from '@/lib/router';
import { HistoryPage } from './HistoryPage';

function renderHistory(initialEntries = ['/historial']) {
  return render(
    <MemoryRouter initialEntries={initialEntries} future={routerFuture}>
      <Routes>
        <Route path="/historial" element={<HistoryPage />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('P05 · Historial de análisis (§4.4)', () => {
  it('AC-HIST-01: muestra 20 filas por página y las columnas en orden', async () => {
    renderHistory();

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { level: 1, name: 'Historial de análisis' }),
      ).toBeInTheDocument();
    });

    // Columnas obligatorias: Fecha, Asunto, Remitente, Veredicto, Score
    expect(screen.getByRole('columnheader', { name: 'Fecha' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Asunto' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Remitente' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Veredicto' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Score' })).toBeInTheDocument();

    // 20 filas en la primera página
    const detailLinks = screen.getAllByRole('link', { name: /Revisión de seguridad/ });
    expect(detailLinks).toHaveLength(20);

    // Contador P05-E3
    expect(screen.getByText('100 resultados')).toBeInTheDocument();

    // Paginador P05-E4
    expect(screen.getByTestId('pagination-info')).toHaveTextContent('Página 1 de 5');
    expect(screen.getByTestId('pagination-prev')).toBeDisabled();
    expect(screen.getByTestId('pagination-next')).not.toBeDisabled();
  });

  it('AC-HIST-02 y AC-HIST-03: filtrar por veredicto y reiniciar página a 1', async () => {
    renderHistory(['/historial?pagina=3']);

    await waitFor(() => {
      expect(screen.getByTestId('pagination-info')).toHaveTextContent('Página 3 de 5');
    });

    const filterMalicioso = screen.getByTestId('filter-malicioso');
    const filterSospechoso = screen.getByTestId('filter-sospechoso');

    // Desmarcar Malicioso y Sospechoso para dejar solo Sin indicadores
    fireEvent.click(filterMalicioso);
    fireEvent.click(filterSospechoso);

    // AC-HIST-03: Debe reiniciar página a 1
    await waitFor(() => {
      expect(screen.getByTestId('pagination-info')).toHaveTextContent('Página 1 de 3');
      expect(screen.getByText('55 resultados')).toBeInTheDocument();
    });
  });

  it('AC-HIST-04: muestra estado vacío cuando no hay resultados', async () => {
    vi.spyOn(api, 'listAnalyses').mockResolvedValueOnce({
      items: [],
      total: 0,
      pagina: 1,
      limite: 20,
      paginas: 1,
    });

    renderHistory();

    await waitFor(() => {
      expect(screen.getByText('No hay análisis con estos filtros.')).toBeInTheDocument();
    });
  });

  it('AC-HIST-04: muestra estado de error con botón Reintentar', async () => {
    vi.spyOn(api, 'listAnalyses').mockRejectedValueOnce(new Error('Network error'));

    renderHistory();

    await waitFor(() => {
      expect(screen.getByText('No se pudo cargar el historial.')).toBeInTheDocument();
    });

    expect(screen.getByRole('button', { name: 'Reintentar' })).toBeInTheDocument();
  });

  it('permite navegar a la siguiente página mediante el paginador', async () => {
    renderHistory();

    await waitFor(() => {
      expect(screen.getByTestId('pagination-next')).not.toBeDisabled();
    });

    fireEvent.click(screen.getByTestId('pagination-next'));

    await waitFor(() => {
      expect(screen.getByTestId('pagination-info')).toHaveTextContent('Página 2 de 5');
    });
  });
});
