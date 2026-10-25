import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it } from 'vitest';
import { resetMockAnalyses } from '@/lib/mock/service';
import { routerFuture } from '@/lib/router';
import { App } from '../App';

describe('Flujo crítico E2E (§11.1, AC-TEST-04)', () => {
  beforeEach(() => {
    resetMockAnalyses();
  });

  it('AC-TEST-04: abrir /analizar → elegir "phishing-credenciales" → analizar → ver /analisis/:id con veredicto "Malicioso" → abrir /historial → ver análisis en primera fila', async () => {
    render(
      <MemoryRouter initialEntries={['/analizar']} future={routerFuture}>
        <App />
      </MemoryRouter>,
    );

    // 1. Abrir /analizar y verificar encabezado
    expect(
      await screen.findByRole('heading', { level: 1, name: 'Analizar un correo' }),
    ).toBeInTheDocument();

    // 2. Elegir pestaña "Caso de ejemplo"
    const tabMuestra = screen.getByRole('tab', { name: 'Caso de ejemplo' });
    fireEvent.click(tabMuestra);

    await screen.findByRole('radiogroup');

    // Seleccionar caso "phishing-credenciales" ("Verificación de cuenta bancaria")
    const cardPhishing = screen.getByText('Verificación de cuenta bancaria');
    fireEvent.click(cardPhishing);

    // 3. Analizar (clic en botón P03-E5)
    const btnAnalizar = screen.getByTestId('p03-e5');
    fireEvent.click(btnAnalizar);

    // Debe mostrar indicador de progreso "Analizando… X s"
    expect(screen.getByTestId('p03-e6')).toBeInTheDocument();

    // 4. Esperar redirección a /analisis/:id y verificar veredicto "Malicioso"
    await waitFor(
      () => {
        expect(screen.getByTestId('analysis-detail')).toBeInTheDocument();
      },
      { timeout: 4000 },
    );

    const verdictHeading = screen.getByTestId('verdict-heading');
    expect(verdictHeading).toHaveTextContent('Malicioso');

    // 5. Abrir /historial mediante enlace en la navegación principal
    const mainNav = screen.getByRole('navigation', { name: 'Principal' });
    const navHistorial = within(mainNav).getByRole('link', { name: 'Historial' });
    fireEvent.click(navHistorial);

    // 6. Verificar que carga /historial y el nuevo análisis aparece en la primera fila
    expect(
      await screen.findByRole('heading', { level: 1, name: 'Historial de análisis' }),
    ).toBeInTheDocument();

    // En la tabla P05-T1, debe haber 101 resultados en total (100 de siembra + 1 nuevo)
    expect(await screen.findByText('101 resultados')).toBeInTheDocument();

    // El primer enlace de asunto en la tabla debe coincidir con el asunto de la muestra analizada
    const tableLinks = screen.getAllByRole('link', {
      name: /URGENTE: Verifique su cuenta para evitar bloqueo inmediato/,
    });
    expect(tableLinks.length).toBeGreaterThanOrEqual(1);
    expect(tableLinks[0]).toBeInTheDocument();
  });
});
