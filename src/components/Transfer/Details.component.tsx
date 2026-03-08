'use client';

import { useChains } from '@/hooks/useGlobalData';
import { getChainData } from '@/lib/config';
import { getStep, resolveStepTxInfo } from './Transfer.utils';
import { DetailsRow } from './DetailsRow.component';
import type { DetailsProps, TransferStep } from './Transfer.types';
import * as styles from './Transfer.styles';

export function Details({ data }: DetailsProps) {
  const chains = useChains();

  const { link, send, unwrap } = { ...data };

  const destinationChain = (send?.destination_chain ||
    unwrap?.destination_chain ||
    link?.destination_chain) as string | undefined;
  const destinationChainData = getChainData(destinationChain, chains);
  const axelarChainData = getChainData('axelarnet', chains);

  const steps = getStep(data, chains);

  if (steps.length === 0) return null;

  const visibleSteps = steps.filter(
    (d: TransferStep) =>
      d.status !== 'pending' || (d.id === 'ibc_send' && d.data)
  );

  return (
    <div className={styles.detailsTableWrapper}>
      <table className={styles.detailsTable}>
        <thead className={styles.detailsThead}>
          <tr className={styles.detailsTheadTr}>
            <th scope="col" className={styles.detailsThStep}>
              Step
            </th>
            <th scope="col" className={styles.detailsThTxHash}>
              Tx Hash
            </th>
            <th scope="col" className={styles.detailsThDefault}>
              Height
            </th>
            <th scope="col" className={styles.detailsThDefault}>
              Status
            </th>
            <th scope="col" className={styles.detailsThTime}>
              Time
            </th>
          </tr>
        </thead>
        <tbody className={styles.detailsTbody}>
          {visibleSteps.map((d: TransferStep, i: number) => {
            const { stepTX, stepURL, stepMoreInfos } = resolveStepTxInfo(
              d,
              axelarChainData,
              destinationChainData
            );

            return (
              <DetailsRow
                key={i}
                step={d}
                stepTX={stepTX}
                stepURL={stepURL}
                stepMoreInfos={stepMoreInfos}
                axelarChainData={axelarChainData}
              />
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
