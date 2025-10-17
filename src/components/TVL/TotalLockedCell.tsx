import Link from 'next/link';
import { PiInfo } from 'react-icons/pi';

import { Number } from '@/components/Number';
import { Tooltip } from '@/components/Tooltip';
import {
  getTotalNumberClass,
  totalLockedCellStyles,
} from './TotalLockedCell.styles';
import { ProcessedTVLData, TVLPerChain } from './TVL.types';

interface TotalLockedCellProps {
  data: ProcessedTVLData;
}

/**
 * Renders the total locked amount cell for an asset
 * Shows the total amount with optional link and ITS info tooltip
 */
export function TotalLockedCell({ data }: TotalLockedCellProps) {
  const url = data.nativeChain?.url;
  const tvlData = data.tvl ?? {};

  const isNotLockUnlock: boolean =
    data.assetType === 'its' &&
    !Object.values(tvlData).some((d: TVLPerChain) =>
      d.contract_data?.token_manager_type?.startsWith('lockUnlock')
    );

  // Don't show if total is 0 and no url (old behavior)
  const shouldShowAmount = data.total > 0 || url;

  if (!shouldShowAmount) {
    return null;
  }

  const element = (
    <Number
      value={data.total}
      format="0,0.0a"
      suffix={` ${data.assetData?.symbol}`}
      className={getTotalNumberClass(!!url)}
    />
  );

  return (
    <div className={totalLockedCellStyles.container}>
      <div className={totalLockedCellStyles.row}>
        {url && (
          <Link
            href={url}
            target="_blank"
            className={totalLockedCellStyles.link}
          >
            {element}
          </Link>
        )}
        {!url && element}
        {isNotLockUnlock && (
          <Tooltip
            content="The circulating supply retrieved from CoinGecko used for TVL tracking."
            className={totalLockedCellStyles.tooltip}
          >
            <PiInfo className={totalLockedCellStyles.infoIcon} />
          </Tooltip>
        )}
      </div>
      {data.value > 0 && (
        <Number
          value={data.value}
          format="0,0.0a"
          prefix="$"
          className={totalLockedCellStyles.value}
        />
      )}
    </div>
  );
}
