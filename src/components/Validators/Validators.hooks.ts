'use client';

import { useQuery } from '@tanstack/react-query';

import { REFETCH_INTERVAL_MS } from './Validators.constants';
import { fetchValidatorsPageData } from './Validators.utils';
import type { ValidatorsPageData } from './Validators.types';

export function useValidatorsData(initialData: ValidatorsPageData | null) {
  return useQuery({
    queryKey: ['validators-page'],
    queryFn: fetchValidatorsPageData,
    initialData: initialData ?? undefined,
    refetchInterval: REFETCH_INTERVAL_MS,
    refetchOnWindowFocus: false,
  });
}
