/**
 * @jest-environment node
 */
import {
  decodeHexStrict,
  resolveIbcPayload,
  normalizeIbcAttributes,
  extractIbcPacketData,
  type IbcAttribute,
} from './ibc';

const toHex = (s: string) => Buffer.from(s, 'utf8').toString('hex');

// Realistic ICS-20 packet_data used for a GMP gas payment.
const PACKET_DATA_JSON = JSON.stringify({
  amount: '1000000',
  denom: 'transfer/channel-3/uaxl',
  receiver: 'axelar1gasservice000000000000000000000000000000',
  sender: 'osmo1sender0000000000000000000000000000000000',
  memo: JSON.stringify({
    source_chain: 'osmosis',
    destination_chain: 'ethereum',
    contract: '0xabc',
  }),
});
const PACKET_DATA_HEX = toHex(PACKET_DATA_JSON);

const ACK_SUCCESS_JSON = JSON.stringify({ result: 'AQ==' });
const ACK_ERROR_JSON = JSON.stringify({ error: 'insufficient funds' });

describe('decodeHexStrict', () => {
  it('decodes valid UTF-8 hex', () => {
    expect(decodeHexStrict(PACKET_DATA_HEX)).toBe(PACKET_DATA_JSON);
  });
  it('rejects non-string', () => {
    expect(() => decodeHexStrict(123)).toThrow(/not a string/);
  });
  it('rejects empty', () => {
    expect(() => decodeHexStrict('')).toThrow(/empty/);
  });
  it('rejects odd length', () => {
    expect(() => decodeHexStrict('abc')).toThrow(/odd length/);
  });
  it('rejects non-hex characters', () => {
    expect(() => decodeHexStrict('zz')).toThrow(/non-hex/);
  });
  it('rejects invalid UTF-8 (lone 0xff)', () => {
    expect(() => decodeHexStrict('ff')).toThrow(/valid UTF-8/);
  });
  it('accepts a genuine U+FFFD in source', () => {
    const s = 'a�b';
    expect(decodeHexStrict(toHex(s))).toBe(s);
  });
});

