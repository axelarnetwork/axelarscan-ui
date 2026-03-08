import { Transaction } from '@/components/Transaction';
import { getTransaction } from '@/lib/api/validator';
import type { TransactionData } from '@/components/Transaction/Transaction.types';

export const revalidate = 30;

export default async function TransactionPage({
  params,
}: {
  params: Promise<{ tx: string }>;
}) {
  const { tx } = await params;
  const data = (await getTransaction(tx)) as TransactionData | null;
  return <Transaction tx={tx} initialData={data} />;
}
