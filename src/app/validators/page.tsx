import { Validators } from '@/components/Validators';
import { fetchValidatorsPageData } from '@/components/Validators/Validators.utils';

export const revalidate = 60;

export default async function ValidatorsPage() {
  const initialData = await fetchValidatorsPageData();
  return <Validators status="active" initialData={initialData} />;
}
