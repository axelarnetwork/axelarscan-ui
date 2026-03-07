import { Image } from '@/components/Image';
import { Number } from '@/components/Number';
import { formatUnits } from '@/lib/number';

import type { AssetBadgeProps } from './EVMBatch.types';
import * as styles from './EVMBatch.styles';

export function AssetBadge({
  image,
  amount,
  assets,
  decimals,
  symbol,
}: AssetBadgeProps) {
  return (
    <div className={styles.assetBadge}>
      <Image src={image} alt="" width={16} height={16} />
      {amount && assets ? (
        <Number
          value={formatUnits(amount, decimals)}
          format="0,0.000000"
          suffix={` ${symbol}`}
          className={styles.assetText}
        />
      ) : (
        <span className={styles.assetText}>{symbol}</span>
      )}
    </div>
  );
}
