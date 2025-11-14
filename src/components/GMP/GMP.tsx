'use client';

import { useGlobalStore } from '@/components/Global';
import { find } from '@/lib/string';

import { Details } from './Details/Details';
import {
  useEstimatedTimeSpent,
  useExecuteData,
  useGMPMessageData,
} from './GMP.hooks';
import type { GMPMessage } from './GMP.types';
import { GMPProps } from './GMP.types';
import { GMPContainer } from './GMPContainer';
import { Info } from './Info/Info';

export function GMP({ tx, lite }: GMPProps) {
  const { chains, assets } = useGlobalStore();
  const { data, refresh } = useGMPMessageData(tx);
  const estimatedTimeSpent = useEstimatedTimeSpent(data);
  const executeData = useExecuteData(data, chains, assets);

  if (!data) {
    return <GMPContainer data={null} />;
  }

  return (
    <GMPContainer data={data}>
      <Info
        data={data}
        estimatedTimeSpent={estimatedTimeSpent}
        executeData={executeData}
        refreshData={refresh}
        tx={tx}
        lite={lite}
      />
      {!lite && (
        <>
          {data.originData && (
            <Details
              data={{
                ...data.originData,
                callbackData: Object.fromEntries(
                  Object.entries(data).filter(
                    ([key]) => !find(key, ['originData', 'callbackData'])
                  )
                ) as Partial<GMPMessage>,
              }}
            />
          )}
          <Details data={data} />
          {data.callbackData && (
            <Details
              data={{
                ...data.callbackData,
                originData: Object.fromEntries(
                  Object.entries(data).filter(
                    ([key]) => !find(key, ['originData', 'callbackData'])
                  )
                ) as Partial<GMPMessage>,
              }}
            />
          )}
        </>
      )}
    </GMPContainer>
  );
}
