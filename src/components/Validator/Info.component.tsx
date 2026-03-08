'use client';

import Link from 'next/link';
// @ts-expect-error react-linkify has no type declarations
import Linkify from 'react-linkify';
import clsx from 'clsx';
import _ from 'lodash';

import { Copy } from '@/components/Copy';
import { Tag } from '@/components/Tag';
import { Number } from '@/components/Number';
import { Profile } from '@/components/Profile';
import { useValidators } from '@/hooks/useGlobalData';
import { toArray } from '@/lib/parser';
import { ellipse } from '@/lib/string';
import { isNumber } from '@/lib/number';
import type { Validator as ValidatorType } from '@/types';

import { AddressRow } from './AddressRow.component';
import { DelegationsTable } from './DelegationsTable.component';
import { SupportedChains } from './SupportedChains.component';
import { VotingPowerRow } from './VotingPowerRow.component';
import type { InfoProps } from './Validator.types';
import * as styles from './Validator.styles';

export function Info({ data, address, delegations }: InfoProps) {
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

  const bondedValidators = toArray(validators).filter(
    (d: ValidatorType) => d.status === 'BOND_STATUS_BONDED'
  );
  const totalVotingPower = _.sumBy(bondedValidators, 'tokens');
  const totalQuadraticVotingPower = _.sumBy(
    bondedValidators,
    'quadratic_voting_power'
  );
  const isBonded = status === 'BOND_STATUS_BONDED';

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
                <Tag className={clsx('w-fit', styles.getStatusStyle(status))}>
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
            <VotingPowerRow
              label={isBonded ? 'Consensus Power' : 'Staking'}
              value={tokens as number}
              totalPower={totalVotingPower}
              showPercent={isBonded}
            />
          )}
          {isNumber(quadratic_voting_power) && isBonded && (
            <VotingPowerRow
              label="Quadratic Power"
              value={quadratic_voting_power as number}
              totalPower={totalQuadraticVotingPower}
              showPercent={true}
            />
          )}
          {supportedChains && (
            <SupportedChains supportedChains={supportedChains} />
          )}
          {delegations && <DelegationsTable delegations={delegations} />}
        </dl>
      </div>
    </div>
  );
}
