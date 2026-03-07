import { Validator } from '@/components/Validator';

export default function ValidatorPage({ params }: { params: { address: string } }) {
  return <Validator {...params} />;
}
