import { AssetProfile, ChainProfile } from '@/components/Profile';
import { assetRowStyles } from './AssetRow.styles';
import { ChainColumnCell } from './ChainColumnCell.component';
import { ITSBadge } from './ITSBadge.component';
import { TotalColumn } from './TotalColumn.component';
import { TotalLockedCell } from './TotalLockedCell.component';
import type { AssetRowProps } from './TVL.types';
import { ChainWithTotalValue } from './TVL.types';

/**
 * Renders a single asset row in the TVL table
 * Includes asset info, native chain, totals, and per-chain breakdowns
 */
export function AssetRow({ data, chainsTVL }: AssetRowProps) {
  return (
    <tr key={data.asset} className={assetRowStyles.row}>
      {/* Asset Name Column */}
      <td className={assetRowStyles.cell.assetName}>
        <div className={assetRowStyles.assetNameContent}>
          <AssetProfile
            value={data.asset}
            customAssetData={data.assetData}
            ITSPossible={data.assetType === 'its'}
            titleClassName={assetRowStyles.assetProfile.titleClass}
          />
          <ITSBadge data={data} />
        </div>
      </td>

      {/* Native Chain Column */}
      <td className={assetRowStyles.cell.standard}>
        <ChainProfile value={data.nativeChain?.chainData?.id} />
      </td>

      {/* Total Locked Column */}
      <td className={assetRowStyles.cell.rightAlign}>
        <TotalLockedCell data={data} />
      </td>

      {/* Moved to EVM Column */}
      <td className={assetRowStyles.cell.rightAlign}>
        <TotalColumn
          total={data.total_on_evm}
          value={data.value_on_evm}
          symbol={data.assetData?.symbol}
        />
      </td>

      {/* Moved to Cosmos Column */}
      <td className={assetRowStyles.cell.rightAlign}>
        <TotalColumn
          total={data.total_on_cosmos}
          value={data.value_on_cosmos}
          symbol={data.assetData?.symbol}
        />
      </td>

      {/* Per-Chain Columns */}
      {chainsTVL?.map((chain: ChainWithTotalValue) => (
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
