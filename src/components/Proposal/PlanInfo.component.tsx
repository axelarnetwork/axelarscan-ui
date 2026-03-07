import { JSONView } from '@/components/JSONView';
import { toJson } from '@/lib/parser';

import type { PlanInfoProps } from './Proposal.types';
import * as styles from './Proposal.styles';

export function PlanInfo({ info, type: _type }: PlanInfoProps) {
  if (typeof toJson(info) === 'object') {
    return <JSONView value={info} />;
  }

  return <div className={styles.infoCodeBlock}>{info}</div>;
}
