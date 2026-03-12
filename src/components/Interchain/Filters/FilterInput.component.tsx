import { DateRangePicker } from '@/components/DateRangePicker';
import type { FilterParams } from '../Interchain.types';
import { filterInputStyles } from './FilterInput.styles';
import type { FilterInputProps } from './Filters.types';

export function FilterInput({
  attribute,
  params,
  setParams,
}: FilterInputProps) {
  if (attribute.type === 'datetimeRange') {
    return (
      <DateRangePicker
        params={params}
        onChange={(v: Partial<FilterParams>) => setParams({ ...params, ...v })}
        className=""
      />
    );
  }

  return (
    <input
      type={attribute.type || 'text'}
      name={attribute.name}
      placeholder={attribute.label}
      value={params[attribute.name] || ''}
      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
        setParams({
          ...params,
          [attribute.name]: e.target.value,
        })
      }
      className={filterInputStyles.input}
    />
  );
}
