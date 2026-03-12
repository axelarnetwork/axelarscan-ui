'use client';

import { useQuery } from '@tanstack/react-query';

import { REFETCH_INTERVAL_MS } from './Verifiers.constants';
import { fetchVerifiersPageData } from './Verifiers.utils';
import type { VerifiersPageData } from './Verifiers.types';

export function useVerifiersData(initialData: VerifiersPageData | null) {
  return useQuery({
    queryKey: ['verifiers-page'],
    queryFn: fetchVerifiersPageData,
    initialData: initialData ?? undefined,
    refetchInterval: REFETCH_INTERVAL_MS,
    refetchOnWindowFocus: false,
  });
}
