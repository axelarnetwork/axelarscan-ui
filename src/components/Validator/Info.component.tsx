'use client';

import Link from 'next/link';
import { useState } from 'react';
// @ts-expect-error react-linkify has no type declarations
import Linkify from 'react-linkify';
import clsx from 'clsx';
import _ from 'lodash';

import { Image } from '@/components/Image';
import { Copy } from '@/components/Copy';
import { Tooltip } from '@/components/Tooltip';
import { Tag } from '@/components/Tag';
import { Number } from '@/components/Number';
import { Profile } from '@/components/Profile';
import { TablePagination } from '@/components/Pagination';
import { useChains, useAssets, useValidators } from '@/hooks/useGlobalData';
import { getChainData, getAssetData } from '@/lib/config';
import { toArray } from '@/lib/parser';
import { ellipse } from '@/lib/string';
import { isNumber, numberFormat } from '@/lib/number';
import type { Validator as ValidatorType, Delegation } from '@/types';
import type { InfoProps } from './Validator.types';
import * as styles from './Validator.styles';

const DELEGATIONS_SIZE_PER_PAGE = 10;

function AddressRow({ label, value, children }: { label: string; value: string; children: React.ReactNode }) {
  return (
    <div className={styles.dlRow}>
      <dt className={styles.dlLabel}>{label}</dt>
      <dd className={styles.dlValue}>
        <Copy value={value}>{children}</Copy>
      </dd>
    </div>
  );
}

function DelegationRow({ d, assets }: { d: Delegation; assets: import('@/types').Asset[] | null | undefined }) {
  const { price } = { ...getAssetData(d.denom, assets) } as Record<string, unknown>;

  return (
    <tr className={styles.delegationsRow}>
      <td className={styles.delegationsTdFirst}>
        <Copy size={14} value={d.delegator_address}>
          <Link
            href={`/account/${d.delegator_address}`}
            target="_blank"
            className={styles.delegatorLink}
          >
            {ellipse(d.delegator_address, 6, 'axelar')}
          </Link>
        </Copy>
      </td>
      <td className={styles.delegationsTdMiddle}>
        <div className={styles.delegationsAmountWrapper}>
          <Number
            value={d.amount}
            className={styles.delegationsAmountValue}
          />
        </div>
      </td>
      <td className={styles.delegationsTdLast}>
        {isNumber(d.amount) && isNumber(price) && (
          <div className={styles.delegationsAmountWrapper}>
            <Number
              value={d.amount! * (price as number)}
              prefix="$"
              noTooltip={true}
              className={styles.delegationsValueNumber}
            />
          </div>
        )}
      </td>
    </tr>
  );
}

