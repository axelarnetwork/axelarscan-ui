import { Resources } from '@/components/Resources';

export default function ResourcePage({ params }: { params: { resource: string } }) {
  return <Resources {...params} />;
}
