import { AmplifierRewards } from '@/components/AmplifierRewards';

export default async function AmplifierRewardsPage({
  params,
}: {
  params: Promise<{ chain: string }>;
}) {
  const { chain } = await params;
  return <AmplifierRewards chain={chain} />;
}
