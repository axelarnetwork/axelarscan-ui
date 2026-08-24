'use client';

import { JSONView } from '@/components/JSONView';
import { Tag } from '@/components/Tag';
import { extractIbcPacketData } from '@/lib/chain/ibc';
import type { DataProps } from './Transaction.types';
import * as styles from './Transaction.styles';

export function PacketData({ data }: DataProps) {
  const packets = extractIbcPacketData(data.events);

  if (packets.length === 0) return null;

  return (
    <section className={styles.sectionWrapper}>
      <h3 className={styles.sectionTitle}>Packet data</h3>
      <div className={styles.packetDataPanel}>
        {packets.map((packet, index) => (
          <div
            key={`${packet.eventType}-${packet.sequence ?? 'unknown'}-${index}`}
            className={styles.packetDataItem}
          >
            <div className={styles.packetDataHeader}>
              <Tag className={styles.packetDataTag}>{packet.eventType}</Tag>
              {packet.sequence && (
                <span className={styles.packetDataSequence}>
                  Packet #{packet.sequence}
                </span>
              )}
              <span className={styles.packetDataSource}>
                {packet.source === 'packet_data_hex'
                  ? 'Decoded from packet_data_hex'
                  : 'From packet_data'}
              </span>
            </div>
            <JSONView value={packet.value} className={styles.packetDataJson} />
          </div>
        ))}
      </div>
    </section>
  );
}
