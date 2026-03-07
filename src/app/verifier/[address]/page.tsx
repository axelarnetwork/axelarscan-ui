import { Verifier } from '@/components/Verifier';

export default function VerifierPage({ params }: { params: { address: string } }) {
  return <Verifier {...params} />;
}
