import { Number } from '@/components/Number';
import { numberFormat } from '@/lib/number';
import type { ProposedBlock } from '@/types';
import type { ProposedBlocksProps } from './Validator.types';
import { ProposedBlockDot } from './ProposedBlockDot.component';
import * as styles from './Validator.styles';

const NUM_LATEST_PROPOSED_BLOCKS = 2500;

export function ProposedBlocks({ data }: ProposedBlocksProps) {
  if (!data) {
    return null;
  }

  return (
    <div className={styles.sectionWrapper}>
      <div className={styles.sectionHeader}>
        <div className={styles.sectionHeaderLeft}>
          <h3 className={styles.sectionTitle}>Proposed Blocks</h3>
          <p className={styles.sectionSubtitle}>
            Latest {numberFormat(NUM_LATEST_PROPOSED_BLOCKS, '0,0')} Blocks
          </p>
        </div>
        <div className={styles.sectionHeaderRight}>
          <Number
            value={(data.length * 100) / NUM_LATEST_PROPOSED_BLOCKS}
            suffix="%"
            className={styles.sectionTitle}
          />
          <Number
            value={data.length}
            format="0,0"
            suffix={`/${NUM_LATEST_PROPOSED_BLOCKS}`}
            className={styles.sectionSubtitle}
          />
        </div>
      </div>
      <div className={styles.blockGrid}>
        {data.map((d: ProposedBlock, i: number) => (
          <ProposedBlockDot key={i} d={d} />
        ))}
      </div>
    </div>
  );
}
