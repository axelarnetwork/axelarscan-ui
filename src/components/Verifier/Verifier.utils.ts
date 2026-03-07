import { toArray } from '@/lib/parser';
import { equalsIgnoreCase } from '@/lib/string';

export function flattenVerifierEntries(
  entries: unknown[],
  verifierAddress: string | undefined
) {
  return toArray(entries).map((d: unknown) =>
    Object.fromEntries(
      Object.entries(d as Record<string, unknown>)
        .filter(
          ([k]) =>
            !k.startsWith('axelar') || equalsIgnoreCase(k, verifierAddress)
        )
        .flatMap(([k, v]) =>
          equalsIgnoreCase(k, verifierAddress)
            ? Object.entries({ ...(v as Record<string, unknown>) }).map(
                ([k, v]) => [k === 'id' ? 'txhash' : k, v]
              )
            : [[k, v]]
        )
    )
  );
}
