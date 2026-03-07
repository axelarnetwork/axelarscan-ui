import { Number } from '@/components/Number';
import { numberFormat } from '@/lib/number';
import type { UptimeBlock } from '@/types';
import type { UptimesProps } from './Validator.types';
import { UptimeBlockDot } from './UptimeBlockDot.component';
import * as styles from './Validator.styles';

const SIZE = 200;

export function Uptimes({ data }: UptimesProps) {
  if (!data) {
    return null;
  }

  return (
    <div className={styles.sectionWrapper}>
      <div className={styles.sectionHeader}>
        <div className={styles.sectionHeaderLeft}>
          <h3 className={styles.sectionTitle}>Uptimes</h3>
          <p className={styles.sectionSubtitle}>
            Latest {numberFormat(SIZE, '0,0')} Blocks
          </p>
        </div>
        <div className={styles.sectionHeaderRight}>
          <Number
            value={
              (data.filter((d: UptimeBlock) => d.status).length * 100) /
              data.length
            }
            suffix="%"
            className={styles.sectionTitle}
          />
          <Number
            value={data.filter((d: UptimeBlock) => d.status).length}
            format="0,0"
            suffix={`/${data.length}`}
            className={styles.sectionSubtitle}
          />
        </div>
      </div>
      <div className={styles.blockGrid}>
        {data.map((d: UptimeBlock, i: number) => (
          <UptimeBlockDot key={i} d={d} />
        ))}
      </div>
    </div>
  );
}
