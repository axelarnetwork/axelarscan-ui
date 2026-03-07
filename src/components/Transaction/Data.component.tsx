'use client';

import { useEffect, useState } from 'react';

import { useChains, useAssets, useValidators } from '@/hooks/useGlobalData';
import { JSONView } from '@/components/JSONView';
import { Switch } from '@/components/Switch';
import { getActivities, getType } from '@/components/Transactions';
import { toJson } from '@/lib/parser';
import type { DataProps } from './Transaction.types';
import { ActivityItem } from './ActivityItem.component';
import { EventLogEntry } from './EventLogEntry.component';
import * as styles from './Transaction.styles';

const FORMATTABLE_TYPES = [
  'MsgSend',
  'ConfirmDeposit',
  'ConfirmERC20Deposit',
  'ConfirmERC20TokenDeployment',
  'ConfirmGatewayTx',
  'ConfirmTransferKey',
  'Vote',
  'MsgTransfer',
  'RetryIBCTransfer',
  'RouteIBCTransfers',
  'MsgUpdateClient',
  'MsgAcknowledgement',
  'MsgDelegate',
  'MsgUndelegate',
  'CreatePendingTransfers',
  'ExecutePendingTransfers',
  'SignCommands',
];


export function Data({ data }: DataProps) {
  const [formattable, setFormattable] = useState<boolean | null>(null);
  const [formatted, setFormatted] = useState(true);
  const chains = useChains();
  const assets = useAssets();
  const validators = useValidators();

  useEffect(() => {
    if (data) {
      setFormattable(
        FORMATTABLE_TYPES.includes(getType(data) ?? '') &&
          (getActivities(data, null)?.length ?? 0) > 0 &&
          !!toJson(data.raw_log)
      );
    }
  }, [data]);

  useEffect(() => {
    if (!formattable && typeof formattable === 'boolean') {
      setFormatted(false);
    }
  }, [formattable]);

  const activities = getActivities(data, assets) ?? [];

  if (!formatted) {
    return (
      <div className={styles.dataWrapper}>
        {formattable && (
          <div className={styles.switchRow}>
            <Switch
              value={formatted}
              onChange={(v: boolean) => setFormatted(v)}
              title="Formatted"
            />
          </div>
        )}
        <JSONView value={data} className={styles.jsonViewPanel} />
      </div>
    );
  }

  const rawLogParsed = toJson(data.raw_log);

  return (
    <div className={styles.dataWrapper}>
      {formattable && (
        <div className={styles.switchRow}>
          <Switch
            value={formatted}
            onChange={(v: boolean) => setFormatted(v)}
            title="Formatted"
          />
        </div>
      )}
      <div className={styles.formattedWrapper}>
        <div className={styles.sectionWrapper}>
          <span className={styles.sectionTitle}>Activities</span>
          <div className={styles.sectionPanel}>
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {activities.map((d: Record<string, any>, i: number) => (
              <ActivityItem
                key={i}
                activity={d}
                index={i}
                data={data}
                activitiesCount={activities.length}
                chains={chains}
                assets={assets}
                validators={validators}
              />
            ))}
          </div>
        </div>
        <div className={styles.sectionWrapper}>
          <span className={styles.sectionTitle}>Events</span>
          <div className={styles.sectionPanel}>
            {!Array.isArray(rawLogParsed)
              ? data.raw_log
              : /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
                (rawLogParsed as Record<string, any>[]).map(
                  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
                  (d: Record<string, any>, i: number) => (
                    <EventLogEntry key={i} entry={d} index={i} />
                  )
                )}
          </div>
        </div>
      </div>
    </div>
  );
}
