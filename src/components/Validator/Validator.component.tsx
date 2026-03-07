'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import _ from 'lodash';

import { Container } from '@/components/Container';
import { Spinner } from '@/components/Spinner';
import { Response } from '@/components/Response';
import { useValidatorStore } from '@/components/Validators';
import { useChains, useValidators } from '@/hooks/useGlobalData';
import { getBalances } from '@/lib/api/axelarscan';
import {
  getRPCStatus,
  searchUptimes,
  searchProposedBlocks,
  searchEVMPolls,
  getChainMaintainers,
  getValidatorDelegations,
} from '@/lib/api/validator';
import { ENVIRONMENT } from '@/lib/config';
import { toArray } from '@/lib/parser';
import { equalsIgnoreCase, find, includesSomePatterns } from '@/lib/string';
import type { Chain, Validator as ValidatorType, Delegation, UptimeBlock, ProposedBlock, EVMVote } from '@/types';
import type { ValidatorProps } from './Validator.types';
import { Info } from './Info.component';
import { Uptimes } from './Uptimes.component';
import { ProposedBlocks } from './ProposedBlocks.component';
import { Votes } from './Votes.component';
import * as styles from './Validator.styles';

const SIZE = 200;
const NUM_LATEST_BLOCKS = 10000;
const NUM_LATEST_PROPOSED_BLOCKS = 2500;

