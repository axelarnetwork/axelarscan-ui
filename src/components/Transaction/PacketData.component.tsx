'use client';

import { normalizeEvents } from '@/lib/chain/cosmos';
import { extractIbcPacketData, type IbcEvent } from '@/lib/chain/ibc';
import type { DataProps } from './Transaction.types';
import { PacketDataItem } from './PacketDataItem.component';
import * as styles from './Transaction.styles';

export function PacketData({ data }: DataProps) {
  // Same event source as getActivities.
  const events = normalizeEvents(
    data as Parameters<typeof normalizeEvents>[0]
  ) as IbcEvent[];
  const packets = extractIbcPacketData(events);

  if (packets.length === 0) return null;

  return (
    <section className={styles.sectionWrapper}>
      <h3 className={styles.sectionTitle}>Packet data</h3>
      <div className={styles.packetDataPanel}>
        {packets.map((packet, index) => (
          <PacketDataItem
            key={`${packet.eventType}-${packet.sequence ?? 'unknown'}-${index}`}
            packet={packet}
          />
        ))}
      </div>
    </section>
  );
}
