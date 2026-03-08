import { Block } from '@/components/Block';
import { getBlock, getValidatorSets } from '@/lib/api/validator';
import type {
  BlockData,
  ValidatorSetEntry,
} from '@/components/Block/Block.types';

export default async function BlockPage({
  params,
}: {
  params: Promise<{ height: string }>;
}) {
  const { height } = await params;
  const [block, validatorSets] = await Promise.all([
    getBlock(height) as Promise<BlockData | null>,
    getValidatorSets(height) as Promise<ValidatorSetEntry[] | null>,
  ]);
  return (
    <Block
      height={height}
      initialBlock={block}
      initialValidatorSets={validatorSets}
    />
  );
}
