'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import clsx from 'clsx';
import _ from 'lodash';
import moment from 'moment';
import { IoCheckmarkDoneCircle } from 'react-icons/io5';

import { Container } from '@/components/Container';
import { Copy } from '@/components/Copy';
import { Spinner } from '@/components/Spinner';
import { Tag } from '@/components/Tag';
import { Number } from '@/components/Number';
import { Profile, ChainProfile } from '@/components/Profile';
import { TimeAgo } from '@/components/Time';
import { ExplorerLink } from '@/components/ExplorerLink';
import { useChains, useVerifiers } from '@/hooks/useGlobalData';
import { getRPCStatus, searchAmplifierProofs } from '@/lib/api/validator';
import { getChainData } from '@/lib/config';
import { toArray, getValuesOfAxelarAddressKey } from '@/lib/parser';
import {
  equalsIgnoreCase,
  headString,
  lastString,
  find,
  ellipse,
  toTitle,
  removeHexPrefix,
} from '@/lib/string';
import { TIME_FORMAT } from '@/lib/time';

import * as styles from './AmplifierProof.styles';

interface SignOption {
  option: string;
  value: number;
  signers?: string[];
  i?: number;
}

interface ProofSign {
  signer?: string;
  sign?: boolean;
  height?: number;
  id?: string;
  created_at?: number;
  option?: string;
  verifierData?: VerifierEntry;
  [key: string]: unknown;
}

interface VerifierEntry {
  address?: string;
  [key: string]: unknown;
}

interface MessageId {
  message_id?: string;
  id?: string;
  source_chain?: string;
  chain?: string;
}

interface Timestamp {
  ms?: number;
}

interface AmplifierProofData {
  session_id?: string;
  multisig_prover_contract_address?: string;
  multisig_contract_address?: string;
  message_ids?: MessageId[];
  message_id?: string;
  source_chain?: string;
  chain?: string;
  destination_chain?: string;
  status?: string;
  height?: number;
  initiated_txhash?: string;
  confirmation_txhash?: string;
  completed_txhash?: string;
  expired_height?: number;
  completed_height?: number;
  gateway_txhash?: string;
  participants?: string[];
  signOptions?: SignOption[];
  signs?: ProofSign[];
  created_at?: Timestamp;
  updated_at?: Timestamp;
  success?: boolean;
  failed?: boolean;
  expired?: boolean;
  [key: string]: unknown;
}

interface RPCStatusData {
  latest_block_height?: number;
  [key: string]: unknown;
}

interface InfoProps {
  data: AmplifierProofData;
  id: string;
}

