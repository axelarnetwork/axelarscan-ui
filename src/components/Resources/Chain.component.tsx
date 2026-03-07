'use client';

import clsx from 'clsx';
import { LuFileSearch2 } from 'react-icons/lu';
import { GoDotFill } from 'react-icons/go';

import { Image } from '@/components/Image';
import { Tooltip } from '@/components/Tooltip';
import { Tag } from '@/components/Tag';
import { AddMetamask } from '@/components/Metamask';
import { ValueBox } from '@/components/ValueBox';
import { useContracts } from '@/hooks/useGlobalData';
import { toArray } from '@/lib/parser';
import type { ChainProps } from './Resources.types';
import * as styles from './Resources.styles';

interface ContractsData {
  gateway_contracts?: Record<string, { address?: string; [key: string]: unknown }>;
  gas_service_contracts?: Record<string, { address?: string; [key: string]: unknown }>;
  interchain_token_service_contract?: {
    addresses?: string[];
    [key: string]: string | string[] | undefined;
  };
  [key: string]: unknown;
}

export function Chain({ data }: ChainProps) {
  const contracts = useContracts();

  const {
    gateway_contracts,
    gas_service_contracts,
    interchain_token_service_contract,
  } = { ...(contracts as ContractsData | null) };

  const {
    id,
    chain_id,
    chain_name,
    deprecated,
    endpoints,
    name,
    image,
    explorer,
    prefix_address,
    chain_type,
  } = { ...data };
  const { rpc, lcd } = { ...endpoints };
  const { url, address_path } = { ...explorer };

  const gatewayAddress =
    data?.gateway?.address || gateway_contracts?.[id]?.address;
  const gasServiceAddress = gas_service_contracts?.[id]?.address;
  const itsAddress: string | undefined =
    chain_type === 'evm'
      ? (id && interchain_token_service_contract && id in interchain_token_service_contract
          ? String(interchain_token_service_contract[id] ?? '')
          : interchain_token_service_contract?.addresses?.[0]) || undefined
      : undefined;

  const multisigProverAddress = data?.multisig_prover?.address;
  const votingVerifierAddress = data?.voting_verifier?.address;
  const routerAddress = data?.router?.address;
  const serviceRegistryAddress = data?.service_registry?.address;
  const rewardsAddress = data?.rewards?.address;
  const multisigAddress = data?.multisig?.address;

  return (
    <li>
      <div className={styles.cardWrapper}>
        <div className={styles.cardHeader}>
          <div className={styles.cardImageWrapper}>
            <Image
              src={image}
              alt=""
              width={56}
              height={56}
              className={styles.cardImage}
            />
          </div>
          <div className={styles.chainActionsColumn}>
            <div className={styles.chainActionsRow}>
              {chain_type === 'evm' && <AddMetamask chain={id} />}
              {url && (
                <Tooltip content="Explorer">
                  <a
                    href={url}
                    target="_blank"
                    className={styles.explorerLink}
                  >
                    <LuFileSearch2 size={24} />
                  </a>
                </Tooltip>
              )}
              <Tooltip content={deprecated ? 'Deactivated' : 'Active'}>
                <GoDotFill
                  size={18}
                  className={clsx(
                    deprecated ? styles.statusDotDeprecated : styles.statusDotActive
                  )}
                />
              </Tooltip>
            </div>
            {chain_type && (
              <Tag className={styles.chainTypeTag}>
                {chain_type === 'vm' ? 'amplifier' : chain_type}
              </Tag>
            )}
          </div>
        </div>
        <div className={styles.chainNameRow}>
          <span className={styles.chainName}>{name}</span>
          {chain_id && (
            <span className={styles.chainId}>
              ID: {chain_id}
            </span>
          )}
        </div>
        <div className={styles.valueBoxList}>
          {chain_name && <ValueBox title="Chain Name" value={chain_name} />}
          {gatewayAddress && (
            <ValueBox
              title="Gateway Address"
              value={gatewayAddress}
              url={
                url &&
                `${url}${address_path?.replace('{address}', gatewayAddress)}`
              }
            />
          )}
          {gasServiceAddress && (
            <ValueBox
              title="Gas Service Address"
              value={gasServiceAddress}
              url={
                url &&
                `${url}${address_path?.replace('{address}', gasServiceAddress)}`
              }
            />
          )}
          {itsAddress && (
            <ValueBox
              title="ITS Address"
              value={itsAddress}
              url={
                url && `${url}${address_path?.replace('{address}', itsAddress)}`
              }
            />
          )}
          {multisigProverAddress && (
            <ValueBox
              title="Multisig Prover Address"
              value={multisigProverAddress}
              url={`/account/${multisigProverAddress}`}
            />
          )}
          {votingVerifierAddress && (
            <ValueBox
              title="Voting Verifier Address"
              value={votingVerifierAddress}
              url={`/account/${votingVerifierAddress}`}
            />
          )}
          {routerAddress && (
            <ValueBox
              title="Router Address"
              value={routerAddress}
              url={`/account/${routerAddress}`}
            />
          )}
          {serviceRegistryAddress && (
            <ValueBox
              title="Service Registry Address"
              value={serviceRegistryAddress}
              url={`/account/${serviceRegistryAddress}`}
            />
          )}
          {rewardsAddress && (
            <ValueBox
              title="Rewards Address"
              value={rewardsAddress}
              url={`/account/${rewardsAddress}`}
            />
          )}
          {multisigAddress && (
            <ValueBox
              title="Multisig Address"
              value={multisigAddress}
              url={`/account/${multisigAddress}`}
            />
          )}
          {toArray(rpc).length > 0 && (
            <ValueBox
              title="RPC Endpoint"
              value={toArray(rpc)[0]}
              url={toArray(rpc)[0]}
              noEllipse={true}
            />
          )}
          {toArray(lcd).length > 0 && (
            <ValueBox
              title="LCD Endpoint"
              value={toArray(lcd)[0]}
              url={toArray(lcd)[0]}
              noEllipse={true}
            />
          )}
          {prefix_address && (
            <ValueBox title="Address Prefix" value={prefix_address} />
          )}
        </div>
      </div>
    </li>
  );
}
