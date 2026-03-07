'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
// @ts-expect-error react-linkify has no type declarations
import Linkify from 'react-linkify';
import clsx from 'clsx';
import _ from 'lodash';
import moment from 'moment';

import { Container } from '@/components/Container';
import { Image } from '@/components/Image';
import { JSONView } from '@/components/JSONView';
import { Copy } from '@/components/Copy';
import { Tooltip } from '@/components/Tooltip';
import { Spinner } from '@/components/Spinner';
import { Tag } from '@/components/Tag';
import { Number } from '@/components/Number';
import { Profile } from '@/components/Profile';
import { useChains, useValidators } from '@/hooks/useGlobalData';
import { getProposal } from '@/lib/api/axelarscan';
import { getChainData } from '@/lib/config';
import { toJson, toArray } from '@/lib/parser';
import { equalsIgnoreCase, ellipse, toTitle } from '@/lib/string';
import { toNumber } from '@/lib/number';
import { TIME_FORMAT } from '@/lib/time';
import * as styles from './Proposal.styles';

interface ProposalDeposit {
  amount?: number;
  symbol?: string;
}

interface ProposalContent {
  plan?: { name?: string; height?: number; info?: string };
  title?: string;
  description?: string;
  changes?: { key?: string; value?: string; subspace?: string }[];
  contract_calls?: { chain?: string }[];
}

interface ProposalData {
  proposal_id?: string;
  type?: string;
  content?: ProposalContent;
  status?: string;
  submit_time?: string;
  deposit_end_time?: string;
  voting_start_time?: string;
  voting_end_time?: number;
  total_deposit?: ProposalDeposit[];
  final_tally_result?: Record<string, number>;
  votes?: VoteEntry[];
  [key: string]: unknown;
}

interface VoteEntry {
  voter?: string;
  option?: string;
  validatorData?: { operator_address: string; description?: { moniker?: string }; tokens?: number };
  voting_power?: number;
}

interface VoteOptionSummary {
  option: string;
  value: number;
}

