'use client';

import { useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import _ from 'lodash';

import { THIRTY_SECONDS_MS } from '@/lib/constants';
import { searchGMP } from '@/lib/api/gmp';
import { toArray } from '@/lib/parser';
import { getParams } from '@/lib/operator';

import { customData } from './GMPs.utils';
import type { GMPRowData } from './GMPs.types';

const SIZE = 25;

interface GMPSearchResult {
  data?: GMPRowData[];
  total?: number;
}

async function fetchGMPData(
  params: Record<string, unknown>
): Promise<GMPSearchResult> {
  const sort = params.sortBy === 'value' ? { value: 'desc' } : undefined;

  const _params = _.cloneDeep(params);
  delete _params.sortBy;

  const response = (await searchGMP({
    ..._params,
    size: SIZE,
    sort,
  })) as Record<string, unknown> | null;

  if (!response) return { data: [], total: 0 };

  const data = await Promise.all(
    toArray(response.data as unknown[]).map((d: unknown) =>
      customData(d as GMPRowData)
    )
  );

  return { data, total: response.total as number | undefined };
}

export function useGMPSearch(
  initialData: GMPSearchResult | null,
  address?: string
) {
  const searchParams = useSearchParams();
  const params = getParams(searchParams, SIZE);
  if (address) params.address = address;

  return useQuery({
    queryKey: ['gmp-search', params],
    queryFn: () => fetchGMPData(params),
    initialData: initialData ?? undefined,
    refetchInterval: THIRTY_SECONDS_MS,
    refetchOnWindowFocus: false,
  });
}