describe('resolveIbcPayload: packet_data', () => {
  it('raw-only parses', () => {
    expect(
      resolveIbcPayload(
        [{ key: 'packet_data', value: PACKET_DATA_JSON }],
        'packet_data'
      )
    ).toEqual({ value: PACKET_DATA_JSON, source: 'raw' });
  });
  it('hex-only parses', () => {
    expect(
      resolveIbcPayload(
        [{ key: 'packet_data_hex', value: PACKET_DATA_HEX }],
        'packet_data'
      )
    ).toEqual({ value: PACKET_DATA_JSON, source: 'hex' });
  });
  it('matching raw + hex uses hex, no error', () => {
    const r = resolveIbcPayload(
      [
        { key: 'packet_data', value: PACKET_DATA_JSON },
        { key: 'packet_data_hex', value: PACKET_DATA_HEX },
      ],
      'packet_data'
    );
    expect(r.value).toBe(PACKET_DATA_JSON);
    expect(r.source).toBe('hex');
    expect(r.error).toBeUndefined();
  });
  it('conflicting raw + hex surfaces error, prefers hex', () => {
    const r = resolveIbcPayload(
      [
        { key: 'packet_data', value: '{"receiver":"tampered"}' },
        { key: 'packet_data_hex', value: PACKET_DATA_HEX },
      ],
      'packet_data'
    );
    expect(r.value).toBe(PACKET_DATA_JSON);
    expect(r.source).toBe('hex');
    expect(r.error).toMatch(/disagree/);
  });
  it('odd-length hex, no raw -> rejected', () => {
    const r = resolveIbcPayload(
      [{ key: 'packet_data_hex', value: 'abc' }],
      'packet_data'
    );
    expect(r.value).toBeUndefined();
    expect(r.error).toMatch(/odd length/);
  });
  it('non-hex -> rejected', () => {
    const r = resolveIbcPayload(
      [{ key: 'packet_data_hex', value: 'zzzz' }],
      'packet_data'
    );
    expect(r.value).toBeUndefined();
    expect(r.error).toMatch(/non-hex/);
  });
  it('invalid UTF-8 -> rejected', () => {
    const r = resolveIbcPayload(
      [{ key: 'packet_data_hex', value: 'ffff' }],
      'packet_data'
    );
    expect(r.value).toBeUndefined();
    expect(r.error).toMatch(/valid UTF-8/);
  });
  it('malformed hex WITH raw falls back to raw + error', () => {
    const r = resolveIbcPayload(
      [
        { key: 'packet_data', value: PACKET_DATA_JSON },
        { key: 'packet_data_hex', value: 'abc' },
      ],
      'packet_data'
    );
    expect(r.value).toBe(PACKET_DATA_JSON);
    expect(r.source).toBe('raw');
    expect(r.error).toMatch(/using raw/);
  });
  it('empty payload -> unresolved, no error', () => {
    expect(resolveIbcPayload([], 'packet_data')).toEqual({});
  });
  it('duplicate raw -> rejected', () => {
    const r = resolveIbcPayload(
      [
        { key: 'packet_data', value: PACKET_DATA_JSON },
        { key: 'packet_data', value: PACKET_DATA_JSON },
      ],
      'packet_data'
    );
    expect(r.value).toBeUndefined();
    expect(r.error).toMatch(/duplicate "packet_data"/);
  });
  it('duplicate hex -> rejected', () => {
    const r = resolveIbcPayload(
      [
        { key: 'packet_data_hex', value: PACKET_DATA_HEX },
        { key: 'packet_data_hex', value: PACKET_DATA_HEX },
      ],
      'packet_data'
    );
    expect(r.value).toBeUndefined();
    expect(r.error).toMatch(/duplicate "packet_data_hex"/);
  });
});

describe('resolveIbcPayload: packet_ack', () => {
  it('hex-only success ack', () => {
    expect(
      resolveIbcPayload(
        [{ key: 'packet_ack_hex', value: toHex(ACK_SUCCESS_JSON) }],
        'packet_ack'
      ).value
    ).toBe(ACK_SUCCESS_JSON);
  });
  it('hex-only error ack', () => {
    expect(
      resolveIbcPayload(
        [{ key: 'packet_ack_hex', value: toHex(ACK_ERROR_JSON) }],
        'packet_ack'
      ).value
    ).toBe(ACK_ERROR_JSON);
  });
});

