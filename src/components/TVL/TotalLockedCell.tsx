import clsx from 'clsx';
import Link from 'next/link';
import { PiInfo } from 'react-icons/pi';

import { Number } from '@/components/Number';
import { Tooltip } from '@/components/Tooltip';
import { ProcessedTVLData, TVLPerChain } from './TVL.types';

interface TotalLockedCellProps {
  data: ProcessedTVLData;
}

/**
 * Renders the total locked amount cell for an asset
 * Shows the total amount with optional link and ITS info tooltip
 */
export function TotalLockedCell({ data }: TotalLockedCellProps) {
  const { url } = { ...data.nativeChain };

  const element = (
    <Number
      value={data.total}
      format="0,0.0a"
      suffix={` ${data.assetData?.symbol}`}
      className={clsx(
        'text-sm font-semibold leading-4',
        !url && 'text-zinc-700 dark:text-zinc-300'
      )}
    />
  );

  const isLockUnlock: boolean =
    data.assetType === 'its' &&
    Object.values({ ...data.tvl }).findIndex((d: TVLPerChain) =>
      d.contract_data?.token_manager_type?.startsWith('lockUnlock')
    ) < 0;

  return (
    <div className="flex flex-col items-end gap-y-1">
      <div className="flex items-center space-x-1">
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
        {isLockUnlock && (
          <Tooltip
            content="The circulating supply retrieved from CoinGecko used for TVL tracking."
            className="w-56 text-left text-xs"
          >
            <PiInfo className="mb-0.5 text-zinc-400 dark:text-zinc-500" />
          </Tooltip>
        )}
      </div>
      {data.value > 0 && (
        <Number
          value={data.value}
          format="0,0.0a"
          prefix="$"
          className="text-sm font-medium leading-4 text-zinc-400 dark:text-zinc-500"
        />
      )}
    </div>
  );
}
