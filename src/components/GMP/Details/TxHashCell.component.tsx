import Link from 'next/link';

import { Copy } from '@/components/Copy';
import { ExplorerLink } from '@/components/ExplorerLink';
import { ellipse } from '@/lib/string';

import type { TxHashCellProps } from '../GMP.types';
import { detailsStyles } from './Details.styles';

export function TxHashCell({
  stepTX,
  stepURL,
  proposalId,
  chainId,
  stepMoreInfos,
  stepMoreTransactions,
}: TxHashCellProps) {
  return (
    <td className={detailsStyles.tableCellNarrow}>
      <div className={detailsStyles.columnStack}>
        {stepTX && (
          <div className={detailsStyles.inlineRow}>
            <Copy value={stepTX}>
              {stepURL ? (
                <Link
                  href={stepURL}
                  target="_blank"
                  className={detailsStyles.linkMedium}
                >
                  {ellipse(stepTX)}
                </Link>
              ) : (
                ellipse(stepTX)
              )}
            </Copy>
            {!proposalId && (
              <ExplorerLink
                value={stepTX}
                chain={chainId}
                customURL={stepURL}
              />
            )}
          </div>
        )}
        {stepMoreInfos.length > 0 && (
          <div className={detailsStyles.rowStart}>{stepMoreInfos}</div>
        )}
        {stepMoreTransactions.length > 0 && (
          <div className={detailsStyles.columnTight}>
            {stepMoreTransactions}
          </div>
        )}
      </div>
    </td>
  );
}
