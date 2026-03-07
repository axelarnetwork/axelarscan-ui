'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import clsx from 'clsx';
import _ from 'lodash';
import moment from 'moment';
import { IoCheckmarkCircle, IoCheckmarkDoneCircle } from 'react-icons/io5';

import { Container } from '@/components/Container';
import { Image } from '@/components/Image';
import { Copy } from '@/components/Copy';
import { Spinner } from '@/components/Spinner';
import { Tag } from '@/components/Tag';
import { Number } from '@/components/Number';
import { Profile, ChainProfile } from '@/components/Profile';
import { TimeAgo } from '@/components/Time';
import { ExplorerLink } from '@/components/ExplorerLink';
import { useChains, useAssets, useValidators } from '@/hooks/useGlobalData';
import { searchEVMPolls } from '@/lib/api/validator';
import { getChainData, getAssetData } from '@/lib/config';
import {
  toJson,
  split,
  toArray,
  getValuesOfAxelarAddressKey,
} from '@/lib/parser';
import {
  equalsIgnoreCase,
  find,
  includesSomePatterns,
  ellipse,
  toTitle,
} from '@/lib/string';
import { isNumber, toNumber, formatUnits, numberFormat } from '@/lib/number';
import { timeDiff, TIME_FORMAT } from '@/lib/time';
import type { Validator } from '@/types';

import * as styles from './EVMPoll.styles';

interface VoteOption {
  option: string;
  value: number;
  voters: string[];
  i?: number;
}

interface PollVote {
  voter?: string;
  vote?: boolean;
  height?: number;
  id?: string;
  created_at?: number;
  option?: string;
  confirmed?: boolean;
  validatorData?: Validator;
  confirmedFlag?: number;
  [key: string]: unknown;
}

interface ConfirmationEvent {
  type?: string;
  txID?: string;
  asset?: string;
  symbol?: string;
  amount?: string;
  [key: string]: unknown;
}

interface Timestamp {
  ms?: number;
}

interface EVMPollData {
  poll_id?: string;
  transaction_id?: string;
  sender_chain?: string;
  event?: string;
  eventName?: string;
  confirmation_events?: ConfirmationEvent[];
  status?: string;
  height?: number;
  initiated_txhash?: string;
  confirmation_txhash?: string;
  transfer_id?: number;
  deposit_address?: string;
  participants?: string[];
  voteOptions?: VoteOption[];
  votes?: PollVote[];
  created_at?: Timestamp;
  updated_at?: Timestamp;
  success?: boolean;
  failed?: boolean;
  expired?: boolean;
  confirmation?: boolean;
  url?: string;
  idNumber?: number | string;
  id?: string;
  [key: string]: unknown;
}

interface InfoProps {
  data: EVMPollData;
  id: string;
}

