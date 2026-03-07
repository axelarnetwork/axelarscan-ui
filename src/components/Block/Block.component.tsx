'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import _ from 'lodash';
import moment from 'moment';
import { MdArrowBackIosNew, MdArrowForwardIos } from 'react-icons/md';
import { RxCaretDown, RxCaretUp } from 'react-icons/rx';

import { Container } from '@/components/Container';
import { JSONView } from '@/components/JSONView';
import { Copy } from '@/components/Copy';
import { Tooltip } from '@/components/Tooltip';
import { Spinner } from '@/components/Spinner';
import { Tag } from '@/components/Tag';
import { Number } from '@/components/Number';
import { Profile } from '@/components/Profile';
import { Transactions } from '@/components/Transactions';
import { useValidators } from '@/hooks/useGlobalData';
import { getBlock, getValidatorSets } from '@/lib/api/validator';
import { toJson, toHex, toArray } from '@/lib/parser';
import {
  equalsIgnoreCase,
  removeDoubleQuote,
  lastString,
  find,
  ellipse,
  toTitle,
} from '@/lib/string';
import { isNumber, toNumber, numberFormat } from '@/lib/number';
import { TIME_FORMAT } from '@/lib/time';
import * as styles from './Block.styles';

interface ValidatorSetEntry {
  address?: string;
  tokens?: number;
  operator_address?: string;
  [key: string]: unknown;
}

interface BlockEvent {
  type: string;
  data: Record<string, unknown>[];
}

interface BlockData {
  block_id?: { hash?: string };
  block?: {
    header?: { proposer_address?: string; time?: string };
    data?: { txs?: unknown[] };
    last_commit?: { round?: number; validators?: unknown[] };
  };
  round?: number;
  validators?: unknown[];
  begin_block_events?: BlockEvent[];
  end_block_events?: BlockEvent[];
  [key: string]: unknown;
}

