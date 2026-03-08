import _ from 'lodash';

import { Transfers } from '@/components/Transfers';
import { searchTransfers } from '@/lib/api/token-transfer';
import { getParams } from '@/lib/operator';

import type { TransferSearchResult } from '@/components/Transfers/Transfers.types';

const SIZE = 25;

export default async function TransfersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const resolved = await searchParams;
  const params = getParams(new URLSearchParams(resolved), SIZE);

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

  const initialData: TransferSearchResult = {
    data: response?.data ?? [],
    total: response?.total,
  };

  return <Transfers initialData={initialData} />;
}
