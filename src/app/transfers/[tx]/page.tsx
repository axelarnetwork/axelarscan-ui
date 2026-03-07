import { Transfer } from '@/components/Transfer';

export default function TransferPage({ params }: { params: { tx: string } }) {
  return <Transfer {...params} />;
}
