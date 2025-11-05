import { getChainData } from '@/lib/config';
import { split, toArray } from '@/lib/parser';
import { ChainData, GroupDataItem } from './Interchain.types';

export interface ProfileRenderProps {
  type: string;
  key: string;
  chain?: string | string[];
  transfersType?: string;
  chains: ChainData[];
}

/**
 * Checks if a chain key should be filtered out
 */
export function shouldFilterChain(key: string, chains: ChainData[]): boolean {
  return (
    split(key, { delimiter: '_' }).filter(k => !getChainData(k, chains))
      .length < 1
  );
}

/**
 * Gets the border class name based on index and layout
 */
export function getBorderClassName(
  i: number,
  type: string,
  hasTransfers: boolean,
  hasGMP: boolean
): string {
  if (type === 'chain') {
    if (i % 3 !== 0) {
      return 'sm:border-l-0';
    }
    if (i % (hasTransfers ? 6 : 3) !== 0) {
      return 'lg:border-l-0';
    }
    return '';
  }

  if (!hasTransfers || !hasGMP || i % 4 !== 0) {
    return 'sm:border-l-0';
  }

  return '';
}
