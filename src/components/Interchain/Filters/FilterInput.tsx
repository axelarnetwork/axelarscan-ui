import { DateRangePicker } from '@/components/DateRangePicker';
import { filterInputStyles } from './FilterInput.styles';
import { FilterAttribute, FilterParams } from '../Interchain.types';

interface FilterInputProps {
  attribute: FilterAttribute;
  params: FilterParams;
  setParams: (params: FilterParams) => void;
}

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
