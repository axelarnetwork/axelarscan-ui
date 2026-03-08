import { Verifier } from '@/components/Verifier';
import { getRPCStatus } from '@/lib/api/validator';

export default async function VerifierPage({
  params,
}: {
  params: Promise<{ address: string }>;
}) {
  const { address } = await params;
  const rpcStatus = await getRPCStatus();

  return <Verifier address={address} initialRPCStatus={rpcStatus} />;
}
