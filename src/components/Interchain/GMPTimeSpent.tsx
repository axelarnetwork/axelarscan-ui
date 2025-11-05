import { Number } from '@/components/Number';
import { ChainProfile } from '@/components/Profile';
import { TimeSpent } from '@/components/Time';
import { TooltipComponent } from '@/components/Tooltip';
import { GMPTimeSpentProps } from './GMPTimeSpent.types';
import { GMPTimeSpentPoint } from './GMPTimeSpentPoint';
import { calculatePoints } from './GMPTimeSpent.utils';
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
    <div className="flex flex-col gap-y-2 rounded-lg bg-zinc-50 px-3 py-4 dark:bg-zinc-800/25 sm:flex-row sm:justify-between sm:gap-x-2 sm:gap-y-0">
      <div className="flex w-40 flex-col gap-y-0.5">
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
          className="whitespace-nowrap text-xs font-medium text-zinc-700 dark:text-zinc-300"
        />
      </div>
      {total && typeof total === 'number' && total > 0 && (
        <div className="flex w-full flex-col gap-y-0.5">
          <div className="flex w-full items-center justify-between">
            <GMPTimeSpentPoint title="S" name="Start" />
            {points.map((d, i) => (
              <div
                key={i}
                className="flex justify-between"
                style={{ width: `${d.width}%` }}
              >
                <div
                  className="h-0.5 w-full bg-blue-600 dark:bg-blue-500"
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
          <div className="ml-2 flex w-full items-center justify-between">
            {points.map((d, i) => (
              <div
                key={i}
                className="flex justify-end"
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
                      className="whitespace-nowrap text-2xs font-medium text-zinc-900 dark:text-zinc-100"
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