export function Info({ data, address, delegations }: InfoProps) {
  const [delegationsPage, setDelegationsPage] = useState(1);
  const chains = useChains();
  const assets = useAssets();
  const validators = useValidators();

  const {
    operator_address,
    consensus_address,
    delegator_address,
    broadcaster_address,
    broadcasterBalance,
    status,
    tokens,
    quadratic_voting_power,
    supportedChains,
  } = { ...data };
  const { details, website } = { ...data?.description };
  const { rate } = { ...data?.commission?.commission_rates };

  const totalVotingPower = _.sumBy(
    toArray(validators).filter((d: ValidatorType) => d.status === 'BOND_STATUS_BONDED'),
    'tokens'
  );
  const totalQuadraticVotingPower = _.sumBy(
    toArray(validators).filter((d: ValidatorType) => d.status === 'BOND_STATUS_BONDED'),
    'quadratic_voting_power'
  );

  return (
    <div className={styles.infoPanel}>
      <div className={styles.infoPanelHeader}>
        <h3 className={styles.infoPanelTitle}>
          <Profile address={address} width={32} height={32} />
        </h3>
        <div className={styles.infoPanelDescriptionWrapper}>
          {details && (
            <div className={styles.infoPanelDetails}>
              <Linkify>{details}</Linkify>
            </div>
          )}
          {website && (
            <Link
              href={website}
              target="_blank"
              className={styles.infoPanelWebsite}
            >
              {website}
            </Link>
          )}
        </div>
      </div>
      <div className={styles.infoPanelBorder}>
        <dl className={styles.infoPanelDefinitionList}>
          {operator_address && (
            <AddressRow label="Operator Address" value={operator_address}>
              <span>{ellipse(operator_address, 10, 'axelarvaloper')}</span>
            </AddressRow>
          )}
          {consensus_address && (
            <AddressRow label="Consensus Address" value={consensus_address}>
              <span>{ellipse(consensus_address, 10, 'axelarvalcons')}</span>
            </AddressRow>
          )}
          {delegator_address && (
            <AddressRow label="Delegator Address" value={delegator_address}>
              <Link
                href={`/account/${delegator_address}`}
                target="_blank"
                className={styles.blueLink}
              >
                {ellipse(delegator_address, 14, 'axelar')}
              </Link>
            </AddressRow>
          )}
          {broadcaster_address && (
            <div className={styles.dlRow}>
              <dt className={styles.dlLabel}>Broadcaster Address</dt>
              <dd className={styles.dlValue}>
                <div className={styles.broadcasterWrapper}>
                  <Copy value={broadcaster_address}>
                    <Link
                      href={`/account/${broadcaster_address}`}
                      target="_blank"
                      className={styles.blueLink}
                    >
                      {ellipse(broadcaster_address, 14, 'axelar')}
                    </Link>
                  </Copy>
                  {isNumber(broadcasterBalance?.amount) && (
                    <Number
                      value={broadcasterBalance!.amount}
                      suffix={` ${broadcasterBalance!.symbol}`}
                      className={clsx(
                        'font-medium',
                        broadcasterBalance!.amount! < 5
                          ? styles.balanceLow
                          : styles.balanceOk
                      )}
                    />
                  )}
                </div>
              </dd>
            </div>
          )}
          <div className={styles.dlRow}>
            <dt className={styles.dlLabel}>Status</dt>
            <dd className={styles.dlValue}>
              {status && (
                <Tag
                  className={clsx(
                    'w-fit',
                    status.includes('UN')
                      ? status.endsWith('ED')
                        ? styles.statusUnbonded
                        : styles.statusUnbonding
                      : styles.statusBonded
                  )}
                >
                  {status.replace('BOND_STATUS_', '')}
                </Tag>
              )}
            </dd>
          </div>
          {isNumber(rate) && (
            <div className={styles.dlRow}>
              <dt className={styles.dlLabel}>Commission</dt>
              <dd className={styles.dlValue}>
                <Number
                  value={(rate as number) * 100}
                  maxDecimals={2}
                  suffix="%"
                  noTooltip={true}
                  className="font-medium"
                />
              </dd>
            </div>
          )}
          {isNumber(tokens) && (
            <div className={styles.dlRow}>
              <dt className={styles.dlLabel}>
                {status === 'BOND_STATUS_BONDED' ? 'Consensus Power' : 'Staking'}
              </dt>
              <dd className={styles.dlValue}>
                <div className={styles.votingPowerRow}>
                  <Number
                    value={tokens}
                    format="0,0.0a"
                    noTooltip={true}
                    className={styles.votingPowerValue}
                  />
                  {status === 'BOND_STATUS_BONDED' && (
                    <Number
                      value={((tokens as number) * 100) / totalVotingPower}
                      format="0,0.0a"
                      prefix="("
                      suffix="%)"
                      noTooltip={true}
                      className={styles.votingPowerPercent}
                    />
                  )}
                </div>
              </dd>
            </div>
          )}
          {isNumber(quadratic_voting_power) &&
            status === 'BOND_STATUS_BONDED' && (
              <div className={styles.dlRow}>
                <dt className={styles.dlLabel}>Quadratic Power</dt>
                <dd className={styles.dlValue}>
                  <div className={styles.votingPowerRow}>
                    <Number
                      value={quadratic_voting_power}
                      format="0,0.0a"
                      noTooltip={true}
                      className={styles.votingPowerValue}
                    />
                    <Number
                      value={
                        ((quadratic_voting_power as number) * 100) /
                        totalQuadraticVotingPower
                      }
                      format="0,0.0a"
                      prefix="("
                      suffix="%)"
                      noTooltip={true}
                      className={styles.votingPowerPercent}
                    />
                  </div>
                </dd>
              </div>
            )}
          {supportedChains && (
            <div className={styles.dlRow}>
              <dt className={styles.dlLabel}>EVM Supported</dt>
              <dd className={styles.dlValue}>
                <div className={styles.supportedChainsGrid}>
                  {supportedChains.map((c: string, i: number) => {
                    const { name, image } = { ...getChainData(c, chains) };

                    return (
                      <Tooltip
                        key={i}
                        content={name}
                        className={styles.chainTooltip}
                      >
                        <Image
                          src={image}
                          alt=""
                          width={20}
                          height={20}
                          className={styles.chainImage}
                        />
                      </Tooltip>
                    );
                  })}
                </div>
              </dd>
            </div>
          )}
          {delegations && (
            <div className={styles.dlRow}>
              <dt className={styles.dlLabel}>{`Delegation${delegations.length > 1 ? `s (${numberFormat(delegations.length, '0,0')})` : ''}`}</dt>
              <dd className={styles.dlValue}>
                <div className={styles.delegationsWrapper}>
                  <div className={styles.delegationsTableScroll}>
                    <table className={styles.delegationsTable}>
                      <thead className={styles.delegationsTableHead}>
                        <tr className={styles.delegationsTableHeadRow}>
                          <th
                            scope="col"
                            className={styles.delegationsThFirst}
                          >
                            Delegator
                          </th>
                          <th scope="col" className={styles.delegationsThMiddle}>
                            Amount
                          </th>
                          <th
                            scope="col"
                            className={styles.delegationsThLast}
                          >
                            Value
                          </th>
                        </tr>
                      </thead>
                      <tbody className={styles.delegationsTableBody}>
                        {delegations
                          .filter(
                            (_d: Delegation, i: number) =>
                              i >= (delegationsPage - 1) * DELEGATIONS_SIZE_PER_PAGE &&
                              i < delegationsPage * DELEGATIONS_SIZE_PER_PAGE
                          )
                          .map((d: Delegation, i: number) => (
                            <DelegationRow key={i} d={d} assets={assets} />
                          ))}
                      </tbody>
                    </table>
                  </div>
                  {delegations.length > DELEGATIONS_SIZE_PER_PAGE && (
                    <TablePagination
                      data={delegations}
                      value={delegationsPage}
                      onChange={(page: number) => setDelegationsPage(page)}
                      sizePerPage={DELEGATIONS_SIZE_PER_PAGE}
                    />
                  )}
                </div>
              </dd>
            </div>
          )}
        </dl>
      </div>
    </div>
  );
}
