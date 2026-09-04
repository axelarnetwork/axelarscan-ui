'use client';

import { JSONView } from '@/components/JSONView';
import { Tag } from '@/components/Tag';
import type { PacketDataItemProps } from './Transaction.types';
import * as styles from './Transaction.styles';

export function PacketDataItem({ packet }: PacketDataItemProps) {
  return (
    <div className={styles.stackedPanelItem}>
      <div className={styles.stackedPanelHeader}>
        <Tag className={styles.stackedPanelTag}>{packet.eventType}</Tag>
        {packet.sequence && (
          <span className={styles.packetDataSequence}>
            Packet #{packet.sequence}
          </span>
        )}
        <span className={styles.stackedPanelMutedText}>
          {packet.source === 'hex'
            ? 'Decoded from packet_data_hex'
            : 'From packet_data'}
        </span>
      </div>
      <JSONView value={packet.value} className={styles.packetDataJson} />
    </div>
  );
}
