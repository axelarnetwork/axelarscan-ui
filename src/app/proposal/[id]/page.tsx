import { Proposal } from '@/components/Proposal';
import { getProposal } from '@/lib/api/axelarscan';
import type { ProposalData } from '@/components/Proposal/Proposal.types';

export const revalidate = 60;

export default async function ProposalPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = (await getProposal({ id })) as ProposalData | null;
  return <Proposal id={id} initialData={data} />;
}
