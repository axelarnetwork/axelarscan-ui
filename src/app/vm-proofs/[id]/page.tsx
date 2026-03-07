import { AmplifierProof } from '@/components/AmplifierProof';

export default function VMProofPage({ params }: { params: { id: string } }) {
  return <AmplifierProof {...params} />;
}
