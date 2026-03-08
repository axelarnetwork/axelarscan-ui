import { EVMPoll } from '@/components/EVMPoll';
import { searchEVMPolls } from '@/lib/api/validator';
import type { EVMPollData } from '@/components/EVMPoll/EVMPoll.types';

export default async function EVMPollPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = (await searchEVMPolls({ pollId: id })) as {
    data?: EVMPollData[];
  } | null;
  return <EVMPoll id={id} initialData={data ?? undefined} />;
}
