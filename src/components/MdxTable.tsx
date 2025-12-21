import React, { type ReactElement, type ReactNode } from 'react';

interface MdxTableProps {
  head?: 'row' | 'column';
  className?: string;
  children?: ReactNode;
}

type ElementWithChildren = ReactElement<{ children?: ReactNode }>;

const hasChildrenProp = (props: unknown): props is { children?: ReactNode } =>
  typeof props === 'object' && props !== null && 'children' in props;

const isElementWithChildren = (node: ReactNode): node is ElementWithChildren =>
  React.isValidElement(node) && hasChildrenProp(node.props);

const isTableElement = (node: ReactNode): node is ElementWithChildren =>
  isElementWithChildren(node) && node.type === 'table';

const normalizeCells = (row: ElementWithChildren, rowIndex: number): ElementWithChildren => {
  const cells = React.Children.toArray(row.props.children);
  const normalized = cells.map((cell, cellIndex) => {
    if (React.isValidElement(cell) && cell.type === 'th') {
      const cellElement = cell as ElementWithChildren;
      return React.createElement('td', { key: cellIndex }, cellElement.props.children);
    }
    if (React.isValidElement(cell)) {
      return React.cloneElement(cell, { key: cellIndex });
    }
    return cell;
  });

  return React.cloneElement(row, { key: rowIndex }, normalized);
};

const extractRows = (section: ElementWithChildren): ElementWithChildren[] =>
  React.Children.toArray(section.props.children)
    .filter((child): child is ElementWithChildren => isElementWithChildren(child))
    .map((row, index) => normalizeCells(row, index));

const transformTableForColumnHead = (table: ElementWithChildren): ElementWithChildren => {
  const tableChildren = React.Children.toArray(table.props.children);
  const otherChildren: ReactNode[] = [];
  let theadRows: ElementWithChildren[] = [];
  let tbodyRows: ElementWithChildren[] = [];

  tableChildren.forEach((child) => {
    if (!React.isValidElement(child)) {
      otherChildren.push(child);
      return;
    }

    if (child.type === 'thead' && isElementWithChildren(child)) {
      theadRows = extractRows(child);
      return;
    }

    if (child.type === 'tbody' && isElementWithChildren(child)) {
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
