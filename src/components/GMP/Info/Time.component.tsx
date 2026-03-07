import _ from 'lodash';
import { MdOutlineTimer } from 'react-icons/md';
import { RiTimerFlashLine } from 'react-icons/ri';

import { TimeSpent } from '@/components/Time';
import { Section } from './Section.component';
import { TimeProps } from './Time.types';
import { timeStyles } from './Time.styles';
import { timeDiff } from '@/lib/time';

export function Time({
  isMultihop,
  executedGMPsData,
  timeSpent,
  status,
  estimatedTimeSpent,
  fees,
  confirm,
  approved,
  call,
}: TimeProps) {
  const shouldRenderExpressEstimate =
    fees?.express_supported &&
    !(confirm || approved) &&
    (estimatedTimeSpent?.express_execute ?? 0) > 0 &&
    timeDiff((call?.block_timestamp ?? 0) * 1000) <
      (estimatedTimeSpent?.express_execute ?? 0);

  const totalEstimate = estimatedTimeSpent?.total ?? 0;

  if (isMultihop) {
    return executedGMPsData.length > 0 ? (
      <Section label="Time Spent">
        <div className={timeStyles.row}>
          <div className={timeStyles.valueRow}>
            <MdOutlineTimer size={20} />
            <TimeSpent
              fromTimestamp={0}
              toTimestamp={_.sumBy(executedGMPsData, 'time_spent.total') * 1000}
            />
          </div>
        </div>
      </Section>
    ) : null;
  }

  const expressTimeSpent = timeSpent?.call_express_executed ?? 0;
  const totalTimeSpent = timeSpent?.total ?? 0;
  const callBlockTimestamp = call?.block_timestamp;

  if (
    (expressTimeSpent > 0 &&
      ['express_executed', 'executed'].includes(status || '')) ||
    (totalTimeSpent > 0 && status === 'executed')
  ) {
    return (
      <Section label="Time Spent">
        <div className={timeStyles.detailColumn}>
          {expressTimeSpent > 0 &&
            ['express_executed', 'executed'].includes(status || '') && (
              <div className={timeStyles.expressRow}>
                <RiTimerFlashLine size={20} />
                <TimeSpent
                  fromTimestamp={0}
                  toTimestamp={expressTimeSpent * 1000}
                />
              </div>
            )}
          {totalTimeSpent > 0 && status === 'executed' && (
            <div className={timeStyles.valueRow}>
              <MdOutlineTimer size={20} />
              <TimeSpent
                fromTimestamp={0}
                toTimestamp={totalTimeSpent * 1000}
              />
            </div>
          )}
        </div>
      </Section>
    );
  }

  if (!estimatedTimeSpent) {
    return null;
  }

  return (
    <>
      <Section label="Estimated Time Spent">
        <div className={timeStyles.detailColumn}>
          {shouldRenderExpressEstimate && (
            <div className={timeStyles.expressRow}>
              <RiTimerFlashLine size={20} />
              <TimeSpent
                fromTimestamp={0}
                toTimestamp={(estimatedTimeSpent?.express_execute ?? 0) * 1000}
              />
            </div>
          )}
          {totalEstimate > 0 && (
            <div className={timeStyles.valueRow}>
              <MdOutlineTimer size={20} />
              <TimeSpent fromTimestamp={0} toTimestamp={totalEstimate * 1000} />
            </div>
          )}
        </div>
      </Section>
      {!['express_executed', 'executed'].includes(status || '') &&
        callBlockTimestamp && (
          <Section label="Time Spent">
            <div className={timeStyles.valueRow}>
              <MdOutlineTimer size={20} />
              <TimeSpent fromTimestamp={callBlockTimestamp * 1000} />
            </div>
          </Section>
        )}
    </>
  );
}
