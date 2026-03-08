import clsx from 'clsx';

import { Tag } from '@/components/Tag';

import { TimeSpentSection } from './TimeSpentSection.component';
import {
  contractCallDataStyles,
  getStatusTagClass,
} from './ContractCallData.styles';
import type { MultihopStatusProps } from './ContractCallData.types';
import { resolveStatusLabel } from './ContractCallData.utils';

export function MultihopStatus({ data }: MultihopStatusProps) {
  return (
    <>
      <div className={contractCallDataStyles.section}>
        <dt className={contractCallDataStyles.label}>Status</dt>
        <dd className={contractCallDataStyles.value}>
          <Tag
            className={clsx(
              contractCallDataStyles.statusTag,
              getStatusTagClass(data.simplified_status)
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
