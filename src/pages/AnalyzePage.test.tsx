import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { routerFuture } from '@/lib/router';
import { AnalyzePage } from './AnalyzePage';

function renderAnalyzePage(initialEntries = ['/analizar']) {
  return render(
    <MemoryRouter initialEntries={initialEntries} future={routerFuture}>
      <Routes>
        <Route path="/analizar" element={<AnalyzePage />} />
        <Route path="/analisis/:id" element={<div data-testid="detail-page">Detalle</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('P03 · Analizar correo (§4.2)', () => {
  it('AC-ANAL-01: muestra las 2 pestañas y conserva lo digitado al cambiar entre ellas', async () => {
    renderAnalyzePage();

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Analizar un correo' }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        'Pegue el contenido del correo o elija un caso de ejemplo. El análisis tarda hasta 60 segundos.',
      ),
    ).toBeInTheDocument();

    // Aviso de privacidad P03-E4
    expect(
      screen.getByText(
        'No ingrese datos reales de clientes. Los correos y números largos se enmascaran antes de guardarse.',
      ),
    ).toBeInTheDocument();

    const tabPegar = screen.getByRole('tab', { name: 'Pegar contenido' });
    const tabMuestra = screen.getByRole('tab', { name: 'Caso de ejemplo' });

    expect(tabPegar).toBeInTheDocument();
    expect(tabMuestra).toBeInTheDocument();

    // Escribir en modo pegar
    const remitenteInput = screen.getByLabelText(/Remitente/);
    fireEvent.change(remitenteInput, { target: { value: 'contacto@prueba.com' } });

    // Cambiar a pestaña muestra
    fireEvent.click(tabMuestra);
    await screen.findByRole('radiogroup');
    expect(screen.queryByLabelText(/Remitente/)).not.toBeInTheDocument();

    // Volver a pestaña pegar y comprobar que el valor se preservó
    fireEvent.click(tabPegar);
    expect(screen.getByLabelText(/Remitente/)).toHaveValue('contacto@prueba.com');
  });

  it('AC-ANAL-02: valida campos con mensajes exactos y botón Analizar deshabilitado ante errores', async () => {
    renderAnalyzePage();

    const btnAnalizar = await screen.findByTestId('p03-e5');
    // Inicialmente está deshabilitado porque los campos requeridos están vacíos
    expect(btnAnalizar).toBeDisabled();

    const remitente = screen.getByLabelText(/Remitente/);
    const asunto = screen.getByLabelText(/Asunto/);
    const cuerpo = screen.getByLabelText(/Cuerpo/);

    // Ingresar remitente inválido
    fireEvent.change(remitente, { target: { value: 'correo-invalido' } });
    fireEvent.blur(remitente);

    expect(
      screen.getByText('Ingrese un correo válido, por ejemplo nombre@dominio.com.'),
    ).toBeInTheDocument();

    // Rellenar valores válidos
    fireEvent.change(remitente, { target: { value: 'valido@empresa.com' } });
    fireEvent.change(asunto, { target: { value: 'Asunto de prueba' } });
    fireEvent.change(cuerpo, { target: { value: 'Cuerpo suficiente para validación' } });

    // Ahora debe estar habilitado
    expect(btnAnalizar).not.toBeDisabled();
  });

  it('AC-ANAL-03: en modo muestra permite seleccionar un caso y redirige a /analisis/:id', async () => {
    renderAnalyzePage();

    const tabMuestra = screen.getByRole('tab', { name: 'Caso de ejemplo' });
    fireEvent.click(tabMuestra);

    await waitFor(() => {
      expect(screen.getByRole('radiogroup')).toBeInTheDocument();
    });

    const btnAnalizar = screen.getByTestId('p03-e5');
    expect(btnAnalizar).not.toBeDisabled();

    // Seleccionar y enviar
    fireEvent.click(btnAnalizar);

    // Debe mostrar indicador de progreso P03-E6
    expect(screen.getByTestId('p03-e6')).toBeInTheDocument();
    expect(screen.getByText(/Analizando… \d+ s/)).toBeInTheDocument();

    // Debe redirigir exitosamente
    await waitFor(
      () => {
        expect(screen.getByTestId('detail-page')).toBeInTheDocument();
      },
      { timeout: 3000 },
    );
  });

  it('AC-ANAL-04: botón Cancelar detiene el análisis y conserva lo digitado', async () => {
    renderAnalyzePage();

    const remitente = screen.getByLabelText(/Remitente/);
    const asunto = screen.getByLabelText(/Asunto/);
    const cuerpo = screen.getByLabelText(/Cuerpo/);

    fireEvent.change(remitente, { target: { value: 'alerta@banco.com' } });
    fireEvent.change(asunto, { target: { value: 'Urgente: verificar clave' } });
    fireEvent.change(cuerpo, { target: { value: 'Texto del correo para cancelar' } });

    const btnAnalizar = screen.getByTestId('p03-e5');
    fireEvent.click(btnAnalizar);

    // Ver progreso y cancelar
    const btnCancelar = await screen.findByTestId('cancel-analysis');
    fireEvent.click(btnCancelar);

    // Debe mostrar aviso de cancelación y mantener lo digitado
    await waitFor(() => {
      expect(screen.getByText('Análisis cancelado por el usuario.')).toBeInTheDocument();
    });

    expect(screen.getByLabelText(/Remitente/)).toHaveValue('alerta@banco.com');
    expect(screen.getByLabelText(/Asunto/)).toHaveValue('Urgente: verificar clave');
    expect(screen.getByLabelText(/Cuerpo/)).toHaveValue('Texto del correo para cancelar');
  });
});
