import { Account } from '@/components/Account';

export default function AccountPage({
  params,
}: {
  params: { address: string };
}) {
  return <Account {...params} />;
}
