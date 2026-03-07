import { Transaction } from '@/components/Transaction';

export default function TransactionPage({
  params,
}: {
  params: { tx: string };
}) {
  return <Transaction {...params} />;
}
