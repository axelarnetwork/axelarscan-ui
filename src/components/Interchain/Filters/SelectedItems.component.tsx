'use client';

import type { SelectedItemsProps } from './Filters.types';
import { filterSelectInputStyles } from './FilterSelectInput.styles';

export function SelectedItems({ items, onRemoveItem }: SelectedItemsProps) {
  return (
    <>
      {items.map((v, j) => (
        <div
          key={j}
          onClick={() => onRemoveItem(v)}
          className={filterSelectInputStyles.button.selectedItem}
        >
          {v?.title}
        </div>
      ))}
    </>
  );
}
