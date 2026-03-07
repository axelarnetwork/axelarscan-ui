import clsx from 'clsx';

import { Image } from '@/components/Image';
import { Tag } from '@/components/Tag';
import { Number } from '@/components/Number';
import { isString, toTitle } from '@/lib/string';
import { isNumber, formatUnits } from '@/lib/number';

import { normalizeType } from './Transfers.utils';
import type { TransferMethodCellProps } from './Transfers.types';
import * as styles from './Transfers.styles';

export function MethodCell({
  d,
  symbol,
  image,
  assetData,
  assets,
}: TransferMethodCellProps) {
  return (
    <div className={styles.methodCol}>
      <Tag className={clsx(styles.tagFitCapitalize)}>
        {toTitle(normalizeType(d.type))}
      </Tag>
      {symbol && (
        <div className={styles.assetBadge}>
          <Image src={image} alt="" width={16} height={16} />
          {isNumber(d.send.amount) && assets ? (
            <Number
              value={
                isString(d.send.amount)
                  ? formatUnits(d.send.amount, assetData?.decimals)
                  : d.send.amount
              }
              format="0,0.000000"
              suffix={` ${symbol}`}
              className={styles.assetNumberText}
            />
          ) : (
            <span className={styles.assetSymbolText}>{symbol}</span>
          )}
        </div>
      )}
    </div>
  );
}
