import { Proposal } from '@/components/Proposal';

export default function ProposalPage({ params }: { params: { id: string } }) {
  return <Proposal {...params} />;
}
