import { Address } from '@/components/Address';

export default function AddressPage({
  params,
}: {
  params: { address: string };
}) {
  return <Address {...params} />;
}
