import { Validator } from '@/components/Validator';
import { getBalances } from '@/lib/api/axelarscan';
import { getRPCStatus } from '@/lib/api/validator';

export default async function ValidatorPage({
  params,
}: {
  params: Promise<{ address: string }>;
}) {
  const { address } = await params;
  const [balances, rpcStatus] = await Promise.all([
    getBalances({ address }),
    getRPCStatus(),
  ]);

  return (
    <Validator
      address={address}
      initialBalances={balances}
      initialRPCStatus={rpcStatus}
    />
  );
}
