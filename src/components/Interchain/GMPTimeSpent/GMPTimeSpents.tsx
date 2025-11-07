import { GMPTimeSpent } from './GMPTimeSpent';
import { gmpTimeSpentsStyles } from './GMPTimeSpents.styles';
import { GMPTimeSpentsProps } from './GMPTimeSpents.types';
import { TimeSpentData } from '../Interchain.types';

export function GMPTimeSpents({ data }: GMPTimeSpentsProps) {
  if (!data?.GMPStatsAVGTimes?.time_spents) {
    return null;
  }

  const timeSpents = data.GMPStatsAVGTimes.time_spents as TimeSpentData[];

  return (
    <div className={gmpTimeSpentsStyles.container}>
      <div className={gmpTimeSpentsStyles.header.container}>
        <div className={gmpTimeSpentsStyles.header.titleContainer}>
          <span className={gmpTimeSpentsStyles.header.title}>
            GMP Time Spent
          </span>
          <span className={gmpTimeSpentsStyles.header.description}>
            The median time spent of General Message Passing from each chain
          </span>
        </div>
      </div>
      <div className={gmpTimeSpentsStyles.grid}>
        {timeSpents.map((d: TimeSpentData, i: number) => (
          <GMPTimeSpent key={i} data={d} />
        ))}
      </div>
    </div>
  );
}
