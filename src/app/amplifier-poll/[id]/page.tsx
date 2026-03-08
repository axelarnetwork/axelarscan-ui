import { AmplifierPoll } from '@/components/AmplifierPoll';
import { getRPCStatus, searchAmplifierPolls } from '@/lib/api/validator';
import type {
  RPCStatusData,
  AmplifierPollData,
} from '@/components/AmplifierPoll/AmplifierPoll.types';

export default async function AmplifierPollPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [rpcStatus, pollData] = await Promise.all([
    getRPCStatus() as Promise<RPCStatusData | null>,
    searchAmplifierPolls({ pollId: id }) as Promise<{
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
