import { EVMBatches } from '@/components/EVMBatches';
import { searchBatches } from '@/lib/api/token-transfer';
import { ENVIRONMENT } from '@/lib/config';
import { getParams } from '@/lib/operator';
import { PAGE_SIZE } from '@/components/EVMBatches/EVMBatches.types';
import type { BatchSearchResponse } from '@/components/EVMBatches/EVMBatches.types';

export default async function BatchesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const resolved = await searchParams;
  const params = getParams(new URLSearchParams(resolved), PAGE_SIZE);

  let response = (await searchBatches({
    ...params,
    size: PAGE_SIZE,
  })) as BatchSearchResponse | null;

  if (
    response &&
    !response.data &&
    !['mainnet', 'testnet'].includes(ENVIRONMENT!)
  ) {
    response = { data: [], total: 0 };
  }

  const data = response?.data ?? [];
  const total = response?.total ?? 0;

  return <EVMBatches initialData={{ data, total }} />;
}
