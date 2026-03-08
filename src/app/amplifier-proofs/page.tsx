import _ from 'lodash';

import { AmplifierProofs } from '@/components/AmplifierProofs';
import { getRPCStatus, searchAmplifierProofs } from '@/lib/api/validator';
import { toArray } from '@/lib/parser';
import { getParams } from '@/lib/operator';
import { buildProofEntry } from '@/components/AmplifierProofs/AmplifierProofs.utils';
import type {
  BlockData,
  AmplifierProofEntry,
} from '@/components/AmplifierProofs/AmplifierProofs.types';

const SIZE = 25;

export default async function AmplifierProofsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const resolved = await searchParams;
  const params = getParams(new URLSearchParams(resolved), SIZE);

  const [response, blockData] = await Promise.all([
    searchAmplifierProofs({ ...params, size: SIZE }) as Promise<
      Record<string, unknown> | undefined
    >,
    getRPCStatus() as Promise<BlockData>,
  ]);

  const { data: rawData, total: rawTotal } = {
    ...(response as { data?: unknown[]; total?: number }),
  };

  const effectiveBlockData = blockData ?? { latest_block_height: 0 };

  const data: AmplifierProofEntry[] = _.orderBy(
    toArray(rawData).map(d => buildProofEntry(d, effectiveBlockData)),
    ['created_at.ms'],
    ['desc']
  );
  const total = rawTotal ?? 0;

  return (
    <AmplifierProofs
      initialData={{ data, total, blockData: effectiveBlockData }}
    />
  );
}
