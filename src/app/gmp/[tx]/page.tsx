import { GMP } from '@/components/GMP';

export default function GMPPage({ params }: { params: { tx: string } }) {
  return <GMP {...params} />;
}
