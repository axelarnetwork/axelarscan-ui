import Link from 'next/link';

import { Number } from '@/components/Number';
import { isNumber } from '@/lib/number';
import {
  customBalanceItemStyles,
  getCustomBalanceNumberClass,
} from './CustomBalanceItem.styles';
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
      className={getCustomBalanceNumberClass(!!url)}
    />
  );

  return (
    <div className={customBalanceItemStyles.container}>
      {url && (
        <Link
          href={url}
          target="_blank"
          className={customBalanceItemStyles.link}
        >
          {element}
        </Link>
      )}
      {!url && element}
    </div>
  );
}
