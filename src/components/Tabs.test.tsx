import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { TabPanel, Tabs } from './Tabs';

const ITEMS = [
  { id: 'pegar', label: 'Pegar contenido' },
  { id: 'muestra', label: 'Caso de ejemplo' },
];

describe('Tabs (§4.2, AC-A11Y-01)', () => {
  it('renderiza role="tablist" y pestañas con atributos WAI-ARIA', () => {
    render(<Tabs items={ITEMS} activeId="pegar" onChange={() => {}} />);

    const tablist = screen.getByRole('tablist');
    expect(tablist).toBeInTheDocument();

    const tabs = screen.getAllByRole('tab');
    expect(tabs).toHaveLength(2);
    expect(tabs[0]).toHaveAttribute('aria-selected', 'true');
    expect(tabs[1]).toHaveAttribute('aria-selected', 'false');
  });

  it('permite cambiar de pestaña mediante teclado con las flechas', () => {
    const handleChange = vi.fn();
    render(<Tabs items={ITEMS} activeId="pegar" onChange={handleChange} />);

    const firstTab = screen.getByRole('tab', { name: 'Pegar contenido' });
    firstTab.focus();

    fireEvent.keyDown(firstTab, { key: 'ArrowRight' });
    expect(handleChange).toHaveBeenCalledWith('muestra');
  });

  it('renderiza el contenido correspondiente en TabPanel', () => {
    render(
      <div>
        <TabPanel id="pegar" activeId="pegar">
          <p>Contenido pegar</p>
        </TabPanel>
        <TabPanel id="muestra" activeId="pegar">
          <p>Contenido muestra</p>
        </TabPanel>
      </div>,
    );

    expect(screen.getByText('Contenido pegar')).toBeInTheDocument();
    expect(screen.queryByText('Contenido muestra')).not.toBeInTheDocument();
  });
});
