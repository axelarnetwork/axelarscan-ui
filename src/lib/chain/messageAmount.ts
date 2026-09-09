import type { Asset } from '@/types';
import { getAssetData } from '@/lib/config';
import { formatUnits } from '@/lib/number';

import type { MessageAmount } from './txMessages';

/**
 * IBC packets name a token by its trace path, e.g. transfer/channel-208/uusdc.
 * The registry knows the base denom at the end of it, and that is where the
 * precision comes from, so a path has to be reduced before looking it up.
 */
const baseDenom = (denom: string | undefined): string | undefined =>
  denom?.includes('/') ? denom.split('/').pop() : denom;

/**
 * How a message's amount should be shown.
 *
 * The asset registry is fetched at runtime, so the precision is not always
 * known yet, and it is never worth guessing: an 18 decimal voucher displayed at
 * 6 is a million times too large. Until the denom resolves the raw integer is
 * shown instead, which is unconverted but never wrong.
 *
 * The unit is held back until the registry has loaded, or it renders the raw
 * denom and swaps it for the symbol a moment later, which reads as a bug.
 */
export interface MessageAmountDisplay {
  /** Converted to whole units, for the Number component. */
  value?: number | string;
  /** The raw base-unit integer, when the precision is not known. */
  raw?: string;
  suffix?: string;
}

export function resolveMessageAmount(
  amount: MessageAmount,
  assets: Asset[] | null
): MessageAmountDisplay {
  const assetData =
    getAssetData(amount.denom, assets) ??
    getAssetData(baseDenom(amount.denom), assets);
  const suffix = assets ? (assetData?.symbol ?? amount.denom) : undefined;

  if (!assetData) {
    return { raw: amount.amount, suffix };
  }

  return {
    value: formatUnits(amount.amount, assetData.decimals ?? 6),
    suffix,
  };
}
