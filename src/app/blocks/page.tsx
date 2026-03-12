import { Blocks } from '@/components/Blocks';
import type { BlockEntry } from '@/components/Blocks/Blocks.types';
import { searchBlocks } from '@/lib/api/validator';

const SIZE = 250;

export const revalidate = 2;

export default async function BlocksPage() {
  const response = (await searchBlocks({ size: SIZE })) as {
    data?: BlockEntry[];
  } | null;

  return <Blocks initialData={{ data: response?.data ?? [] }} />;
}
