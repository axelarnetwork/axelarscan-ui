import _ from 'lodash';
import Link from 'next/link';

import { Number } from '@/components/Number';
import { isNumber } from '@/lib/number';
import { toArray } from '@/lib/parser';
import {
  chainColumnCellStyles,
  getAmountNumberClass,
} from './ChainColumnCell.styles';
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

  if (!shouldShowAmount && customBalances.length === 0) {
    return <td className={chainColumnCellStyles.cell} />;
  }

  const element = (
    <Number
      value={amount ?? 0}
      format="0,0.0a"
      className={getAmountNumberClass(!!url)}
    />
  );

  return (
    <td className={chainColumnCellStyles.cell}>
      <div className={chainColumnCellStyles.container}>
        {shouldShowAmount && (
          <div className={chainColumnCellStyles.amountContainer}>
            {url && (
              <Link
                href={url}
                target="_blank"
                className={chainColumnCellStyles.link}
              >
                {element}
              </Link>
            )}
            {!url && element}
            {value > 0 && (
              <Number
                value={value}
                format="0,0.0a"
                prefix="$"
                className={chainColumnCellStyles.value}
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
