import { Number } from '@/components/Number';
import { totalColumnStyles } from './TotalColumn.styles';

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
    <div className={totalColumnStyles.container}>
      <Number
        value={total}
        format="0,0.0a"
        suffix={symbol ? ` ${symbol}` : ''}
        className={totalColumnStyles.total}
      />
      {value > 0 && (
        <Number
          value={value}
          format="0,0.0a"
          prefix="$"
          className={totalColumnStyles.value}
        />
      )}
    </div>
  );
}
