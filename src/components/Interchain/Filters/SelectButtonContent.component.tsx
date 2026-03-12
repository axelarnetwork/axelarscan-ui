'use client';

import type { SelectButtonContentProps } from './Filters.types';
import { filterSelectInputStyles } from './FilterSelectInput.styles';
import { SelectedItems } from './SelectedItems.component';

export function SelectButtonContent({
  attribute,
  selectedArray,
  selectedSingle,
  onRemoveItem,
}: SelectButtonContentProps) {
  if (!attribute.multiple) {
    return (
      <span className={filterSelectInputStyles.button.placeholder}>
        {selectedSingle?.title || 'Any'}
      </span>
    );
  }

  return (
    <div
      className={filterSelectInputStyles.button.selectedContainer(
        selectedArray.length
      )}
    >
      {selectedArray.length === 0 ? (
        <span className={filterSelectInputStyles.button.placeholder}>Any</span>
      ) : (
        <SelectedItems items={selectedArray} onRemoveItem={onRemoveItem} />
      )}
    </div>
  );
}
