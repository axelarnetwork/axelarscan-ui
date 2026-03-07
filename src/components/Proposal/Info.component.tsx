'use client';

import Link from 'next/link';
// @ts-expect-error react-linkify has no type declarations
import Linkify from 'react-linkify';
import clsx from 'clsx';
import moment from 'moment';

import { Image } from '@/components/Image';
import { JSONView } from '@/components/JSONView';
import { Tooltip } from '@/components/Tooltip';
import { Tag } from '@/components/Tag';
import { Number } from '@/components/Number';
import { useChains } from '@/hooks/useGlobalData';
import { getChainData } from '@/lib/config';
import { toJson, toArray } from '@/lib/parser';
import { toTitle } from '@/lib/string';
import { toNumber } from '@/lib/number';
import { TIME_FORMAT } from '@/lib/time';

import type { ProposalData, ProposalDeposit, VoteOptionSummary } from './Proposal.types';
import * as styles from './Proposal.styles';

interface InfoProps {
  id: string;
  data: ProposalData;
  end: boolean;
  voteOptions: VoteOptionSummary[];
}

function StatusTag({ status }: { status: string }) {
  const className = clsx(
    'w-fit',
    ['UNSPECIFIED', 'DEPOSIT_PERIOD'].includes(status)
      ? ''
      : ['VOTING_PERIOD'].includes(status)
        ? 'bg-yellow-400 dark:bg-yellow-500'
        : ['REJECTED', 'FAILED'].includes(status)
          ? 'bg-red-600 dark:bg-red-500'
          : 'bg-green-600 dark:bg-green-500'
  );

  return <Tag className={className}>{status}</Tag>;
}

function PlanInfo({ info, type: _type }: { info: string; type?: string }) {
  if (typeof toJson(info) === 'object') {
    return <JSONView value={info} />;
  }

  return <div className={styles.infoCodeBlock}>{info}</div>;
}

function ChangeRow({ keyName, value, subspace }: { keyName?: string; value?: string; subspace?: string }) {
  if (typeof toJson(value) === 'object') {
    return (
      <div className={styles.dlRow}>
        <dt className={styles.dtLabel}>{subspace}</dt>
        <dd className={styles.ddValueBold}>
          <div className="flex flex-col gap-y-2">
            <Tag className={styles.changeTag}>{keyName}</Tag>
            <JSONView value={value} />
          </div>
        </dd>
      </div>
    );
  }

  return (
    <div className={styles.dlRow}>
      <dt className={styles.dtLabel}>{subspace}</dt>
      <dd className={styles.ddValueBold}>
        <Tag className={styles.changeTag}>
          {keyName} = {value}
        </Tag>
      </dd>
    </div>
  );
}

function GmpChainIcon({ chain, chains }: { chain?: string; chains: ReturnType<typeof useChains> }) {
  const { name, image } = { ...getChainData(chain, chains) };
  return (
    <div className={styles.gmpChainItem}>
      <Tooltip content={name}>
        <Image src={image} alt="" width={20} height={20} />
      </Tooltip>
    </div>
  );
}

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
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {(toArray(changes) as any[])
            .filter((d: { subspace?: string }) => d.subspace)
            .map((d: { key?: string; value?: string; subspace?: string }, i: number) => (
              <ChangeRow key={i} keyName={d.key} value={d.value} subspace={d.subspace} />
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
                    <Image src="/logos/logo.png" alt="" width={24} height={24} />
                  </div>
                  <div className="hidden dark:block">
                    <Image src="/logos/logo_white.png" alt="" width={24} height={24} />
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
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {(toArray(total_deposit) as any[]).map((d: ProposalDeposit, i: number) => (
                  <Number
                    key={i}
                    value={d.amount}
                    suffix={` ${d.symbol}`}
                    noTooltip={true}
                    className={styles.depositValue}
                  />
                ))}
              </div>
            </dd>
          </div>
          <div className={styles.dlRow}>
            <dt className={styles.dtLabel}>{end ? 'Final Tally' : 'Votes'}</dt>
            <dd className={styles.ddValue}>
              <div className={styles.depositList}>
                {end
                  ? Object.entries({ ...final_tally_result })
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
                      ))
                  : voteOptions.map((d: VoteOptionSummary, i: number) => (
                      <Number
                        key={i}
                        value={d.value}
                        format="0,0.00a"
                        prefix={`${toTitle(d.option)}: `}
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
