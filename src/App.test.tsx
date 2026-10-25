import { fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { App } from './App';
import { routerFuture } from './lib/router';

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]} future={routerFuture}>
      <App />
    </MemoryRouter>,
  );
}

describe('Enrutamiento (§4.0)', () => {
  it('muestra la cabecera global con los enlaces en orden y "Modo demo"', async () => {
    renderAt('/');
    const nav = screen.getByRole('navigation', { name: 'Principal' });
    const links = within(nav)
      .getAllByRole('link')
      .map((a) => a.textContent);
    expect(links).toEqual(['Inicio', 'Tablero', 'Analizar correo', 'Historial']);
    expect(screen.getByText('Modo demo')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Detector de Phishing' })).toHaveAttribute('href', '/');
    await screen.findByRole('heading', {
      level: 2,
      name: /Cómo analiza el sistema un correo sospechoso/i,
    });
  });

  it.each([
    ['/', 'Detección Inteligente de Phishing con Agentes IA y Triaje Heurístico'],
    ['/tablero', 'Tablero de detección'],
    ['/analizar', 'Analizar un correo'],
    ['/historial', 'Historial de análisis'],
  ])('la ruta %s tiene un único h1 "%s"', async (path, heading) => {
    renderAt(path);
    const h1s = await screen.findAllByRole('heading', { level: 1 });
    expect(h1s).toHaveLength(1);
    expect(h1s[0]).toHaveTextContent(heading);
  });

  it('AC-ERR-01: una ruta no definida muestra G01 con los textos exactos', () => {
    renderAt('/no-existe');
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Página no encontrada');
    expect(
      screen.getByText('La dirección no existe o el análisis fue eliminado.'),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Ir al tablero' })).toHaveAttribute('href', '/tablero');
  });

  it('AC-DET-05: un id inválido en /analisis/:id muestra G01', () => {
    renderAt('/analisis/abc');
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Página no encontrada');
  });

  it('permite alternar entre Modo demo y Producción desde el interruptor de la cabecera', () => {
    renderAt('/no-existe');
    const modeSwitch = screen.getByRole('button', { name: /Modo actual:/i });
    expect(modeSwitch).toHaveTextContent('Modo demo');

    fireEvent.click(modeSwitch);
    expect(modeSwitch).toHaveTextContent('Producción');

    fireEvent.click(modeSwitch);
    expect(modeSwitch).toHaveTextContent('Modo demo');
  });
});
