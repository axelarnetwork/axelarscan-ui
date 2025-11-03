import { Number } from '@/components/Number';
import { ChainProfile } from '@/components/Profile';
import { TimeSpent } from '@/components/Time';
import { TooltipComponent } from '@/components/Tooltip';
import { toFixed } from '@/lib/number';
import { toArray } from '@/lib/parser';
import { GMPTimeSpentProps } from './GMPTimeSpent.types';
import { TimeSpentData } from './Interchain.types';

export function GMPTimeSpent({
  data,
  format: _format = '0,0',
  prefix: _prefix = '',
}: GMPTimeSpentProps) {
  if (!data) return null;

  const dataRecord = data as TimeSpentData;
  const { key, num_txs, express_execute, confirm, approve, total } = {
    ...dataRecord,
  };

  const Point = ({
    title,
    name,
    noTooltip = false,
  }: {
    title: string;
    name: string;
    noTooltip?: boolean;
  }) => {
    const point = (
      <div className="flex flex-col gap-y-0.5">
        <div className="h-2 w-2 rounded-full bg-blue-600 p-1 dark:bg-blue-500" />
        <span className="text-2xs font-medium uppercase text-blue-600 dark:text-blue-500">
          {title}
        </span>
      </div>
    );

    if (noTooltip) {
      return point;
    }

    return (
      <TooltipComponent content={name} className="whitespace-nowrap">
        {point}
      </TooltipComponent>
    );
  };

  type PointData = {
    id: string;
    title: string;
    name: string;
    time_spent: number;
    label?: string;
    value?: number;
    width?: string | number;
  };

  let points: PointData[] = toArray([
    express_execute && {
      id: 'express_execute',
      title: 'X',
      name: 'Express Execute',
      time_spent: express_execute,
    },
    confirm && {
      id: 'confirm',
      title: 'C',
      name: 'Confirm',
      time_spent: confirm,
    },
    approve && {
      id: 'approve',
      title: 'A',
      name: 'Approve',
      time_spent: approve,
    },
    total && {
      id: 'execute',
      title: 'E',
      name: 'Execute',
      label: 'Total',
      time_spent: total,
    },
  ]) as PointData[];

  if (total && typeof total === 'number') {
    points = points.map((d, i) => {
      const value =
        (d.time_spent || 0) - (i > 0 ? points[i - 1].time_spent || 0 : 0);

      return {
        ...d,
        value,
        width: toFixed((value * 100) / total, 2),
      };
    });
  }

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
            <Point title="S" name="Start" />
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
                  <Point title={d.title} name={d.name} noTooltip={true} />
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
