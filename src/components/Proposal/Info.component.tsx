'use client';

import Link from 'next/link';
// @ts-expect-error react-linkify has no type declarations
import Linkify from 'react-linkify';
import moment from 'moment';

import { Image } from '@/components/Image';
import { Tag } from '@/components/Tag';
import { Number } from '@/components/Number';
import { useChains } from '@/hooks/useGlobalData';
import { toArray } from '@/lib/parser';
import { toTitle } from '@/lib/string';
import { toNumber } from '@/lib/number';
import { TIME_FORMAT } from '@/lib/time';

import { StatusTag } from './StatusTag.component';
import { PlanInfo } from './PlanInfo.component';
import { ChangeRow } from './ChangeRow.component';
import { GmpChainIcon } from './GmpChainIcon.component';
import type {
  InfoProps,
  ProposalDeposit,
  VoteOptionSummary,
} from './Proposal.types';
import * as styles from './Proposal.styles';

export function Info({ id, data, end, voteOptions }: InfoProps) {
  const chains = useChains();

  const {
    proposal_id,
    type,
    content,
    status,
    submit_time,
    deposit_end_time,
    voting_start_time,
    voting_end_time,
    total_deposit,
    final_tally_result,
  } = { ...data };
  const { plan, title, description, changes, contract_calls } = { ...content };
  const { height, info } = { ...plan };

  const tallyItems = end
    ? Object.entries({ ...final_tally_result })
        .filter(([_k, v]) => toNumber(v) >= 0)
        .map(([k, v]) => ({ key: k, value: v, label: toTitle(k) }))
    : voteOptions.map((d: VoteOptionSummary, i: number) => ({
        key: String(i),
        value: d.value,
        label: toTitle(d.option),
      }));

  return (
    <div className={styles.infoPanel}>
      <div className={styles.infoHeader}>
        <h3 className={styles.infoTitle}>{title || plan?.name}</h3>
        <p className={styles.infoSubtitle}>Proposal ID: {proposal_id || id}</p>
      </div>
      <div className={styles.infoBorder}>
        <dl className={styles.dlDivide}>
          <div className={styles.dlRow}>
            <dt className={styles.dtLabel}>Description</dt>
            <dd className={styles.ddValue}>
              <span className={styles.descriptionText}>
                <Linkify>{description}</Linkify>
              </span>
            </dd>
          </div>
          <div className={styles.dlRow}>
            <dt className={styles.dtLabel}>Status</dt>
            <dd className={styles.ddValue}>
              {status && <StatusTag status={status} />}
            </dd>
          </div>
          {type && (
            <div className={styles.dlRow}>
              <dt className={styles.dtLabel}>Type</dt>
              <dd className={styles.ddValue}>
                <Tag className="w-fit">{type}</Tag>
              </dd>
            </div>
          )}
          {plan && (
            <>
              <div className={styles.dlRow}>
                <dt className={styles.dtLabel}>Plan</dt>
                <dd className={styles.ddValueBold}>{plan.name}</dd>
              </div>
              <div className={styles.dlRow}>
                <dt className={styles.dtLabel}>Height</dt>
                <dd className={styles.ddValueBold}>
                  <Number value={height} />
                </dd>
              </div>
              {info && (
                <div className={styles.dlRow}>
                  <dt className={styles.dtLabel}>{type}</dt>
                  <dd className={styles.ddValueBold}>
                    <PlanInfo info={info} type={type} />
                  </dd>
                </div>
              )}
            </>
          )}
          {(
            toArray(changes) as {
              key?: string;
              value?: string;
              subspace?: string;
            }[]
          )
            .filter(d => d.subspace)
            .map((d, i: number) => (
              <ChangeRow
                key={i}
                keyName={d.key}
                value={d.value}
                subspace={d.subspace}
              />
            ))}
          {toArray(contract_calls).length > 0 && (
            <div className={styles.dlRow}>
              <dt className={styles.dtLabel}>GMP(s)</dt>
              <Link
                href={`/gmp/search?proposalId=${proposal_id}`}
                target="_blank"
                className={styles.gmpLink}
              >
                <div>
                  <div className="block dark:hidden">
                    <Image
                      src="/logos/logo.png"
                      alt=""
                      width={24}
                      height={24}
                    />
                  </div>
                  <div className="hidden dark:block">
                    <Image
                      src="/logos/logo_white.png"
                      alt=""
                      width={24}
                      height={24}
                    />
                  </div>
                </div>
                <div className={styles.gmpDivider} />
                <div className={styles.gmpChainList}>
                  {contract_calls!.map((c: { chain?: string }, i: number) => (
                    <GmpChainIcon key={i} chain={c.chain} chains={chains} />
                  ))}
                </div>
              </Link>
            </div>
          )}
          <div className={styles.dlRow}>
            <dt className={styles.dtLabel}>Deposit Period</dt>
            <dd className={styles.ddValue}>
              {!!proposal_id && (
                <>
                  {moment(submit_time).format(TIME_FORMAT)} -{' '}
                  {moment(deposit_end_time).format(TIME_FORMAT)}
                </>
              )}
            </dd>
          </div>
          <div className={styles.dlRow}>
            <dt className={styles.dtLabel}>Voting Period</dt>
            <dd className={styles.ddValue}>
              {!!proposal_id && (
                <>
                  {moment(voting_start_time).format(TIME_FORMAT)} -{' '}
                  {moment(voting_end_time).format(TIME_FORMAT)}
                </>
              )}
            </dd>
          </div>
          <div className={styles.dlRow}>
            <dt className={styles.dtLabel}>Total Deposit</dt>
            <dd className={styles.ddValue}>
              <div className={styles.depositList}>
                {(toArray(total_deposit) as ProposalDeposit[]).map(
                  (d: ProposalDeposit, i: number) => (
                    <Number
                      key={i}
                      value={d.amount}
                      suffix={` ${d.symbol}`}
                      noTooltip={true}
                      className={styles.depositValue}
                    />
                  )
                )}
              </div>
            </dd>
          </div>
          <div className={styles.dlRow}>
            <dt className={styles.dtLabel}>{end ? 'Final Tally' : 'Votes'}</dt>
            <dd className={styles.ddValue}>
              <div className={styles.depositList}>
                {tallyItems.map(item => (
                  <Number
                    key={item.key}
                    value={item.value}
                    format="0,0.00a"
                    prefix={`${item.label}: `}
                    noTooltip={true}
                    className={styles.tallyValue}
                  />
                ))}
              </div>
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
