import { getAssetData } from '@/lib/config';
import { toCase } from '@/lib/parser';
import { equalsIgnoreCase } from '@/lib/string';

import type { TransferRowData, TransferRowProps } from './Transfers.types';

export const normalizeType = (type: string | undefined) =>
  ['wrap', 'unwrap', 'erc20_transfer'].includes(type as string)
    ? 'deposit_service'
    : type || 'deposit_address';

export function resolveSymbol(
  d: TransferRowData,
  assets: TransferRowProps['assets']
): {
  symbol: string | undefined;
  image: string | undefined;
  assetData: ReturnType<typeof getAssetData>;
} {
  const assetData = getAssetData(d.send.denom, assets);
  const { addresses } = { ...assetData };
  let { symbol, image } = { ...addresses?.[d.send.source_chain] };

  if (!symbol) symbol = assetData?.symbol;
  if (!image) image = assetData?.image;

  if (symbol && d.type === 'wrap') {
    const WRAP_PREFIXES = ['w', 'axl'];
    const i = WRAP_PREFIXES.findIndex(
      (p: string) =>
        toCase(symbol!, 'lower').startsWith(p) && !equalsIgnoreCase(p, symbol!)
    );
    if (i > -1) {
      symbol = symbol.substring(WRAP_PREFIXES[i].length);
    }
  }

  return { symbol, image, assetData };
}
