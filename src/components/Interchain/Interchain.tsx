'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { useState } from 'react';

import { Container } from '@/components/Container';
import { useGlobalStore } from '@/components/Global';
import { Overlay } from '@/components/Overlay';
import { Spinner } from '@/components/Spinner';
import { generateKeyByParams, getParams } from '@/lib/operator';

import { Charts } from './Charts';
import { GMPTimeSpents } from './GMPTimeSpents';
import {
  useInterchainAutoRefresh,
  useInterchainData,
  useInterchainFilters,
  useInterchainTimeSpent,
} from './Interchain.hooks';
import {
  DynamicInterchainData,
  FilterParams,
  InterchainData,
} from './Interchain.types';
import { calculateGranularity } from './Interchain.utils';
import { InterchainHeader } from './InterchainHeader';
import { Summary } from './Summary';
import { Tops } from './Tops';

export function Interchain() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [params, setParams] = useState<FilterParams>(
    getParams(searchParams) as FilterParams
  );
  const [types, setTypes] = useState<string[] | string>(
    params.transfersType || ['gmp', 'transfers']
  );
  const [data, setData] = useState<DynamicInterchainData | null>(null);
  const [timeSpentData, setTimeSpentData] =
    useState<DynamicInterchainData | null>(null);
  const [refresh, setRefresh] = useState<boolean | null>(null);
  const globalStore = useGlobalStore();
  const { assets, stats, itsAssets } = { ...globalStore };

  const { contractMethod, contractAddress, fromTime, toTime } = {
    ...params,
  };

  const granularity = calculateGranularity(fromTime || 0, toTime || 0);

  const hooksParams = {
    searchParams,
    params,
    setParams,
    types,
    setTypes,
    setData,
    setTimeSpentData,
    refresh,
    setRefresh,
    assets,
    stats,
    itsAssets,
    granularity,
  };

  useInterchainFilters(hooksParams);
  useInterchainData(hooksParams);
  useInterchainTimeSpent(hooksParams);
  useInterchainAutoRefresh(hooksParams);

  if (!data) {
    return (
      <Container className="sm:mt-8">
        <Spinner />
      </Container>
    );
  }

  return (
    <Container className="sm:mt-8">
      <div className="flex flex-col gap-y-6">
        <InterchainHeader
          pathname={pathname}
          params={params}
          contractAddress={contractAddress}
          contractMethod={contractMethod}
          fromTime={fromTime}
          toTime={toTime}
          isRefreshing={refresh && typeof refresh !== 'boolean' ? true : false}
          onRefresh={() => setRefresh(true)}
        />
        {refresh && typeof refresh !== 'boolean' && <Overlay />}
        <Summary
          data={data[generateKeyByParams(params)] as InterchainData}
          params={params}
        />
        <Charts
          data={data[generateKeyByParams(params)] as InterchainData}
          granularity={granularity}
          params={params}
        />
        <Tops
          data={data[generateKeyByParams(params)] as InterchainData}
          types={Array.isArray(types) ? types : [types]}
          params={params}
        />
        {types.includes('gmp') && (
          <GMPTimeSpents
            data={
              (timeSpentData?.[
                generateKeyByParams(params)
              ] as InterchainData) || {}
            }
          />
        )}
      </div>
    </Container>
  );
}
