import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import * as api from '@/lib/api';
import { ApiError } from '@/lib/errors';
import { routerFuture } from '@/lib/router';
import { AnalyzePage } from './AnalyzePage';

describe('AnalyzePage con backend no disponible', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('no se queda en blanco ante fallo del backend en getSamples y muestra alerta descriptiva', async () => {
    // Simular que getSamples falla porque el backend está caído
    vi.spyOn(api, 'getSamples').mockRejectedValueOnce(
      new ApiError(503, 'BACKEND_NO_DISPONIBLE', 'El backend no responde.'),
    );

    render(
      <MemoryRouter initialEntries={['/analizar']} future={routerFuture}>
        <AnalyzePage />
      </MemoryRouter>,
    );

    // Debe renderizar la cabecera sin pantalla en blanco
    expect(
      await screen.findByRole('heading', { level: 1, name: 'Analizar un correo' }),
    ).toBeInTheDocument();

    // Cambiar a la pestaña de Caso de ejemplo
    const tabMuestra = screen.getByRole('tab', { name: 'Caso de ejemplo' });
    fireEvent.click(tabMuestra);

    // Debe mostrar la alerta de que el backend no responde
    await waitFor(() => {
      expect(screen.getByTestId('backend-offline-banner')).toBeInTheDocument();
      expect(screen.getByText('El backend no responde')).toBeInTheDocument();
    });
  });

  it('muestra mensaje claro cuando el backend no responde al enviar análisis en modo pegar', async () => {
    vi.spyOn(api, 'getSamples').mockResolvedValue([]);
    vi.spyOn(api, 'createAnalysis').mockRejectedValueOnce(
      new ApiError(503, 'BACKEND_NO_DISPONIBLE', 'El backend no responde.'),
    );

    render(
      <MemoryRouter initialEntries={['/analizar']} future={routerFuture}>
        <AnalyzePage />
      </MemoryRouter>,
    );

    const remitente = await screen.findByLabelText(/Remitente/);
    const asunto = screen.getByLabelText(/Asunto/);
    const cuerpo = screen.getByLabelText(/Cuerpo/);

    fireEvent.change(remitente, { target: { value: 'usuario@empresa.com' } });
    fireEvent.change(asunto, { target: { value: 'Factura vencida' } });
    fireEvent.change(cuerpo, {
      target: { value: 'Por favor revise su cuenta bancaria de inmediato.' },
    });

    const btnSubmit = screen.getByTestId('p03-e5');
    expect(btnSubmit).not.toBeDisabled();
    fireEvent.click(btnSubmit);

    // Debe mostrar el error descriptivo en pantalla con botón de reintento
    await waitFor(() => {
      expect(screen.getByTestId('analyze-error')).toBeInTheDocument();
      expect(screen.getByText(/El backend no responde/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Reintentar/i })).toBeInTheDocument();
    });
  });
});
