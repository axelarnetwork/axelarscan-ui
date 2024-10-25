'use client'

import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Fragment, useEffect, useState } from 'react'
import { Listbox, Transition } from '@headlessui/react'
import clsx from 'clsx'
import _ from 'lodash'
import { MdCheck } from 'react-icons/md'
import { LuFileSearch2, LuChevronsUpDown } from 'react-icons/lu'
import { GoDotFill } from 'react-icons/go'

import { Container } from '@/components/Container'
import { Image } from '@/components/Image'
import { Tooltip } from '@/components/Tooltip'
import { Tag } from '@/components/Tag'
import { AddMetamask } from '@/components/Metamask'
import { ValueBox } from '@/components/ValueBox'
import { useGlobalStore } from '@/components/Global'
import { ENABLE_AMPLIFIER_DISPLAY, getChainData } from '@/lib/config'
import { getIBCDenomBase64, split, toArray } from '@/lib/parser'
import { includesStringList } from '@/lib/operator'
import { equalsIgnoreCase, ellipse } from '@/lib/string'

const chainTypes = toArray([
  { label: 'All', value: undefined },
  { label: 'EVM', value: 'evm' },
  { label: 'Cosmos', value: 'cosmos' },
  ENABLE_AMPLIFIER_DISPLAY && { label: 'Amplifier', value: 'vm' },
])

const assetTypes = [
  { label: 'All', value: undefined },
  { label: 'Gateway', value: 'gateway' },
  { label: 'ITS', value: 'its' },
]

function Chain({ data }) {
  const { contracts } = useGlobalStore()
  const { gateway_contracts, gas_service_contracts, interchain_token_service_contract } = { ...contracts }

  const { id, chain_id, chain_name, deprecated, endpoints, name, image, explorer, prefix_address, chain_type } = { ...data }
  const { rpc, lcd } = { ...endpoints }
  const { url, address_path } = { ...explorer }
  const gatewayAddress = gateway_contracts?.[id]?.address
  const gasServiceAddress = gas_service_contracts?.[id]?.address
  const itsAddress = chain_type === 'evm' && (id in { ...interchain_token_service_contract } ? interchain_token_service_contract[id] : _.head(interchain_token_service_contract?.addresses))

  return (
    <li>
      <div className="relative bg-zinc-50/75 dark:bg-zinc-800/25 p-6 rounded-2xl">
        <div className="flex items-start justify-between">
          <div className="overflow-hidden">
            <Image
              src={image}
              alt=""
              width={56}
              height={56}
              className="object-cover"
            />
          </div>
          <div className="flex flex-col items-end gap-y-2.5">
            <div className="flex items-center gap-x-2">
              {chain_type === 'evm' && <AddMetamask chain={id} />}
              {url && (
                <Tooltip content="Explorer">
                  <a
                    href={url}
                    target="_blank"
                    className="text-blue-600 dark:text-blue-500"
                  >
                    <LuFileSearch2 size={24} />
                  </a>
                </Tooltip>
              )}
              <Tooltip content={deprecated ? 'Deactivated' : 'Active'}>
                <GoDotFill size={18} className={clsx(deprecated ? 'text-red-600' : 'text-green-600')} />
              </Tooltip>
            </div>
            {chain_type && <Tag className="uppercase">{chain_type}</Tag>}
          </div>
        </div>
        <div className="flex items-center justify-between mt-3">
          <span className="font-display text-xl font-medium">{name}</span>
          {chain_id && <span className="text-zinc-400 dark:text-zinc-500 text-sm font-normal whitespace-nowrap mt-0.5">ID: {chain_id}</span>}
        </div>
        <div className="flex flex-col gap-y-4 mt-6 mb-1">
          {chain_name && <ValueBox title="Chain Name" value={chain_name} />}
          {gatewayAddress && (
            <ValueBox
              title="Gateway Address"
              value={gatewayAddress}
              url={url && `${url}${address_path?.replace('{address}', gatewayAddress)}`}
            />
          )}
          {gasServiceAddress && (
            <ValueBox
              title="Gas Service Address"
              value={gasServiceAddress}
              url={url && `${url}${address_path?.replace('{address}', gasServiceAddress)}`}
            />
          )}
          {itsAddress && (
            <ValueBox
              title="ITS Address"
              value={itsAddress}
              url={url && `${url}${address_path?.replace('{address}', itsAddress)}`}
            />
          )}
          {toArray(rpc).length > 0 && (
            <ValueBox
              title="RPC Endpoint"
              value={_.head(toArray(rpc))}
              url={_.head(toArray(rpc))}
              noEllipse={true}
            />
          )}
          {toArray(lcd).length > 0 && (
            <ValueBox
              title="LCD Endpoint"
              value={_.head(toArray(lcd))}
              url={_.head(toArray(lcd))}
              noEllipse={true}
            />
          )}
          {prefix_address && <ValueBox title="Address Prefix" value={prefix_address} />}
        </div>
      </div>
    </li>
  )
}

