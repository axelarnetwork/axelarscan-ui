import Link from 'next/link';

import { Image } from '@/components/Image';
import { Number } from '@/components/Number';
import { getAssetData } from '@/lib/config';
import { toJson } from '@/lib/parser';
import { formatUnits } from '@/lib/number';

import type { ConfirmationAssetProps } from './EVMPoll.types';
import * as styles from './EVMPoll.styles';

export function ConfirmationAsset({ event, chain, url, assets, index }: ConfirmationAssetProps) {
  let { asset, symbol, amount } = { ...event };

  const assetObj = toJson(asset) as { denom?: string; amount?: string } | null;
  if (assetObj) {
    asset = assetObj.denom;
    amount = assetObj.amount;
  }

  const assetData = getAssetData(asset || symbol, assets);
  const { decimals, addresses } = { ...assetData };
  let { image } = { ...assetData };

  if (assetData) {
    symbol =
      (chain ? addresses?.[chain]?.symbol : undefined) ||
      assetData.symbol ||
      symbol;
    image = (chain ? addresses?.[chain]?.image : undefined) || image;
  }

  if (!symbol) {
    return null;
  }

  const element = (
    <div className={styles.assetPill}>
      <Image src={image} alt="" width={16} height={16} />
      {amount && assets ? (
        <Number
          value={formatUnits(amount, decimals)}
          format="0,0.000000"
          suffix={` ${symbol}`}
          className={styles.assetText}
        />
      ) : (
        <span className={styles.assetText}>{symbol}</span>
      )}
    </div>
  );

  if (url) {
    return (
      <Link key={index} href={url} target="_blank">
        {element}
      </Link>
    );
  }

  return <div key={index}>{element}</div>;
}
