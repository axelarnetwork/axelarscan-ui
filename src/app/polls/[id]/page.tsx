import { EVMPoll } from '@/components/EVMPoll';

export default function PollPage({ params }: { params: { id: string } }) {
  return <EVMPoll {...params} />;
}
