import { Resources } from '@/components/Resources';

export default async function ResourcePage({
  params,
}: {
  params: Promise<{ resource: string }>;
}) {
  const { resource } = await params;
  return <Resources resource={resource} />;
}
