import { render, screen, within } from '@testing-library/react';
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
  it('muestra la cabecera global con los enlaces en orden y "Modo demo"', () => {
    renderAt('/');
    const nav = screen.getByRole('navigation', { name: 'Principal' });
    const links = within(nav)
      .getAllByRole('link')
      .map((a) => a.textContent);
    expect(links).toEqual(['Tablero', 'Analizar correo', 'Historial']);
    expect(screen.getByText('Modo demo')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Detector de Phishing' })).toHaveAttribute('href', '/');
  });

  it.each([
    ['/', 'Tablero de detección'],
    ['/analizar', 'Analizar un correo'],
    ['/historial', 'Historial de análisis'],
  ])('la ruta %s tiene un único h1 "%s"', (path, heading) => {
    renderAt(path);
    const h1s = screen.getAllByRole('heading', { level: 1 });
    expect(h1s).toHaveLength(1);
    expect(h1s[0]).toHaveTextContent(heading);
  });

  it('AC-ERR-01: una ruta no definida muestra G01 con los textos exactos', () => {
    renderAt('/no-existe');
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Página no encontrada');
    expect(
      screen.getByText('La dirección no existe o el análisis fue eliminado.'),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Ir al tablero' })).toHaveAttribute('href', '/');
  });

  it('AC-DET-05: un id inválido en /analisis/:id muestra G01', () => {
    renderAt('/analisis/abc');
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Página no encontrada');
  });
});
