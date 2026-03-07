import { Block } from '@/components/Block';

export default function BlockPage({ params }: { params: { height: string } }) {
  return <Block {...params} />;
}
