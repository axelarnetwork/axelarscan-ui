import { AmplifierPoll } from '@/components/AmplifierPoll';

export default function VMPollPage({ params }: { params: { id: string } }) {
  return <AmplifierPoll {...params} />;
}
