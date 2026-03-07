'use client';

import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Fragment, useEffect, useState } from 'react';
import { Listbox, Transition } from '@headlessui/react';
import clsx from 'clsx';
import _ from 'lodash';
import { MdCheck } from 'react-icons/md';
import { LuFileSearch2, LuChevronsUpDown } from 'react-icons/lu';
import { GoDotFill } from 'react-icons/go';

import { Container } from '@/components/Container';
import { Image } from '@/components/Image';
import { Tooltip } from '@/components/Tooltip';
import { Tag } from '@/components/Tag';
import { AddMetamask } from '@/components/Metamask';
import { ValueBox } from '@/components/ValueBox';
import { useChains, useAssets, useITSAssets, useContracts } from '@/hooks/useGlobalData';
import { getChainData } from '@/lib/config';
import { getIBCDenomBase64, split, toArray } from '@/lib/parser';
import { getParams, getQueryString } from '@/lib/operator';
import { equalsIgnoreCase, includesSomePatterns, ellipse } from '@/lib/string';
import type { Chain } from '@/types';
import * as styles from './Resources.styles';

interface SelectOption {
  value?: string;
  title: string;
}

interface FilterAttribute {
  label: string;
  name: string;
  type?: string;
  multiple?: boolean;
  options?: SelectOption[];
}

const CHAIN_TYPES = [
  { label: 'All', value: undefined },
  { label: 'EVM', value: 'evm' },
  { label: 'Cosmos', value: 'cosmos' },
  { label: 'Amplifier', value: 'vm' },
];