describe('normalizeIbcAttributes (whole-array parity for Object.fromEntries / _.assign)', () => {
  it('hex-only event yields a canonical packet_data key, keeps packet_data_hex', () => {
    const issues: string[] = [];
    const attrs: IbcAttribute[] = [
      { key: 'packet_sequence', value: '42' },
      { key: 'packet_data_hex', value: PACKET_DATA_HEX },
    ];
    const out = normalizeIbcAttributes(attrs, (k, m) =>
      issues.push(`${k}:${m}`)
    );
    const obj = Object.fromEntries(out.map(a => [a.key, a.value]));
    // Downstream (Object.fromEntries) now sees packet_data with decoded JSON.
    expect(obj.packet_data).toBe(PACKET_DATA_JSON);
    expect(JSON.parse(obj.packet_data as string).denom).toBe(
      'transfer/channel-3/uaxl'
    );
    expect(obj.packet_data_hex).toBe(PACKET_DATA_HEX); // preserved for diagnostics
    expect(obj.packet_sequence).toBe('42');
    expect(issues).toHaveLength(0);
  });
  it('raw-only event is unchanged in effect: packet_data present', () => {
    const out = normalizeIbcAttributes(
      [{ key: 'packet_data', value: PACKET_DATA_JSON }],
      () => {}
    );
    expect(Object.fromEntries(out.map(a => [a.key, a.value])).packet_data).toBe(
      PACKET_DATA_JSON
    );
  });
  it('returns non-payload attributes untouched', () => {
    const attrs: IbcAttribute[] = [
      { key: 'amount', value: '1000uaxl' },
      { key: 'receiver', value: 'axelar1recv' },
    ];
    expect(normalizeIbcAttributes(attrs, () => {})).toEqual(attrs);
  });
  it('drops both raw entries when duplicated', () => {
    const issues: string[] = [];
    const out = normalizeIbcAttributes(
      [
        { key: 'packet_data', value: PACKET_DATA_JSON },
        { key: 'packet_data', value: PACKET_DATA_JSON },
      ],
      (k, m) => issues.push(`${k}:${m}`)
    );
    expect(out).toEqual([]);
    expect(issues.some(i => /duplicate/.test(i))).toBe(true);
  });
  it('resolves packet_data and packet_ack from one write_acknowledgement event', () => {
    const out = normalizeIbcAttributes(
      [
        { key: 'packet_data_hex', value: PACKET_DATA_HEX },
        { key: 'packet_ack_hex', value: toHex(ACK_SUCCESS_JSON) },
      ],
      () => {}
    );
    const obj = Object.fromEntries(out.map(a => [a.key, a.value]));

    expect(obj.packet_data).toBe(PACKET_DATA_JSON);
    expect(obj.packet_ack).toBe(ACK_SUCCESS_JSON);
  });
  it('malformed hex-only event: no packet_data (degraded, not crashed), issue reported', () => {
    const issues: string[] = [];
    const out = normalizeIbcAttributes(
      [{ key: 'packet_data_hex', value: 'ffff' }],
      (k, m) => issues.push(`${k}:${m}`)
    );
    const obj = Object.fromEntries(out.map(a => [a.key, a.value]));
    expect(obj.packet_data).toBeUndefined();
    expect(issues.some(i => /valid UTF-8/.test(i))).toBe(true);
  });
});

describe('extractIbcPacketData', () => {
  it('extracts a displayable packet from a hex-only event', () => {
    expect(
      extractIbcPacketData([
        {
          type: 'send_packet',
          attributes: [
            { key: 'packet_sequence', value: '42' },
            { key: 'packet_data_hex', value: PACKET_DATA_HEX },
          ],
        },
      ])
    ).toEqual([
      {
        eventType: 'send_packet',
        sequence: '42',
        source: 'hex',
        value: JSON.parse(PACKET_DATA_JSON),
      },
    ]);
  });

  it('accepts pre-upgrade raw-only packet data', () => {
    expect(
      extractIbcPacketData([
        {
          type: 'send_packet',
          attributes: [{ key: 'packet_data', value: PACKET_DATA_JSON }],
        },
      ])[0]?.source
    ).toBe('raw');
  });

  it('keeps separate packets from a multi-packet transaction', () => {
    const events = ['1', '2'].map(sequence => ({
      type: 'send_packet',
      attributes: [
        { key: 'packet_sequence', value: sequence },
        { key: 'packet_data_hex', value: PACKET_DATA_HEX },
      ],
    }));

    expect(extractIbcPacketData(events).map(packet => packet.sequence)).toEqual(
      ['1', '2']
    );
  });

  it('does not display malformed or non-object JSON', () => {
    const issues: string[] = [];
    const events = [
      {
        type: 'send_packet',
        attributes: [{ key: 'packet_data_hex', value: toHex('{') }],
      },
      {
        type: 'send_packet',
        attributes: [{ key: 'packet_data_hex', value: toHex('null') }],
      },
    ];

    expect(
      extractIbcPacketData(events, (key, message) =>
        issues.push(`${key}:${message}`)
      )
    ).toEqual([]);
    expect(issues).toEqual([
      'packet_data:decoded value is not valid JSON',
      'packet_data:decoded JSON is not an object',
    ]);
  });
});
