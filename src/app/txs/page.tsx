import { Transactions } from '@/components/Transactions';
import { searchTransactions } from '@/lib/api/validator';
import { getParams } from '@/lib/operator';
import type { TransactionRowData } from '@/components/Transactions/Transactions.types';
import { PAGE_SIZE } from '@/components/Transactions/Transactions.types';

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const resolved = await searchParams;
  const params = getParams(new URLSearchParams(resolved), PAGE_SIZE);

  const response = (await searchTransactions({
    ...params,
    size: PAGE_SIZE,
  })) as { data?: TransactionRowData[]; total?: number } | null;

  const data = response?.data ?? [];
  const total = response?.total ?? 0;

  return <Transactions initialData={{ data, total }} />;
}