function Info({ data, id }: InfoProps) {
  const chains = useChains();
  const assets = useAssets();
  const validators = useValidators();

  const {
    transaction_id,
    sender_chain,
    eventName,
    confirmation_events,
    status,
    height,
    initiated_txhash,
    confirmation_txhash,
    transfer_id,
    deposit_address,
    participants,
    voteOptions,
    created_at,
    updated_at,
  } = { ...data };

  const { id: chain, explorer } = { ...getChainData(sender_chain, chains) };
  const { url, transaction_path } = { ...explorer };

  const totalParticipantsPower = _.sumBy(
    toArray(validators) as Validator[],
    'quadratic_voting_power'
  );

  const eventElement = <Tag className={clsx(styles.eventTagBase)}>{eventName}</Tag>;

  return (
    <div className={styles.infoPanel}>
      <div className={styles.infoPanelHeader}>
        <h3 className={styles.infoPanelTitle}>
          <Copy value={id}>
            <span>{ellipse(id, 16)}</span>
          </Copy>
        </h3>
        <div className={styles.infoPanelSubtitle}>
          {transaction_id && (
            <div className={styles.txIdRow}>
              <Copy value={transaction_id}>
                <Link
                  href={`${url}${transaction_path?.replace('{tx}', transaction_id)}`}
                  target="_blank"
                  className={styles.txIdLink}
                >
                  {ellipse(transaction_id)}
                </Link>
              </Copy>
              <ExplorerLink value={transaction_id} chain={sender_chain} />
            </div>
          )}
        </div>
      </div>
      <div className={styles.infoBorderTop}>
        <dl className={styles.dlDivider}>
          <div className={styles.dlRow}>
            <dt className={styles.dtLabel}>
              Chain
            </dt>
            <dd className={styles.ddValue}>
              <ChainProfile value={sender_chain} />
            </dd>
          </div>
          {eventName && (
            <div className={styles.dlRow}>
              <dt className={styles.dtLabel}>
                Event
              </dt>
              <dd className={styles.ddValue}>
                <div className={styles.eventRow}>
                  {data.url ? (
                    <Link href={data.url} target="_blank">
                      {eventElement}
                    </Link>
                  ) : (
                    eventElement
                  )}
                  {(toArray(confirmation_events) as ConfirmationEvent[]).map((e, i) => {
                    let { asset, symbol, amount } = { ...e };

                    // asset is object { denom, amount }
                    const assetObj = toJson(asset) as { denom?: string; amount?: string } | null;

                    if (assetObj) {
                      asset = assetObj.denom;
                      amount = assetObj.amount;
                    }

                    // asset data
                    const assetData = getAssetData(asset || symbol, assets);
                    const { decimals, addresses } = { ...assetData };
                    let { image } = { ...assetData };

                    if (assetData) {
                      symbol =
                        (chain ? addresses?.[chain]?.symbol : undefined) ||
                        assetData.symbol ||
                        symbol;
                      image = (chain ? addresses?.[chain]?.image : undefined) || image;
                    }

                    const element = symbol && (
                      <div className={styles.assetPill}>
                        <Image src={image} alt="" width={16} height={16} />
                        {amount && assets ? (
                          <Number
                            value={formatUnits(amount, decimals)}
                            format="0,0.000000"
                            suffix={` ${symbol}`}
                            className={styles.assetText}
                          />
                        ) : (
                          <span className={styles.assetText}>
                            {symbol}
                          </span>
                        )}
                      </div>
                    );

                    return (
                      element &&
                      (data.url ? (
                        <Link key={i} href={data.url} target="_blank">
                          {element}
                        </Link>
                      ) : (
                        <div key={i}>{element}</div>
                      ))
                    );
                  })}
                </div>
              </dd>
            </div>
          )}
          <div className={styles.dlRow}>
            <dt className={styles.dtLabel}>
              Status
            </dt>
            <dd className={styles.ddValue}>
              {status && (
                <Tag
                  className={clsx(
                    styles.statusTagBase,
                    ['completed'].includes(status)
                      ? styles.statusTagCompleted
                      : ['confirmed'].includes(status)
                        ? styles.statusTagConfirmed
                        : ['failed'].includes(status)
                          ? styles.statusTagFailed
                          : ['expired'].includes(status)
                            ? styles.statusTagExpired
                            : styles.statusTagPending
                  )}
                >
                  {status}
                </Tag>
              )}
            </dd>
          </div>
          <div className={styles.dlRow}>
            <dt className={styles.dtLabel}>
              Height
            </dt>
            <dd className={styles.ddValue}>
              {height && (
                <Link
                  href={`/block/${height}`}
                  target="_blank"
                  className={styles.blockLink}
                >
                  <Number value={height} />
                </Link>
              )}
            </dd>
          </div>
          {initiated_txhash && (
            <div className={styles.dlRow}>
              <dt className={styles.dtLabel}>
                Initiated Tx Hash
              </dt>
              <dd className={styles.ddValue}>
                <Link
                  href={`/tx/${initiated_txhash}`}
                  target="_blank"
                  className={styles.blockLink}
                >
                  {ellipse(initiated_txhash)}
                </Link>
              </dd>
            </div>
          )}
          {confirmation_txhash && (
            <div className={styles.dlRow}>
              <dt className={styles.dtLabel}>
                Confirmation Tx Hash
              </dt>
              <dd className={styles.ddValue}>
                <Link
                  href={`/tx/${confirmation_txhash}`}
                  target="_blank"
                  className={styles.blockLink}
                >
                  {ellipse(confirmation_txhash)}
                </Link>
              </dd>
            </div>
          )}
          {transfer_id && (
            <div className={styles.dlRow}>
              <dt className={styles.dtLabel}>
                Transfer ID
              </dt>
              <dd className={styles.ddValue}>
                <Copy value={transfer_id}>
                  <Link
                    href={data.url!}
                    target="_blank"
                    className={styles.blockLink}
                  >
                    {transfer_id}
                  </Link>
                </Copy>
              </dd>
            </div>
          )}
          {deposit_address && (
            <div className={styles.dlRow}>
              <dt className={styles.dtLabel}>
                Deposit Address
              </dt>
              <dd className={styles.ddValue}>
                <Copy value={deposit_address}>
                  <Link
                    href={`/account/${deposit_address}`}
                    target="_blank"
                    className={styles.accountLink}
                  >
                    {ellipse(deposit_address)}
                  </Link>
                </Copy>
              </dd>
            </div>
          )}
          <div className={styles.dlRow}>
            <dt className={styles.dtLabel}>
              Created
            </dt>
            <dd className={styles.ddValue}>
              {created_at?.ms && moment(created_at.ms).format(TIME_FORMAT)}
            </dd>
          </div>
          {(updated_at?.ms ?? 0) > (created_at?.ms ?? 0) && (
            <div className={styles.dlRow}>
              <dt className={styles.dtLabel}>
                Updated
              </dt>
              <dd className={styles.ddValue}>
                {moment(updated_at!.ms).format(TIME_FORMAT)}
              </dd>
            </div>
          )}
          {participants && (
            <div className={styles.dlRow}>
              <dt className={styles.dtLabel}>{`Participants${participants.length > 1 ? ` (${participants.length})` : ''}`}</dt>
              <dd className={styles.ddValue}>
                <div className={styles.participantsWrapper}>
                  {voteOptions!.map((v: VoteOption, i: number) => {
                    const totalVotersPower = _.sumBy(
                      (toArray(validators) as Validator[]).filter(d =>
                        toArray(v.voters).includes(d.broadcaster_address!)
                      ),
                      'quadratic_voting_power'
                    );

                    const powerDisplay =
                      totalVotersPower > 0 && totalParticipantsPower > 0
                        ? `${numberFormat(totalVotersPower, '0,0.0a')} (${numberFormat((totalVotersPower * 100) / totalParticipantsPower, '0,0.0')}%)`
                        : '';
                    const isDisplayPower =
                      powerDisplay && timeDiff(created_at?.ms, 'days') < 3;

                    return (
                      <Number
                        key={i}
                        value={v.value}
                        format="0,0"
                        suffix={` ${toTitle(v.option.substring(0, ['unsubmitted'].includes(v.option) ? 2 : 1))}${isDisplayPower ? `: ${powerDisplay}` : ''}`}
                        noTooltip={true}
                        className={clsx(
                          styles.voteOptionBase,
                          ['no'].includes(v.option)
                            ? styles.voteOptionNo
                            : ['yes'].includes(v.option)
                              ? styles.voteOptionYes
                              : styles.voteOptionUnsubmitted
                        )}
                      />
                    );
                  })}
                </div>
              </dd>
            </div>
          )}
        </dl>
      </div>
    </div>
  );
}

