'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import clsx from 'clsx';
import _ from 'lodash';
import { MdOutlineFilterList } from 'react-icons/md';

import { Button } from '@/components/Button';
import { FilterDialog } from '@/components/FilterSelect';
import type { FilterAttribute } from '@/components/FilterSelect';
import { useChains, useAssets, useITSAssets } from '@/hooks/useGlobalData';
import { toArray } from '@/lib/parser';
import {
  getParams,
  getQueryString,
  isFiltered,
} from '@/lib/operator';
import type { Chain } from '@/types';

import * as styles from './GMPs.styles';

const size = 25;

export function Filters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);
  const [params, setParams] = useState<Record<string, unknown>>(getParams(searchParams, size));
  const [searchInput, setSearchInput] = useState<Record<string, string>>({});
  const chains = useChains();
  const assets = useAssets();
  const itsAssets = useITSAssets();

  useEffect(() => {
    if (params) {
      setSearchInput({});
    }
  }, [params, setSearchInput]);

  const onSubmit = (e1?: unknown, e2?: unknown, _params?: Record<string, unknown>) => {
    if (!_params) {
      _params = params;
    }

    if (!_.isEqual(_params, getParams(searchParams, size))) {
      router.push(`${pathname}${getQueryString(_params)}`);
      setParams(_params);
    }

    setOpen(false);
  };

  const onClose = () => {
    setOpen(false);
    setParams(getParams(searchParams, size));
  };

  const chainOptions = _.orderBy(
    toArray(chains).map((d: Chain, i: number) => ({ ...d, i })),
    ['deprecated', 'name', 'i'],
    ['desc', 'asc', 'asc']
  ).map((d) => ({
    value: d.id,
    title: `${d.name}${d.deprecated ? ` (deprecated)` : ''}`,
  }));

  const attributes = toArray([
    { label: 'Tx Hash', name: 'txHash' },
    { label: 'Message ID', name: 'messageId' },
    {
      label: 'Source Chain',
      name: 'sourceChain',
      type: 'select',
      searchable: true,
      multiple: true,
      options: chainOptions,
    },
    {
      label: 'Destination Chain',
      name: 'destinationChain',
      type: 'select',
      searchable: true,
      multiple: true,
      options: chainOptions,
    },
    {
      label: 'From / To Chain',
      name: 'chain',
      type: 'select',
      searchable: true,
      multiple: true,
      options: chainOptions,
    },
    {
      label: 'Asset Type',
      name: 'assetType',
      type: 'select',
      options: [
        { title: 'Any' },
        { value: 'gateway', title: 'Gateway Token' },
        { value: 'its', title: 'ITS Token' },
      ],
    },
    {
      label: 'Asset',
      name: 'asset',
      type: 'select',
      multiple: true,
      options: _.orderBy(
        _.uniqBy(
          toArray(
            _.concat(
              (params.assetType !== 'its' &&
                toArray(assets).map((d) => ({
                  value: (d as { id: string }).id,
                  title: `${(d as { symbol?: string }).symbol} (${(d as { id: string }).id})`,
                }))) || [],
              (params.assetType !== 'gateway' &&
                toArray(itsAssets).map((d) => ({
                  value: (d as { symbol: string }).symbol,
                  title: `${(d as { symbol: string }).symbol} (ITS)`,
                }))) || []
            )
          ),
          'value'
        ),
        ['title'],
        ['asc']
      ),
    },
    params.assetType === 'its' && {
      label: 'ITS Token Address',
      name: 'itsTokenAddress',
    },
    {
      label: 'Method',
      name: 'contractMethod',
      type: 'select',
      options: [
        { title: 'Any' },
        { value: 'callContract', title: 'CallContract' },
        { value: 'callContractWithToken', title: 'CallContractWithToken' },
        { value: 'InterchainTransfer', title: 'InterchainTransfer' },
        {
          value: 'InterchainTokenDeployment',
          title: 'InterchainTokenDeployment',
        },
        { value: 'TokenManagerDeployment', title: 'TokenManagerDeployment' },
        { value: 'LinkToken', title: 'LinkToken' },
        { value: 'TokenMetadataRegistered', title: 'TokenMetadataRegistered' },
        { value: 'SquidCoral', title: 'SquidCoral' },
        {
          value: 'SquidCoralSettlementForwarded',
          title: 'SquidCoralSettlementForwarded',
        },
        {
          value: 'SquidCoralSettlementFilled',
          title: 'SquidCoralSettlementFilled',
        },
      ],
    },
    (params.contractMethod as string | undefined)?.startsWith('SquidCoral') && {
      label: 'Squid Coral OrderHash',
      name: 'squidCoralOrderHash',
    },
    {
      label: 'Status',
      name: 'status',
      type: 'select',
      options: [
        { title: 'Any' },
        { value: 'called', title: 'Called' },
        { value: 'confirming', title: 'Wait for Confirmation' },
        { value: 'express_executed', title: 'Express Executed' },
        { value: 'approving', title: 'Wait for Approval' },
        { value: 'approved', title: 'Approved' },
        { value: 'executing', title: 'Executing' },
        { value: 'executed', title: 'Executed' },
        { value: 'error', title: 'Error Execution' },
        { value: 'insufficient_fee', title: 'Insufficient Fee' },
        { value: 'not_enough_gas_to_execute', title: 'Not Enough Gas' },
      ],
    },
    { label: 'Sender', name: 'senderAddress' },
    { label: 'Source Address', name: 'sourceAddress' },
    { label: 'Destination Contract', name: 'destinationContractAddress' },
    { label: 'Command ID', name: 'commandId' },
    { label: 'Time', name: 'time', type: 'datetimeRange' },
    {
      label: 'Sort By',
      name: 'sortBy',
      type: 'select',
      options: [
        { title: 'ContractCall Time' },
        { value: 'value', title: 'Token Value' },
      ],
    },
    { label: 'Proposal ID', name: 'proposalId' },
  ]);

  const filtered = isFiltered(params);

  return (
    <>
      <Button
        color="default"
        circle="true"
        onClick={() => setOpen(true)}
        className={clsx(filtered && styles.filterButtonActive)}
      >
        <MdOutlineFilterList
          size={20}
          className={clsx(filtered && styles.filterIconActive)}
        />
      </Button>
      <FilterDialog
        open={open}
        onClose={onClose}
        onSubmit={() => onSubmit()}
        onReset={() => onSubmit(undefined, undefined, {})}
        filtered={filtered}
        attributes={attributes as FilterAttribute[]}
        params={params}
        setParams={setParams}
        searchInput={searchInput}
        setSearchInput={setSearchInput}
      />
    </>
  );
}
