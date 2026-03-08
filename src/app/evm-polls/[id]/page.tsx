import { EVMPoll } from '@/components/EVMPoll';
import { searchEVMPolls } from '@/lib/api/validator';
import type { EVMPollData } from '@/components/EVMPoll/EVMPoll.types';

export const revalidate = 30;

export default async function PollPage({
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