interface VotesProps {
  data: EVMPollData;
}

function Votes({ data }: VotesProps) {
  const [votes, setVotes] = useState<PollVote[] | null>(null);
  const validators = useValidators();

  useEffect(() => {
    if (data?.votes) {
      const mappedVotes: PollVote[] = data.votes.map(d => ({
        ...d,
        validatorData: (toArray(validators) as Validator[]).find(v =>
          equalsIgnoreCase(v.broadcaster_address, d.voter)
        ),
      }));

      const unsubmitted: PollVote[] = (toArray(data.participants) as string[])
        .filter(
          p =>
            !find(
              p,
              mappedVotes.map(v => v.validatorData?.operator_address).filter(Boolean) as string[]
            )
        )
        .map(p => {
          const validatorData = (toArray(validators) as Validator[]).find(v =>
            equalsIgnoreCase(v.operator_address, p)
          );

          return {
            voter: validatorData?.broadcaster_address || p,
            validatorData,
          };
        });

      setVotes(
        _.concat(
          _.orderBy(
            mappedVotes.map(d => ({ ...d, confirmedFlag: d.confirmed ? 1 : 0 })),
            ['confirmedFlag'],
            ['desc']
          ),
          unsubmitted
        )
      );
    }
  }, [data, setVotes, validators]);

  const { initiated_txhash, confirmation_txhash } = { ...data };

  const totalVotingPower = _.sumBy(
    (toArray(validators) as Validator[]).filter(
      d => !d.jailed && d.status === 'BOND_STATUS_BONDED'
    ),
    'quadratic_voting_power'
  );

  return (
    votes && (
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead className={styles.thead}>
            <tr className={styles.theadRow}>
              <th scope="col" className={styles.thFirst}>
                #
              </th>
              <th scope="col" className={styles.thMiddle}>
                Voter
              </th>
              <th scope="col" className={styles.thMiddleRight}>
                Voting Power
              </th>
              <th scope="col" className={styles.thMiddle}>
                Tx Hash
              </th>
              <th scope="col" className={styles.thMiddle}>
                Height
              </th>
              <th scope="col" className={styles.thRight}>
                Vote
              </th>
              <th scope="col" className={styles.thLast}>
                Time
              </th>
            </tr>
          </thead>
          <tbody className={styles.tbody}>
            {votes.map((d: PollVote, i: number) => {
              const vote = d.vote
                ? 'yes'
                : typeof d.vote === 'boolean'
                  ? 'no'
                  : 'unsubmitted';

              return (
                <tr key={i} className={styles.tr}>
                  <td className={styles.tdFirst}>{i + 1}</td>
                  <td className={styles.tdMiddle}>
                    {d.validatorData ? (
                      <Profile
                        i={i}
                        address={d.validatorData.operator_address}
                        prefix="axelarvaloper"
                      />
                    ) : (
                      <Copy value={d.voter}>
                        <Link
                          href={`/account/${d.voter}`}
                          target="_blank"
                          className={styles.voterLink}
                        >
                          {ellipse(d.voter, 10, 'axelar')}
                        </Link>
                      </Copy>
                    )}
                  </td>
                  <td className={styles.tdMiddleRight}>
                    {d.validatorData && (
                      <div className={styles.votingPowerWrapper}>
                        <Number
                          value={d.validatorData.quadratic_voting_power}
                          format="0,0.00a"
                          noTooltip={true}
                          className={styles.votingPowerValue}
                        />
                        {(d.validatorData.quadratic_voting_power ?? 0) > 0 &&
                          totalVotingPower > 0 && (
                            <Number
                              value={
                                (d.validatorData.quadratic_voting_power! * 100) /
                                totalVotingPower
                              }
                              format="0,0.000000"
                              suffix="%"
                              noTooltip={true}
                              className={styles.votingPowerPercent}
                            />
                          )}
                      </div>
                    )}
                  </td>
                  <td className={styles.tdMiddle}>
                    {d.id && (
                      <div className={styles.txHashWrapper}>
                        <Copy value={d.id}>
                          <Link
                            href={`/tx/${d.id}`}
                            target="_blank"
                            className={styles.txHashLink}
                          >
                            {ellipse(d.id, 6)}
                          </Link>
                        </Copy>
                        {equalsIgnoreCase(d.id, initiated_txhash) && (
                          <Link
                            href={`/tx/${initiated_txhash}`}
                            target="_blank"
                            className={styles.statusRow}
                          >
                            <IoCheckmarkCircle
                              size={18}
                              className={styles.initiatedIcon}
                            />
                            <span className={styles.statusLabel}>
                              Initiated
                            </span>
                          </Link>
                        )}
                        {equalsIgnoreCase(d.id, confirmation_txhash) && (
                          <Link
                            href={`/tx/${confirmation_txhash}`}
                            target="_blank"
                            className={styles.statusRow}
                          >
                            <IoCheckmarkDoneCircle
                              size={18}
                              className={styles.confirmationIcon}
                            />
                            <span className={styles.statusLabel}>
                              Confirmation
                            </span>
                          </Link>
                        )}
                      </div>
                    )}
                  </td>
                  <td className={styles.tdMiddle}>
                    {d.height && (
                      <Link
                        href={`/block/${d.height}`}
                        target="_blank"
                        className={styles.blockLink}
                      >
                        <Number value={d.height} />
                      </Link>
                    )}
                  </td>
                  <td className={styles.tdMiddleRight}>
                    <div className={styles.voteWrapper}>
                      <Tag
                        className={clsx(
                          styles.statusTagBase,
                          ['no'].includes(vote)
                            ? styles.voteOptionNo
                            : ['yes'].includes(vote)
                              ? styles.voteOptionYes
                              : styles.voteOptionUnsubmitted
                        )}
                      >
                        {toTitle(vote)}
                      </Tag>
                    </div>
                  </td>
                  <td className={styles.tdLast}>
                    <TimeAgo timestamp={d.created_at} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    )
  );
}

interface EVMPollProps {
  id: string;
}

export function EVMPoll({ id }: EVMPollProps) {
  const [data, setData] = useState<EVMPollData | null>(null);
  const chains = useChains();
  const validators = useValidators();

  useEffect(() => {
    const getData = async () => {
      const response = await searchEVMPolls({ pollId: id }) as { data?: EVMPollData[] } | undefined;

      let d = response?.data?.[0];

      if (d) {
        const votes = (getValuesOfAxelarAddressKey(d as unknown as Record<string, unknown>) as PollVote[]).map(v => ({
          ...v,
          option: v.vote
            ? 'yes'
            : typeof v.vote === 'boolean'
              ? 'no'
              : 'unsubmitted',
        }));

        const voteOptions: VoteOption[] = Object.entries(_.groupBy(votes, 'option'))
          .map(([k, v]) => ({
            option: k,
            value: v?.length,
            voters: v?.map(item => item.voter).filter(Boolean) as string[],
          }))
          .filter(v => v.value)
          .map(v => ({
            ...v,
            i: v.option === 'yes' ? 0 : v.option === 'no' ? 1 : 2,
          }));

        // add unsubmitted option
        if (
          toArray(d.participants).length > 0 &&
          voteOptions.findIndex(v => v.option === 'unsubmitted') < 0 &&
          _.sumBy(voteOptions, 'value') < d.participants!.length
        ) {
          voteOptions.push({
            option: 'unsubmitted',
            value: d.participants!.length - _.sumBy(voteOptions, 'value'),
            voters: [],
            i: 2,
          });
        }

        let eventName = split(d.event, {
          delimiter: '_',
          toCase: 'lower',
        }).join('_');

        // set eventName and transaction ID from confirmation events
        if (d.confirmation_events) {
          const { type, txID } = { ...d.confirmation_events[0] };

          switch (type) {
            case 'depositConfirmation':
              if (!eventName) {
                eventName = 'Transfer';
              }
              break;
            case 'ContractCallApproved':
              if (!eventName) {
                eventName = 'ContractCall';
              }
              break;
            case 'ContractCallApprovedWithMint':
            case 'ContractCallWithMintApproved':
              if (!eventName) {
                eventName = 'ContractCallWithToken';
              }
              break;
            default:
              eventName = type ?? '';
              break;
          }

          if (!d.transaction_id) {
            d.transaction_id = txID;
          }
        }

        const { url, transaction_path } = {
          ...getChainData(d.sender_chain, chains)?.explorer,
        };
        const txhashConfirm = votes.find(v => v.confirmed)?.id;

        d = {
          ...d,
          idNumber: isNumber(d.id) ? toNumber(d.id) : d.id,
          status: d.success
            ? 'completed'
            : d.failed
              ? 'failed'
              : d.expired
                ? 'expired'
                : d.confirmation || txhashConfirm
                  ? 'confirmed'
                  : 'pending',
          height: _.minBy(votes, 'height')?.height || d.height,
          confirmation_txhash: txhashConfirm,
          votes: _.orderBy(votes, ['height', 'created_at'], ['desc', 'desc']),
          voteOptions: _.orderBy(voteOptions, ['i'], ['asc']),
          eventName: d.event ? toTitle(eventName, '_', true, true) : eventName,
          url: includesSomePatterns(eventName, ['operator', 'token_deployed'])
            ? `${url}${transaction_path?.replace('{tx}', d.transaction_id!)}`
            : `/${includesSomePatterns(eventName, ['contract_call', 'ContractCall']) || !(includesSomePatterns(eventName, ['transfer', 'Transfer']) || d.deposit_address) ? 'gmp' : 'transfer'}/${d.transaction_id ? d.transaction_id : d.transfer_id ? `?transferId=${d.transfer_id}` : ''}`,
        };
      }

      console.log('[data]', d);
      setData({ ...d } as EVMPollData);
    };

    getData();
  }, [id, setData, chains]);

  return (
    <Container className={styles.containerClass}>
      {!data ? (
        <Spinner />
      ) : (
        <div className={styles.contentWrapper}>
          <Info data={data} id={id} />
          {validators && <Votes data={data} />}
        </div>
      )}
    </Container>
  );
}
