import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ScoreMeter } from './ScoreMeter';

describe('ScoreMeter (§4.3 P04-E3, AC-DET-03)', () => {
  it('expone role="meter" con aria-valuenow igual al score, min=0 y max=100', () => {
    render(<ScoreMeter score={82} />);
    const meter = screen.getByRole('meter');

    expect(meter).toHaveAttribute('aria-valuenow', '82');
    expect(meter).toHaveAttribute('aria-valuemin', '0');
    expect(meter).toHaveAttribute('aria-valuemax', '100');
    expect(screen.getByText('82')).toBeInTheDocument();
  });

  it('AC-DET-03: DEBE tener marcas en 30 y 75', () => {
    render(<ScoreMeter score={50} />);

    const mark30 = screen.getByTestId('score-mark-30');
    const mark75 = screen.getByTestId('score-mark-75');

    expect(mark30).toBeInTheDocument();
    expect(mark30).toHaveTextContent('30');

    expect(mark75).toBeInTheDocument();
    expect(mark75).toHaveTextContent('75');
  });

  it('limita el score entre 0 y 100', () => {
    const { rerender } = render(<ScoreMeter score={-10} />);
    expect(screen.getByRole('meter')).toHaveAttribute('aria-valuenow', '0');

    rerender(<ScoreMeter score={120} />);
    expect(screen.getByRole('meter')).toHaveAttribute('aria-valuenow', '100');
  });
});
