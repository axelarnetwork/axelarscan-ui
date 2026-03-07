import { Account } from '@/components/Account';

export default function AccountsPage({ params }: { params: { address: string } }) {
  return <Account {...params} />;
}
