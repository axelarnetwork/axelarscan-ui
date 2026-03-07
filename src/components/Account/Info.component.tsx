'use client';

import _ from 'lodash';

import { Number } from '@/components/Number';
import { Profile } from '@/components/Profile';
import type { Validator } from '@/types';
import { useChains, useValidators } from '@/hooks/useGlobalData';
import { getChainData } from '@/lib/config';
import { getInputType, toArray } from '@/lib/parser';
import { equalsIgnoreCase } from '@/lib/string';
import type { InfoProps } from './Account.types';
import * as styles from './Account.styles';

export function Info({ data, address }: InfoProps) {
  const chains = useChains();
  const validators = useValidators();

  const { rewards, commissions, delegations, redelegations, unbondings } = { ...data };
  const { symbol } = { ...(getChainData('axelarnet', chains)?.native_token as Record<string, unknown>) };

  const validatorData = (toArray(validators) as Validator[]).find(d =>
    equalsIgnoreCase(d.delegator_address, address)
  );

  const isAxelarAddress = getInputType(address, chains!) === 'axelarAddress';
  if (!isAxelarAddress) {
    return (
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h3 className={styles.cardTitle}>
            <Profile address={address} />
          </h3>
        </div>
        <div className={styles.cardBorder}>
          <dl className={styles.cardDivider} />
        </div>
      </div>
    );
  }

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <h3 className={styles.cardTitle}>
          <Profile address={address} />
        </h3>
      </div>
      <div className={styles.cardBorder}>
        <dl className={styles.cardDivider}>
          {rewards?.total?.[0] && (
            <div className={styles.detailRow}>
              <dt className={styles.detailLabel}>Rewards</dt>
              <dd className={styles.detailValue}>
                <div className={styles.detailValueRow}>
                  <Number
                    value={rewards.total[0].amount}
                    format="0,0.000000"
                    suffix={` ${symbol}`}
                    className={styles.numberValue}
                  />
                </div>
              </dd>
            </div>
          )}
          {validatorData && (
            <div className={styles.detailRow}>
              <dt className={styles.detailLabel}>Commissions</dt>
              <dd className={styles.detailValue}>
                <div className={styles.detailValueRow}>
                  {commissions?.[0] && (
                    <Number
                      value={commissions[0].amount}
                      format="0,0.000000"
                      suffix={` ${symbol}`}
                      className={styles.numberValue}
                    />
                  )}
                </div>
              </dd>
            </div>
          )}
          <div className={styles.detailRow}>
            <dt className={styles.detailLabel}>Delegations</dt>
            <dd className={styles.detailValue}>
              <div className={styles.detailValueRow}>
                {delegations?.data && (
                  <Number
                    value={_.sumBy(delegations.data, 'amount')}
                    format="0,0.000000"
                    suffix={` ${symbol}`}
                    className={styles.numberValue}
                  />
                )}
              </div>
            </dd>
          </div>
          {redelegations?.data && (
            <div className={styles.detailRow}>
              <dt className={styles.detailLabel}>Redelegations</dt>
              <dd className={styles.detailValue}>
                <div className={styles.detailValueRow}>
                  <Number
                    value={_.sumBy(redelegations.data, 'amount')}
                    format="0,0.000000"
                    suffix={` ${symbol}`}
                    className={styles.numberValue}
                  />
                </div>
              </dd>
            </div>
          )}
          <div className={styles.detailRow}>
            <dt className={styles.detailLabel}>Unstakings</dt>
            <dd className={styles.detailValue}>
              <div className={styles.detailValueRow}>
                {unbondings?.data && (
                  <Number
                    value={_.sumBy(unbondings.data, 'amount')}
                    format="0,0.000000"
                    suffix={` ${symbol}`}
                    className={styles.numberValue}
                  />
                )}
              </div>
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
