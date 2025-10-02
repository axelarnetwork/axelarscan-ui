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
import { useGlobalStore } from '@/components/Global';
import { getVerifiersVotes, getVerifiersSigns } from '@/lib/api/validator';
import { toArray } from '@/lib/parser';
import { isString, equalsIgnoreCase, find } from '@/lib/string';
import { toNumber, numberFormat } from '@/lib/number';

export function Verifiers() {
  const [verifiersVotes, setVerifiersVotes] = useState(null);
  const [verifiersSigns, setVerifiersSigns] = useState(null);
  const [data, setData] = useState(null);
  const { chains, verifiers, verifiersByChain } = useGlobalStore();

  // getVerifiersVotes
  useEffect(() => {
    const getData = async () => {
      const response = await getVerifiersVotes();

      if (response?.data) {
        setVerifiersVotes(response);
      }
    };

    getData();
  }, [setVerifiersVotes]);

  // getVerifiersSigns
  useEffect(() => {
    const getData = async () => {
      const response = await getVerifiersSigns();

      if (response?.data) {
        setVerifiersSigns(response);
      }
    };

    getData();
  }, [setVerifiersSigns]);

  // set verifiers data
  useEffect(() => {
    if (verifiersVotes && verifiersSigns && verifiers) {
      const _data = verifiers.map(d => {
        if (verifiersVotes.data) {
          d.total_polls = toNumber(verifiersVotes.total);
          d.votes = { ...verifiersVotes.data[d.address] };
          d.total_votes = toNumber(d.votes.total);

          const getVoteCount = (vote, votes) =>
            _.sum(
              Object.values({ ...votes }).map(v =>
                toNumber(
                  _.last(
                    Object.entries({ ...v?.votes }).find(([k, v]) =>
                      equalsIgnoreCase(k, vote?.toString())
                    )
                  )
                )
              )
            );

          d.total_yes_votes = getVoteCount(true, d.votes.chains);
          d.total_no_votes = getVoteCount(false, d.votes.chains);
          d.total_unsubmitted_votes = getVoteCount(
            'unsubmitted',
            d.votes.chains
          );
        }

        if (verifiersSigns.data) {
          d.total_proofs = toNumber(verifiersSigns.total);
          d.signs = { ...verifiersSigns.data[d.address] };
          d.total_signs = toNumber(d.signs.total);

          const getSignCount = (sign, signs) =>
            _.sum(
              Object.values({ ...signs }).map(v =>
                toNumber(
                  _.last(
                    Object.entries({ ...v?.signs }).find(([k, v]) =>
                      equalsIgnoreCase(k, sign?.toString())
                    )
                  )
                )
              )
            );

          d.total_signed_signs = getSignCount(true, d.signs.chains);
          d.total_unsubmitted_signs = getSignCount(
            'unsubmitted',
            d.signs.chains
          );
        }

        return {
          ...d,
          votes: d.votes && {
            ...d.votes,
            chains: Object.fromEntries(
              Object.entries({ ...d.votes.chains }).filter(([k, v]) =>
                find(k, d.supportedChains)
              )
            ),
          },
          signs: d.signs && {
            ...d.signs,
            chains: Object.fromEntries(
              Object.entries({ ...d.signs.chains }).filter(([k, v]) =>
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
  }, [verifiersVotes, verifiersSigns, data, setData, verifiers]);

  const amplifierChains = toArray(chains).filter(
    c => c.chain_type === 'vm' && !c.deprecated
  );
  const additionalAmplifierChains = Object.entries({ ...verifiersByChain })
    .filter(
      ([k, v]) =>
        amplifierChains.findIndex(d => d.id === k) < 0 &&
        toArray(v.addresses).length > 0
    )
    .map(([k, v]) => k);

  return (
    <Container className="sm:mt-8">
      {!data ? (
        <Spinner />
      ) : (
        <div>
          <div className="flex flex-col gap-y-4 sm:flex-row sm:items-center sm:justify-between sm:gap-x-4 sm:gap-y-0">
            <div className="sm:flex-auto">
              <div className="flex items-center space-x-2">
                <Link
                  href="/validators"
                  className="text-base font-medium leading-6 text-blue-600 dark:text-blue-500"
                >
                  Validators
                </Link>
                <span className="text-zinc-400 dark:text-zinc-500">|</span>
                <h1 className="text-base font-semibold leading-6 text-zinc-900 underline dark:text-zinc-100">
                  Verifiers
                </h1>
              </div>
              <p className="mt-2 text-sm text-zinc-400 dark:text-zinc-500">
                List of active verifiers in Axelar Network with the latest 10K
                blocks performance.
              </p>
            </div>
          </div>
          <div className="-mx-4 mt-4 overflow-x-auto sm:-mx-0 lg:overflow-x-visible">
            <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-700">
              <thead className="sticky top-0 z-10 bg-white dark:bg-zinc-900">
                <tr className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                  <th
                    scope="col"
                    className="py-3.5 pl-4 pr-3 text-left sm:pl-0"
                  >
                    #
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left">
                    Verifier
                  </th>
                  <th
                    scope="col"
                    className="whitespace-nowrap py-3.5 pl-3 pr-4 text-left sm:pr-0"
                  >
                    Amplifier Supported
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 bg-white dark:divide-zinc-800 dark:bg-zinc-900">
                {data.map((d, i) => (
                  <tr
                    key={i}
                    className="align-top text-sm text-zinc-400 dark:text-zinc-500"
                  >
                    <td className="py-4 pl-4 pr-3 text-left sm:pl-0">
                      {i + 1}
                    </td>
                    <td className="px-3 py-4 text-left">
                      <div className="flex flex-col gap-y-0.5">
                        <Profile
                          i={i}
                          address={d.address}
                          customURL={`/verifier/${d.address}`}
                        />
                      </div>
                    </td>
                    <td className="table-cell py-4 pl-3 pr-4 text-left sm:pr-0">
                      <div
                        className={clsx(
                          'grid grid-cols-2 gap-x-2 gap-y-1 lg:grid-cols-3',
                          additionalAmplifierChains.length > 0
                            ? 'min-w-md max-w-4xl lg:min-w-56'
                            : 'min-w-56 max-w-3xl'
                        )}
                      >
                        {_.concat(
                          amplifierChains,
                          additionalAmplifierChains
                        ).map(c => {
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
                            <div key={chain} className="flex justify-start">
                              <div className="flex items-center gap-x-2">
                                <Tooltip
                                  content={`${name}${!isSupported ? `: Not Supported` : ''}`}
                                  className="whitespace-nowrap"
                                >
                                  {image ? (
                                    <Image
                                      src={image}
                                      alt=""
                                      width={20}
                                      height={20}
                                    />
                                  ) : (
                                    <span className="whitespace-nowrap text-xs text-zinc-900 dark:text-zinc-100">
                                      {name}
                                    </span>
                                  )}
                                </Tooltip>
                                {!isSupported ? (
                                  <span className="whitespace-nowrap text-xs font-medium text-zinc-400 dark:text-zinc-500">
                                    Not Supported
                                  </span>
                                ) : (
                                  <div className="flex items-center gap-x-4">
                                    <Tooltip
                                      content={['true', 'false', 'unsubmitted']
                                        .map(s => [
                                          s === 'true'
                                            ? 'Y'
                                            : s === 'false'
                                              ? 'N'
                                              : 'UN',
                                          votes?.[s],
                                        ])
                                        .map(
                                          ([k, v]) =>
                                            `${numberFormat(v, '0,0')}${k}`
                                        )
                                        .join(' / ')}
                                      className="whitespace-nowrap"
                                    >
                                      <div className="flex items-center gap-x-1">
                                        <Number
                                          value={total || 0}
                                          format="0,0.0a"
                                          prefix="Voting: "
                                          noTooltip={true}
                                          className={clsx(
                                            'text-xs font-medium',
                                            total < total_polls
                                              ? 'text-zinc-400 dark:text-zinc-500'
                                              : 'text-zinc-900 dark:text-zinc-100'
                                          )}
                                        />
                                        <Number
                                          value={total_polls || 0}
                                          format="0,0.0a"
                                          prefix=" / "
                                          noTooltip={true}
                                          className="text-xs font-medium text-zinc-900 dark:text-zinc-100"
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
                                          ([k, v]) =>
                                            `${numberFormat(v, '0,0')}${k}`
                                        )
                                        .join(' / ')}
                                      className="whitespace-nowrap"
                                    >
                                      <div className="flex items-center gap-x-1">
                                        <Number
                                          value={
                                            d.signs.chains[chain]?.total || 0
                                          }
                                          format="0,0.0a"
                                          prefix="Signing: "
                                          noTooltip={true}
                                          className={clsx(
                                            'text-xs font-medium',
                                            d.signs.chains[chain]?.total <
                                              total_proofs
                                              ? 'text-zinc-400 dark:text-zinc-500'
                                              : 'text-zinc-900 dark:text-zinc-100'
                                          )}
                                        />
                                        <Number
                                          value={total_proofs || 0}
                                          format="0,0.0a"
                                          prefix=" / "
                                          noTooltip={true}
                                          className="text-xs font-medium text-zinc-900 dark:text-zinc-100"
                                        />
                                      </div>
                                    </Tooltip>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
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
