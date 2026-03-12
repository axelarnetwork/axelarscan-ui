import { Account } from '@/components/Account';

export default async function AccountsPage({
  params,
}: {
  params: Promise<{ address: string }>;
}) {
  const { address } = await params;
  return <Account address={address} />;
}
