import Link from 'next/link';
import clsx from 'clsx';
import moment from 'moment';

import { Tag } from '@/components/Tag';
import { Number } from '@/components/Number';
import { toArray } from '@/lib/parser';
import { toTitle } from '@/lib/string';
import { toNumber } from '@/lib/number';
import { TIME_FORMAT } from '@/lib/time';
import * as styles from './Proposals.styles';
import type { ProposalDeposit, ProposalRowProps } from './Proposals.types';

export function ProposalRow({ proposal: d }: ProposalRowProps) {
  const showTally =
    d.status && ['PASSED', 'REJECTED'].includes(d.status);
  const tallyEntries = Object.entries({ ...d.final_tally_result }).filter(
    ([_k, v]) => toNumber(v) >= 0
  );

  return (
    <tr className={styles.row}>
      <td className={styles.tdFirst}>{d.proposal_id}</td>
      <td className={styles.tdMiddle}>
        <div className={styles.proposalWrapper}>
          <Link
            href={`/proposal/${d.proposal_id}`}
            target="_blank"
            className={styles.proposalTitle}
          >
            {d.content?.title || d.content?.plan?.name}
          </Link>
          <span className={styles.proposalDescription}>
            {d.content?.description}
          </span>
        </div>
      </td>
      <td className={styles.tdMiddle}>
        {d.type && <Tag className="w-fit">{d.type}</Tag>}
      </td>
      <td className={styles.tdHidden}>
        <Number value={d.content?.plan?.height} />
      </td>
      <td className={styles.tdHidden}>
        <div className={styles.votingPeriodWrapper}>
          {[d.voting_start_time, d.voting_end_time].map(
            (t: string | undefined, j: number) => (
              <div key={j} className={styles.votingPeriodRow}>
                <div className={styles.votingPeriodLabel}>
                  {j === 0 ? 'From' : 'To'}:
                </div>
                <span className={styles.votingPeriodTime}>
                  {moment(t).format(TIME_FORMAT)}
                </span>
              </div>
            )
          )}
        </div>
      </td>
      <td className={styles.tdHiddenRight}>
        <div className={styles.depositWrapper}>
          {(toArray(d.total_deposit) as ProposalDeposit[]).map(
            (dep: ProposalDeposit, j: number) => (
              <Number
                key={j}
                value={dep.amount}
                suffix={` ${dep.symbol}`}
                noTooltip={true}
                className={styles.depositValue}
              />
            )
          )}
        </div>
      </td>
      <td className={styles.tdLast}>
        {d.status && (
          <div className={styles.statusWrapper}>
            <Tag className={clsx('w-fit', styles.getStatusColor(d.status))}>
              {d.status}
            </Tag>
            {showTally && (
              <div className={styles.tallyWrapper}>
                {tallyEntries.map(([k, v]) => (
                  <Number
                    key={k}
                    value={v}
                    format="0,0.00a"
                    prefix={`${toTitle(k)}: `}
                    noTooltip={true}
                    className={styles.tallyValue}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </td>
    </tr>
  );
}
