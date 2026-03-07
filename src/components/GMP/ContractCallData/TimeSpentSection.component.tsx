import { MdOutlineTimer } from 'react-icons/md';
import { RiTimerFlashLine } from 'react-icons/ri';

import { TimeSpent } from '@/components/Time';

import type { TimeSpentSectionProps } from './ContractCallData.types';
import { contractCallDataStyles } from './ContractCallData.styles';

export function TimeSpentSection({ data }: TimeSpentSectionProps) {
  const { time_spent, status } = data;

  const showExpress =
    time_spent &&
    (time_spent.call_express_executed ?? 0) > 0 &&
    ['express_executed', 'executed'].includes(status ?? '');

  const showTotal =
    time_spent &&
    (time_spent.total ?? 0) > 0 &&
    status === 'executed';

  const shouldRender =
    ((time_spent?.call_express_executed ?? 0) > 0 &&
      ['express_executed', 'executed'].includes(status ?? '')) ||
    ((time_spent?.total ?? 0) > 0 && status === 'executed');

  if (!shouldRender) return null;

  return (
    <div className={contractCallDataStyles.section}>
      <dt className={contractCallDataStyles.label}>Time Spent</dt>
      <dd className={contractCallDataStyles.value}>
        <div className={contractCallDataStyles.timeSpentList}>
          {showExpress && (
            <div className={contractCallDataStyles.timeSpentExpress}>
              <RiTimerFlashLine size={20} />
              <TimeSpent
                fromTimestamp={0}
                toTimestamp={(time_spent!.call_express_executed ?? 0) * 1000}
              />
            </div>
          )}
          {showTotal && (
            <div className={contractCallDataStyles.timeSpentTotal}>
              <MdOutlineTimer size={20} />
              <TimeSpent
                fromTimestamp={0}
                toTimestamp={(time_spent!.total ?? 0) * 1000}
              />
            </div>
          )}
        </div>
      </dd>
    </div>
  );
}
