import { createApiClient, ApiParams } from '@/lib/api/client';

const request = createApiClient(process.env.NEXT_PUBLIC_GMP_API_URL!);

export const getContracts = () => request('getContracts');
export const getConfigurations = () => request('getConfigurations');
export const estimateITSFee = (params?: ApiParams) =>
  request('estimateITSFee', params);
export const searchGMP = (params?: ApiParams) => request('searchGMP', params);
export const GMPStatsByChains = (params?: ApiParams) =>
  request('GMPStatsByChains', params);
export const GMPStatsByContracts = (params?: ApiParams) =>
  request('GMPStatsByContracts', params);
export const GMPStatsAVGTimes = (params?: ApiParams) =>
  request('GMPStatsAVGTimes', params);
export const GMPChart = (params?: ApiParams) => request('GMPChart', params);
export const GMPTotalVolume = (params?: ApiParams) =>
  request('GMPTotalVolume', params);
export const GMPTopUsers = (params?: ApiParams) =>
  request('GMPTopUsers', params);
export const GMPTopITSAssets = (params?: ApiParams) =>
  request('GMPTopITSAssets', params);
export const estimateTimeSpent = (params?: ApiParams) =>
  request('estimateTimeSpent', params);
