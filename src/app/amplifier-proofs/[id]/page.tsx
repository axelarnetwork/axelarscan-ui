import { AmplifierProof } from '@/components/AmplifierProof';
import { getRPCStatus, searchAmplifierProofs } from '@/lib/api/validator';
import { parseCompoundId } from '@/lib/string';
import type {
  RPCStatusData,
  AmplifierProofData,
} from '@/components/AmplifierProof/AmplifierProof.types';

export const revalidate = 30;

export default async function AmplifierProofPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [rpcStatus, proofData] = await Promise.all([
    getRPCStatus() as Promise<RPCStatusData | null>,
    searchAmplifierProofs({
      multisigContractAddress: parseCompoundId(id).contractAddress,
      sessionId: parseCompoundId(id).resourceId,
    }) as Promise<{
      data?: AmplifierProofData[];
    } | null>,
  ]);
  return (
    <AmplifierProof
      id={id}
      initialRPCStatus={rpcStatus ?? undefined}
      initialData={proofData ?? undefined}
    />
  );
}
