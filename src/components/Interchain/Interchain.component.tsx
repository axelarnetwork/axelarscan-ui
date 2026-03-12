'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { useRef, useState } from 'react';

import { Container } from '@/components/Container';
import { useAssets, useITSAssets, useStats } from '@/hooks/useGlobalData';
import { Spinner } from '@/components/Spinner';
import { generateKeyByParams, getParams } from '@/lib/operator';

import { Charts } from './Charts';
import { GMPTimeSpents } from './GMPTimeSpent';
import {
  useInterchainAutoRefresh,
  useInterchainData,
  useInterchainFilters,
  useInterchainTimeSpent,
} from './Interchain.hooks';
import { interchainStyles } from './Interchain.styles';
import {
  DynamicInterchainData,
  FilterParams,
  InterchainData,
} from './Interchain.types';
import { calculateGranularity } from './Interchain.utils';
import { InterchainHeader } from './InterchainHeader';
import { Summary } from './Summary';
import { Tops } from './Top';

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
  const assets = useAssets();
  const stats = useStats();
  const itsAssets = useITSAssets();

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

  // Stale-while-revalidate: show previous data while new filter loads
  const key = generateKeyByParams(params);
  const currentData = data?.[key] as InterchainData | undefined;
  const lastDataRef = useRef<InterchainData | undefined>(undefined);
  if (currentData) {
    lastDataRef.current = currentData;
  }
  const displayData = currentData ?? lastDataRef.current;

  if (!displayData) {
    return (
      <Container className={interchainStyles.container}>
        <Spinner />
      </Container>
    );
  }

  return (
    <Container className={interchainStyles.container}>
      <div className={interchainStyles.content}>
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
        <Summary data={displayData} params={params} />
        <Charts data={displayData} granularity={granularity} params={params} />
        <Tops
          data={displayData}
          types={Array.isArray(types) ? types : [types]}
          params={params}
        />
        {types.includes('gmp') && (
          <GMPTimeSpents
            data={(timeSpentData?.[key] as InterchainData) || {}}
          />
        )}
      </div>
    </Container>
  );
}
