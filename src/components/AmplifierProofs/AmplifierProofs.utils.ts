import _ from 'lodash';

import { toArray, getValuesOfAxelarAddressKey, split } from '@/lib/parser';
import { equalsIgnoreCase } from '@/lib/string';
import type {
  SignEntry,
  SignOptionEntry,
  AmplifierProofEntry,
  BlockData,
  FilterOption,
  FilterAttribute,
} from './AmplifierProofs.types';

export function buildProofEntry(d: unknown, blockData: BlockData): AmplifierProofEntry {
  const rawEntry = d as Record<string, unknown>;
  const signs = getValuesOfAxelarAddressKey(rawEntry).map((s) => {
    const entry = s as Record<string, unknown>;
    return {
      ...entry,
      signer: entry.signer as string | undefined,
      sign: entry.sign as boolean | undefined,
      height: entry.height as number | undefined,
      created_at: entry.created_at as { ms?: number } | undefined,
      option: entry.sign ? 'signed' : 'unsubmitted',
    } as SignEntry;
  });

  const signOptions: SignOptionEntry[] = Object.entries(_.groupBy(signs, 'option'))
    .map(([k, v]) => ({
      option: k,
      value: v?.length,
      signers: toArray(v?.map((entry: SignEntry) => entry.signer)) as string[],
    }))
    .filter((s) => s.value)
    .map((s) => ({
      ...s,
      i: s.option === 'signed' ? 0 : 1,
    }));

  const participants = rawEntry.participants as string[] | undefined;
  if (
    toArray(participants).length > 0 &&
    signOptions.findIndex((s) => s.option === 'unsubmitted') < 0 &&
    _.sumBy(signOptions, 'value') < toArray(participants).length
  ) {
    signOptions.push({
      option: 'unsubmitted',
      value: toArray(participants).length - _.sumBy(signOptions, 'value'),
      signers: undefined,
      i: 1,
    });
  }

  return {
    ...rawEntry,
    status: rawEntry.success
      ? 'completed'
      : rawEntry.failed
        ? 'failed'
        : rawEntry.expired ||
            (rawEntry.expired_height as number) < (blockData?.latest_block_height ?? 0)
          ? 'expired'
          : 'pending',
    height: _.minBy(signs, 'height')?.height || rawEntry.height,
    signs: _.orderBy(signs, ['height', 'created_at'], ['desc', 'desc']),
    signOptions: _.orderBy(signOptions, ['i'], ['asc']),
  } as AmplifierProofEntry;
}

export function getSelectedValue(attribute: FilterAttribute, params: Record<string, unknown>) {
  const paramValue = params[attribute.name] as string | undefined;
  const isSelected = (v: string) =>
    attribute.multiple
      ? split(paramValue).includes(v)
      : v === paramValue || equalsIgnoreCase(v, paramValue);
  const selectedValue = attribute.multiple
    ? toArray(attribute.options).filter((o: FilterOption) => isSelected(o.value ?? ''))
    : toArray(attribute.options).find((o: FilterOption) => isSelected(o.value ?? ''));
  return selectedValue;
}
