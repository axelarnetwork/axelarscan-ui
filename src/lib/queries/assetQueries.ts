import type { Asset } from '@/types';
import { getAssets, getITSAssets, getTokensPrice } from '@/lib/api/axelarscan';

interface PriceEntry {
  price?: number;
}

export const fetchAssets = async (): Promise<Asset[] | null> => {
  const assets = (await getAssets()) as Asset[] | null;
  if (!assets) return null;

  const prices = (await getTokensPrice({
    symbols: assets.map(d => d.id),
  })) as Record<string, PriceEntry> | null;
  if (prices) {
    for (const [key, v] of Object.entries(prices)) {
      const i = assets.findIndex(d => d.id === key);
      if (i > -1 && !assets[i].price) {
        assets[i].price = v.price;
      }
    }
  }

  return assets;
};

export const fetchITSAssets = async (): Promise<Asset[] | null> => {
  const itsAssets = (await getITSAssets()) as Asset[] | null;
  if (!itsAssets) return null;

  const prices = (await getTokensPrice({
    symbols: itsAssets.map(d => d.symbol),
  })) as Record<string, PriceEntry> | null;
  if (prices) {
    for (const [key, v] of Object.entries(prices)) {
      const i = itsAssets.findIndex(d => d.symbol === key);
      if (i > -1 && !itsAssets[i].price) {
        itsAssets[i].price = v.price;
      }
    }
  }

  return itsAssets;
};
