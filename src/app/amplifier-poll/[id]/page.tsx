import { AmplifierPoll } from '@/components/AmplifierPoll';
import { getRPCStatus, searchAmplifierPolls } from '@/lib/api/validator';
import { parseCompoundId } from '@/lib/string';
import type {
  RPCStatusData,
  AmplifierPollData,
} from '@/components/AmplifierPoll/AmplifierPoll.types';

export const revalidate = 30;

export default async function AmplifierPollPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [rpcStatus, pollData] = await Promise.all([
    getRPCStatus() as Promise<RPCStatusData | null>,
    searchAmplifierPolls({
      verifierContractAddress: parseCompoundId(id).contractAddress,
      pollId: parseCompoundId(id).resourceId,
    }) as Promise<{
      data?: AmplifierPollData[];
    } | null>,
  ]);
  return (
    <AmplifierPoll
      id={id}
      initialRPCStatus={rpcStatus ?? undefined}
      initialData={pollData ?? undefined}
    />
  );
}
