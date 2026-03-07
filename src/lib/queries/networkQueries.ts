import type { InflationData, NetworkParameters } from '@/types';
import { getInflation, getNetworkParameters, getTVL } from '@/lib/api/axelarscan';
import { ENVIRONMENT } from '@/lib/config';

export const fetchInflationData = async (): Promise<InflationData | null> => {
  return (await getInflation()) as InflationData | null ?? null;
};

export const fetchNetworkParameters = async (): Promise<NetworkParameters | null> => {
  return (await getNetworkParameters()) as NetworkParameters | null ?? null;
};

export const fetchTVL = async () => {
  if (ENVIRONMENT !== 'mainnet') return {};
  return (await getTVL()) ?? null;
};
