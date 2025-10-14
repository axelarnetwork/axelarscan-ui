import clsx from 'clsx';
import _ from 'lodash';
import Link from 'next/link';

import { Number } from '@/components/Number';
import { isNumber } from '@/lib/number';
import { toArray } from '@/lib/parser';
import { CustomBalanceItem } from './CustomBalanceItem';
import { CustomBalance, TVLPerChain } from './TVL.types';

interface ChainColumnCellProps {
  chainId: string;
  tvlData: TVLPerChain;
  price?: number;
}

/**
 * Renders a table cell for a specific chain column
 * Shows the main amount/value and any custom balances
 */
export function ChainColumnCell({
  chainId,
  tvlData,
  price,
}: ChainColumnCellProps) {
  const {
    escrow_balance,
    supply,
    total,
    url,
    custom_contracts_balance,
    custom_tokens_supply,
  }: TVLPerChain = { ...tvlData };

  const amount: number | undefined =
    (isNumber(escrow_balance) && chainId !== 'axelarnet'
      ? escrow_balance
      : supply) || total;

  // @ts-expect-error -- figure out if NaN is on purpose
  const value: number = amount * price;

  const customBalances: CustomBalance[] = toArray(
    _.concat(custom_contracts_balance, custom_tokens_supply)
  ).filter(
    (item): item is CustomBalance => typeof item === 'object' && item !== null
  );

  // Don't show if amount is 0 or invalid and no url (old behavior)
  const shouldShowAmount = (isNumber(amount) && amount > 0) || url;

  // If nothing to show, return empty cell
  if (!shouldShowAmount && customBalances.length === 0) {
    return <td className="px-3 py-4 text-right" />;
  }

  const element = shouldShowAmount ? (
    <Number
      value={amount ?? 0}
      format="0,0.0a"
      className={clsx(
        'text-xs font-semibold',
        !url && 'text-zinc-700 dark:text-zinc-300'
      )}
    />
  ) : null;

  return (
    <td className="px-3 py-4 text-right">
      <div className="flex flex-col items-end gap-y-1">
        {shouldShowAmount && (
          <div className="flex flex-col items-end gap-y-0.5">
            {url ? (
              <Link
                href={url}
                target="_blank"
                className="contents text-blue-600 dark:text-blue-500"
              >
                {element}
              </Link>
            ) : (
              element
            )}
            {value > 0 && (
              <Number
                value={value}
                format="0,0.0a"
                prefix="$"
                className="text-xs font-medium text-zinc-400 dark:text-zinc-500"
              />
            )}
          </div>
        )}
        {customBalances.map((customBalance: CustomBalance, i: number) => (
          <CustomBalanceItem
            key={i}
            customBalance={customBalance}
            price={price}
          />
        ))}
      </div>
    </td>
  );
}
