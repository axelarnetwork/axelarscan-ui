import { toCase } from '@/lib/parser';

export const isAxelar = (chain: string | undefined) =>
  ['axelarnet', 'axelar'].includes(toCase(chain, 'lower') as string);
