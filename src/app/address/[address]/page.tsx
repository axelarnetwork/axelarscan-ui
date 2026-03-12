import { Address } from '@/components/Address';

export default async function AddressPage({
  params,
}: {
  params: Promise<{ address: string }>;
}) {
  const { address } = await params;
  return <Address address={address} />;
}
