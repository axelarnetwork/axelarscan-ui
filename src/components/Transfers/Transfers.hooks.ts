'use client';

import { useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import _ from 'lodash';

import { searchTransfers } from '@/lib/api/token-transfer';
import { ENVIRONMENT } from '@/lib/config';
import { getParams } from '@/lib/operator';
import { isNumber } from '@/lib/number';

import { REFETCH_INTERVAL_MS } from './Transfers.constants';
import type { TransferSearchResult } from './Transfers.types';

const SIZE = 25;

async function fetchTransfersData(
  params: Record<string, unknown>
): Promise<TransferSearchResult> {
  const sort = params.sortBy === 'value' ? { 'send.value': 'desc' } : undefined;

  const _params = _.cloneDeep(params);
  delete _params.sortBy;

  if (_params.from === 0) {
    delete _params.from;
  }

  const response = (await searchTransfers({
    ..._params,
    size: SIZE,
    sort,
  })) as TransferSearchResult | null;

  if (!response) return { data: [], total: 0 };

  // On mainnet, retry when total is missing for unfiltered queries
  const hasFilters =
    Object.keys(_params).length > 0 &&
    !(Object.keys(_params).length === 1 && _params.from !== undefined);

  if (!isNumber(response.total) && !hasFilters && ENVIRONMENT === 'mainnet') {
    // Return without total to trigger refetch
    return { data: response.data, total: undefined };
  }

  return { data: response.data, total: response.total };
}

export function useTransfersSearch(
  initialData: TransferSearchResult | null,
  address?: string
) {
  const searchParams = useSearchParams();
  const params = getParams(searchParams, SIZE);
  if (address) params.address = address;

  return useQuery({
    queryKey: ['transfers-search', params],
    queryFn: () => fetchTransfersData(params),
    initialData: initialData ?? undefined,
    refetchInterval: REFETCH_INTERVAL_MS,
    refetchOnWindowFocus: false,
  });
}
