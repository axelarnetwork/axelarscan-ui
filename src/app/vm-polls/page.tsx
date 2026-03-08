import { AmplifierPolls } from '@/components/AmplifierPolls';
import { getRPCStatus, searchAmplifierPolls } from '@/lib/api/validator';
import { toArray } from '@/lib/parser';
import { getParams } from '@/lib/operator';
import { processPollData } from '@/components/AmplifierPolls/AmplifierPolls.utils';
import type { AmplifierPollEntry } from '@/components/AmplifierPolls/AmplifierPolls.types';

const SIZE = 25;

export default async function VMPollsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const resolved = await searchParams;
  const params = getParams(new URLSearchParams(resolved), SIZE);

  const [response, rpcStatus] = await Promise.all([
    searchAmplifierPolls({ ...params, size: SIZE }) as Promise<{
      data?: AmplifierPollEntry[];
      total?: number;
    } | null>,
    getRPCStatus() as Promise<{ latest_block_height?: number } | null>,
  ]);

  const { data: rawData, total } = { ...response };
  const latestBlockHeight = rpcStatus?.latest_block_height ?? 0;

  const data = processPollData(
    toArray(rawData) as AmplifierPollEntry[],
    latestBlockHeight
  );

  return <AmplifierPolls initialData={{ data, total: total ?? 0 }} />;
}
