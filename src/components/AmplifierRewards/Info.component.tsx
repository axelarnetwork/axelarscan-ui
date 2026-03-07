'use client';

import { Fragment } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Listbox, Transition } from '@headlessui/react';
import clsx from 'clsx';
import { MdCheck } from 'react-icons/md';
import { LuChevronsUpDown } from 'react-icons/lu';

import { Tooltip } from '@/components/Tooltip';
import { Number } from '@/components/Number';
import { Profile } from '@/components/Profile';
import type { Chain } from '@/types';
import { useChains, useVerifiers } from '@/hooks/useGlobalData';
import { getChainData } from '@/lib/config';
import { toArray } from '@/lib/parser';
import { equalsIgnoreCase, find } from '@/lib/string';
import { isNumber, formatUnits } from '@/lib/number';

import type { InfoProps, RewardsContractInfo } from './AmplifierRewards.types';
import * as styles from './AmplifierRewards.styles';

export function Info({ chain, rewardsPool, cumulativeRewards }: InfoProps) {
  const router = useRouter();
  const pathname = usePathname();
  const chains = useChains();
  const verifiers = useVerifiers();

  const chainData = getChainData(chain, chains);
  const id = chainData?.id;
  const name = chainData?.name;
  const multisig_prover = chainData?.multisig_prover as { address?: string } | undefined;
  const { voting_verifier, multisig } = { ...rewardsPool };

  const contracts = [
    { ...voting_verifier, id: 'voting_verifier', title: 'Verification' },
    { ...multisig, id: 'multisig', title: 'Signing' },
  ];

  const contractsFields = [
    { id: 'balance', title: 'Reward pool balance' },
    { id: 'epoch_duration', title: 'Epoch duration (blocks)' },
    { id: 'rewards_per_epoch', title: 'Rewards per epoch' },
    { id: 'last_distribution_epoch', title: 'Last distribution epoch' },
    { id: 'address', title: 'Contract addresses' },
  ];

  const symbol = (getChainData('axelarnet', chains)?.native_token as { symbol?: string } | undefined)?.symbol;

  return (
    <>
      <div className={styles.infoCard}>
        <div className={styles.infoHeaderWrapper}>
          <h3 className={styles.infoHeading}>
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            <Listbox
              value={id}
              onChange={(v: string) => router.push(`${pathname.replace(chain, v)}`)}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              {...({ className: styles.listboxWrapper } as any)}
            >
              {({ open }) => {
                const isSelected = (v: string) => v === id || equalsIgnoreCase(v, chain);
                const selectedValue = toArray(chains).find((d: Chain) =>
                  isSelected(d.id)
                ) as Chain | undefined;

                return (
                  <div className={styles.listboxRelative}>
                    <Listbox.Button className={styles.listboxButton}>
                      <span className={styles.listboxButtonText}>
                        {selectedValue?.name}
                      </span>
                      <span className={styles.listboxButtonIcon}>
                        <LuChevronsUpDown size={20} className={styles.listboxChevronIcon} />
                      </span>
                    </Listbox.Button>
                    <Transition
                      show={open}
                      as={Fragment}
                      leave="transition ease-in duration-100"
                      leaveFrom="opacity-100"
                      leaveTo="opacity-0"
                    >
                      <Listbox.Options className={styles.listboxOptions}>
                        {toArray(chains)
                          .filter((d: Chain) => d.chain_type === 'vm')
                          .map((d: Chain, j: number) => (
                            <Listbox.Option
                              key={j}
                              value={d.id}
                              // eslint-disable-next-line @typescript-eslint/no-explicit-any
                              className={({ active }: any) =>
                                clsx(
                                  styles.listboxOptionBase,
                                  active
                                    ? styles.listboxOptionActive
                                    : styles.listboxOptionInactive
                                )
                              }
                            >
                              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                              {({ selected, active }: any) => (
                                <>
                                  <span
                                    className={clsx(
                                      styles.listboxButtonText,
                                      selected ? styles.listboxOptionTextSelected : styles.listboxOptionTextNormal
                                    )}
                                  >
                                    {d.name}
                                  </span>
                                  {selected && (
                                    <span
                                      className={clsx(
                                        styles.listboxCheckWrapper,
                                        active ? styles.listboxCheckActive : styles.listboxCheckInactive
                                      )}
                                    >
                                      <MdCheck size={20} />
                                    </span>
                                  )}
                                </>
                              )}
                            </Listbox.Option>
                          ))}
                      </Listbox.Options>
                    </Transition>
                  </div>
                );
              }}
            </Listbox>
          </h3>
        </div>
        <div className={styles.infoBorderTop}>
          <div className={styles.infoGrid}>
            <dl className={styles.infoDl}>
              <div className={styles.infoRow}>
                <dt className={styles.infoDt}>
                  No. Verifiers
                </dt>
                <dd className={styles.infoDd}>
                  <Number
                    value={
                      toArray(verifiers).filter((d: Record<string, unknown>) =>
                        id && find(id, d.supportedChains as string[])
                      ).length
                    }
                    format="0,0"
                    className="font-medium"
                  />
                </dd>
              </div>
              <div className={styles.infoRow}>
                <dt className={styles.infoDt}>
                  Cumulative rewards
                </dt>
                <dd className={styles.infoDd}>
                  <Number
                    value={cumulativeRewards}
                    suffix={` ${symbol}`}
                    noTooltip={true}
                    className="font-medium"
                  />
                </dd>
              </div>
            </dl>
            <dl className={styles.infoDl}>
              <div className={styles.infoRow}>
                <dt className={styles.infoDt}>
                  Total reward pool balance
                </dt>
                <dd className={styles.infoDd}>
                  <Number
                    value={formatUnits(String(rewardsPool?.balance ?? '0'), 6)}
                    suffix={` ${symbol}`}
                    noTooltip={true}
                    className="font-medium"
                  />
                </dd>
              </div>
              <div className={styles.infoRow}>
                <dt className={styles.infoDt}></dt>
                <dd className={styles.infoDd}></dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
      <div className={styles.contractsCard}>
        <table className={styles.contractsTable}>
          <thead className={styles.contractsThead}>
            <tr className={styles.contractsTheadRow}>
              <th scope="col" className={styles.contractsTh}></th>
              {contracts.map(({ id, title }) => (
                <th
                  key={id}
                  scope="col"
                  className={styles.contractsTh}
                >
                  {title}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className={styles.contractsTbody}>
            {contractsFields.map(f => (
              <tr
                key={f.id}
                className={styles.contractsTr}
              >
                <td className={styles.contractsTdLabel}>
                  <div className={styles.contractsTdLabelText}>
                    {f.title}
                  </div>
                </td>
                {contracts.map((d: RewardsContractInfo) => {
                  let element;

                  switch (f.id) {
                    case 'balance':
                      element = (
                        <Number
                          value={formatUnits(String(d.balance ?? '0'), 6)}
                          suffix={` ${symbol}`}
                          noTooltip={true}
                          className="font-medium"
                        />
                      );
                      break;
                    case 'epoch_duration':
                      element = isNumber(d.epoch_duration) ? (
                        <Number
                          value={d.epoch_duration}
                          format="0,0"
                          className="font-medium"
                        />
                      ) : (
                        '-'
                      );
                      break;
                    case 'rewards_per_epoch':
                      element = (
                        <Number
                          value={formatUnits(String(d.rewards_per_epoch ?? '0'), 6)}
                          suffix={` ${symbol}`}
                          noTooltip={true}
                          className="font-medium"
                        />
                      );
                      break;
                    case 'last_distribution_epoch':
                      element =
                        isNumber(d.epoch_duration) &&
                        d.last_distribution_epoch ? (
                          <Number
                            value={d.last_distribution_epoch}
                            format="0,0"
                            className="font-medium"
                          />
                        ) : (
                          '-'
                        );
                      break;
                    case 'address':
                      element = (
                        <div className={styles.addressFlexCol}>
                          {d.id === 'multisig' && multisig_prover?.address && (
                            <div className={styles.addressRow}>
                              <Profile address={multisig_prover.address} />
                              <span>{name} Prover</span>
                            </div>
                          )}
                          <div className={styles.addressRow}>
                            <Profile address={d.address} />
                            {d.id === 'voting_verifier' ? (
                              <span>{name} Voting Verifier</span>
                            ) : (
                              <Tooltip
                                content="The global Multisig contract is used for the rewards pool for signing"
                                className={styles.tooltipContent}
                              >
                                <span>Global Multisig</span>
                              </Tooltip>
                            )}
                          </div>
                        </div>
                      );
                      break;
                    default:
                      break;
                  }

                  return (
                    <td
                      key={`${d.id}_${f.id}`}
                      className={styles.contractsTd}
                    >
                      <div className={styles.contractsTdContent}>
                        {element}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
