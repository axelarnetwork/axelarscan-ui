import { createApiClient, ApiParams } from '@/lib/api/client';

const request = createApiClient(process.env.NEXT_PUBLIC_VALIDATOR_API_URL!);

export const rpc = (params?: ApiParams) => request('rpc', params, 'POST');
export const getRPCStatus = (params?: ApiParams) =>
  request('rpc', { ...params, path: '/status' }, 'POST');
export const lcd = (params?: ApiParams) => request('lcd', params, 'POST');
export const getBlock = (height: string | number) =>
  request(
    'lcd',
    { path: `/cosmos/base/tendermint/v1beta1/blocks/${height}` },
    'POST'
  );
export const getValidatorSets = (height: string | number = 'latest') =>
  request('lcd', { path: `/validatorsets/${height}` }, 'POST');
export const getTransaction = (txhash: string) =>
  request('lcd', { path: `/cosmos/tx/v1beta1/txs/${txhash}` }, 'POST');
export const searchBlocks = (params?: ApiParams) =>
  request('searchBlocks', params);
export const searchTransactions = (params?: ApiParams) =>
  request('searchTransactions', params);
export const getTransactions = (params: ApiParams & { events?: string }) => {
  // after the upgrade to cosmos 0.50.0 the "events" parameter has changed to "query"
  // for backwards compatibility, and while the upgrade is still ongoing, we need to support both
  // we're sending requests including both fields, putting the same value to both
  // TODO: keep only "query" after the upgrade to 0.50.0
  const { events, ...rest } = params;
  return request('getTransactions', {
    ...rest,
    ...(events && { events, query: events }),
  });
};
export const getValidators = (params?: ApiParams) =>
  request('getValidators', params);
export const getValidatorsVotes = (params?: ApiParams) =>
  request('getValidatorsVotes', params);
export const searchUptimes = (params?: ApiParams) =>
  request('searchUptimes', params);
export const searchProposedBlocks = (params?: ApiParams) =>
  request('searchProposedBlocks', params);
export const searchHeartbeats = (params?: ApiParams) =>
  request('searchHeartbeats', params);
export const searchEVMPolls = (params?: ApiParams) =>
  request('searchEVMPolls', params);
export const searchAmplifierPolls = (params?: ApiParams) =>
  request('searchAmplifierPolls', params);
export const searchAmplifierProofs = (params?: ApiParams) =>
  request('searchAmplifierProofs', params);
export const getChainMaintainers = (params?: ApiParams) =>
  request('getChainMaintainers', params);
export const getValidatorDelegations = (params?: ApiParams) =>
  request('getValidatorDelegations', params);
export const getVerifiers = (params?: ApiParams) =>
  request('getVerifiers', params);
export const getVerifiersVotes = (params?: ApiParams) =>
  request('getVerifiersVotes', params);
export const getVerifiersSigns = (params?: ApiParams) =>
  request('getVerifiersSigns', params);
export const getVerifiersRewards = (params?: ApiParams) =>
  request('getVerifiersRewards', params);
export const searchRewardsDistribution = (params?: ApiParams) =>
  request('searchRewardsDistribution', params);
export const searchVerifiersRewards = (params?: ApiParams) =>
  request('searchVerifiersRewards', params);
export const getRewardsPool = (params?: ApiParams) =>
  request('getRewardsPool', params);
