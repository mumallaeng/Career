import React, { type ReactElement, type ReactNode } from 'react';

interface MdxTableProps {
  head?: 'row' | 'column';
  className?: string;
  children?: ReactNode;
}

const isTableElement = (node: ReactNode): node is ReactElement =>
  React.isValidElement(node) && node.type === 'table';

const normalizeCells = (row: ReactElement, rowIndex: number): ReactElement => {
  const cells = React.Children.toArray(row.props.children);
  const normalized = cells.map((cell, cellIndex) => {
    if (React.isValidElement(cell) && cell.type === 'th') {
      return React.createElement('td', { ...cell.props, key: cellIndex }, cell.props.children);
    }
    if (React.isValidElement(cell)) {
      return React.cloneElement(cell, { key: cellIndex });
    }
    return cell;
  });

  return React.cloneElement(row, { key: rowIndex }, normalized);
};

const extractRows = (section: ReactElement): ReactElement[] =>
  React.Children.toArray(section.props.children)
    .filter((child): child is ReactElement => React.isValidElement(child))
    .map((row, index) => normalizeCells(row, index));

const transformTableForColumnHead = (table: ReactElement): ReactElement => {
  const tableChildren = React.Children.toArray(table.props.children);
  const otherChildren: ReactNode[] = [];
  let theadRows: ReactElement[] = [];
  let tbodyRows: ReactElement[] = [];

  tableChildren.forEach((child) => {
    if (!React.isValidElement(child)) {
      otherChildren.push(child);
      return;
    }

    if (child.type === 'thead') {
      theadRows = extractRows(child);
      return;
    }

    if (child.type === 'tbody') {
      tbodyRows = extractRows(child);
      return;
    }

    otherChildren.push(child);
  });

  const mergedRows = [...theadRows, ...tbodyRows];
  const tbodyElement = React.createElement('tbody', null, mergedRows);

  return React.cloneElement(table, undefined, [...otherChildren, tbodyElement]);
};

export default function MdxTable({ head = 'row', className = '', children }: MdxTableProps) {
  const headClass = head === 'column' ? 'mdx-table--column-head' : 'mdx-table--row-head';
  const resolvedChildren = head === 'column'
    ? React.Children.map(children, (child) => (isTableElement(child) ? transformTableForColumnHead(child) : child))
    : children;

  return (
    <div className={`mdx-table ${headClass} ${className}`.trim()}>
      {resolvedChildren}
    </div>
  );
}
