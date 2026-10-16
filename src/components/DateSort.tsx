'use client';

import React, { useState, type ElementType, type ReactElement, type ReactNode } from 'react';

type SortOrder = 'desc' | 'asc';

interface DateSortProps {
  tbodyType?: ElementType;
  children?: ReactNode;
}

interface DateSortItemProps {
  date: string;
  children?: ReactNode;
}

type ElementWithChildren = ReactElement<{ children?: ReactNode }>;

const DATE_PATTERN = /(\d{4})[.-](\d{2})[.-](\d{2})/;

const isElementWithChildren = (node: ReactNode): node is ElementWithChildren =>
  React.isValidElement(node) && typeof node.props === 'object' && node.props !== null && 'children' in node.props;

const textOf = (node: ReactNode): string => {
  if (typeof node === 'string' || typeof node === 'number') {
    return String(node);
  }
  if (Array.isArray(node)) {
    return node.map(textOf).join(' ');
  }
  if (isElementWithChildren(node)) {
    return textOf(node.props.children);
  }
  return '';
};

const dateKey = (value: string): number | null => {
  const match = DATE_PATTERN.exec(value);
  return match ? Number(`${match[1]}${match[2]}${match[3]}`) : null;
};

const compareKeys = (a: number | null, b: number | null, order: SortOrder): number => {
  if (a === null || b === null) {
    return a === b ? 0 : a === null ? 1 : -1;
  }
  return order === 'desc' ? b - a : a - b;
};

export function DateSortItem({ children }: DateSortItemProps) {
  return <div className="date-sort-item">{children}</div>;
}

const isDateSortItem = (node: ReactNode): node is ReactElement<DateSortItemProps> =>
  React.isValidElement(node) && node.type === DateSortItem;

const sortRows = (node: ReactNode, tbodyType: ElementType | undefined, order: SortOrder): ReactNode => {
  if (!isElementWithChildren(node) || isDateSortItem(node)) {
    return node;
  }
  const children = React.Children.toArray(node.props.children);
  if (node.type === 'tbody' || node.type === tbodyType) {
    const rows = [...children].sort((a, b) => compareKeys(dateKey(textOf(a)), dateKey(textOf(b)), order));
    return React.cloneElement(node, undefined, rows);
  }
  if (children.length === 0) {
    return node;
  }
  return React.cloneElement(node, undefined, children.map((child) => sortRows(child, tbodyType, order)));
};

export default function DateSort({ tbodyType, children }: DateSortProps) {
  const [order, setOrder] = useState<SortOrder>('desc');
  const nodes = React.Children.toArray(children);
  const items = nodes
    .filter(isDateSortItem)
    .sort((a, b) => compareKeys(dateKey(a.props.date), dateKey(b.props.date), order));
  let itemIndex = 0;
  const sorted = nodes.map((node) => (isDateSortItem(node) ? items[itemIndex++] : sortRows(node, tbodyType, order)));

  const buttonClass = (active: boolean) => `date-sort-button${active ? ' is-active' : ''}`;

  return (
    <div className="date-sort">
      <div className="date-sort-toolbar" role="group" aria-label="날짜 정렬">
        <button type="button" className={buttonClass(order === 'desc')} aria-pressed={order === 'desc'} onClick={() => setOrder('desc')}>
          최신순
        </button>
        <button type="button" className={buttonClass(order === 'asc')} aria-pressed={order === 'asc'} onClick={() => setOrder('asc')}>
          오래된순
        </button>
      </div>
      {sorted}
    </div>
  );
}
