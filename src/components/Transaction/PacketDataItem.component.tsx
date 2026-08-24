'use client';

import { JSONView } from '@/components/JSONView';
import { Tag } from '@/components/Tag';
import type { PacketDataItemProps } from './Transaction.types';
import * as styles from './Transaction.styles';

export function PacketDataItem({ packet }: PacketDataItemProps) {
  return (
    <div className={styles.packetDataItem}>
      <div className={styles.packetDataHeader}>
        <Tag className={styles.packetDataTag}>{packet.eventType}</Tag>
        {packet.sequence && (
          <span className={styles.packetDataSequence}>
            Packet #{packet.sequence}
          </span>
        )}
        <span className={styles.packetDataSource}>
          {packet.source === 'hex'
            ? 'Decoded from packet_data_hex'
            : 'From packet_data'}
        </span>
      </div>
      <JSONView value={packet.value} className={styles.packetDataJson} />
    </div>
  );
}
