import { createApiClient, ApiParams } from '@/lib/api/client';

const request = createApiClient(process.env.NEXT_PUBLIC_AXELARSCAN_API_URL!);

export const getChains = () => request('getChains');
export const getAssets = () => request('getAssets');
export const getITSAssets = () => request('getITSAssets');
export const getTokensPrice = (params?: ApiParams) =>
  request('getTokensPrice', params);
export const getInflation = (params?: ApiParams) =>
  request('getInflation', params);
export const getNetworkParameters = (params?: ApiParams) =>
  request('getNetworkParameters', params);
export const getBalances = (params?: ApiParams) =>
  request('getBalances', params);
export const getAccountAmounts = (params?: ApiParams) =>
  request('getAccountAmounts', params);
export const getProposals = () => request('getProposals');
export const getProposal = (params?: ApiParams) =>
  request('getProposal', params);
export const getTVL = (params?: ApiParams) => request('getTVL', params);
