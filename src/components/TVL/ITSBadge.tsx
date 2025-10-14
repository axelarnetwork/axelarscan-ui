import { Tag } from '@/components/Tag';
import { Tooltip } from '@/components/Tooltip';
import { ProcessedTVLData, TVLPerChain } from './TVL.types';

interface ITSBadgeProps {
  data: ProcessedTVLData;
}

/**
 * Displays an ITS badge with tooltip indicating whether it's canonical or custom
 */
export function ITSBadge({ data }: ITSBadgeProps) {
  if (data.assetType !== 'its') {
    return null;
  }

  // Check if this is a lock/unlock (canonical) or custom ITS token
  const tvlValues = Object.values({ ...data.tvl });
  const hasLockUnlock = tvlValues.some((tvl: TVLPerChain) =>
    tvl.token_manager_type?.startsWith('lockUnlock')
  );
  const isCustomType = data.assetData?.type?.includes('custom');
  const isCanonical = hasLockUnlock && !isCustomType;

  const tooltipContent = isCanonical
    ? 'canonical ITS token'
    : 'custom ITS token';

  return (
    <Tooltip content={tooltipContent} className="whitespace-nowrap">
      <Tag className="w-fit bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100">
        ITS
      </Tag>
    </Tooltip>
  );
}
