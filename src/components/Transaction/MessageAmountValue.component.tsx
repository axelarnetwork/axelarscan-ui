'use client';

import { Number } from '@/components/Number';
import { useAssets } from '@/hooks/useGlobalData';
import { getAssetData } from '@/lib/config';
import { formatUnits } from '@/lib/number';
import { spacedSuffix } from '@/lib/string';

import type { MessageAmountValueProps } from './Transaction.types';
import * as styles from './Transaction.styles';

export function MessageAmountValue({ amount }: MessageAmountValueProps) {
  const assets = useAssets();
  const assetData = getAssetData(amount.denom, assets);

  // useAssets is fetched at runtime and is null until it resolves, so "no asset
  // data" means either still loading or a denom the registry does not know.
  // Only the second is worth showing the raw denom for: doing it while loading
  // renders "uaxl" and then swaps it for "AXL" a moment later, which reads as a
  // bug. The info table's fee row omits its symbol the same way while chain
  // data loads.
  const suffix = assets ? (assetData?.symbol ?? amount.denom) : undefined;

  // Number shows whole units above 1000 and keeps the exact figure in its
  // tooltip, same as amounts elsewhere in the app. The 6 decimal fallback is
  // the bond denom's precision - staking only ever uses uaxl, so the figure
  // does not shift once the registry arrives.
  return (
    <Number
      value={formatUnits(amount.amount, assetData?.decimals ?? 6)}
      format="0,0.000000"
      suffix={spacedSuffix(suffix)}
      className={styles.messageFieldAmount}
    />
  );
}
