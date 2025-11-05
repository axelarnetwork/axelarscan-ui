import { DateRangePicker } from '@/components/DateRangePicker';
import { FilterAttribute, FilterParams } from './Interchain.types';

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
      className="w-full rounded-md border border-zinc-200 py-1.5 text-zinc-900 shadow-sm placeholder:text-zinc-400 focus:border-blue-600 focus:ring-0 sm:text-sm sm:leading-6"
    />
  );
}

