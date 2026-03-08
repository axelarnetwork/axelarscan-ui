import { Verifiers } from '@/components/Verifiers';
import { fetchVerifiersPageData } from '@/components/Verifiers/Verifiers.utils';

export const revalidate = 60;

export default async function VerifiersPage() {
  const initialData = await fetchVerifiersPageData();
  return <Verifiers initialData={initialData} />;
}