export function Validator({ address }: ValidatorProps) {
  const router = useRouter();
  const [EVMChains, setEVMChains] = useState<Chain[] | null>(null);
  const [data, setData] = useState<ValidatorType | null>(null);
  const [delegations, setDelegations] = useState<Delegation[] | null>(null);
  const [uptimes, setUptimes] = useState<UptimeBlock[] | null>(null);
  const [proposedBlocks, setProposedBlocks] = useState<ProposedBlock[] | null>(null);
  const [votes, setVotes] = useState<EVMVote[] | null>(null);
  const chains = useChains();
  const validators = useValidators();
  const { maintainers, setMaintainers } = useValidatorStore();

  // redirect or get evm chains
  useEffect(() => {
    if (address && validators) {
      if (
        ['axelarvalcons', 'axelar1'].findIndex(p => address.startsWith(p)) > -1
      ) {
        const { operator_address } = {
          ...validators.find((d: ValidatorType) =>
            includesSomePatterns(
              [d.consensus_address, d.delegator_address, d.broadcaster_address].filter((s): s is string => !!s),
              address
            )
          ),
        };

        if (operator_address) {
          router.push(`/validator/${operator_address}`);
        }
      } else if (address.startsWith('axelarvaloper') && chains) {
        setEVMChains(
          chains.filter((d: Chain) => d.chain_type === 'evm' && d.gateway?.address)
        );
      }
    }
  }, [address, router, setEVMChains, chains, validators]);

  // getChainMaintainers
  useEffect(() => {
    const getData = async () => {
      if (EVMChains) {
        setMaintainers(
          Object.fromEntries(
            await Promise.all(
              EVMChains.filter((d: Chain) => !maintainers?.[d.id]).map(
                (d: Chain) =>
                  new Promise<[string, string[]]>(async resolve => {
                    const { maintainers } = {
                      ...(await getChainMaintainers({ chain: d.id }) as Record<string, unknown>),
                    };
                    resolve([d.id, toArray(maintainers) as string[]]);
                  })
              )
            )
          )
        );
      }
    };

    getData();
  }, [EVMChains, setMaintainers]);

  // set validator data
  useEffect(() => {
    const getData = async () => {
      if (
        address?.startsWith('axelarvaloper') &&
        EVMChains &&
        validators &&
        Object.keys({ ...maintainers }).length === EVMChains.length
      ) {
        const _data = validators.find((d: ValidatorType) =>
          equalsIgnoreCase(d.operator_address, address)
        );

        if (_data) {
          // broadcaster balance
          if (_data.broadcaster_address) {
            const { data: balanceData } = {
              ...(await getBalances({ address: _data.broadcaster_address }) as Record<string, unknown>),
            };
            _data.broadcasterBalance = toArray(balanceData).find(
              (d: Record<string, unknown>) =>
                d.denom ===
                (ENVIRONMENT === 'devnet-amplifier' ? 'uamplifier' : 'uaxl')
            ) as ValidatorType['broadcasterBalance'];
          }

          // support chains
          _data.supportedChains = Object.entries({ ...maintainers })
            .filter(([_k, v]) => find(_data.operator_address, v as string[]))
            .map(([k, _v]) => k);

          if (!_.isEqual(_data, data)) {
            setData(_data);
          }
        } else if (!data) {
          setData({
            operator_address: '',
            status: 'errorOnGetData',
            code: 404,
            message: `Validator: ${address} not found`,
          });
        }
      }
    };

    getData();
  }, [address, EVMChains, data, setData, validators, maintainers]);

  // set validator metrics
  useEffect(() => {
    const getData = async () => {
      if (address && data && data.status !== 'error') {
        const { consensus_address, broadcaster_address } = { ...data };
        const { latest_block_height } = { ...(await getRPCStatus() as Record<string, unknown>) } as { latest_block_height?: number };

        if (latest_block_height) {
          await Promise.all(
            ['delegations', 'uptimes', 'proposedBlocks', 'votes'].map(
              (d: string) =>
                new Promise<void>(async resolve => {
                  switch (d) {
                    case 'delegations':
                      setDelegations(
                        (await getValidatorDelegations({ address }) as Record<string, unknown>)?.data as Delegation[] | null
                      );
                      break;
                    case 'uptimes':
                      try {
                        const toBlock = latest_block_height - 1;
                        const fromBlock = toBlock - SIZE;

                        const { data: uptimeData } = {
                          ...(await searchUptimes({
                            fromBlock,
                            toBlock,
                            size: SIZE,
                          }) as Record<string, unknown>),
                        };

                        setUptimes(
                          _.range(0, SIZE).map(i => {
                            const height = toBlock - i;
                            const ud = toArray(uptimeData).find(
                              (item: Record<string, unknown>) => item.height === height
                            ) as Record<string, unknown> | undefined;

                            return {
                              ...ud,
                              height,
                              status:
                                toArray(ud?.validators as string[]).findIndex((a: string) =>
                                  equalsIgnoreCase(a, consensus_address as string)
                                ) > -1,
                            };
                          })
                        );
                      } catch (_error) {}
                      break;
                    case 'proposedBlocks':
                      try {
                        const toBlock = latest_block_height - 1;
                        const fromBlock = toBlock - NUM_LATEST_PROPOSED_BLOCKS;

                        const { data: proposedData } = {
                          ...(await searchProposedBlocks({
                            fromBlock,
                            toBlock,
                            size: NUM_LATEST_PROPOSED_BLOCKS,
                          }) as Record<string, unknown>),
                        };

                        setProposedBlocks(
                          toArray(proposedData).filter((d: Record<string, unknown>) =>
                            equalsIgnoreCase(d.proposer as string, consensus_address as string)
                          ) as ProposedBlock[]
                        );
                      } catch (_error) {}
                      break;
                    case 'votes':
                      try {
                        const toBlock = latest_block_height - 1;
                        const fromBlock = toBlock - NUM_LATEST_BLOCKS;

                        const { data: votesData } = {
                          ...((broadcaster_address &&
                            (await searchEVMPolls({
                              voter: broadcaster_address as string,
                              fromBlock,
                              toBlock,
                              size: SIZE,
                            }))) as Record<string, unknown>),
                        };

                        setVotes(
                        toArray(votesData).map((d: unknown) =>
                            Object.fromEntries(
                              Object.entries(d as Record<string, unknown>)
                                // filter broadcaster address
                                .filter(
                                  ([k, _v]) =>
                                    !k.startsWith('axelar1') ||
                                    equalsIgnoreCase(k, broadcaster_address as string)
                                )
                                // flatMap vote data
                                .flatMap(([k, v]) =>
                                  equalsIgnoreCase(k, broadcaster_address as string)
                                    ? Object.entries({ ...(v as Record<string, unknown>) }).map(([k2, v2]) => [
                                        k2 === 'id' ? 'txhash' : k2,
                                        v2,
                                      ])
                                    : [[k, v]]
                                )
                            )
                          ) as EVMVote[]
                        );
                      } catch (_error) {}
                      break;
                    default:
                      break;
                  }

                  resolve();
                })
            )
          );
        }
      }
    };

    getData();
  }, [address, data]);

  if (!data) {
    return (
      <Container className="sm:mt-8">
        <Spinner />
      </Container>
    );
  }

  if (data.status === 'errorOnGetData') {
    return (
      <Container className="sm:mt-8">
        <Response data={{ code: data.code as number | string, message: data.message as string }} />
      </Container>
    );
  }

  return (
    <Container className="sm:mt-8">
      <div className={styles.mainGrid}>
        <div className={styles.mainLeft}>
          <Info data={data} address={address} delegations={delegations} />
        </div>
        {!(uptimes || proposedBlocks || votes) ? (
          <Spinner />
        ) : (
          <div className={styles.mainRight}>
            <Uptimes data={uptimes} />
            <ProposedBlocks data={proposedBlocks} />
            <Votes data={votes} />
          </div>
        )}
      </div>
    </Container>
  );
}