const ASSET_TYPES = [
  { label: 'All', value: undefined },
  { label: 'Gateway', value: 'gateway' },
  { label: 'ITS', value: 'its' },
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function Chain({ data }: { data: Record<string, any> }) {
  const contracts = useContracts();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const {
    gateway_contracts,
    gas_service_contracts,
    interchain_token_service_contract,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } = { ...(contracts as any) };

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
  const itsAddress =
    chain_type === 'evm' &&
    (id in { ...interchain_token_service_contract }
      ? interchain_token_service_contract[id]
      : interchain_token_service_contract?.addresses?.[0]);

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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function Asset({ data, focusID, onFocus }: { data: Record<string, any>; focusID: string | null; onFocus: (id: string) => void }) {
  const NUM_CHAINS_TRUNCATE = 6;

  const [seeMore, setSeeMore] = useState(false);
  const [chainSelected, setChainSelected] = useState<string | null>(null);
  const chains = useChains();

  // asset
  const { type, denom, native_chain, symbol } = { ...data };
  let { addresses } = { ...data };
  const asset = type === 'its' ? data.id : denom;

  addresses = _.uniqBy(
    toArray(
      _.concat(
        {
          chain: native_chain,
          ...(type === 'its'
            ? data.chains?.[native_chain]
            : addresses?.[native_chain]),
        },
        Object.entries({ ...(type === 'its' ? data.chains : addresses) }).map(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ([k, v]: [string, any]) => ({ chain: k, ...v })
        )
      )
    ),
    'chain'
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ).map((d: any) => ({ ...d, address: d.address || d.tokenAddress }));

  // chain
  const {
    id: chain,
    explorer,
    chain_type,
  } = { ...(focusID === asset && getChainData(chainSelected, chains)) };
  const { url, contract_path, asset_path } = { ...explorer };

  // asset data of focused chain
  const {
    address,
    ibc_denom,
    symbol: tokenSymbol,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } = { ...addresses.find((d: any) => d.chain === chain) };

  useEffect(() => {
    if (focusID !== asset) {
      setSeeMore(false);
    }
  }, [data, focusID, asset, type, denom]);

  return (
    <li>
      <div className={styles.cardWrapper}>
        <div className={styles.cardHeader}>
          <div className={styles.cardImageWrapper}>
            <Image
              src={data.image}
              alt=""
              width={56}
              height={56}
              className={styles.cardImage}
            />
          </div>
          <div className={styles.assetActionsColumn}>
            {symbol && (
              <Tooltip content="Symbol" className={styles.symbolTooltip}>
                <Tag>{symbol}</Tag>
              </Tooltip>
            )}
            <div className={styles.denomsWrapper}>
              {toArray(_.concat(denom, _.head(data.denoms))).map((d: string | undefined) => (
                <Tooltip key={d} content="Denom" className={styles.symbolTooltip}>
                  <Tag className={styles.denomTag}>
                    {ellipse(d)}
                  </Tag>
                </Tooltip>
              ))}
            </div>
          </div>
        </div>
        <div className={styles.assetNameRow}>
          <span className={styles.assetName}>{data.name}</span>
          {data.decimals > 0 && (
            <span className={styles.assetDecimals}>
              Decimals: {data.decimals}
            </span>
          )}
        </div>
        <div className={styles.assetBodyWrapper}>
          <div className={styles.tokensSection}>
            <span className={styles.tokensLabel}>
              {type === 'its' ? 'Interchain' : 'Gateway'} Tokens
            </span>
            <div className={styles.tokensIconRow}>
              {_.slice(
                addresses,
                0,
                focusID === asset && seeMore
                  ? addresses.length
                  : NUM_CHAINS_TRUNCATE
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              ).map(({ chain: chainId }: any, i: number) => {
                const { name, image } = { ...getChainData(chainId, chains) };

                return (
                  <div key={i} className={styles.chainIconWrapper}>
                    <Tooltip
                      content={`${name}${chainId === native_chain ? ' (Native Chain)' : ''}`}
                      className={styles.chainIconTooltip}
                    >
                      <button
                        onClick={() => {
                          setChainSelected(
                            chainId === chainSelected ? null : chainId
                          );

                          if (onFocus) {
                            onFocus(asset);
                          }
                        }}
                      >
                        <Image
                          src={image}
                          alt=""
                          width={24}
                          height={24}
                          className={clsx(
                            'rounded-full',
                            focusID === asset && chainId === chainSelected
                              ? styles.chainIconSelected
                              : chainId === native_chain
                                ? styles.chainIconNative
                                : ''
                          )}
                        />
                      </button>
                    </Tooltip>
                  </div>
                );
              })}
              {addresses.length > NUM_CHAINS_TRUNCATE && (
                <button
                  onClick={() => {
                    setSeeMore(!seeMore);

                    if (onFocus) {
                      onFocus(asset);
                    }
                  }}
                  className={styles.seeMoreButton}
                >
                  {seeMore
                    ? 'See Less'
                    : `+${addresses.length - NUM_CHAINS_TRUNCATE} More`}
                </button>
              )}
            </div>
          </div>
          {chain && (
            <div className={styles.focusedChainSection}>
              <div className={styles.focusedChainHeader}>
                <Tag className={styles.focusedChainTag}>{chain}</Tag>
                {chain_type === 'evm' && (
                  <AddMetamask chain={chain} asset={asset} type={type} />
                )}
              </div>
              {address && (
                <ValueBox
                  title="Token Contract"
                  value={address}
                  url={
                    url &&
                    `${url}${contract_path?.replace('{address}', address)}`
                  }
                />
              )}
              {ibc_denom && (
                <ValueBox
                  title="IBC Denom"
                  value={ibc_denom}
                  url={
                    url &&
                    `${url}${asset_path?.replace('{ibc_denom}', getIBCDenomBase64(ibc_denom))}`
                  }
                  prefix="ibc/"
                />
              )}
              {(tokenSymbol || symbol) && (
                <ValueBox
                  title="Symbol"
                  value={tokenSymbol || symbol}
                  url={
                    url &&
                    (address
                      ? `${url}${contract_path?.replace('{address}', address)}`
                      : ibc_denom
                        ? `${url}${asset_path?.replace('{ibc_denom}', getIBCDenomBase64(ibc_denom))}`
                        : undefined)
                  }
                />
              )}
            </div>
          )}
        </div>
      </div>
    </li>
  );
}

const RESOURCES = ['chains', 'assets'];

export function Resources({ resource = undefined }: { resource?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [rendered, setRendered] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [params, setParams] = useState<Record<string, string>>(getParams(searchParams) as any);
  const [input, setInput] = useState('');
  const [assetFocusID, setAssetFocusID] = useState<string | null>(null);
  const chains = useChains();
  const assets = useAssets();
  const itsAssets = useITSAssets();

  useEffect(() => {
    switch (pathname) {
      case '/resources':
        router.push(`/resources/${RESOURCES[0]}`);
        break;
      case '/assets':
        router.push('/resources/assets');
        break;
      default:
        if (!rendered) {
          setRendered(true);
        } else if (resource) {
          router.push(
            `/resources/${resource}${getQueryString(getParams(searchParams))}`
          );

          setInput('');

          if (resource !== 'assets') {
            setAssetFocusID(null);
          }
        }
        break;
    }
  }, [
    resource,
    router,
    pathname,
    searchParams,
    rendered,
    setRendered,
    setInput,
    setAssetFocusID,
  ]);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const _params = getParams(searchParams) as any;

    if (!_.isEqual(_params, params)) {
      setParams(_params);
    }
  }, [searchParams, params, setParams]);

  const attributes = toArray([
    params.type === 'its' && {
      label: 'Chain',
      name: 'chain',
      type: 'select',
      options: _.concat(
        { title: 'Any', value: '' } as SelectOption,
        _.orderBy(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (toArray(chains) as any[]).filter(
            (d: Chain) =>
              !d.deprecated && (params.type !== 'its' || d.chain_type === 'evm')
          ),
          ['name'],
          ['asc']
        ).map((d: Chain) => ({
          value: d.id,
          title: `${d.name}${d.deprecated ? ` (deprecated)` : ''}`,
        }))
      ),
    },
  ]);

  const filter = (resourceType: string, filterParams: Record<string, string>) => {
    const { type, chain } = { ...filterParams };

    const words = split(input, { delimiter: ' ', toCase: 'lower' });

    switch (resourceType) {
      case 'chains':
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return (toArray(chains) as any[])
          .filter(
            (d: Chain) =>
              (!type || d.chain_type === type) &&
              (!chain || equalsIgnoreCase(d.id, chain)) &&
              (!d.no_inflation || d.deprecated)
          )
          .filter(
            (d: Chain) =>
              !input ||
              includesSomePatterns(
                _.uniq(
                  toArray(
                    ['id', 'chain_id', 'chain_name', 'name'].map((f: string) =>
                      d[f]?.toString()
                    ),
                    { toCase: 'lower' }
                  ) as string[]
                ),
                words
              )
          );
      case 'assets':
        return _.concat(
          toArray((!type || type === 'gateway') ? assets : null)
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .filter((d: any) => !chain || d.addresses?.[chain])
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .filter(
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              (d: any) =>
                !input ||
                includesSomePatterns(
                  _.uniq(
                    toArray(
                      _.concat(
                        ['denom', 'name', 'symbol'].map((f: string) => d[f]),
                        d.denoms,
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        Object.values({ ...d.addresses }).flatMap((a: any) =>
                          toArray([
                            !equalsIgnoreCase(input, 'axl') && a.symbol,
                            a.address,
                            a.ibc_denom,
                          ])
                        )
                      ),
                      { toCase: 'lower' }
                    )
                  ),
                  words
                )
            ),
          toArray((!type || type === 'its') ? itsAssets : null)
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .filter((d: any) => !chain || d.chains?.[chain])
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .filter(
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              (d: any) =>
                !input ||
                includesSomePatterns(
                  _.uniq(
                    toArray(
                      _.concat(
                        ['name', 'symbol'].map((f: string) => d[f]),
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        Object.values({ ...d.chains }).flatMap((a: any) =>
                          toArray([
                            !equalsIgnoreCase(input, 'axl') && a.symbol,
                            a.tokenAddress,
                          ])
                        )
                      ),
                      { toCase: 'lower' }
                    )
                  ),
                  words
                )
            )
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .map((d: any) => ({ ...d, type: 'its' }))
        );
      default:
        return [];
    }
  };

  const render = (resourceType: string) => {
    switch (resourceType) {
      case 'chains':
        return (
          <ul
            role="list"
            className={styles.resourceGrid}
          >
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {filter(resourceType, params).map((d: any, i: number) => (
              <Chain key={i} data={d} />
            ))}
          </ul>
        );
      case 'assets':
        return (
          <ul
            role="list"
            className={styles.resourceGrid}
          >
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {filter(resourceType, params).map((d: any, i: number) => (
              <Asset
                key={i}
                data={d}
                focusID={assetFocusID}
                onFocus={(id: string) => setAssetFocusID(id)}
              />
            ))}
          </ul>
        );
      default:
        return <div />;
    }
  };

  return (
    resource && (
      <Container className={styles.containerWrapper}>
        <div className={styles.topBar}>
          <nav className={styles.navRow}>
            {RESOURCES.map((d, i) => (
              <Link
                key={i}
                href={`/resources/${d}`}
                className={clsx(
                  styles.navLinkBase,
                  d === resource
                    ? styles.navLinkActive
                    : styles.navLinkInactive
                )}
              >
                {d}
                {d === resource &&
                ((resource === 'chains' && chains) ||
                  (resource === 'assets' && assets))
                  ? ` (${filter(resource, params).length})`
                  : ''}
              </Link>
            ))}
          </nav>
          <div className={styles.filterColumn}>
            <input
              placeholder={`Search by ${resource === 'assets' ? 'Denom / Symbol / Address' : 'Chain Name / ID'}`}
              value={input}
              onChange={e =>
                setInput(
                  split(e.target.value, {
                    delimiter: ' ',
                    filterBlank: false,
                  }).join(' ')
                )
              }
              className={styles.searchInput}
            />
            <div className={styles.typeFiltersRow}>
              {(resource === 'assets' ? ASSET_TYPES : CHAIN_TYPES).map(
                (d, i) => (
                  <Link
                    key={i}
                    href={`${pathname}${getQueryString({ ...params, type: d.value })}`}
                    className={clsx(
                      styles.typeLinkBase,
                      d.value === params.type
                        ? styles.typeLinkActive
                        : styles.typeLinkInactive
                    )}
                  >
                    <span>{d.label}</span>
                  </Link>
                )
              )}
            </div>
            {attributes.length > 0 && (
              <div className={styles.attributesWrapper}>
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {(attributes as any[]).map((d: FilterAttribute, i: number) => (
                  <div key={i} className={styles.attributeRow}>
                    <label
                      htmlFor={d.name}
                      className={styles.attributeLabel}
                    >
                      {d.label}
                    </label>
                    <div className={styles.attributeFieldWrapper}>
                      {d.type === 'select' ? (
                        <Listbox
                          value={
                            d.multiple ? split(params[d.name]) : params[d.name]
                          }
                          // eslint-disable-next-line @typescript-eslint/no-explicit-any
                          onChange={(v: any) => {
                            router.push(
                              `/resources/${resource}${getQueryString({ ...params, [d.name]: d.multiple ? (v as string[]).join(',') : v })}`
                            );
                          }}
                          // eslint-disable-next-line @typescript-eslint/no-explicit-any
                          multiple={d.multiple as any}
                        >
                          {({ open }) => {
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            const isSelected = (v: any) =>
                              d.multiple
                                ? split(params[d.name]).includes(v)
                                : v === params[d.name] ||
                                  equalsIgnoreCase(v, params[d.name]);
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            const selectedValue: any = d.multiple
                              // eslint-disable-next-line @typescript-eslint/no-explicit-any
                              ? (toArray(d.options) as any[]).filter((o: SelectOption) =>
                                  isSelected(o.value)
                                )
                              // eslint-disable-next-line @typescript-eslint/no-explicit-any
                              : (toArray(d.options) as any[]).find((o: SelectOption) =>
                                  isSelected(o.value)
                                );

                            return (
                              <div className={styles.selectRelative}>
                                <Listbox.Button className={styles.selectButton}>
                                  {d.multiple ? (
                                    <div
                                      className={clsx(
                                        styles.selectMultiWrap,
                                        selectedValue.length !== 0 && styles.selectMultiWrapSelected
                                      )}
                                    >
                                      {selectedValue.length === 0 ? (
                                        <span className={styles.selectTruncate}>
                                          Any
                                        </span>
                                      ) : (
                                        selectedValue.map((v: SelectOption, j: number) => (
                                          <div
                                            key={j}
                                            onClick={() => {
                                              router.push(
                                                `/resources/${resource}${getQueryString(
                                                  {
                                                    ...params,
                                                    [d.name]: selectedValue
                                                      .filter(
                                                        (s: SelectOption) => s.value !== v.value
                                                      )
                                                      .map((s: SelectOption) => s.value)
                                                      .join(','),
                                                  }
                                                )}`
                                              );
                                            }}
                                            className={styles.selectTag}
                                          >
                                            {v.title}
                                          </div>
                                        ))
                                      )}
                                    </div>
                                  ) : (
                                    <span className={styles.selectTruncate}>
                                      {selectedValue?.title}
                                    </span>
                                  )}
                                  <span className={styles.selectIconWrapper}>
                                    <LuChevronsUpDown
                                      size={20}
                                      className={styles.selectChevronIcon}
                                    />
                                  </span>
                                </Listbox.Button>
                                <Transition
                                  show={open}
                                  as={Fragment}
                                  leave="transition ease-in duration-100"
                                  leaveFrom="opacity-100"
                                  leaveTo="opacity-0"
                                >
                                  <Listbox.Options className={styles.selectOptions}>
                                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                    {(toArray(d.options) as any[]).map((o: SelectOption, j: number) => (
                                      <Listbox.Option
                                        key={j}
                                        value={o.value}
                                        className={({ active }) =>
                                          clsx(
                                            styles.selectOptionBase,
                                            active
                                              ? styles.selectOptionActive
                                              : styles.selectOptionInactive
                                          )
                                        }
                                      >
                                        {({ selected, active }) => (
                                          <>
                                            <span
                                              className={clsx(
                                                styles.selectTruncate,
                                                selected
                                                  ? styles.selectOptionTextSelected
                                                  : styles.selectOptionTextNormal
                                              )}
                                            >
                                              {o.title}
                                            </span>
                                            {selected && (
                                              <span
                                                className={clsx(
                                                  styles.selectCheckWrapper,
                                                  active
                                                    ? styles.selectCheckActive
                                                    : styles.selectCheckInactive
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
                      ) : (
                        <input
                          type={d.type || 'text'}
                          name={d.name}
                          placeholder={d.label}
                          value={params[d.name]}
                          onChange={e => {
                            router.push(
                              `/resources/${getQueryString({ ...params, [d.name]: e.target.value })}`
                            );
                          }}
                          className={styles.filterInput}
                        />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        {render(resource)}
      </Container>
    )
  );
}
