import { Account } from '@/components/Account';

export default async function AccountPage({
  params,
}: {
  params: Promise<{ address: string }>;
}) {
  const { address } = await params;
  return <Account address={address} />;
}
