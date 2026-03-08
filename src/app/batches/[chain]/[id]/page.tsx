import { EVMBatch } from '@/components/EVMBatch';

export default async function BatchPage({
  params,
}: {
  params: Promise<{ chain: string; id: string }>;
}) {
  const { chain, id } = await params;
  return <EVMBatch chain={chain} id={id} />;
}
