import { split, toArray } from '@/lib/parser';
import { equalsIgnoreCase } from '@/lib/string';

import type { FilterAttribute, FilterOption } from './FilterSelect.types';

export function getSelectedValue(
  attribute: FilterAttribute,
  params: Record<string, unknown>
): FilterOption | FilterOption[] | undefined {
  const paramValue = params[attribute.name] as string | undefined;
  const isSelected = (v: string) =>
    attribute.multiple
      ? split(paramValue).includes(v)
      : v === paramValue || equalsIgnoreCase(v, paramValue);

  if (attribute.multiple) {
    return toArray(attribute.options).filter((o: FilterOption) =>
      isSelected(o.value ?? '')
    );
  }

  return toArray(attribute.options).find((o: FilterOption) =>
    isSelected(o.value ?? '')
  );
}
