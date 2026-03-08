import { GMPs } from '@/components/GMPs';
import { searchGMP } from '@/lib/api/gmp';
import { customData } from '@/components/GMPs/GMPs.utils';
import { toArray } from '@/lib/parser';
import { getParams } from '@/lib/operator';
import type { GMPRowData } from '@/components/GMPs/GMPs.types';

const SIZE = 25;

export default async function GMPsSearchPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const resolved = await searchParams;
  const params = getParams(new URLSearchParams(resolved), SIZE);

  const sort = params.sortBy === 'value' ? { value: 'desc' } : undefined;
  const apiParams = { ...params };
  delete apiParams.sortBy;

  const response = (await searchGMP({
    ...apiParams,
    size: SIZE,
    sort,
  })) as Record<string, unknown> | null;

  let data: GMPRowData[] = [];
  let total = 0;

  if (response) {
    data = await Promise.all(
      toArray(response.data as unknown[]).map((d: unknown) =>
        customData(d as GMPRowData)
      )
    );
    total = (response.total as number) ?? 0;
  }

  return <GMPs initialData={{ data, total }} />;
}
