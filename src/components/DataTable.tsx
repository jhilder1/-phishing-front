import type { ReactNode, TableHTMLAttributes } from 'react';

interface Column<T> {
  key: string;
  header: string;
  className?: string;
  render: (item: T) => ReactNode;
}

interface DataTableProps<T> extends TableHTMLAttributes<HTMLTableElement> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (item: T) => string;
  caption?: string;
  emptyMessage?: string;
  className?: string;
}

/**
 * Tabla accesible con contenedor desplazable horizontalmente.
 * Garantiza cumplimiento de AC-DASH-06 y AC-HIST-05 (sin scroll en la página a 360, 768 y 1280px).
 */
export function DataTable<T>({
  columns,
  data,
  keyExtractor,
  caption,
  emptyMessage = 'No hay datos para mostrar.',
  className = '',
  ...props
}: DataTableProps<T>) {
  return (
    <div
      className="table-responsive-wrapper"
      tabIndex={0}
      role="region"
      aria-label="Tabla de datos"
    >
      <table className={`data-table ${className}`.trim()} {...props}>
        {caption && <caption className="data-table__caption">{caption}</caption>}
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key} scope="col" className={col.className}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="data-table__empty">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((item) => (
              <tr key={keyExtractor(item)}>
                {columns.map((col) => (
                  <td key={col.key} className={col.className}>
                    {col.render(item)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
