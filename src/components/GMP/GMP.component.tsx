'use client';

import { useChains, useAssets } from '@/hooks/useGlobalData';
import { find } from '@/lib/string';

import { Details } from './Details';
import {
  useEstimatedTimeSpent,
  useExecuteData,
  useGMPMessageData,
} from './GMP.hooks';
import type { GMPMessage } from './GMP.types';
import { GMPProps } from './GMP.types';
import { GMPContainer } from './GMPContainer.component';
import { Info } from './Info';

export function GMP({ tx, lite, initialData }: GMPProps) {
  const chains = useChains();
  const assets = useAssets();
  const { data, refresh } = useGMPMessageData(tx, initialData);
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
