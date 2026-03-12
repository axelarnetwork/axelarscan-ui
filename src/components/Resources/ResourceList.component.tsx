import type {
  ResourceListProps,
  ChainResourceData,
  AssetResourceData,
} from './Resources.types';
import { Chain as ChainCard } from './Chain.component';
import { Asset as AssetCard } from './Asset.component';
import * as styles from './Resources.styles';

export function ResourceList({
  resource,
  filter,
  params,
  assetFocusID,
  setAssetFocusID,
}: ResourceListProps) {
  const filtered = filter(resource, params);

  if (resource === 'chains') {
    return (
      <ul role="list" className={styles.resourceGrid}>
        {(filtered as ChainResourceData[]).map(
          (d: ChainResourceData, i: number) => (
            <ChainCard key={i} data={d} />
          )
        )}
      </ul>
    );
  }

  if (resource === 'assets') {
    return (
      <ul role="list" className={styles.resourceGrid}>
        {(filtered as AssetResourceData[]).map(
          (d: AssetResourceData, i: number) => (
            <AssetCard
              key={i}
              data={d}
              focusID={assetFocusID}
              onFocus={(id: string) => setAssetFocusID(id)}
            />
          )
        )}
      </ul>
    );
  }

  return <div />;
}
