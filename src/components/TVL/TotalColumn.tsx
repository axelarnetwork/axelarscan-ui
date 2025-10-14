import { Number } from '@/components/Number';

interface TotalColumnProps {
  total: number;
  value: number;
  symbol?: string;
}

/**
 * Displays a total amount column (EVM or Cosmos)
 * Shows both the amount and its USD value if amount > 0
 */
export function TotalColumn({ total, value, symbol }: TotalColumnProps) {
  if (total <= 0) {
    return null;
  }

  return (
    <div className="flex flex-col items-end gap-y-1">
      <Number
        value={total}
        format="0,0.0a"
        suffix={symbol ? ` ${symbol}` : ''}
        className="text-sm font-semibold leading-4 text-zinc-700 dark:text-zinc-300"
      />
      {value > 0 && (
        <Number
          value={value}
          format="0,0.0a"
          prefix="$"
          className="text-sm font-medium leading-4 text-zinc-400 dark:text-zinc-500"
        />
      )}
    </div>
  );
}
