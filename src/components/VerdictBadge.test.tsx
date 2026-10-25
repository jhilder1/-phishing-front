import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { VerdictBadge } from './VerdictBadge';

describe('VerdictBadge (§10.1, AC-A11Y-03)', () => {
  it('muestra texto e icono obligatorios para "malicioso"', () => {
    const { container } = render(<VerdictBadge veredicto="malicioso" />);
    expect(screen.getByText('Malicioso')).toBeInTheDocument();
    expect(container.querySelector('svg')).toBeInTheDocument();
    expect(container.firstChild).toHaveClass('verdict-badge--malicious');
  });

  it('muestra texto e icono obligatorios para "sospechoso"', () => {
    const { container } = render(<VerdictBadge veredicto="sospechoso" />);
    expect(screen.getByText('Sospechoso')).toBeInTheDocument();
    expect(container.querySelector('svg')).toBeInTheDocument();
    expect(container.firstChild).toHaveClass('verdict-badge--suspicious');
  });

  it('muestra texto e icono obligatorios para "sin_indicadores" y nunca dice "Seguro"', () => {
    const { container } = render(<VerdictBadge veredicto="sin_indicadores" />);
    expect(screen.getByText('Sin indicadores')).toBeInTheDocument();
    expect(screen.queryByText(/seguro/i)).not.toBeInTheDocument();
    expect(container.querySelector('svg')).toBeInTheDocument();
    expect(container.firstChild).toHaveClass('verdict-badge--clean');
  });
});
