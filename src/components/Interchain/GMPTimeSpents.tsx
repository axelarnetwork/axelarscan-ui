import { GMPTimeSpent } from './GMPTimeSpent';
import { GMPTimeSpentsProps } from './GMPTimeSpents.types';
import { TimeSpentData } from './Interchain.types';

export function GMPTimeSpents({ data }: GMPTimeSpentsProps) {
  if (!data?.GMPStatsAVGTimes?.time_spents) {
    return null;
  }

  const timeSpents = data.GMPStatsAVGTimes.time_spents as TimeSpentData[];

  return (
    <div className="flex flex-col gap-y-4 border border-zinc-200 px-4 py-8 dark:border-zinc-700 sm:px-6 xl:px-8">
      <div className="flex items-start justify-between gap-x-4">
        <div className="flex flex-col gap-y-0.5">
          <span className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
            GMP Time Spent
          </span>
          <span className="text-sm font-normal text-zinc-400 dark:text-zinc-500">
            The median time spent of General Message Passing from each chain
          </span>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {timeSpents.map((d: TimeSpentData, i: number) => (
          <GMPTimeSpent key={i} data={d} />
        ))}
      </div>
    </div>
  );
}
