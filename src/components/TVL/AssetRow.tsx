/* eslint-disable @typescript-eslint/no-explicit-any */

import { AssetProfile, ChainProfile } from '@/components/Profile';
import { ChainColumnCell } from './ChainColumnCell';
import { ITSBadge } from './ITSBadge';
import { TotalColumn } from './TotalColumn';
import { TotalLockedCell } from './TotalLockedCell';
import { ChainWithTotalValue, ProcessedTVLData } from './TVL.types';

interface AssetRowProps {
  data: ProcessedTVLData;
  chainsTVL: ChainWithTotalValue[] | false;
}

/**
 * Renders a single asset row in the TVL table
 * Includes asset info, native chain, totals, and per-chain breakdowns
 */
export function AssetRow({ data, chainsTVL }: AssetRowProps) {
  return (
    <tr
      key={data.asset}
      className="align-top text-sm text-zinc-400 dark:text-zinc-500"
    >
      {/* Asset Name Column */}
      <td className="sticky left-0 z-10 px-3 py-4 text-left backdrop-blur backdrop-filter">
        <div className="flex-items-center flex gap-x-2">
          <AssetProfile
            value={data.asset}
            customAssetData={data.assetData}
            ITSPossible={data.assetType === 'its'}
            titleClassName="font-bold"
            {...({} as any)}
          />
          <ITSBadge data={data} />
        </div>
      </td>

      {/* Native Chain Column */}
      <td className="px-3 py-4 text-left">
        <ChainProfile
          value={data.nativeChain?.chainData?.id}
          {...({} as any)}
        />
      </td>

      {/* Total Locked Column */}
      <td className="px-3 py-4 text-right">
        <TotalLockedCell data={data} />
      </td>

      {/* Moved to EVM Column */}
      <td className="px-3 py-4 text-right">
        <TotalColumn
          total={data.total_on_evm}
          value={data.value_on_evm}
          symbol={data.assetData?.symbol}
        />
      </td>

      {/* Moved to Cosmos Column */}
      <td className="px-3 py-4 text-right">
        <TotalColumn
          total={data.total_on_cosmos}
          value={data.value_on_cosmos}
          symbol={data.assetData?.symbol}
        />
      </td>

      {/* Per-Chain Columns */}
      {chainsTVL !== false &&
        chainsTVL.map((chain: ChainWithTotalValue) => (
          <ChainColumnCell
            key={chain.id}
            chainId={chain.id}
            tvlData={{ ...data.tvl?.[chain.id] }}
            price={data.price}
          />
        ))}
    </tr>
  );
}
