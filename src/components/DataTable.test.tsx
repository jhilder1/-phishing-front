import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { DataTable } from './DataTable';

interface TestItem {
  id: string;
  name: string;
  val: number;
}

const COLUMNS = [
  { key: 'name', header: 'Nombre', render: (item: TestItem) => item.name },
  { key: 'val', header: 'Valor', render: (item: TestItem) => String(item.val) },
];

const DATA: TestItem[] = [
  { id: '1', name: 'Item 1', val: 10 },
  { id: '2', name: 'Item 2', val: 20 },
];

describe('DataTable (AC-DASH-06, AC-HIST-05)', () => {
  it('renderiza encabezados y filas dentro del contenedor desplazable', () => {
    const { container } = render(
      <DataTable
        columns={COLUMNS}
        data={DATA}
        keyExtractor={(item) => item.id}
        caption="Tabla de prueba"
      />,
    );

    expect(container.querySelector('.table-responsive-wrapper')).toBeInTheDocument();
    expect(screen.getByText('Tabla de prueba')).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Nombre' })).toBeInTheDocument();
    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText('Item 2')).toBeInTheDocument();
  });

  it('muestra mensaje vacío cuando data está vacía', () => {
    render(
      <DataTable
        columns={COLUMNS}
        data={[]}
        keyExtractor={(item) => item.id}
        emptyMessage="Sin elementos disponibles."
      />,
    );

    expect(screen.getByText('Sin elementos disponibles.')).toBeInTheDocument();
  });
});
