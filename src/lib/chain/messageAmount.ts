import type { Asset } from '@/types';
import { getAssetData } from '@/lib/config';
import { formatUnits } from '@/lib/number';

import type { MessageAmount } from './txMessages';

/**
 * How a message's amount should be shown.
 *
 * The asset registry is fetched at runtime, so there are three states, and the
 * difference between the last two matters:
 *
 *  - still loading: show the figure, but no unit yet, or it renders the raw
 *    denom and swaps it for the symbol a moment later, which reads as a bug.
 *  - loaded and known: convert with the registry's precision.
 *  - loaded and unknown: show the raw integer. Without the registry we do not
 *    know the precision, and an IBC voucher such as transfer/channel-0/unit-zig
 *    is usually 18 decimals, so assuming 6 prints a number a million times too
 *    large. A plausible wrong figure is worse than an unconverted one.
 */
export interface MessageAmountDisplay {
  /** Already converted, for the Number component. */
  value?: number | string;
  /** Shown as-is, unconverted, when the precision is unknown. */
  raw?: string;
  suffix?: string;
}

export function resolveMessageAmount(
  amount: MessageAmount,
  assets: Asset[] | null
): MessageAmountDisplay {
  const assetData = getAssetData(amount.denom, assets);
  const loaded = Boolean(assets);
  const suffix = loaded ? (assetData?.symbol ?? amount.denom) : undefined;

  if (loaded && !assetData) {
    return { raw: amount.amount, suffix };
  }

  return {
    value: formatUnits(amount.amount, assetData?.decimals ?? 6),
    suffix,
  };
}
