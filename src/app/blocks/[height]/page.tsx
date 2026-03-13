import { Block } from '@/components/Block';
import { getBlock, getValidatorSets } from '@/lib/api/validator';
import type {
  BlockData,
  ValidatorSetEntry,
} from '@/components/Block/Block.types';

export const revalidate = 30;

export default async function BlockPage({
  params,
}: {
  params: Promise<{ height: string }>;
}) {
  const { height } = await params;
  const [block, validatorSetsResponse] = await Promise.all([
    getBlock(height) as Promise<BlockData | null>,
    getValidatorSets(height) as Promise<{
      result?: { validators?: ValidatorSetEntry[] };
    } | null>,
  ]);
  const validatorSets = validatorSetsResponse?.result?.validators ?? null;
  return (
    <Block
      height={height}
      initialBlock={block}
      initialValidatorSets={validatorSets}
    />
  );
}
