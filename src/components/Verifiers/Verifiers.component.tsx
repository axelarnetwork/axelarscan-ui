'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import clsx from 'clsx';
import _ from 'lodash';

import { Container } from '@/components/Container';
import { Image } from '@/components/Image';
import { Tooltip } from '@/components/Tooltip';
import { Spinner } from '@/components/Spinner';
import { Number } from '@/components/Number';
import { Profile } from '@/components/Profile';
import { useChains, useVerifiers, useVerifiersByChain } from '@/hooks/useGlobalData';
import { getVerifiersVotes, getVerifiersSigns } from '@/lib/api/validator';
import { toArray } from '@/lib/parser';
import { isString, equalsIgnoreCase, find } from '@/lib/string';
import { toNumber, numberFormat } from '@/lib/number';
import type { Chain } from '@/types';
import * as styles from './Verifiers.styles';

export function Verifiers() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [verifiersVotes, setVerifiersVotes] = useState<Record<string, any> | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [verifiersSigns, setVerifiersSigns] = useState<Record<string, any> | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [data, setData] = useState<Record<string, any>[] | null>(null);
  const chains = useChains();
  const verifiers = useVerifiers();
  const verifiersByChain = useVerifiersByChain();

  useEffect(() => {
    const getData = async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const response = await getVerifiersVotes() as any;
      if (response?.data) {
        setVerifiersVotes(response);
      }
    };
    getData();
  }, []);

  useEffect(() => {
    const getData = async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const response = await getVerifiersSigns() as any;
      if (response?.data) {
        setVerifiersSigns(response);
      }
    };
    getData();
  }, []);

  useEffect(() => {
    if (verifiersVotes && verifiersSigns && verifiers) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const _data = verifiers.map((d: any) => {
        if (verifiersVotes.data) {
          d.total_polls = toNumber(verifiersVotes.total);
          d.votes = { ...verifiersVotes.data[d.address] };
          d.total_votes = toNumber(d.votes.total);

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const getVoteCount = (vote: any, votes: any) =>
            _.sum(
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              Object.values({ ...votes }).map((v: any) =>
                toNumber(
                  _.last(
                    Object.entries({ ...v?.votes }).find(([k, _v]: [string, unknown]) =>
                      equalsIgnoreCase(k, vote?.toString())
                    )
                  )
                )
              )
            );

          d.total_yes_votes = getVoteCount(true, d.votes.chains);
          d.total_no_votes = getVoteCount(false, d.votes.chains);
          d.total_unsubmitted_votes = getVoteCount('unsubmitted', d.votes.chains);
        }

        if (verifiersSigns.data) {
          d.total_proofs = toNumber(verifiersSigns.total);
          d.signs = { ...verifiersSigns.data[d.address] };
          d.total_signs = toNumber(d.signs.total);

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const getSignCount = (sign: any, signs: any) =>
            _.sum(
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              Object.values({ ...signs }).map((v: any) =>
                toNumber(
                  _.last(
                    Object.entries({ ...v?.signs }).find(([k, _v]: [string, unknown]) =>
                      equalsIgnoreCase(k, sign?.toString())
                    )
                  )
                )
              )
            );

          d.total_signed_signs = getSignCount(true, d.signs.chains);
          d.total_unsubmitted_signs = getSignCount('unsubmitted', d.signs.chains);
        }

        return {
          ...d,
          votes: d.votes && {
            ...d.votes,
            chains: Object.fromEntries(
              Object.entries({ ...d.votes.chains }).filter(([k, _v]: [string, unknown]) =>
                find(k, d.supportedChains)
              )
            ),
          },
          signs: d.signs && {
            ...d.signs,
            chains: Object.fromEntries(
              Object.entries({ ...d.signs.chains }).filter(([k, _v]: [string, unknown]) =>
                find(k, d.supportedChains)
              )
            ),
          },
        };
      });

      if (!_.isEqual(_data, data)) {
        setData(_data);
      }
    }
  }, [verifiersVotes, verifiersSigns, data, verifiers]);

  const amplifierChains = (toArray(chains) as Chain[]).filter(
    (c: Chain) => c.chain_type === 'vm' && !c.deprecated
  );
  const additionalAmplifierChains = Object.entries({ ...verifiersByChain })
    .filter(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ([k, v]: [string, any]) =>
        amplifierChains.findIndex((d: Chain) => d.id === k) < 0 &&
        toArray(v.addresses).length > 0
    )
    .map(([k, _v]: [string, unknown]) => k);

  return (
    <Container className="sm:mt-8">
      {!data ? (
        <Spinner />
      ) : (
        <div>
          <div className={styles.headerWrapper}>
            <div className="sm:flex-auto">
              <div className={styles.navLinks}>
                <Link href="/validators" className={styles.validatorsLink}>
                  Validators
                </Link>
                <span className={styles.navDivider}>|</span>
                <h1 className={styles.pageTitle}>Verifiers</h1>
              </div>
              <p className={styles.pageDescription}>
                List of active verifiers in Axelar Network with the latest 10K
                blocks performance.
              </p>
            </div>
          </div>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead className={styles.thead}>
                <tr className={styles.theadRow}>
                  <th scope="col" className={styles.thFirst}>#</th>
                  <th scope="col" className={styles.thMiddle}>Verifier</th>
                  <th scope="col" className={styles.thLast}>Amplifier Supported</th>
                </tr>
              </thead>
              <tbody className={styles.tbody}>
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {data.map((d: any, i: number) => (
                  <tr key={i} className={styles.row}>
                    <td className={styles.tdFirst}>{i + 1}</td>
                    <td className={styles.tdMiddle}>
                      <div className={styles.profileWrapper}>
                        <Profile
                          i={i}
                          address={d.address}
                          customURL={`/verifier/${d.address}`}
                        />
                      </div>
                    </td>
                    <td className={styles.tdLast}>
                      <div
                        className={clsx(
                          styles.chainGridBase,
                          additionalAmplifierChains.length > 0
                            ? styles.chainGridWide
                            : styles.chainGridNarrow
                        )}
                      >
                        {([...amplifierChains, ...additionalAmplifierChains] as (Chain | string)[]).map(
                          // eslint-disable-next-line @typescript-eslint/no-explicit-any
                          (c: any) => {
                            const {
                              id: chain,
                              name,
                              image,
                            } = { ...(isString(c) ? { id: c, name: c } : c) };

                            const { votes, total, total_polls } = {
                              ...d.votes.chains[chain],
                            };
                            const { signs, total_proofs } = {
                              ...d.signs.chains[chain],
                            };

                            const isSupported = d.supportedChains.includes(chain);

                            return (
                              <div key={chain} className={styles.chainItem}>
                                <div className={styles.chainInner}>
                                  <Tooltip
                                    content={`${name}${!isSupported ? `: Not Supported` : ''}`}
                                    className="whitespace-nowrap"
                                  >
                                    {image ? (
                                      <Image src={image} alt="" width={20} height={20} />
                                    ) : (
                                      <span className={styles.chainName}>{name}</span>
                                    )}
                                  </Tooltip>
                                  {!isSupported ? (
                                    <span className={styles.notSupported}>Not Supported</span>
                                  ) : (
                                    <div className={styles.statsWrapper}>
                                      <Tooltip
                                        content={['true', 'false', 'unsubmitted']
                                          .map(s => [
                                            s === 'true' ? 'Y' : s === 'false' ? 'N' : 'UN',
                                            votes?.[s],
                                          ])
                                          .map(
                                            ([k, v]) => `${numberFormat(v, '0,0')}${k}`
                                          )
                                          .join(' / ')}
                                        className="whitespace-nowrap"
                                      >
                                        <div className={styles.statsInner}>
                                          <Number
                                            value={total || 0}
                                            format="0,0.0a"
                                            prefix="Voting: "
                                            noTooltip={true}
                                            className={clsx(
                                              'text-xs font-medium',
                                              total < total_polls
                                                ? styles.statsInactive
                                                : styles.statsActive
                                            )}
                                          />
                                          <Number
                                            value={total_polls || 0}
                                            format="0,0.0a"
                                            prefix=" / "
                                            noTooltip={true}
                                            className={styles.statsActive}
                                          />
                                        </div>
                                      </Tooltip>
                                      <Tooltip
                                        content={['true', 'unsubmitted']
                                          .map(s => [
                                            s === 'true' ? ' Signed' : 'UN',
                                            signs?.[s],
                                          ])
                                          .map(
                                            ([k, v]) => `${numberFormat(v, '0,0')}${k}`
                                          )
                                          .join(' / ')}
                                        className="whitespace-nowrap"
                                      >
                                        <div className={styles.statsInner}>
                                          <Number
                                            value={d.signs.chains[chain]?.total || 0}
                                            format="0,0.0a"
                                            prefix="Signing: "
                                            noTooltip={true}
                                            className={clsx(
                                              'text-xs font-medium',
                                              d.signs.chains[chain]?.total < total_proofs
                                                ? styles.statsInactive
                                                : styles.statsActive
                                            )}
                                          />
                                          <Number
                                            value={total_proofs || 0}
                                            format="0,0.0a"
                                            prefix=" / "
                                            noTooltip={true}
                                            className={styles.statsActive}
                                          />
                                        </div>
                                      </Tooltip>
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          }
                        )}
                      </div>
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