function Asset({ data, focusID, onFocus }) {
  const NUM_CHAINS_TRUNCATE = 6
  const [seeMore, setSeeMore] = useState(false)
  const [chainSelected, setChainSelected] = useState(null)
  const { chains } = useGlobalStore()

  const { type, denom, denoms, native_chain, name, symbol, decimals, image } = { ...data }
  let { addresses } = { ...data }
  const _id = type === 'its' ? data.id : denom
  const { id, explorer, chain_type } = { ...(focusID === _id && getChainData(chainSelected, chains)) }
  const { url, contract_path, asset_path } = { ...explorer }
  addresses = _.uniqBy(toArray(_.concat({ chain: native_chain, ...(type === 'its' ? data.chains?.[native_chain] : addresses?.[native_chain]) }, Object.entries({ ...(type === 'its' ? data.chains : addresses) }).map(([k, v]) => ({ chain: k, ...v })))), 'chain')/*.filter(d => getChainData(d.chain, chains))*/.map(d => ({ ...d, address: d.address || d.tokenAddress }))
  const tokenData = addresses.find(d => d.chain === id)
  const { address, ibc_denom } = { ...tokenData }
  const tokenSymbol = tokenData?.symbol || symbol

  useEffect(() => {
    if (focusID !== _id) setSeeMore(false)
  }, [focusID, data, type, denom])

  return (
    <li>
      <div className="relative bg-zinc-50/75 dark:bg-zinc-800/25 p-6 rounded-2xl">
        <div className="flex items-start justify-between">
          <div className="overflow-hidden">
            <Image
              src={image}
              alt=""
              width={56}
              height={56}
              className="object-cover"
            />
          </div>
          <div className="flex flex-col items-end gap-y-1">
            {symbol && (
              <Tooltip content="Symbol" className="whitespace-nowrap">
                <Tag>{symbol}</Tag>
              </Tooltip>
            )}
            <div className="flex flex-wrap items-center">
              {toArray(_.concat(denom, _.head(denoms))).map(d => (
                <Tooltip key={d} content="Denom" className="whitespace-nowrap">
                  <Tag className="bg-orange-400 dark:bg-orange-500 font-normal whitespace-nowrap ml-1 mt-1">
                    {ellipse(d)}
                  </Tag>
                </Tooltip>
              ))}
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between mt-3">
          <span className="font-display text-xl font-medium">{name}</span>
          {decimals > 0 && <span className="text-zinc-400 dark:text-zinc-500 text-sm font-normal whitespace-nowrap mt-0.5">Decimals: {decimals}</span>}
        </div>
        <div className="flex flex-col gap-y-4 mt-6 mb-1">
          <div className="flex flex-col gap-y-1">
            <span className="text-base text-zinc-400 dark:text-zinc-500">
              {type === 'its' ? 'Interchain' : 'Gateway'} Tokens
            </span>
            <div className="flex flex-wrap items-center">
              {_.slice(addresses, 0, focusID === _id && seeMore ? addresses.length : NUM_CHAINS_TRUNCATE).map((d, i) => {
                const { chain, address, ibc_denom, symbol } = { ...d }
                const { name, image } = { ...getChainData(chain, chains) }

                return (
                  <div key={i} className="mr-1.5 mb-1.5">
                    <Tooltip content={`${name}${chain === native_chain ? ' (Native Chain)' : ''}`} className="whitespace-nowrap">
                      <button
                        onClick={() => {
                          setChainSelected(chain === chainSelected ? null : chain)
                          if (onFocus) onFocus(_id)
                        }}
                      >
                        <Image
                          src={image}
                          alt=""
                          width={24}
                          height={24}
                          className={clsx(
                            'rounded-full',
                            focusID === _id && chain === chainSelected ? 'border-2 border-blue-600 dark:border-blue-500' : chain === native_chain ? 'border-2 border-orange-400 dark:border-orange-500' : '',
                          )}
                        />
                      </button>
                    </Tooltip>
                  </div>
                )
              })}
              {addresses.length > NUM_CHAINS_TRUNCATE && (
                <button
                  onClick={() => {
                    setSeeMore(!seeMore)
                    if (onFocus) onFocus(_id)
                  }}
                  className="bg-zinc-100 dark:bg-zinc-800 rounded text-blue-600 dark:text-blue-500 text-xs 3xl:text-sm font-medium mb-1.5 px-1.5 3xl:px-2.5 py-1 3xl:py-1.5"
                >
                  {seeMore ? 'See Less' : `+${addresses.length - NUM_CHAINS_TRUNCATE} More`}
                </button>
              )}
            </div>
          </div>
          {id && (
            <div className="flex flex-col gap-y-3">
              <div className="flex items-center justify-between gap-x-2">
                <Tag className="uppercase">{id}</Tag>
                {chain_type === 'evm' && <AddMetamask chain={id} asset={_id} type={type} />}
              </div>
              {address && (
                <ValueBox
                  title="Token Contract"
                  value={address}
                  url={url && `${url}${contract_path?.replace('{address}', address)}`}
                />
              )}
              {ibc_denom && (
                <ValueBox
                  title="IBC Denom"
                  value={ibc_denom}
                  url={url && asset_path && `${url}${asset_path.replace('{ibc_denom}', getIBCDenomBase64(ibc_denom))}`}
                  prefix="ibc/"
                />
              )}
              {tokenSymbol && (
                <ValueBox
                  title="Symbol"
                  value={tokenSymbol}
                  url={url && (address ? `${url}${contract_path?.replace('{address}', address)}` : asset_path && ibc_denom ? `${url}${asset_path.replace('{ibc_denom}', getIBCDenomBase64(ibc_denom))}` : null)}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </li>
  )
}

const getParams = searchParams => {
  const params = {}
  for (const [k, v] of searchParams.entries()) {
    switch (k) {
      default:
        params[k] = v
        break
    }
  }
  return params
}

const getQueryString = params => {
  const qs = new URLSearchParams()
  Object.entries({ ...params }).filter(([k, v]) => v).forEach(([k, v]) => { qs.append(k, v) })
  return qs.toString()
}

const resources = ['chains', 'assets']

export function Resources({ resource }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [rendered, setRendered] = useState(false)
  const [params, setParams] = useState(getParams(searchParams))
  const [input, setInput] = useState('')
  const [assetFocusID, setAssetFocusID] = useState(null)
  const { chains, assets, itsAssets } = useGlobalStore()

  useEffect(() => {
    switch (pathname) {
      case '/resources':
        router.push(`/resources/${resources[0]}`)
        break
      case '/assets':
        router.push('/resources/assets')
        break
      default:
        if (!rendered) setRendered(true)
        else if (resource) {
          router.push(`/resources/${resource}${Object.keys(getParams(searchParams)).length > 0 ? `?${getQueryString(getParams(searchParams))}` : ''}`)
          setInput('')
          if (resource !== 'assets') setAssetFocusID(null)
        }
        break
    }
  }, [router, pathname, rendered, setRendered, resource, setInput, setAssetFocusID])

  useEffect(() => {
    const _params = getParams(searchParams)
    if (!_.isEqual(_params, params)) setParams(_params)
  }, [searchParams, params, setParams])

  const attributes = toArray([
    params.type === 'its' && { label: 'Chain', name: 'chain', type: 'select', options: _.concat({ title: 'Any' }, _.orderBy(toArray(chains).filter(d => !d.deprecated && (params.type !== 'its' || d.chain_type === 'evm')), ['name'], ['asc']).map(d => ({ value: d.id, title: `${d.name}${d.deprecated ? ` (deprecated)` : ''}` }))) },
  ])

  const filter = (resource, params) => {
    const { type, chain } = { ...params }
    const words = split(input, { delimiter: ' ', toCase: 'lower' })

    switch (resource) {
      case 'chains':
        return toArray(chains).filter(d => (!type || d.chain_type === type) && (!chain || equalsIgnoreCase(d.id, chain))).filter(d => !d.no_inflation || d.deprecated).filter(d => !input || includesStringList(_.uniq(toArray(['id', 'chain_id', 'chain_name', 'name'].map(f => d[f]?.toString()), { toCase: 'lower' })), words))
      case 'assets':
        return _.concat(
          toArray(!type || type === 'gateway' ? assets : []).filter(d => !chain || d.addresses?.[chain]).filter(d => !input || includesStringList(_.uniq(toArray(_.concat(['denom', 'name', 'symbol'].map(f => d[f]), d.denoms, Object.values({ ...d.addresses }).flatMap(a => toArray([!equalsIgnoreCase(input, 'axl') && a.symbol, a.address, a.ibc_denom]))), { toCase: 'lower' })), words)),
          toArray(!type || type === 'its' ? itsAssets : []).filter(d => !chain || d.chains?.[chain]).filter(d => !input || includesStringList(_.uniq(toArray(_.concat(['name', 'symbol'].map(f => d[f]), Object.values({ ...d.chains }).flatMap(a => toArray([!equalsIgnoreCase(input, 'axl') && a.symbol, a.tokenAddress]))), { toCase: 'lower' })), words)).map(d => ({ ...d, type: 'its' })),
        )
      default:
        return null
    }
  }

  const render = resource => {
    switch (resource) {
      case 'chains':
        return (
          <ul role="list" className="w-full mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {filter(resource, params).map((d, i) => <Chain key={i} data={d} />)}
          </ul>
        )
      case 'assets':
        return (
          <ul role="list" className="w-full mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {filter(resource, params).map((d, i) => <Asset key={i} data={d} focusID={assetFocusID} onFocus={id => setAssetFocusID(id)} />)}
          </ul>
        )
      default:
        return <div />
    }
  }

  return resource && (
    <Container className="flex flex-col gap-y-8 sm:gap-y-12 sm:mt-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between sm:gap-x-2 gap-y-4 sm:gap-y-0">
        <nav className="flex gap-x-4">
          {resources.map((d, i) => (
            <Link
              key={i}
              href={`/resources/${d}`}
              className={clsx(
                'rounded-md px-3 py-2 capitalize text-base font-medium',
                d === resource ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300' : 'text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-400',
              )}
            >
              {d}{d === resource && ((resource === 'chains' && chains) || (resource === 'assets' && assets)) ? ` (${filter(resource, params).length})` : ''}
            </Link>
          ))}
        </nav>
        <div className="max-w-sm flex flex-col items-start sm:items-end gap-y-2">
          <input
            placeholder={`Search by ${resource === 'assets' ? 'Denom / Symbol / Address' : 'Chain Name / ID'}`}
            value={input}
            onChange={e => setInput(split(e.target.value, { delimiter: ' ', filterBlank: false }).join(' '))}
            className="w-full sm:w-80 h-10 bg-white dark:bg-zinc-900 appearance-none border-zinc-200 hover:border-blue-300 focus:border-blue-600 dark:border-zinc-700 dark:hover:border-blue-800 dark:focus:border-blue-500 focus:ring-0 rounded-lg text-sm text-zinc-600 dark:text-zinc-400 px-3"
          />
          <div className="max-w-xl flex flex-wrap items-center mt-2">
            {(resource === 'assets' ? assetTypes : chainTypes).map((d, i) => {
              const selected = d.value === params.type
              return (
                <Link
                  key={i}
                  href={`${pathname}?${getQueryString({ ...params, type: d.value })}`}
                  className={clsx(
                    'min-w-max flex items-center text-xs sm:text-sm whitespace-nowrap mr-4 mb-1 sm:mb-0',
                    selected ? 'text-blue-600 dark:text-blue-500 font-semibold' : 'text-zinc-400 hover:text-zinc-700 dark:text-zinc-500 dark:hover:text-zinc-300',
                  )}
                >
                  <span>{d.label}</span>
                </Link>
              )
            })}
          </div>
          {attributes.length > 0 && (
            <div className="flex flex-1 flex-col justify-between gap-y-2 mt-2">
              {attributes.map((d, i) => (
                <div key={i} className="flex items-center gap-x-4">
                  <label htmlFor={d.name} className="text-zinc-900 text-sm font-medium leading-6">
                    {d.label}
                  </label>
                  <div className="w-48">
                    {d.type === 'select' ?
                      <Listbox
                        value={d.multiple ? split(params[d.name]) : params[d.name]}
                        onChange={v => {
                          const _params = { ...params, [d.name]: d.multiple ? v.join(',') : v }
                          router.push(`/resources/${resource}${Object.keys(_params).length > 0 ? `?${getQueryString(_params)}` : ''}`)
                        }}
                        multiple={d.multiple}
                      >
                        {({ open }) => {
                          const isSelected = v => d.multiple ? split(params[d.name]).includes(v) : v === params[d.name] || equalsIgnoreCase(v, params[d.name])
                          const selectedValue = d.multiple ? toArray(d.options).filter(o => isSelected(o.value)) : toArray(d.options).find(o => isSelected(o.value))

                          return (
                            <div className="relative">
                              <Listbox.Button className="relative w-full cursor-pointer rounded-md shadow-sm border border-zinc-200 text-zinc-900 sm:text-sm sm:leading-6 text-left pl-3 pr-10 py-1.5">
                                {d.multiple ?
                                  <div className={clsx('flex flex-wrap', selectedValue.length !== 0 && 'my-1')}>
                                    {selectedValue.length === 0 ?
                                      <span className="block truncate">Any</span> :
                                      selectedValue.map((v, j) => (
                                        <div
                                          key={j}
                                          onClick={() => {
                                            const _params = { ...params, [d.name]: selectedValue.filter(_v => _v.value !== v.value).map(_v => _v.value).join(',') }
                                            router.push(`/resources/${resource}${Object.keys(_params).length > 0 ? `?${getQueryString(_params)}` : ''}`)
                                          }}
                                          className="min-w-fit h-6 bg-zinc-100 rounded-xl flex items-center text-zinc-900 mr-2 my-1 px-2.5 py-1"
                                        >
                                          {v.title}
                                        </div>
                                      ))
                                    }
                                  </div> :
                                  <span className="block truncate">{selectedValue?.title}</span>
                                }
                                <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                                  <LuChevronsUpDown size={20} className="text-zinc-400" />
                                </span>
                              </Listbox.Button>
                              <Transition
                                show={open}
                                as={Fragment}
                                leave="transition ease-in duration-100"
                                leaveFrom="opacity-100"
                                leaveTo="opacity-0"
                              >
                                <Listbox.Options className="absolute z-10 w-full max-h-60 bg-white overflow-auto rounded-md shadow-lg text-base sm:text-sm mt-1 py-1">
                                  {toArray(d.options).map((o, j) => (
                                    <Listbox.Option key={j} value={o.value} className={({ active }) => clsx('relative cursor-default select-none pl-3 pr-9 py-2', active ? 'bg-blue-600 text-white' : 'text-zinc-900')}>
                                      {({ selected, active }) => (
                                        <>
                                          <span className={clsx('block truncate', selected ? 'font-semibold' : 'font-normal')}>
                                            {o.title}
                                          </span>
                                          {selected && (
                                            <span className={clsx('absolute inset-y-0 right-0 flex items-center pr-4', active ? 'text-white' : 'text-blue-600')}>
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
                          )
                        }}
                      </Listbox> :
                      <input
                        type={d.type || 'text'}
                        name={d.name}
                        placeholder={d.label}
                        value={params[d.name]}
                        onChange={e => {
                          const _params = { ...params, [d.name]: e.target.value }
                          router.push(`/resources/${resource}${Object.keys(_params).length > 0 ? `?${getQueryString(_params)}` : ''}`)
                        }}
                        className="w-full rounded-md shadow-sm border border-zinc-200 focus:border-blue-600 focus:ring-0 text-zinc-900 placeholder:text-zinc-400 sm:text-sm sm:leading-6 py-1.5"
                      />
                    }
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
}
