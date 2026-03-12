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
import { getRPCStatus, getChainMaintainers } from '@/lib/api/validator';
import { ENVIRONMENT } from '@/lib/config';
import { toArray } from '@/lib/parser';
import { equalsIgnoreCase, find, includesSomePatterns } from '@/lib/string';
import type {
  Chain,
  Validator as ValidatorType,
  Delegation,
  UptimeBlock,
  ProposedBlock,
  EVMVote,
} from '@/types';

import type { ValidatorProps } from './Validator.types';
import { Info } from './Info.component';
import { Uptimes } from './Uptimes.component';
import { ProposedBlocks } from './ProposedBlocks.component';
import { Votes } from './Votes.component';
import {
  fetchDelegations,
  fetchUptimes,
  fetchProposedBlocks,
  fetchVotes,
} from './Validator.utils';
import * as styles from './Validator.styles';

export function Validator({
  address,
  initialBalances,
  initialRPCStatus,
}: ValidatorProps) {
  const router = useRouter();
  const [EVMChains, setEVMChains] = useState<Chain[] | null>(null);
  const [data, setData] = useState<ValidatorType | null>(null);
  const [delegations, setDelegations] = useState<Delegation[] | null>(null);
  const [uptimes, setUptimes] = useState<UptimeBlock[] | null>(null);
  const [proposedBlocks, setProposedBlocks] = useState<ProposedBlock[] | null>(
    null
  );
  const [votes, setVotes] = useState<EVMVote[] | null>(null);
  const chains = useChains();
  const validators = useValidators();
  const { maintainers, setMaintainers } = useValidatorStore();

  // redirect or get evm chains
  useEffect(() => {
    if (!address || !validators) return;

    if (
      ['axelarvalcons', 'axelar1'].findIndex(p => address.startsWith(p)) > -1
    ) {
      const { operator_address } = {
        ...validators.find((d: ValidatorType) =>
          includesSomePatterns(
            [
              d.consensus_address,
              d.delegator_address,
              d.broadcaster_address,
            ].filter((s): s is string => !!s),
            address
          )
        ),
      };

      if (operator_address) {
        router.push(`/validator/${operator_address}`);
      }
      return;
    }

    if (address.startsWith('axelarvaloper') && chains) {
      setEVMChains(
        chains.filter(
          (d: Chain) => d.chain_type === 'evm' && d.gateway?.address
        )
      );
    }
  }, [address, router, setEVMChains, chains, validators]);

  // getChainMaintainers
  useEffect(() => {
    const getData = async () => {
      if (!EVMChains) return;

      setMaintainers(
        Object.fromEntries(
          await Promise.all(
            EVMChains.filter((d: Chain) => !maintainers?.[d.id]).map(
              (d: Chain) =>
                new Promise<[string, string[]]>(async resolve => {
                  const { maintainers } = {
                    ...((await getChainMaintainers({ chain: d.id })) as Record<
                      string,
                      unknown
                    >),
                  };
                  resolve([d.id, toArray(maintainers) as string[]]);
                })
            )
          )
        )
      );
    };

    getData();
  }, [EVMChains, setMaintainers]);

  // set validator data
  useEffect(() => {
    const getData = async () => {
      if (
        !address?.startsWith('axelarvaloper') ||
        !EVMChains ||
        !validators ||
        Object.keys({ ...maintainers }).length !== EVMChains.length
      ) {
        return;
      }

      const _data = validators.find((d: ValidatorType) =>
        equalsIgnoreCase(d.operator_address, address)
      );

      if (!_data) {
        if (!data) {
          setData({
            operator_address: '',
            status: 'errorOnGetData',
            code: 404,
            message: `Validator: ${address} not found`,
          });
        }
        return;
      }

      // broadcaster balance
      if (_data.broadcaster_address) {
        const balancesResponse =
          initialBalances ??
          (await getBalances({
            address: _data.broadcaster_address,
          }));
        const { data: balanceData } = {
          ...(balancesResponse as Record<string, unknown>),
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
    };

    getData();
  }, [address, EVMChains, data, setData, validators, maintainers]);

  // set validator metrics
  useEffect(() => {
    const getData = async () => {
      if (!address || !data || data.status === 'error') return;

      const { consensus_address, broadcaster_address } = { ...data };
      const rpcResponse = initialRPCStatus ?? (await getRPCStatus());
      const { latest_block_height } = {
        ...(rpcResponse as Record<string, unknown>),
      } as { latest_block_height?: number };

      if (!latest_block_height) return;

      const [delegationsResult, uptimesResult, proposedResult, votesResult] =
        await Promise.all([
          fetchDelegations(address).catch(() => null),
          fetchUptimes(latest_block_height, consensus_address).catch(() => []),
          fetchProposedBlocks(latest_block_height, consensus_address).catch(
            () => []
          ),
          fetchVotes(latest_block_height, broadcaster_address).catch(() => []),
        ]);

      setDelegations(delegationsResult);
      setUptimes(uptimesResult as UptimeBlock[]);
      setProposedBlocks(proposedResult as ProposedBlock[]);
      setVotes(votesResult as EVMVote[]);
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
        <Response
          data={{
            code: data.code as number | string,
            message: data.message as string,
          }}
        />
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
