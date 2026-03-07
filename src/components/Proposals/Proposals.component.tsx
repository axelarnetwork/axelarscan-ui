'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import clsx from 'clsx';
import moment from 'moment';

import { Container } from '@/components/Container';
import { Spinner } from '@/components/Spinner';
import { Tag } from '@/components/Tag';
import { Number } from '@/components/Number';
import { getProposals } from '@/lib/api/axelarscan';
import { toArray } from '@/lib/parser';
import { toTitle } from '@/lib/string';
import { toNumber } from '@/lib/number';
import { TIME_FORMAT } from '@/lib/time';
import * as styles from './Proposals.styles';

interface ProposalDeposit {
  amount?: number;
  symbol?: string;
}

interface ProposalListItem {
  proposal_id?: string;
  type?: string;
  content?: {
    title?: string;
    description?: string;
    plan?: { name?: string; height?: number };
  };
  status?: string;
  voting_start_time?: string;
  voting_end_time?: string;
  total_deposit?: ProposalDeposit[];
  final_tally_result?: Record<string, number>;
  [key: string]: unknown;
}

export function Proposals() {
  const [data, setData] = useState<ProposalListItem[] | null>(null);

  useEffect(() => {
    const getData = async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: responseData } = { ...(await getProposals() as any) };
      setData(toArray(responseData));
    };
    getData();
  }, []);

  return (
    <Container className="sm:mt-8">
      {!data ? (
        <Spinner />
      ) : (
        <div>
          <div className={styles.headerWrapper}>
            <div className="sm:flex-auto">
              <h1 className={styles.pageTitle}>Proposals</h1>
              <p className={styles.pageDescription}>
                List of proposals in Axelar Network including ID, title,
                description, type and status.
              </p>
            </div>
          </div>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead className={styles.thead}>
                <tr className={styles.theadRow}>
                  <th scope="col" className={styles.thFirst}>ID</th>
                  <th scope="col" className={styles.thMiddle}>Proposal</th>
                  <th scope="col" className={styles.thMiddle}>Type</th>
                  <th scope="col" className={styles.thHidden}>Height</th>
                  <th scope="col" className={styles.thHiddenWrap}>Voting Period</th>
                  <th scope="col" className={styles.thHiddenRight}>Deposit</th>
                  <th scope="col" className={styles.thLast}>Status</th>
                </tr>
              </thead>
              <tbody className={styles.tbody}>
                {data.map((d: ProposalListItem, i: number) => (
                  <tr key={i} className={styles.row}>
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
                        {(toArray(d.total_deposit) as ProposalDeposit[]).map((dep: ProposalDeposit, j: number) => (
                          <Number
                            key={j}
                            value={dep.amount}
                            suffix={` ${dep.symbol}`}
                            noTooltip={true}
                            className={styles.depositValue}
                          />
                        ))}
                      </div>
                    </td>
                    <td className={styles.tdLast}>
                      {d.status && (
                        <div className={styles.statusWrapper}>
                          <Tag
                            className={clsx(
                              'w-fit',
                              ['UNSPECIFIED', 'DEPOSIT_PERIOD'].includes(d.status)
                                ? ''
                                : ['VOTING_PERIOD'].includes(d.status)
                                  ? 'bg-yellow-400 dark:bg-yellow-500'
                                  : ['REJECTED', 'FAILED'].includes(d.status)
                                    ? 'bg-red-600 dark:bg-red-500'
                                    : 'bg-green-600 dark:bg-green-500'
                            )}
                          >
                            {d.status}
                          </Tag>
                          {['PASSED', 'REJECTED'].includes(d.status) && (
                            <div className={styles.tallyWrapper}>
                              {Object.entries({ ...d.final_tally_result })
                                .filter(([_k, v]) => toNumber(v) >= 0)
                                .map(([k, v]) => (
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
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </Container>
  );
}
