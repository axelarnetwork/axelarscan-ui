import { EVMBatch } from '@/components/EVMBatch';

export default function BatchPage({ params }: { params: { chain: string; id: string } }) {
  return <EVMBatch {...params} />;
}
