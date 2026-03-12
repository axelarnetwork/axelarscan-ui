'use client';

import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/lib/queries/keys';
import { fetchChains } from '@/lib/queries/chainQueries';
import { fetchAssets, fetchITSAssets } from '@/lib/queries/assetQueries';
import {
  fetchValidators,
  fetchVerifiers,
} from '@/lib/queries/validatorQueries';
import {
  fetchInflationData,
  fetchNetworkParameters,
  fetchTVL,
} from '@/lib/queries/networkQueries';
import {
  fetchContracts,
  fetchConfigurations,
} from '@/lib/queries/contractQueries';
import { fetchStats } from '@/lib/queries/statsQueries';
const GLOBAL_DATA_INTERVAL_MS = 5 * 60 * 1000;

const defaultOptions = {
  staleTime: GLOBAL_DATA_INTERVAL_MS,
  refetchInterval: GLOBAL_DATA_INTERVAL_MS,
  refetchOnWindowFocus: false,
} as const;

export const useChains = () => {
  const { data } = useQuery({
    queryKey: queryKeys.chains,
    queryFn: fetchChains,
    ...defaultOptions,
  });
  return data ?? null;
};

export const useAssets = () => {
  const { data } = useQuery({
    queryKey: queryKeys.assets,
    queryFn: fetchAssets,
    ...defaultOptions,
  });
  return data ?? null;
};

export const useITSAssets = () => {
  const { data } = useQuery({
    queryKey: queryKeys.itsAssets,
    queryFn: fetchITSAssets,
    ...defaultOptions,
  });
  return data ?? null;
};

export const useContracts = () => {
  const { data } = useQuery({
    queryKey: queryKeys.contracts,
    queryFn: fetchContracts,
    ...defaultOptions,
  });
  return data ?? null;
};

export const useConfigurations = () => {
  const { data } = useQuery({
    queryKey: queryKeys.configurations,
    queryFn: fetchConfigurations,
    ...defaultOptions,
  });
  return data ?? null;
};

export const useValidators = () => {
  const { data } = useQuery({
    queryKey: queryKeys.validators,
    queryFn: fetchValidators,
    ...defaultOptions,
  });
  return data ?? null;
};

export const useVerifiers = () => {
  const { data } = useQuery({
    queryKey: queryKeys.verifiers,
    queryFn: fetchVerifiers,
    ...defaultOptions,
  });
  return data?.verifiers ?? null;
};

export const useVerifiersByChain = () => {
  const { data } = useQuery({
    queryKey: queryKeys.verifiers,
    queryFn: fetchVerifiers,
    ...defaultOptions,
  });
  return data?.verifiersByChain ?? null;
};

export const useInflationData = () => {
  const { data } = useQuery({
    queryKey: queryKeys.inflationData,
    queryFn: fetchInflationData,
    ...defaultOptions,
  });
  return data ?? null;
};

export const useNetworkParameters = () => {
  const { data } = useQuery({
    queryKey: queryKeys.networkParameters,
    queryFn: fetchNetworkParameters,
    ...defaultOptions,
  });
  return data ?? null;
};

export const useTVL = () => {
  const { data } = useQuery({
    queryKey: queryKeys.tvl,
    queryFn: fetchTVL,
    ...defaultOptions,
  });
  return data ?? null;
};

export const useStats = () => {
  const { data } = useQuery({
    queryKey: queryKeys.stats,
    queryFn: fetchStats,
    ...defaultOptions,
  });
  return data ?? null;
};
