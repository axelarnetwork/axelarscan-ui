/**
 * @jest-environment node
 */
import _ from 'lodash';

import { getActivities } from './Transactions.utils';
import type { TransactionData } from './Transactions.types';
import type { Asset } from '@/types';

const toHex = (s: string) => Buffer.from(s, 'utf8').toString('hex');

const PACKET_DATA_JSON = JSON.stringify({
  amount: '1500000',
  denom: 'uaxl',
  receiver: 'axelar1recv',
  sender: 'osmo1send',
});
const PACKET_DATA_HEX = toHex(PACKET_DATA_JSON);

const ASSETS: Asset[] = [
  { id: 'uaxl', denom: 'uaxl', symbol: 'AXL', decimals: 6 },
];

// A MsgRecvPacket falls through to the event-driven branch of getActivities,
// where the `recv_packet` attributes become the activity via _.assign.
const mkTx = (
  payloadAttributes: Array<{ key: string; value: string }>
): TransactionData => ({
  txhash: '0xdead',
  tx: {
    body: { messages: [{ '@type': '/ibc.core.channel.v1.MsgRecvPacket' }] },
  },
  events: [
    {
      type: 'recv_packet',
      attributes: [
        { key: 'packet_src_channel', value: 'channel-2' },
        { key: 'packet_dst_channel', value: 'channel-3' },
        { key: 'packet_sequence', value: '77' },
        ...payloadAttributes,
      ],
    },
  ],
});

const V8 = mkTx([
  { key: 'packet_data', value: PACKET_DATA_JSON },
  { key: 'packet_data_hex', value: PACKET_DATA_HEX },
]);
const V8_RAW_ONLY = mkTx([{ key: 'packet_data', value: PACKET_DATA_JSON }]);
const V10_HEX_ONLY = mkTx([{ key: 'packet_data_hex', value: PACKET_DATA_HEX }]);

describe('getActivities: IBC packet data across the ibc-go v8 -> v10 upgrade', () => {
  it('resolves amount, denom and symbol from a hex-only (v10) recv_packet', () => {
    const [activity] = getActivities(V10_HEX_ONLY, ASSETS)!;

    expect(activity.packet_data).toEqual({
      amount: 1.5,
      denom: 'uaxl',
      receiver: 'axelar1recv',
      sender: 'osmo1send',
    });
    expect(activity.symbol).toBe('AXL');
  });

  it('produces the same activity for v8 (raw + hex), v8 (raw only) and v10 (hex only)', () => {
    const v8 = getActivities(V8, ASSETS);
    const v8RawOnly = getActivities(V8_RAW_ONLY, ASSETS);
    const v10 = getActivities(V10_HEX_ONLY, ASSETS);

    expect(v10).toEqual(v8);
    expect(v8RawOnly).toEqual(v8!.map(a => _.omit(a, 'packet_data_hex')));
  });
});
