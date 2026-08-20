import { toArray } from '@/lib/parser';

/**
 * IBC packet attribute decoding for the ibc-go v8 -> v10 transition.
 *
 * ibc-go v8 emits both the raw and the hex form of the IBC payload attributes:
 *   packet_data / packet_data_hex, packet_ack / packet_ack_hex
 * ibc-go v10 drops the raw attributes and emits ONLY the hex form:
 *   packet_data_hex, packet_ack_hex
 *
 * The *_hex value is the hexadecimal encoding of the original UTF-8 bytes.
 *
 * resolveIbcPayload() returns a canonical UTF-8 string for one of the two IBC
 * payload keys (prefer hex, fall back to raw). normalizeIbcAttributes() returns
 * a new attribute array with a synthetic canonical `packet_data` / `packet_ack`
 * entry so that whole-array consumers (Object.fromEntries / _.assign) keep
 * receiving `packet_data` for hex-only v10 events. Malformed input, duplicates
 * and raw/hex mismatches are surfaced (never silently swallowed).
 *
 * The fallback is intentionally restricted to these two keys only — there is no
 * generic <key>_hex fallback.
 *
 * Decoding uses TextDecoder/Uint8Array (browser- and server-safe) rather than
 * Buffer, so the Transactions page can decode client-side.
 */

export interface IbcAttribute {
  key: string;
  value?: string | null;
  index?: boolean;
}

export type IbcIssueHandler = (key: string, message: string) => void;

// The only two keys that gained hex-only emission in ibc-go v10.
const IBC_PAYLOAD_KEYS = ['packet_data', 'packet_ack'] as const;

const HEX_KEY: Record<string, string> = {
  packet_data: 'packet_data_hex',
  packet_ack: 'packet_ack_hex',
};

const HEX_CHARS = /^[0-9a-fA-F]*$/;

/**
 * Strictly decode a hex string to a UTF-8 string.
 * Rejects: non-strings, empty, odd length, non-hex characters, and byte
 * sequences that are not valid UTF-8 (TextDecoder fatal mode).
 * Throws Error on any violation; returns the decoded UTF-8 string otherwise.
 */
export const decodeHexStrict = (hex: unknown): string => {
  if (typeof hex !== 'string') throw new Error('hex value is not a string');
  if (hex.length === 0) throw new Error('hex value is empty');
  if (hex.length % 2 !== 0) throw new Error('hex value has odd length');
  if (!HEX_CHARS.test(hex))
    throw new Error('hex value contains non-hex characters');

  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.substr(i * 2, 2), 16);
  }

  try {
    return new TextDecoder('utf-8', { fatal: true }).decode(bytes);
  } catch {
    throw new Error('hex value does not decode to valid UTF-8');
  }
};

export interface ResolvedPayload {
  value?: string;
  error?: string;
}

/**
 * Resolve the canonical UTF-8 string for a single IBC payload key from an
 * event's full attribute array. `value` is the decoded/raw canonical string, or
 * undefined when unresolvable. `error` is a human-readable description when
 * something was wrong (duplicate, malformed hex, or raw/hex mismatch); a
 * mismatch still returns the canonical (hex) value alongside the error.
 */
export const resolveIbcPayload = (
  attributes: IbcAttribute[] | undefined,
  key: string
): ResolvedPayload => {
  const hexKey = HEX_KEY[key];
  const list = toArray(attributes) as IbcAttribute[];

  if (!hexKey) {
    const found = list.find(a => a && a.key === key);
    return { value: found?.value ?? undefined };
  }

  const raws = list.filter(a => a && a.key === key).map(a => a.value);
  const hexes = list.filter(a => a && a.key === hexKey).map(a => a.value);

  // Duplicates are ambiguous: reject (do not guess) but report.
  if (raws.length > 1)
    return { value: undefined, error: `duplicate "${key}" attributes` };
  if (hexes.length > 1)
    return { value: undefined, error: `duplicate "${hexKey}" attributes` };

  const raw = raws[0] ?? undefined;
  const hex = hexes[0] ?? undefined;

  // No hex form present -> accept raw-only input.
  if (hex === undefined) return { value: raw ?? undefined };

  let decoded: string;
  try {
    decoded = decodeHexStrict(hex);
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    // Malformed hex must not silently fall through to the raw value: report it.
    // Fall back to raw only when raw is present, otherwise leave unresolved.
    if (raw !== undefined && raw !== null) {
      return {
        value: raw,
        error: `"${hexKey}" ${message}; using raw "${key}"`,
      };
    }
    return { value: undefined, error: `"${hexKey}" ${message}` };
  }

  // Both forms present and disagree: prefer the canonical hex value, surface it.
  // (Equal UTF-8 strings imply equal bytes, so string comparison is exact.)
  if (raw !== undefined && raw !== null && raw !== decoded) {
    return {
      value: decoded,
      error: `"${key}" and "${hexKey}" disagree; using "${hexKey}"`,
    };
  }

  return { value: decoded };
};

const defaultOnIssue: IbcIssueHandler = (key, message) => {
  // No app logger in the browser; surface loudly instead of swallowing.
  console.warn(`[ibc] attribute "${key}": ${message}`);
};

/**
 * Return a NEW attribute array where the IBC payload keys have been collapsed to
 * a single canonical entry holding the decoded UTF-8 string. The *_hex entries
 * are preserved for diagnostics; existing raw entries are replaced by the
 * canonical value. Whole-array consumers (Object.fromEntries / _.assign) that
 * key on `packet_data` / `packet_ack` therefore keep working for hex-only v10
 * events, exactly as they did for v8.
 */
export const normalizeIbcAttributes = (
  attributes: IbcAttribute[] | undefined,
  onIssue: IbcIssueHandler = defaultOnIssue
): IbcAttribute[] => {
  const list = toArray(attributes) as IbcAttribute[];

  // Keep every non-payload attribute, and keep the *_hex entries as diagnostics;
  // drop the raw payload entries so we can re-add a single canonical one.
  const out = list.filter(
    a => !a || !(IBC_PAYLOAD_KEYS as readonly string[]).includes(a.key)
  );

  for (const key of IBC_PAYLOAD_KEYS) {
    const { value, error } = resolveIbcPayload(list, key);
    if (error) onIssue(key, error);
    if (value !== undefined) out.push({ key, value });
  }

  return out;
};
