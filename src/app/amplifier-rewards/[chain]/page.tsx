import { AmplifierRewards } from '@/components/AmplifierRewards';

export default function AmplifierRewardsPage({ params }: { params: { chain: string } }) {
  return <AmplifierRewards {...params} />;
}
