import _ from 'lodash';

import { EVMPolls } from '@/components/EVMPolls';
import { searchEVMPolls } from '@/lib/api/validator';
import { fetchChains } from '@/lib/queries/chainQueries';
import { processPolls } from '@/components/EVMPolls/EVMPolls.utils';
import { getParams } from '@/lib/operator';
import type { EVMPollRecord } from '@/components/EVMPolls/EVMPolls.types';

const SIZE = 25;

export default async function PollsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const resolved = await searchParams;
  const params = getParams(new URLSearchParams(resolved), SIZE);

  const [response, chains] = await Promise.all([
    searchEVMPolls({ ...params, size: SIZE }) as Promise<Record<
      string,
      unknown
    > | null>,
    fetchChains(),
  ]);

  const { data: rawData, total } = { ...response } as {
    data?: unknown;
    total?: number;
  };

  const data = _.orderBy(
    processPolls(rawData as EVMPollRecord[], chains),
    ['idNumber', 'created_at.ms'],
    ['desc', 'desc']
  );

  return <EVMPolls initialData={{ data, total: total || 0 }} />;
}
