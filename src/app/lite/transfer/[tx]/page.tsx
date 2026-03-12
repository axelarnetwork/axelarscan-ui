import { Transfer } from '@/components/Transfer';
import type { SearchTransfersResult } from '@/components/Transfer/Transfer.types';
import { searchTransfers } from '@/lib/api/token-transfer';

export const revalidate = 30;

export default async function TransferPage({
  params,
}: {
  params: Promise<{ tx: string }>;
}) {
  const { tx } = await params;
  const data = (await searchTransfers({
    txHash: tx,
  })) as SearchTransfersResult | null;
  return <Transfer lite={true} tx={tx} initialData={data} />;
}
