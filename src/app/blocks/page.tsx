import { Blocks } from '@/components/Blocks';
import { searchBlocks } from '@/lib/api/validator';
import type { BlockEntry } from '@/components/Blocks/Blocks.types';

const SIZE = 250;

export const revalidate = 3;

export default async function BlocksPage() {
  const response = (await searchBlocks({ size: SIZE })) as {
    data?: BlockEntry[];
  } | null;

  return <Blocks initialData={{ data: response?.data ?? [] }} />;
}
