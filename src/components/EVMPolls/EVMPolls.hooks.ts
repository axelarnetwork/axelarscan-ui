'use client';

import { useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import _ from 'lodash';

import { THIRTY_SECONDS_MS } from '@/lib/constants';
import { useChains } from '@/hooks/useGlobalData';
import { searchEVMPolls } from '@/lib/api/validator';
import { getParams } from '@/lib/operator';

import { processPolls } from './EVMPolls.utils';
import type { EVMPollRecord, SearchResultEntry } from './EVMPolls.types';

const SIZE = 25;

async function fetchEVMPollsData(
  params: Record<string, unknown>,
  chains: ReturnType<typeof useChains>
): Promise<SearchResultEntry> {
  const response = (await searchEVMPolls({ ...params, size: SIZE })) as Record<
    string,
    unknown
  > | null;

  const { data: rawData, total } = { ...response } as {
    data?: unknown;
    total?: number;
  };

  return {
    data: _.orderBy(
      processPolls(rawData as EVMPollRecord[], chains),
      ['idNumber', 'created_at.ms'],
      ['desc', 'desc']
    ),
    total: total || 0,
  };
}

export function useEVMPollsSearch(initialData: SearchResultEntry | null) {
  const searchParams = useSearchParams();
  const chains = useChains();
  const params = getParams(searchParams, SIZE);

  return useQuery({
    queryKey: ['evm-polls-search', params],
    queryFn: () => fetchEVMPollsData(params, chains),
    initialData: initialData ?? undefined,
    refetchInterval: THIRTY_SECONDS_MS,
    refetchOnWindowFocus: false,
  });
}
