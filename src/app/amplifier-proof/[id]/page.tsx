import { AmplifierProof } from '@/components/AmplifierProof';

export default function AmplifierProofPage({ params }: { params: { id: string } }) {
  return <AmplifierProof {...params} />;
}
