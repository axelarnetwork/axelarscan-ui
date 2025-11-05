import { Number } from '@/components/Number';
import { ChainProfile } from '@/components/Profile';
import { TimeSpent } from '@/components/Time';
import { TooltipComponent } from '@/components/Tooltip';
import { gmpTimeSpentStyles } from './GMPTimeSpent.styles';
import { GMPTimeSpentProps } from './GMPTimeSpent.types';
import { calculatePoints } from './GMPTimeSpent.utils';
import { GMPTimeSpentPoint } from './GMPTimeSpentPoint';
import { TimeSpentData } from './Interchain.types';

export function GMPTimeSpent({
  data,
  format: _format = '0,0',
  prefix: _prefix = '',
}: GMPTimeSpentProps) {
  if (!data) return null;

  const dataRecord = data as TimeSpentData;
  const { key, num_txs, total } = { ...dataRecord };

  const points = calculatePoints(dataRecord);

  return (
    <div className={gmpTimeSpentStyles.container}>
      <div className={gmpTimeSpentStyles.info.container}>
        <ChainProfile
          value={key}
          width={20}
          height={20}
          className="h-5 gap-x-1"
          titleClassName="text-xs"
        />
        <Number
          value={num_txs || 0}
          format="0,0.00a"
          suffix=" records"
          className={gmpTimeSpentStyles.info.numRecords}
        />
      </div>
      {total && typeof total === 'number' && total > 0 && (
        <div className={gmpTimeSpentStyles.timeline.container}>
          <div className={gmpTimeSpentStyles.timeline.points.container}>
            <GMPTimeSpentPoint title="S" name="Start" />
            {points.map((d, i) => (
              <div
                key={i}
                className={gmpTimeSpentStyles.timeline.points.point}
                style={{ width: `${d.width}%` }}
              >
                <div
                  className={gmpTimeSpentStyles.timeline.points.line}
                  style={{ marginTop: '3px' }}
                />
                <TooltipComponent
                  content={
                    <div className="flex flex-col">
                      <span>{d.name}</span>
                      <TimeSpent
                        fromTimestamp={0}
                        toTimestamp={(d.value || 0) * 1000}
                        noTooltip={true}
                        title=""
                        className="font-medium"
                      />
                    </div>
                  }
                  className="whitespace-nowrap"
                >
                  <GMPTimeSpentPoint
                    title={d.title}
                    name={d.name}
                    noTooltip={true}
                  />
                </TooltipComponent>
              </div>
            ))}
          </div>
          <div className={gmpTimeSpentStyles.timeline.labels.container}>
            {points.map((d, i) => (
              <div
                key={i}
                className={gmpTimeSpentStyles.timeline.labels.label}
                style={{ width: `${d.width}%` }}
              >
                {['express_execute', 'execute'].includes(d.id) ? (
                  <TooltipComponent
                    content={d.label || d.name}
                    className="whitespace-nowrap"
                  >
                    <TimeSpent
                      fromTimestamp={0}
                      toTimestamp={d.time_spent * 1000}
                      noTooltip={true}
                      title=""
                      className={gmpTimeSpentStyles.timeline.labels.timeText}
                    />
                  </TooltipComponent>
                ) : (
                  <div />
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