function Info({ id, data, end, voteOptions }: { id: string; data: ProposalData; end: boolean; voteOptions: VoteOptionSummary[] }) {
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
              {status && (
                <Tag
                  className={clsx(
                    'w-fit',
                    ['UNSPECIFIED', 'DEPOSIT_PERIOD'].includes(status)
                      ? ''
                      : ['VOTING_PERIOD'].includes(status)
                        ? 'bg-yellow-400 dark:bg-yellow-500'
                        : ['REJECTED', 'FAILED'].includes(status)
                          ? 'bg-red-600 dark:bg-red-500'
                          : 'bg-green-600 dark:bg-green-500'
                  )}
                >
                  {status}
                </Tag>
              )}
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
                    {typeof toJson(info) === 'object' ? (
                      <JSONView value={info} />
                    ) : (
                      <div className={styles.infoCodeBlock}>{info}</div>
                    )}
                  </dd>
                </div>
              )}
            </>
          )}
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {(toArray(changes) as any[])
            .filter((d: { subspace?: string }) => d.subspace)
            .map(({ key, value, subspace }: { key?: string; value?: string; subspace?: string }, i: number) => (
              <div key={i} className={styles.dlRow}>
                <dt className={styles.dtLabel}>{subspace}</dt>
                <dd className={styles.ddValueBold}>
                  {typeof toJson(value) === 'object' ? (
                    <div className="flex flex-col gap-y-2">
                      <Tag className={styles.changeTag}>{key}</Tag>
                      <JSONView value={value} />
                    </div>
                  ) : (
                    <Tag className={styles.changeTag}>
                      {key} = {value}
                    </Tag>
                  )}
                </dd>
              </div>
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
                  {contract_calls!.map(({ chain }: { chain?: string }, i: number) => {
                    const { name, image } = { ...getChainData(chain, chains) };
                    return (
                      <div key={i} className={styles.gmpChainItem}>
                        <Tooltip content={name}>
                          <Image src={image} alt="" width={20} height={20} />
                        </Tooltip>
                      </div>
                    );
                  })}
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

function Votes({ data }: { data: VoteEntry[] }) {
  const validators = useValidators();

  const totalVotingPower = _.sumBy(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (toArray(validators) as any[]).filter(
      (d) => !d.jailed && d.status === 'BOND_STATUS_BONDED'
    ),
    'tokens'
  );

  return (
    data && (
      <div className={styles.votesWrapper}>
        <table className={styles.votesTable}>
          <thead className={styles.votesThead}>
            <tr className={styles.votesTheadRow}>
              <th scope="col" className={styles.votesThFirst}>#</th>
              <th scope="col" className={styles.votesTh}>Voter</th>
              <th scope="col" className={styles.votesTh}>Validator</th>
              <th scope="col" className={styles.votesThRight}>Voting Power</th>
              <th scope="col" className={styles.votesThLast}>Vote</th>
            </tr>
          </thead>
          <tbody className={styles.votesTbody}>
            {data.map((d: VoteEntry, i: number) => (
              <tr key={i} className={styles.votesRow}>
                <td className={styles.votesTdFirst}>{i + 1}</td>
                <td className={styles.votesTd}>
                  <Copy value={d.voter}>
                    <Link
                      href={`/account/${d.voter}`}
                      target="_blank"
                      className={styles.voterLink}
                    >
                      {ellipse(d.voter, 10, 'axelar')}
                    </Link>
                  </Copy>
                </td>
                <td className={styles.votesTd}>
                  {d.validatorData && (
                    <Profile
                      i={i}
                      address={d.validatorData.operator_address}
                      prefix="axelarvaloper"
                    />
                  )}
                </td>
                <td className={styles.votesTdRight}>
                  {(d.voting_power ?? 0) > 0 && (
                    <div className={styles.votePowerWrapper}>
                      <Number
                        value={d.voting_power}
                        format="0,0.00a"
                        noTooltip={true}
                        className={styles.votePowerValue}
                      />
                      {totalVotingPower > 0 && (
                        <Number
                          value={(d.voting_power! * 100) / totalVotingPower}
                          format="0,0.000000"
                          suffix="%"
                          noTooltip={true}
                          className={styles.votePowerPercent}
                        />
                      )}
                    </div>
                  )}
                </td>
                <td className={styles.votesTdLast}>
                  {d.option && (
                    <div className={styles.voteOptionWrapper}>
                      <Tag
                        className={clsx(
                          'w-fit capitalize',
                          ['NO'].includes(d.option)
                            ? 'bg-red-600 dark:bg-red-500'
                            : ['YES'].includes(d.option)
                              ? 'bg-green-600 dark:bg-green-500'
                              : ''
                        )}
                      >
                        {toTitle(d.option)}
                      </Tag>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  );
}

export function Proposal({ id }: { id: string }) {
  const [data, setData] = useState<ProposalData | null>(null);
  const validators = useValidators();

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const setValidatorsToVotes = (votes: any) => {
      if (!validators) {
        return votes as VoteEntry[];
      }

      return _.orderBy(
        toArray(votes)
          .map((d: VoteEntry) => ({
            ...d,
            validatorData: validators.find((v) =>
              equalsIgnoreCase(v.delegator_address, d.voter)
            ),
          }))
          .map((d) => ({
            ...d,
            voting_power: d.validatorData ? d.validatorData.tokens : -1,
          })),
        ['voting_power', 'validatorData.description.moniker'],
        ['desc', 'asc']
      );
    };

    const getData = async () => {
      if (validators) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const response = await getProposal({ id }) as any;
        setData({ ...response, votes: setValidatorsToVotes(response?.votes) });
      }
    };

    getData();
  }, [id, validators]);

  const { proposal_id, voting_end_time, votes } = { ...data };

  const end = voting_end_time && voting_end_time < moment().valueOf();
  const voteOptions = Object.entries(_.groupBy(toArray(votes), 'option'))
    .map(([k, v]) => ({
      option: k,
      value: toArray(v).length,
    }))
    .filter((d) => d.value);

  return (
    <Container className="sm:mt-8">
      {!(data && (!proposal_id || toNumber(id) === toNumber(proposal_id))) ? (
        <Spinner />
      ) : (
        <div className={styles.mainLayout}>
          <Info id={id} data={data} end={!!end} voteOptions={voteOptions} />
          {!end && validators && <Votes data={votes!} />}
        </div>
      )}
    </Container>
  );
}
