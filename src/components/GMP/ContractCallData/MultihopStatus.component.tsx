import clsx from 'clsx';

import { getEvent } from '@/components/GMPs';
import { Tag } from '@/components/Tag';
import { isAxelar } from '@/lib/chain';

import type { GMPMessage } from '../GMP.types';
import { TimeSpentSection } from './TimeSpentSection.component';
import { contractCallDataStyles, getStatusTagClass } from './ContractCallData.styles';

interface MultihopStatusProps {
  data: GMPMessage;
}

function resolveStatusLabel(data: GMPMessage): string {
  const { simplified_status, call } = data;
  if (
    simplified_status === 'received' &&
    (getEvent(data) === 'ContractCall' ||
      (getEvent(data) === 'InterchainTransfer' &&
        isAxelar(call?.returnValues?.destinationChain)))
  ) {
    return 'Executed';
  }
  return simplified_status ?? '';
}

export function MultihopStatus({ data }: MultihopStatusProps) {
  return (
    <>
      <div className={contractCallDataStyles.section}>
        <dt className={contractCallDataStyles.label}>Status</dt>
        <dd className={contractCallDataStyles.value}>
          <Tag
            className={clsx(
              contractCallDataStyles.statusTag,
              getStatusTagClass(data.simplified_status),
            )}
          >
            {resolveStatusLabel(data)}
          </Tag>
        </dd>
      </div>
      <TimeSpentSection data={data} />
    </>
  );
}
