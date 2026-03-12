'use client';

import { split, toArray } from '@/lib/parser';
import { equalsIgnoreCase } from '@/lib/string';

import type { FilterOption } from '../Interchain.types';
import type { FilterSelectInputProps } from './Filters.types';
import { SearchableInput } from './SearchableInput.component';
import { SimpleInput } from './SimpleInput.component';

export function FilterSelectInput({
  attribute,
  params,
  searchInput,
  setParams,
  setSearchInput,
}: FilterSelectInputProps) {
  const isSelected = (v: string) => {
    if (attribute.multiple) {
      return split(params[attribute.name]).includes(v);
    }
    return (
      v === params[attribute.name] ||
      equalsIgnoreCase(v, String(params[attribute.name] || ''))
    );
  };

  const options = toArray(attribute.options) as FilterOption[];
  const selectedArray = options.filter(o => isSelected(o?.value || ''));
  const selectedSingle = !attribute.multiple
    ? options.find(o => isSelected(o?.value || ''))
    : undefined;

  const handleChange = (v: string | string[] | null) => {
    if (v === null) return;
    setParams({
      ...params,
      [attribute.name]: attribute.multiple
        ? Array.isArray(v)
          ? v.join(',')
          : v
        : v,
    });
  };

  const handleRemoveItem = (item: FilterOption) => {
    const filtered = selectedArray
      .filter(sv => sv?.value !== item?.value)
      .map(sv => sv?.value)
      .join(',');
    setParams({ ...params, [attribute.name]: filtered });
  };

  if (attribute.searchable) {
    return (
      <SearchableInput
        attribute={attribute}
        params={params}
        searchInput={searchInput}
        setSearchInput={setSearchInput}
        selectedArray={selectedArray}
        selectedSingle={selectedSingle}
        options={options}
        onChange={handleChange}
        onRemoveItem={handleRemoveItem}
      />
    );
  }

  return (
    <SimpleInput
      attribute={attribute}
      params={params}
      selectedArray={selectedArray}
      selectedSingle={selectedSingle}
      options={options}
      onChange={handleChange}
      onRemoveItem={handleRemoveItem}
    />
  );
}