function Info({ data, id }: InfoProps) {
  const chains = useChains();

  const {
    session_id,
    multisig_prover_contract_address,
    multisig_contract_address,
    message_ids,
    status,
    height,
    initiated_txhash,
    confirmation_txhash,
    completed_txhash,
    expired_height,
    completed_height,
    gateway_txhash,
    participants,
    signOptions,
    created_at,
    updated_at,
  } = { ...data };

  const chain = data?.chain || data?.destination_chain;
  const { url, transaction_path } = {
    ...getChainData(chain, chains)?.explorer,
  };

  return (
    <div className={styles.infoPanel}>
      <div className={styles.infoPanelHeader}>
        <h3 className={styles.infoPanelTitle}>
          <Copy value={chain && session_id ? `${chain}-${session_id}` : id}>
            <span>
              {chain && session_id ? `${chain}-${session_id}` : ellipse(id, 16)}
            </span>
          </Copy>
        </h3>
      </div>
      <div className={styles.infoBorderTop}>
        <dl className={styles.dlDivider}>
          <div className={styles.dlRow}>
            <dt className={styles.dtLabel}>
              Chain
            </dt>
            <dd className={styles.ddValue}>
              <ChainProfile value={chain} />
            </dd>
          </div>
          {multisig_prover_contract_address && (
            <div className={styles.dlRow}>
              <dt className={styles.dtLabel}>
                Multisig Prover Contract
              </dt>
              <dd className={styles.ddValue}>
                <Copy value={multisig_prover_contract_address}>
                  {ellipse(multisig_prover_contract_address)}
                </Copy>
              </dd>
            </div>
          )}
          {multisig_contract_address && (
            <div className={styles.dlRow}>
              <dt className={styles.dtLabel}>
                Multisig Contract
              </dt>
              <dd className={styles.ddValue}>
                <Copy value={multisig_contract_address}>
                  {ellipse(multisig_contract_address)}
                </Copy>
              </dd>
            </div>
          )}
          <div className={styles.dlRow}>
            <dt className={styles.dtLabel}>
              Messages
            </dt>
            <dd className={styles.ddValue}>
              <div className={styles.messageList}>
                {(toArray(
                  message_ids || {
                    message_id: data?.message_id,
                    source_chain: data?.source_chain,
                  }
                ) as MessageId[]).map((m: MessageId, i: number) => {
                  if (!m.message_id) {
                    m.message_id = m.id;
                  }

                  if (!m.source_chain) {
                    m.source_chain = m.chain;
                  }

                  const { url, transaction_path } = {
                    ...getChainData(m.source_chain, chains)?.explorer,
                  };

                  return (
                    m.message_id && (
                      <div key={i} className={styles.messageRow}>
                        <ChainProfile value={m.source_chain} />
                        <div className={styles.messageIdRow}>
                          <Copy value={removeHexPrefix(m.message_id)}>
                            <Link
                              href={`${url}${transaction_path?.replace('{tx}', headString(removeHexPrefix(m.message_id)) ?? '')}`}
                              target="_blank"
                              className={styles.messageIdLink}
                            >
                              {ellipse(
                                removeHexPrefix(m.message_id)
                              ).toUpperCase()}
                            </Link>
                          </Copy>
                          <ExplorerLink
                            value={headString(removeHexPrefix(m.message_id))}
                            chain={m.source_chain}
                          />
                        </div>
                      </div>
                    )
                  );
                })}
              </div>
            </dd>
          </div>
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
          {gateway_txhash && (
            <div className={styles.dlRow}>
              <dt className={styles.dtLabel}>
                Gateway Tx Hash
              </dt>
              <dd className={styles.ddValue}>
                <Link
                  href={`${url}${transaction_path?.replace('{tx}', gateway_txhash)}`}
                  target="_blank"
                  className={styles.blockLink}
                >
                  {ellipse(gateway_txhash)}
                </Link>
              </dd>
            </div>
          )}
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
          {confirmation_txhash && confirmation_txhash !== completed_txhash && (
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
          {completed_txhash && (
            <div className={styles.dlRow}>
              <dt className={styles.dtLabel}>
                Proof Completed Tx Hash
              </dt>
              <dd className={styles.ddValue}>
                <Link
                  href={`/tx/${completed_txhash}`}
                  target="_blank"
                  className={styles.blockLink}
                >
                  {ellipse(completed_txhash)}
                </Link>
              </dd>
            </div>
          )}
          {completed_height && (
            <div className={styles.dlRow}>
              <dt className={styles.dtLabel}>
                Completed Height
              </dt>
              <dd className={styles.ddValue}>
                <Link
                  href={`/block/${completed_height}`}
                  target="_blank"
                  className={styles.blockLink}
                >
                  <Number value={completed_height} />
                </Link>
              </dd>
            </div>
          )}
          <div className={styles.dlRow}>
            <dt className={styles.dtLabel}>
              Expires Height
            </dt>
            <dd className={styles.ddValue}>
              {expired_height && (
                <Link
                  href={`/block/${expired_height}`}
                  target="_blank"
                  className={styles.blockLink}
                >
                  <Number value={expired_height} />
                </Link>
              )}
            </dd>
          </div>
          <div className={styles.dlRow}>
            <dt className={styles.dtLabel}>
              Created
            </dt>
            <dd className={styles.ddValue}>
              {created_at?.ms && moment(created_at.ms).format(TIME_FORMAT)}
            </dd>
          </div>
          {updated_at?.ms && created_at?.ms && updated_at.ms > created_at.ms && (
            <div className={styles.dlRow}>
              <dt className={styles.dtLabel}>
                Updated
              </dt>
              <dd className={styles.ddValue}>
                {moment(updated_at!.ms).format(TIME_FORMAT)}
              </dd>
            </div>
          )}
          <div className={styles.dlRow}>
            <dt className={styles.dtLabel}>{`Participants${toArray(participants).length > 1 ? ` (${toArray(participants).length})` : ''}`}</dt>
            <dd className={styles.ddValue}>
              {signOptions && (
                <div className={styles.participantsWrapper}>
                  {signOptions.map((s: SignOption, i: number) => (
                    <Number
                      key={i}
                      value={s.value}
                      format="0,0"
                      suffix={` ${toTitle(s.option.substring(0, ['unsubmitted'].includes(s.option) ? 2 : undefined))}`}
                      noTooltip={true}
                      className={clsx(
                        styles.signOptionBase,
                        ['signed'].includes(s.option)
                          ? styles.signOptionSigned
                          : styles.signOptionUnsubmitted
                      )}
                    />
                  ))}
                </div>
              )}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}

interface SignsProps {
  data: AmplifierProofData;
}

function Signs({ data }: SignsProps) {
  const [signs, setSigns] = useState<ProofSign[] | null>(null);
  const verifiers = useVerifiers();

  useEffect(() => {
    if (data?.signs) {
      const signsList: ProofSign[] = data.signs.map(d => ({
        ...d,
        verifierData: (toArray(verifiers) as VerifierEntry[]).find(v =>
          equalsIgnoreCase(v.address, d.signer)
        ) || { address: d.signer },
      }));

      const unsubmitted: ProofSign[] = (toArray(data.participants) as string[])
        .filter(
          p =>
            !find(
              p,
              signsList.map(s => s.verifierData?.address).filter(Boolean) as string[]
            )
        )
        .map(p => {
          const verifierData = (toArray(verifiers) as VerifierEntry[]).find(v =>
            equalsIgnoreCase(v.address, p)
          );

          return {
            signer: verifierData?.address || p,
            verifierData,
          };
        });

      setSigns(_.concat(signsList, unsubmitted)
      );
    }
  }, [data, setSigns, verifiers]);

  const { confirmation_txhash } = { ...data };

  return (
    signs && (
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead className={styles.thead}>
            <tr className={styles.theadRow}>
              <th scope="col" className={styles.thFirst}>
                #
              </th>
              <th scope="col" className={styles.thMiddle}>
                Signer
              </th>
              <th
                scope="col"
                className={styles.thMiddleNowrap}
              >
                Tx Hash
              </th>
              <th scope="col" className={styles.thMiddle}>
                Height
              </th>
              <th scope="col" className={styles.thRight}>
                Sign
              </th>
              <th scope="col" className={styles.thLast}>
                Time
              </th>
            </tr>
          </thead>
          <tbody className={styles.tbody}>
            {signs.map((d: ProofSign, i: number) => {
              const sign = d.sign ? 'signed' : 'unsubmitted';

              return (
                <tr
                  key={i}
                  className={styles.tr}
                >
                  <td className={styles.tdFirst}>{i + 1}</td>
                  <td className={styles.tdMiddle}>
                    {d.verifierData ? (
                      <Profile i={i} address={d.verifierData.address} />
                    ) : (
                      <Copy value={d.signer}>
                        <Link
                          href={`/verifier/${d.signer}`}
                          target="_blank"
                          className={styles.signerLink}
                        >
                          {ellipse(d.signer, 10, '0x')}
                        </Link>
                      </Copy>
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
                        {equalsIgnoreCase(d.id, confirmation_txhash) && (
                          <Link
                            href={`/tx/${confirmation_txhash}`}
                            target="_blank"
                            className={styles.confirmationRow}
                          >
                            <IoCheckmarkDoneCircle
                              size={18}
                              className={styles.confirmationIcon}
                            />
                            <span className={styles.confirmationLabel}>
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
                  <td className={styles.tdRight}>
                    <div className={styles.signWrapper}>
                      <Tag
                        className={clsx(
                          styles.statusTagBase,
                          ['signed'].includes(sign)
                            ? styles.signOptionSigned
                            : styles.signOptionUnsubmitted
                        )}
                      >
                        {toTitle(sign)}
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

interface AmplifierProofProps {
  id: string;
}

export function AmplifierProof({ id }: AmplifierProofProps) {
  const [data, setData] = useState<AmplifierProofData | null>(null);
  const [blockData, setBlockData] = useState<RPCStatusData | null>(null);
  const _chains = useChains();
  const verifiers = useVerifiers();

  useEffect(() => {
    const getData = async () => setBlockData(await getRPCStatus() as RPCStatusData);
    getData();
  }, [setBlockData]);

  useEffect(() => {
    const getData = async () => {
      if (blockData) {
        const response = await searchAmplifierProofs({
            multisigContractAddress: id.includes('_')
              ? headString(id, '_')
              : undefined,
            sessionId: lastString(id, '_'),
          }) as { data?: AmplifierProofData[] } | undefined;

        let d = response?.data?.[0];

        if (d) {
          const signs = (getValuesOfAxelarAddressKey(d as unknown as Record<string, unknown>) as ProofSign[]).map(s => ({
            ...s,
            option: s.sign ? 'signed' : 'unsubmitted',
          }));

          const signOptions = Object.entries(_.groupBy(signs, 'option'))
            .map(([k, v]) => ({
              option: k,
              value: v?.length,
              signers: v?.map(item => item.signer).filter(Boolean) as string[],
            }))
            .filter(s => s.value)
            .map(s => ({
              ...s,
              i: s.option === 'signed' ? 0 : 1,
            }));

          // add unsubmitted option
          if (
            toArray(d.participants).length > 0 &&
            signOptions.findIndex(s => s.option === 'unsubmitted') < 0 &&
            _.sumBy(signOptions, 'value') < d.participants!.length
          ) {
            signOptions.push({
              option: 'unsubmitted',
              value: d.participants!.length - _.sumBy(signOptions, 'value'),
              i: 1,
              signers: [],
            });
          }

          d = {
            ...d,
            status: d.success
              ? 'completed'
              : d.failed
                ? 'failed'
                : d.expired || (d.expired_height != null && blockData.latest_block_height != null && d.expired_height < blockData.latest_block_height)
                  ? 'expired'
                  : 'pending',
            height: _.minBy(signs, 'height')?.height || d.height,
            signs: _.orderBy(signs, ['height', 'created_at'], ['desc', 'desc']),
            signOptions: _.orderBy(signOptions, ['i'], ['asc']),
          };
        }

        console.log('[data]', d);
        setData({ ...d });
      }
    };

    getData();
  }, [id, setData, blockData]);

  return (
    <Container className={styles.containerClass}>
      {!data ? (
        <Spinner />
      ) : (
        <div className={styles.contentWrapper}>
          <Info data={data} id={id} />
          {verifiers && <Signs data={data} />}
        </div>
      )}
    </Container>
  );
}
