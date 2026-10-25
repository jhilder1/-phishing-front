import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { KpiCard } from './KpiCard';

describe('KpiCard (§4.1 P02-K1 a K4)', () => {
  it('renderiza la etiqueta exacta, el valor y el subtexto', () => {
    render(<KpiCard label="Correos analizados" value="100" subtext="Últimos 30 días" />);

    expect(
      screen.getByRole('heading', { level: 2, name: 'Correos analizados' }),
    ).toBeInTheDocument();
    expect(screen.getByText('100')).toBeInTheDocument();
    expect(screen.getByText('Últimos 30 días')).toBeInTheDocument();
  });

  it('muestra el estado esqueleto cuando loading es true', () => {
    const { container } = render(<KpiCard label="Correos analizados" value="100" loading />);

    expect(container.querySelector('.skeleton')).toBeInTheDocument();
  });
});
