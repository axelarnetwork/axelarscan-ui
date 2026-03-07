import Link from 'next/link';

import { Number as NumberDisplay } from '@/components/Number';
import { isNumber, toNumber } from '@/lib/number';

import type { BlockNumberLinkProps } from '../GMP.types';
import { detailsStyles } from './Details.styles';

export function BlockNumberLink({
  blockNumber,
  url,
  blockPath,
}: BlockNumberLinkProps) {
  const displayValue = isNumber(blockNumber)
    ? blockNumber
    : toNumber(blockNumber);

  if (url && blockPath) {
    return (
      <Link
        href={`${url}${blockPath.replace('{block}', String(blockNumber))}`}
        target="_blank"
        className={detailsStyles.linkMedium}
      >
        <NumberDisplay value={displayValue} />
      </Link>
    );
  }

  return <NumberDisplay value={displayValue} />;
}
