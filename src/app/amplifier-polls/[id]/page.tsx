import { AmplifierPoll } from '@/components/AmplifierPoll';

export default function AmplifierPollPage({ params }: { params: { id: string } }) {
  return <AmplifierPoll {...params} />;
}
