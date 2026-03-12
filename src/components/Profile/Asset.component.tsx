'use client';

import Link from 'next/link';
import clsx from 'clsx';

import { Image } from '@/components/Image';
import { Number } from '@/components/Number';
import { useChains, useAssets, useITSAssets } from '@/hooks/useGlobalData';
import { getChainData, getAssetData, getITSAssetData } from '@/lib/config';
import type { Asset } from '@/types';
import { ellipse } from '@/lib/string';
import { isNumber } from '@/lib/number';
import type { AssetProfileProps } from './Profile.types';
import { assetProfile as styles } from './Profile.styles';

export function AssetProfile({
  value,
  chain: chainProp,
  amount,
  addressOrDenom,
  customAssetData,
  ITSPossible = false,
  onlyITS = false,
  isLink = false,
  width = 24,
  height = 24,
  className = 'h-6',
  titleClassName,
}: AssetProfileProps) {
  const chains = useChains();
  const assets = useAssets();
  const itsAssets = useITSAssets();

  let chain = chainProp;

  if (!value) return null;

  const assetData =
    (!onlyITS && getAssetData(addressOrDenom || value, assets)) ||
    (ITSPossible && getITSAssetData(addressOrDenom || value, itsAssets)) ||
    (customAssetData as Asset | undefined);

  const { addresses } = { ...assetData };
  let { symbol, image } = { ...assetData };

  if (!chain && assetData?.chains) {
    chain = Object.keys(assetData.chains)[0];
  }

  if (chain && addresses?.[chain]) {
    if (addresses[chain].symbol) symbol = addresses[chain].symbol;
    if (addresses[chain].image) image = addresses[chain].image;
  }

  const { url, contract_path } = { ...getChainData(chain, chains)?.explorer };

  const element = (
    <div
      className={clsx(
        styles.wrapper,
        isNumber(amount) ? styles.gapWithAmount : styles.gapDefault,
        className
      )}
    >
      <Image src={image} alt="" width={width} height={height} />
      {isNumber(amount) && (
        <Number
          value={amount}
          format="0,0.000000"
          className={clsx(styles.amountText, titleClassName)}
        />
      )}
      <span
        className={clsx(
          styles.symbolText,
          isLink && url ? styles.symbolLink : styles.symbolDefault,
          titleClassName
        )}
      >
        {symbol || (value === addressOrDenom ? ellipse(value, 4, '0x') : value)}
      </span>
    </div>
  );

  if (isLink && url) {
    return (
      <Link
        href={`${url}${contract_path?.replace('{address}', addressOrDenom || value)}`}
        target="_blank"
      >
        {element}
      </Link>
    );
  }

  return element;
}
