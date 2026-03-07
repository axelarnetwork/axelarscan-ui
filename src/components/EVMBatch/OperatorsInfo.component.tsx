import _ from 'lodash';

import { Number } from '@/components/Number';
import { toNumber } from '@/lib/number';
import { split } from '@/lib/parser';

import type { OperatorsInfoProps } from './EVMBatch.types';
import * as styles from './EVMBatch.styles';

export function OperatorsInfo({
  newOperators,
  newWeights,
}: OperatorsInfoProps) {
  return (
    <div className={styles.operatorsWrapper}>
      <Number
        value={split(newOperators, { delimiter: ';' }).length}
        suffix={' New Operators'}
        className={styles.operatorsBadge}
      />
      {newWeights && (
        <Number
          value={_.sum(
            split(newWeights, { delimiter: ';' }).map((w: string) =>
              toNumber(w)
            )
          )}
          prefix="["
          suffix="]"
          className={styles.weightsText}
        />
      )}
    </div>
  );
}
