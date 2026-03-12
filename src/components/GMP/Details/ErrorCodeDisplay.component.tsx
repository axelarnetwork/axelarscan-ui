import Link from 'next/link';

import { isNumber } from '@/lib/number';
import { split } from '@/lib/parser';
import { isString } from '@/lib/string';

import type { ErrorCodeDisplayProps } from '../GMP.types';
import { detailsStyles } from './Details.styles';

export function ErrorCodeDisplay({
  code,
  destinationChainType,
}: ErrorCodeDisplayProps) {
  if (destinationChainType === 'evm') {
    return (
      <Link
        href={
          isNumber(code)
            ? 'https://docs.metamask.io/guide/ethereum-provider.html#errors'
            : `https://docs.ethers.io/v5/api/utils/logger/#errors-${
                isString(code)
                  ? `-${split(code, { toCase: 'lower', delimiter: '_' }).join('-')}`
                  : 'ethereum'
              }`
        }
        target="_blank"
        className={detailsStyles.infoPill}
      >
        {code}
      </Link>
    );
  }

  return <div className={detailsStyles.infoPill}>{code}</div>;
}
