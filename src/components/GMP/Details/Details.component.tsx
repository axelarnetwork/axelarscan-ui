import React from 'react';

import { ChainProfile } from '@/components/Profile';
import { useChains } from '@/hooks/useGlobalData';
import { getChainData } from '@/lib/config';

import { GMPStep } from '../GMP.types';
import { getStep } from '../GMP.utils';
import { detailsStyles } from './Details.styles';
import { DetailsProps } from './Details.types';
import { StepRow } from './StepRow.component';

import { MdKeyboardArrowRight } from 'react-icons/md';

export function Details({ data }: DetailsProps) {
  const chains = useChains();

  const { call, approved } = { ...data };

  const sourceChain = call?.chain;
  const destinationChain =
    approved?.chain || call?.returnValues?.destinationChain;

  const destinationChainData = getChainData(destinationChain, chains);
  const axelarChainData = getChainData('axelarnet', chains);

  const steps = getStep(data, chains);

  if (steps.length === 0) {
    return null;
  }

  const visibleSteps = steps.filter(
    step =>
      step.status !== 'pending' ||
      (typeof step.data === 'object' &&
        step.data !== null &&
        'axelarTransactionHash' in step.data &&
        step.data.axelarTransactionHash)
  );

  return (
    <div className={detailsStyles.container}>
      {(data.originData || data.callbackData) && (
        <div className={detailsStyles.multiHopHeader}>
          <ChainProfile
            value={sourceChain}
            width={20}
            height={20}
            className={detailsStyles.chainProfileIcon}
            titleClassName={detailsStyles.chainProfileTitle}
          />
          <MdKeyboardArrowRight size={20} />
          <ChainProfile
            value={destinationChain}
            width={20}
            height={20}
            className={detailsStyles.chainProfileIcon}
            titleClassName={detailsStyles.chainProfileTitle}
          />
        </div>
      )}
      <table className={detailsStyles.table}>
        <thead className={detailsStyles.tableHead}>
          <tr className={detailsStyles.tableHeadRow}>
            <th scope="col" className={detailsStyles.cellStep}>
              Step
            </th>
            <th scope="col" className={detailsStyles.cellTx}>
              Tx Hash
            </th>
            <th scope="col" className={detailsStyles.cellDefault}>
              Height
            </th>
            <th scope="col" className={detailsStyles.cellDefault}>
              Address
            </th>
            <th scope="col" className={detailsStyles.cellDefault}>
              Status
            </th>
            <th scope="col" className={detailsStyles.cellDefault}>
              Gas
            </th>
            <th scope="col" className={detailsStyles.cellTime}>
              Time
            </th>
          </tr>
        </thead>
        <tbody className={detailsStyles.tableBody}>
          {visibleSteps.map((step: GMPStep, index: number) => (
            <StepRow
              key={index}
              step={step}
              index={index}
              data={data}
              axelarChainData={axelarChainData}
              destinationChainData={destinationChainData}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
