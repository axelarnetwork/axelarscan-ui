'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import clsx from 'clsx';
import _ from 'lodash';

import { Container } from '@/components/Container';
import { Spinner } from '@/components/Spinner';
import { Transactions } from '@/components/Transactions';
import { useChains, useAssets, useValidators } from '@/hooks/useGlobalData';
import { getAccountAmounts } from '@/lib/api/axelarscan';
import {
  searchTransfers,
  searchDepositAddresses,
} from '@/lib/api/token-transfer';
import {
  axelarContracts,
  getAxelarContractAddresses,
  getAssetData,
} from '@/lib/config';
import { getInputType } from '@/lib/parser';
import { includesSomePatterns, find } from '@/lib/string';
import type {
  AccountProps,
  AccountData,
  BalanceEntry,
  DepositAddressData,
  TransferData,
} from './Account.types';
import { isDepositAddressCandidate } from './Account.utils';
import { DepositAddress } from './DepositAddress.component';
import { Info } from './Info.component';
import { Balances } from './Balances.component';
import { Delegations } from './Delegations.component';
import * as styles from './Account.styles';

export function Account({ address }: AccountProps) {
  const router = useRouter();
  const [data, setData] = useState<AccountData | null>(null);
  const chains = useChains();
  const assets = useAssets();
  const validators = useValidators();

  useEffect(() => {
    const getData = async () => {
      if (!address) return;

      if (
        includesSomePatterns(address, ['axelarvaloper', 'axelarvalcons']) &&
        validators
      ) {
        const match = validators.find(d =>
          includesSomePatterns(address, [
            d.operator_address,
            d.consensus_address ?? '',
          ])
        );
        if (match) {
          router.push(`/validator/${match.operator_address}`);
          return;
        }
      }

      if (!chains || !assets) return;

      const isEVMAddress = getInputType(address, chains) === 'evmAddress';
      const accountData = (
        isEVMAddress ? {} : await getAccountAmounts({ address })
      ) as AccountData;
      if (!accountData) return;

      if (accountData.balances?.data) {
        accountData.balances.data = _.orderBy(
          accountData.balances.data.map((d: BalanceEntry) => ({
            ...d,
            value: d.amount * (getAssetData(d.denom, assets)?.price || 0),
          })),
          ['value'],
          ['desc']
        );
      }

      if (isDepositAddressCandidate(address, chains)) {
        const depositAddressData = (
          (await searchDepositAddresses({ address })) as
            | { data?: DepositAddressData[] }
            | undefined
        )?.data?.[0];

        if (depositAddressData) {
          accountData.depositAddressData = depositAddressData;
          const transferData = (
            (await searchTransfers({ depositAddress: address })) as
              | { data?: TransferData[] }
              | undefined
          )?.data?.[0];
          if (transferData) {
            accountData.transferData = transferData;
          }
        }
      }

      console.log('[data]', accountData);
      setData(accountData);
    };

    getData();
  }, [address, router, setData, chains, assets, validators]);

  if (!address) return null;

  if (!data) {
    return (
      <Container className="sm:mt-8">
        <Spinner />
      </Container>
    );
  }

  const isDepositAddress =
    isDepositAddressCandidate(address, chains) || !!data.depositAddressData;
  const isAxelarAddress = address.startsWith('axelar1');
  const isShortAxelarAddress = isAxelarAddress && address.length < 65;
  const isAxelarContract = !!find(
    address,
    _.concat(axelarContracts, getAxelarContractAddresses(chains))
  );
  const showInfo = isAxelarAddress && !isDepositAddress && isShortAxelarAddress;
  const showBalances =
    isAxelarAddress &&
    (isDepositAddress || isAxelarContract || isShortAxelarAddress);
  const showDelegations =
    isAxelarAddress && !isDepositAddress && isShortAxelarAddress;

  return (
    <Container className={clsx('sm:mt-8', 'max-w-full')}>
      <div className={styles.mainGrid}>
        {isDepositAddress && <DepositAddress data={data} address={address} />}
        {showInfo && <Info data={data} address={address} />}
        {showBalances && <Balances data={data.balances?.data} />}
        {showDelegations && <Delegations data={data} />}
        <div className={styles.transactionsCol}>
          <Transactions address={address} />
        </div>
      </div>
    </Container>
  );
}