function Info({ data, height, validatorSets }: { data: BlockData; height: string; validatorSets: ValidatorSetEntry[] | null }) {
  const [signedCollpased, setSignedCollpased] = useState(true);

  const { hash } = { ...data.block_id };
  const { proposer_address, time } = { ...data.block?.header };
  const { txs } = { ...data.block?.data };

  const signedValidatorsData = (toArray(validatorSets) as ValidatorSetEntry[]).filter(d =>
    d.address && find(d.address, data.validators as string[])
  );
  const unsignedValidatorsData = (toArray(validatorSets) as ValidatorSetEntry[]).filter(
    d => !d.address || !find(d.address, data.validators as string[])
  );

  return (
    <div className={styles.infoPanel}>
      <div className={styles.infoHeader}>
        <h3 className={styles.infoTitle}>
          <Copy value={height}>
            <Number value={height} format="0,0" />
          </Copy>
        </h3>
        <div className={styles.navWrapper}>
          <Tooltip content={numberFormat(toNumber(height) - 1, '0,0')}>
            <Link
              href={`/block/${toNumber(height) - 1}`}
              className={styles.navButton}
            >
              <MdArrowBackIosNew size={14} />
            </Link>
          </Tooltip>
          <Tooltip content={numberFormat(toNumber(height) + 1, '0,0')}>
            <Link
              href={`/block/${toNumber(height) + 1}`}
              className={styles.navButton}
            >
              <MdArrowForwardIos size={14} />
            </Link>
          </Tooltip>
        </div>
      </div>
      <div className={styles.infoBorder}>
        <dl className={styles.dlDivide}>
          <div className={styles.dlRow}>
            <dt className={styles.dtLabel}>Hash</dt>
            <dd className={styles.ddValue}>
              {hash && (
                <Copy value={hash}>
                  <span>{ellipse(hash)}</span>
                </Copy>
              )}
            </dd>
          </div>
          <div className={styles.dlRow}>
            <dt className={styles.dtLabel}>Proposer</dt>
            <dd className={styles.ddValue}>
              <Profile address={proposer_address} />
            </dd>
          </div>
          <div className={styles.dlRow}>
            <dt className={styles.dtLabel}>Block Time</dt>
            <dd className={styles.ddValue}>
              {time && moment(time).format(TIME_FORMAT)}
            </dd>
          </div>
          {isNumber(data.round) && (
            <div className={styles.dlRow}>
              <dt className={styles.dtLabel}>Round</dt>
              <dd className={styles.ddValue}>{data.round}</dd>
            </div>
          )}
          {validatorSets &&
            signedValidatorsData.length + unsignedValidatorsData.length > 0 && (
              <div className={styles.dlRow}>
                <dt className={styles.dtLabel}>Signer / Absent</dt>
                <dd className={styles.ddValue}>
                  <div className={styles.signerSection}>
                    <button
                      onClick={() => setSignedCollpased(!signedCollpased)}
                      className={styles.signerToggle}
                    >
                      <Number
                        value={
                          (_.sumBy(signedValidatorsData, 'tokens') * 100) /
                          _.sumBy(
                            _.concat(signedValidatorsData, unsignedValidatorsData),
                            'tokens'
                          )
                        }
                        prefix={`${signedValidatorsData.length} (`}
                        suffix="%)"
                        noTooltip={true}
                      />
                      <span>/</span>
                      <Number value={unsignedValidatorsData.length} format="0,0" />
                      <div className={styles.caretWrapper}>
                        {signedCollpased ? <RxCaretDown size={18} /> : <RxCaretUp size={18} />}
                      </div>
                    </button>
                    {!signedCollpased && (
                      <div className={styles.signerSection}>
                        <div className={styles.signerSubsection}>
                          <span className={styles.signerLabel}>Signed by</span>
                          <div className={styles.signerGrid}>
                            {signedValidatorsData.map((d, i) => (
                              <Profile
                                key={i}
                                i={i}
                                address={d.operator_address}
                                width={20}
                                height={20}
                                className="text-xs"
                              />
                            ))}
                          </div>
                        </div>
                        {unsignedValidatorsData.length > 0 && (
                          <div className={styles.signerSubsection}>
                            <span className={styles.signerLabel}>Missing</span>
                            <div className={styles.signerGrid}>
                              {unsignedValidatorsData.map((d, i) => (
                                <Profile
                                  key={i}
                                  i={i}
                                  address={d.operator_address}
                                  width={20}
                                  height={20}
                                  className="text-xs"
                                />
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </dd>
              </div>
            )}
          <div className={styles.dlRow}>
            <dt className={styles.dtLabel}>No. Transactions</dt>
            <dd className={styles.ddValue}>
              {txs && (
                <Number
                  value={txs.length}
                  format="0,0"
                  className={styles.txCountValue}
                />
              )}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}

const BLOCK_EVENTS = ['begin_block_events', 'end_block_events'];

function BlockEvents({ data }: { data: BlockData }) {
  const COLLAPSE_SIZE = 3;

  const [seeMoreTypes, setSeeMoreTypes] = useState<string[]>([]);

  return (
    <div className={styles.eventsGrid}>
      {BLOCK_EVENTS.filter(f => toArray(data[f as keyof BlockData]).length > 0).map((f, i) => (
        <div key={i} className={styles.eventColumn}>
          <Tag className="w-fit capitalize">{toTitle(f)}</Tag>
          <div className={styles.eventTableWrapper}>
            <table className={styles.eventTable}>
              <thead className={styles.eventThead}>
                <tr className={styles.eventTheadRow}>
                  <th scope="col" className={styles.eventThLeft}>Type</th>
                  <th scope="col" className={styles.eventThRight}>Data</th>
                </tr>
              </thead>
              <tbody className={styles.eventTbody}>
                {(data[f as keyof BlockData] as BlockEvent[])
                  .filter(d => d.data)
                  .map((d, j) => (
                    <tr key={j} className={styles.eventRow}>
                      <td className={styles.eventTypeCell}>
                        <div className={styles.eventTypeInner}>
                          <span className="whitespace-nowrap">
                            {toTitle(lastString(d.type, '.'))}
                          </span>
                          {d.data.length > 1 && (
                            <Number
                              value={d.data.length}
                              format="0,0"
                              prefix="["
                              suffix="]"
                              className="text-xs font-medium"
                            />
                          )}
                        </div>
                      </td>
                      <td className={styles.eventDataCell}>
                        <div className={styles.eventDataInner}>
                          {_.slice(
                            d.data,
                            0,
                            seeMoreTypes.includes(d.type) ? d.data.length : COLLAPSE_SIZE
                          ).map((item: Record<string, unknown>, k: number) => (
                            <JSONView
                              key={k}
                              value={item}
                              tab={2}
                              useJSONView={false}
                              className="text-xs"
                            />
                          ))}
                          {(d.data.length > COLLAPSE_SIZE || seeMoreTypes.includes(d.type)) && (
                            <button
                              onClick={() =>
                                setSeeMoreTypes(
                                  seeMoreTypes.includes(d.type)
                                    ? seeMoreTypes.filter((t: string) => t !== d.type)
                                    : _.uniq(_.concat(seeMoreTypes, d.type))
                                )
                              }
                              className={styles.seeMoreButton}
                            >
                              <span>
                                See {seeMoreTypes.includes(d.type) ? 'Less' : 'More'}
                              </span>
                              {!seeMoreTypes.includes(d.type) && (
                                <span>({d.data.length - COLLAPSE_SIZE})</span>
                              )}
                              {seeMoreTypes.includes(d.type) ? (
                                <RxCaretUp size={14} />
                              ) : (
                                <RxCaretDown size={14} />
                              )}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}

export function Block({ height }: { height: string }) {
  const [data, setData] = useState<BlockData | null>(null);
  const [validatorSets, setValidatorSets] = useState<ValidatorSetEntry[] | null>(null);
  const validators = useValidators();

  useEffect(() => {
    const getData = async () => {
      const responseData = await getBlock(height) as BlockData | undefined;

      if (responseData) {
        const nextBlock = await getBlock(toNumber(height) + 1) as BlockData | undefined;
        const { round, validators: blockValidators } = { ...nextBlock?.block?.last_commit };

        if (isNumber(round)) {
          responseData.round = round;
        }

        if (blockValidators) {
          responseData.validators = blockValidators;
        }

        for (const f of BLOCK_EVENTS) {
          const events = responseData[f as keyof BlockData];
          if (events) {
            (responseData as Record<string, unknown>)[f] = Object.entries(
              _.groupBy(events as Record<string, unknown>[], 'type')
            ).map(([k, v]) => ({
              type: k,
              data: (v as Record<string, unknown>[]).map(e =>
                Object.fromEntries(
                  (toArray(e.attributes as unknown[]) as Record<string, unknown>[]).map(a => [
                    a.key,
                    removeDoubleQuote(toJson(a.value) || toHex(a.value)),
                  ])
                )
              ),
            }));
          }
        }

        console.log('[data]', responseData);
        setData(responseData);
      }
    };

    getData();
  }, [height]);

  useEffect(() => {
    const getData = async () => {
      if (height && data && validators) {
        const validatorSetsResponse = await getValidatorSets(height) as { result?: { validators?: Record<string, unknown>[] } } | undefined;
        setValidatorSets(
          (toArray(validatorSetsResponse?.result?.validators) as Record<string, unknown>[]).map(d => ({
            ...d,
            ...validators.find(v =>
              equalsIgnoreCase(v.consensus_address, d.address as string | undefined)
            ),
          })) as ValidatorSetEntry[]
        );
      }
    };

    getData();
  }, [height, data, validators]);

  return (
    <Container className="sm:mt-8">
      {!data ? (
        <Spinner />
      ) : (
        <div className={styles.mainGrid}>
          <Info data={data} height={height} validatorSets={validatorSets} />
          <div className={styles.transactionsCol}>
            <Transactions height={height} />
          </div>
          <div className={styles.eventsCol}>
            <BlockEvents data={data} />
          </div>
        </div>
      )}
    </Container>
  );
}
