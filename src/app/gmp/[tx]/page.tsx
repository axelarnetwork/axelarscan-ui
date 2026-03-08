import { GMP } from '@/components/GMP';
import type { SearchGMPResult } from '@/components/GMP/GMP.types';
import { searchGMP } from '@/lib/api/gmp';

export default async function GMPPage({
  params,
}: {
  params: Promise<{ tx: string }>;
}) {
  const { tx } = await params;
  const data = (await searchGMP(
    tx.includes('-') ? { messageId: tx } : { txHash: tx }
  )) as SearchGMPResult | null;
  return <GMP tx={tx} initialData={data} />;
}
