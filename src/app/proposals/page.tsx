import { Proposals } from '@/components/Proposals';
import { getProposals } from '@/lib/api/axelarscan';
import { toArray } from '@/lib/parser';
import type {
  ProposalsApiResponse,
  ProposalListItem,
} from '@/components/Proposals/Proposals.types';

export const revalidate = 300;

export default async function ProposalsPage() {
  const response = (await getProposals()) as ProposalsApiResponse | null;
  const data = toArray(response?.data) as ProposalListItem[];
  return <Proposals data={data} />;
}
