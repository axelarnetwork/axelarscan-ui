import { toNumber } from '@/lib/number';

import type { HeightCellProps } from '../GMP.types';
import { detailsStyles } from './Details.styles';
import { BlockNumberLink } from './BlockNumberLink.component';

export function HeightCell({
  blockNumber,
  axelarBlockNumber,
  url,
  blockPath,
  axelarChainData,
}: HeightCellProps) {
  return (
    <td className={detailsStyles.tableCellNarrow}>
      <div className={detailsStyles.columnStack}>
        {toNumber(blockNumber) > 0 && (
          <BlockNumberLink
            blockNumber={blockNumber}
            url={url}
            blockPath={blockPath}
          />
        )}
        {axelarBlockNumber && (
          <BlockNumberLink
            blockNumber={axelarBlockNumber}
            url={axelarChainData?.explorer?.url}
            blockPath={axelarChainData?.explorer?.block_path}
          />
        )}
      </div>
    </td>
  );
}
