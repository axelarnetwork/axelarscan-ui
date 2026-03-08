import { Verifiers } from '@/components/Verifiers';
import { fetchVerifiersPageData } from '@/components/Verifiers/Verifiers.utils';

export const revalidate = 30;

export default async function VerifiersPage() {
  const initialData = await fetchVerifiersPageData();
  return <Verifiers initialData={initialData} />;
}
