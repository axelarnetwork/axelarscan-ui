import _ from 'lodash';
import { MdOutlineTimer } from 'react-icons/md';
import { RiTimerFlashLine } from 'react-icons/ri';

import { TimeSpent } from '@/components/Time';
import { infoStyles } from './Info.styles';
import { InfoSection } from './InfoSection';
import { InfoTimeProps } from './Info.types';
import { timeDiff } from '@/lib/time';

export function InfoTime({
  isMultihop,
  executedGMPsData,
  timeSpent,
  status,
  estimatedTimeSpent,
  fees,
  confirm,
  approved,
  call,
}: InfoTimeProps) {
  const shouldRenderExpressEstimate =
    fees?.express_supported &&
    !(confirm || approved) &&
    (estimatedTimeSpent?.express_execute ?? 0) > 0 &&
    timeDiff((call?.block_timestamp ?? 0) * 1000) <
      (estimatedTimeSpent?.express_execute ?? 0);

  const totalEstimate = estimatedTimeSpent?.total ?? 0;

  if (isMultihop) {
    return executedGMPsData.length > 0 ? (
      <InfoSection label="Time Spent">
        <div className={infoStyles.timeRow}>
          <div className={infoStyles.timeValueRow}>
            <MdOutlineTimer size={20} />
            <TimeSpent
              fromTimestamp={0}
              toTimestamp={_.sumBy(executedGMPsData, 'time_spent.total') * 1000}
            />
          </div>
        </div>
      </InfoSection>
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
      <InfoSection label="Time Spent">
        <div className={infoStyles.detailColumn}>
          {expressTimeSpent > 0 &&
            ['express_executed', 'executed'].includes(status || '') && (
              <div className={infoStyles.timeExpressRow}>
                <RiTimerFlashLine size={20} />
                <TimeSpent
                  fromTimestamp={0}
                  toTimestamp={expressTimeSpent * 1000}
                />
              </div>
            )}
          {totalTimeSpent > 0 && status === 'executed' && (
            <div className={infoStyles.timeValueRow}>
              <MdOutlineTimer size={20} />
              <TimeSpent
                fromTimestamp={0}
                toTimestamp={totalTimeSpent * 1000}
              />
            </div>
          )}
        </div>
      </InfoSection>
    );
  }

  if (!estimatedTimeSpent) {
    return null;
  }

  return (
    <>
      <InfoSection label="Estimated Time Spent">
        <div className={infoStyles.detailColumn}>
          {shouldRenderExpressEstimate && (
            <div className={infoStyles.timeExpressRow}>
              <RiTimerFlashLine size={20} />
              <TimeSpent
                fromTimestamp={0}
                toTimestamp={(estimatedTimeSpent?.express_execute ?? 0) * 1000}
              />
            </div>
          )}
          {totalEstimate > 0 && (
            <div className={infoStyles.timeValueRow}>
              <MdOutlineTimer size={20} />
              <TimeSpent fromTimestamp={0} toTimestamp={totalEstimate * 1000} />
            </div>
          )}
        </div>
      </InfoSection>
      {!['express_executed', 'executed'].includes(status || '') &&
        callBlockTimestamp && (
          <InfoSection label="Time Spent">
            <div className={infoStyles.timeValueRow}>
              <MdOutlineTimer size={20} />
              <TimeSpent fromTimestamp={callBlockTimestamp * 1000} />
            </div>
          </InfoSection>
        )}
    </>
  );
}
