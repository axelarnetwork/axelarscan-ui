import clsx from 'clsx';
import Link from 'next/link';

import { Number } from '@/components/Number';
import { isNumber } from '@/lib/number';
import { CustomBalance } from './TVL.types';

interface CustomBalanceItemProps {
  customBalance: CustomBalance;
  price?: number;
}

/**
 * Renders a single custom balance item (contracts or tokens)
 */
export function CustomBalanceItem({
  customBalance,
  price,
}: CustomBalanceItemProps) {
  const { balance, supply, url } = { ...customBalance };

  // Use balance if available, otherwise supply
  let amount: number | undefined;
  if (isNumber(balance)) {
    amount = balance;
  } else {
    amount = supply;
  }

  // @ts-expect-error -- figure out if NaN is on purpose
  const value: number = amount * price;

  const element = (
    <Number
      value={value}
      format="0,0.0a"
      prefix="+$"
      className={clsx(
        '!text-2xs font-semibold',
        !url && 'text-zinc-700 dark:text-zinc-300'
      )}
    />
  );

  return (
    <div className="flex flex-col items-end">
      {url && (
        <Link
          href={url}
          target="_blank"
          className="contents text-green-600 dark:text-green-500"
        >
          {element}
        </Link>
      )}
      {!url && element}
    </div>
  );
}
