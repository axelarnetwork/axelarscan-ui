import _ from 'lodash';

import { toArray } from '@/lib/parser';
import {
  AssetData,
  ChainData,
  FilterAttribute,
  FilterParams,
  ITSAssetData,
} from '../Interchain.types';

export function getFilterAttributes(
  params: FilterParams,
  chains: ChainData[],
  assets: AssetData[],
  itsAssets: ITSAssetData[]
): FilterAttribute[] {
  return [
    {
      label: 'Transfers Type',
      name: 'transfersType',
      type: 'select',
      options: [
        { title: 'Any' },
        { value: 'gmp', title: 'General Message Passing' },
        { value: 'transfers', title: 'Token Transfers' },
      ],
    },
    {
      label: 'Source Chain',
      name: 'sourceChain',
      type: 'select',
      searchable: true,
      multiple: true,
      options: _.orderBy(
        (toArray(chains) as ChainData[]).map((d, i) => ({ ...d, i })),
        ['deprecated', 'name', 'i'],
        ['desc', 'asc', 'asc']
      ).map(d => ({
        value: d.id,
        title: `${d.name}${d.deprecated ? ` (deprecated)` : ''}`,
      })),
    },
    {
      label: 'Destination Chain',
      name: 'destinationChain',
      type: 'select',
      searchable: true,
      multiple: true,
      options: _.orderBy(
        (toArray(chains) as ChainData[]).map((d, i) => ({ ...d, i })),
        ['deprecated', 'name', 'i'],
        ['desc', 'asc', 'asc']
      ).map(d => ({
        value: d.id,
        title: `${d.name}${d.deprecated ? ` (deprecated)` : ''}`,
      })),
    },
    {
      label: 'From / To Chain',
      name: 'chain',
      type: 'select',
      searchable: true,
      multiple: true,
      options: _.orderBy(
        (toArray(chains) as ChainData[]).map((d, i) => ({ ...d, i })),
        ['deprecated', 'name', 'i'],
        ['desc', 'asc', 'asc']
      ).map(d => ({
        value: d.id,
        title: `${d.name}${d.deprecated ? ` (deprecated)` : ''}`,
      })),
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
              params.assetType !== 'its'
                ? (toArray(assets) as AssetData[]).map(d => ({
                    value: d.id,
                    title: `${d.symbol} (${d.id})`,
                  }))
                : [],
              params.assetType !== 'gateway'
                ? (toArray(itsAssets) as ITSAssetData[]).map(d => ({
                    value: d.symbol,
                    title: `${d.symbol} (ITS)`,
                  }))
                : []
            )
          ),
          'value'
        ),
        ['title'],
        ['asc']
      ),
    },
    ...(params.assetType === 'its'
      ? [
          {
            label: 'ITS Token Address',
            name: 'itsTokenAddress',
          } as FilterAttribute,
        ]
      : []),
    {
      label: 'Method',
      name: 'contractMethod',
      type: 'select',
      options: [
        { title: 'Any' },
        { value: 'callContract', title: 'CallContract' },
        { value: 'callContractWithToken', title: 'CallContractWithToken' },
        { value: 'InterchainTransfer', title: 'InterchainTransfer' },
        { value: 'SquidCoral', title: 'SquidCoral' },
      ],
    },
    { label: 'Contract', name: 'contractAddress' },
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
    { label: 'Time', name: 'time', type: 'datetimeRange' },
  ] as FilterAttribute[];
}
