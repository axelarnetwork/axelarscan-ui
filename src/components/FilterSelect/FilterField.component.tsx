'use client';

import { DateRangePicker } from '@/components/DateRangePicker';

import type { FilterFieldProps } from './FilterSelect.types';
import * as styles from './FilterSelect.styles';
import { SearchableSelect } from './SearchableSelect.component';
import { SimpleSelect } from './SimpleSelect.component';

export function FilterField({
  attribute,
  params,
  setParams,
  searchInput,
  setSearchInput,
}: FilterFieldProps) {
  if (attribute.type === 'select') {
    return attribute.searchable ? (
      <SearchableSelect
        attribute={attribute}
        params={params}
        setParams={setParams}
        searchInput={searchInput}
        setSearchInput={setSearchInput}
      />
    ) : (
      <SimpleSelect
        attribute={attribute}
        params={params}
        setParams={setParams}
      />
    );
  }

  if (attribute.type === 'datetimeRange') {
    return (
      <DateRangePicker
        params={params}
        onChange={(v: Record<string, unknown>) =>
          setParams({ ...params, ...v })
        }
      />
    );
  }

  return (
    <input
      type={attribute.type || 'text'}
      name={attribute.name}
      placeholder={attribute.label}
      value={(params[attribute.name] as string) ?? ''}
      onChange={e => setParams({ ...params, [attribute.name]: e.target.value })}
      className={styles.filterInput}
    />
  );
}
