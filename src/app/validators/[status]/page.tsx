import { Validators } from '@/components/Validators';

export default function ValidatorsPage({
  params,
}: {
  params: { status: string };
}) {
  return <Validators {...params} />;
}
