import { createApiClient, ApiParams } from '@/lib/api/client';

const request = createApiClient(
  process.env.NEXT_PUBLIC_TOKEN_TRANSFER_API_URL!
);

export const searchTransfers = (params?: ApiParams) =>
  request('searchTransfers', params);
export const transfersStats = (params?: ApiParams) =>
  request('transfersStats', params);
export const transfersChart = (params?: ApiParams) =>
  request('transfersChart', params);
export const transfersTotalVolume = (params?: ApiParams) =>
  request('transfersTotalVolume', params);
export const transfersTopUsers = (params?: ApiParams) =>
  request('transfersTopUsers', params);
export const searchDepositAddresses = (params?: ApiParams) =>
  request('searchDepositAddresses', params);
export const searchBatches = (params?: ApiParams) =>
  request('searchBatches', params);
export const getBatch = (chain: string, batchId: string) =>
  request(
    'lcd',
    {
      path: `/axelar/evm/v1beta1/batched_commands/${chain}/${batchId}`,
    },
    'POST'
  );
