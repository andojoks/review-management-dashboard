import type { ReactNode } from 'react';
import { Icon } from './Icon';

export interface SortState {
  key: string;
  direction: number;
}

export interface DataTableColumn<T> {
  key: string;
  header: ReactNode;
  className?: string;
  headerClassName?: string;
  cellClassName?: string;
  sortKey?: string;
  sortable?: boolean;
  right?: boolean;
  render: (row: T, index: number) => ReactNode;
}

export interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  rows: T[];
  rowKey: (row: T, index: number) => string;
  rowClassName?: (row: T, index: number) => string | undefined;
  className?: string;
  ariaLabel?: string;
  sort?: SortState;
  onSort?: (key: string) => void;
  onRowClick?: (row: T) => void;
  empty?: ReactNode;
}

/** Source-style table primitive with optional sortable headers and row actions. */
export function DataTable<T>({
  columns,
  rows,
  rowKey,
  rowClassName,
  className = '',
  ariaLabel,
  sort,
  onSort,
  onRowClick,
  empty,
}: DataTableProps<T>) {
  return (
    <div className="table-wrap">
      <table className={`table${className ? ` ${className}` : ''}`} aria-label={ariaLabel}>
        <thead>
          <tr>
            {columns.map((column) => {
              const key = column.sortKey ?? column.key;
              const active = sort?.key === key;
              return (
                <th
                  key={column.key}
                  className={column.headerClassName ?? (column.right ? 'r' : column.cellClassName)}
                  aria-sort={active ? (sort?.direction === 1 ? 'ascending' : 'descending') : undefined}
                >
                  {column.sortable && onSort ? (
                    <button type="button" aria-pressed={active} onClick={() => onSort(key)}>
                      {column.header}
                      <Icon name={active && sort?.direction === 1 ? 'arrow' : 'sort'} size={12} />
                    </button>
                  ) : column.header}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr
              className={[onRowClick ? 'is-click' : '', rowClassName?.(row, index) ?? ''].filter(Boolean).join(' ') || undefined}
              key={rowKey(row, index)}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
            >
              {columns.map((column) => (
                <td key={column.key} className={column.className}>{column.render(row, index)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {!rows.length ? empty : null}
    </div>
  );
}
