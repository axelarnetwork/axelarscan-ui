import { Validators } from '@/components/Validators';
import { fetchValidatorsPageData } from '@/components/Validators/Validators.utils';

export const revalidate = 60;

export default async function ValidatorsPage({
  params,
}: {
  params: Promise<{ status: string }>;
}) {
  const { status } = await params;
  const initialData = await fetchValidatorsPageData();
  return <Validators status={status} initialData={initialData} />;
}
