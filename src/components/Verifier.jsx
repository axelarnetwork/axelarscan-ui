'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import clsx from 'clsx'
import _ from 'lodash'
import { MdKeyboardDoubleArrowLeft, MdKeyboardDoubleArrowRight } from 'react-icons/md'

import { Container } from '@/components/Container'
import { Button } from '@/components/Button'
import { Image } from '@/components/Image'
import { Copy } from '@/components/Copy'
import { Tooltip } from '@/components/Tooltip'
import { Spinner } from '@/components/Spinner'
import { Tag } from '@/components/Tag'
import { Number } from '@/components/Number'
import { Profile } from '@/components/Profile'
import { TimeAgo } from '@/components/Time'
import { useGlobalStore } from '@/components/Global'
import { getRPCStatus, searchVMPolls, searchVMProofs, getVerifiersSigns, getVerifiersRewards, searchVerifiersRewards } from '@/lib/api/validator'
import { getChainData } from '@/lib/config'
import { toArray } from '@/lib/parser'
import { equalsIgnoreCase } from '@/lib/string'
import { isNumber, toNumber, numberFormat } from '@/lib/number'

function Pagination({ data, value = 1, maxPage = 5, sizePerPage = 25, onChange }) {
  const [page, setPage] = useState(value)

  useEffect(() => {
    if (value) setPage(value)
  }, [value, setPage])

  useEffect(() => {
    if (page && onChange) onChange(page)
  }, [page, onChange])

  const half = Math.floor(toNumber(maxPage) / 2)
  const totalPage = Math.ceil(toNumber(data.length) / sizePerPage)
  const pages = _.range(page - half, page + half + 1).filter(p => p > 0 && p <= totalPage)
  const prev = _.min(_.range(_.head(pages) - maxPage, _.head(pages)).filter(p => p > 0))
  const next = _.max(_.range(_.last(pages) + 1, _.last(pages) + maxPage + 1).filter(p => p <= totalPage))

  return (
    <div className="flex items-center justify-center gap-x-1">
      {isNumber(prev) && (
        <Button
          color="none"
          onClick={() => setPage(prev)}
          className="!px-1"
        >
          <MdKeyboardDoubleArrowLeft size={18} />
        </Button>
      )}
      {pages.map(p => (
        <Button
          key={p}
          color={p === page ? 'blue' : 'default'}
          onClick={() => setPage(p)}
          className="!text-2xs !px-3 !py-1"
        >
          <Number value={p} />
        </Button>
      ))}
      {isNumber(next) && (
        <Button
          color="none"
          onClick={() => setPage(next)}
          className="!px-1"
        >
          <MdKeyboardDoubleArrowRight size={18} />
        </Button>
      )}
    </div>
  )
}

function Info({ data, rewards, cumulativeRewards, address }) {
  const rewardsSizePerPage = 10
  const [rewardsPage, setRewardsPage] = useState(1)
  const { chains, verifiersByChain } = useGlobalStore()
  const { supportedChains } = { ...data }

  const { bonding_state, authorization_state, weight } = { ...Object.values(verifiersByChain).flatMap(d => toArray(d?.addresses)).find(d => equalsIgnoreCase(d.address, address)) }
  return (
    <div className="overflow-hidden bg-zinc-50/75 dark:bg-zinc-800/25 shadow sm:rounded-lg">
      <div className="px-4 sm:px-6 py-6">
        <h3 className="text-zinc-900 dark:text-zinc-100 text-base font-semibold leading-7">
          <Profile address={address} width={32} height={32} />
        </h3>
      </div>
      <div className="border-t border-zinc-200 dark:border-zinc-700">
        <dl className="divide-y divide-zinc-100 dark:divide-zinc-800">
          {supportedChains && (
            <>
              <div className="px-4 sm:px-6 py-6 sm:grid sm:grid-cols-3 sm:gap-4">
                <dt className="text-zinc-900 dark:text-zinc-100 text-sm font-medium">Status</dt>
                <dd className="sm:col-span-2 flex flex-col text-zinc-700 dark:text-zinc-300 text-sm leading-6 space-y-2 mt-1 sm:mt-0">
                  <Tag className={clsx('w-fit', supportedChains.length > 0 ? 'bg-green-600 dark:bg-green-500' : 'bg-red-600 dark:bg-red-500')}>
                    {supportedChains.length > 0 ? 'Active' : 'Inactive'}
                  </Tag>
                  {isNumber(bonding_state?.Bonded?.amount) && (
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold">Bonding State:</span>
                      <Number
                        value={bonding_state.Bonded.amount}
                        suffix={` ${getChainData('axelarnet', chains)?.native_token?.symbol}`}
                        noTooltip={true}
                      />
                    </div>
                  )}
                  {authorization_state && (
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold">Authorization State:</span>
                      <span>{authorization_state}</span>
                    </div>
                  )}
                  {isNumber(weight) && (
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold">Weight:</span>
                      <Number value={weight} noTooltip={true} />
                    </div>
                  )}
                </dd>
              </div>
              <div className="px-4 sm:px-6 py-6 sm:grid sm:grid-cols-3 sm:gap-4">
                <dt className="text-zinc-900 dark:text-zinc-100 text-sm font-medium">Amplifier Supported</dt>
                <dd className="sm:col-span-2 text-zinc-700 dark:text-zinc-300 text-sm leading-6 mt-1 sm:mt-0">
                  <div className="flex flex-wrap">
                    {supportedChains.map((c, i) => {
                      const { name, image } = { ...getChainData(c, chains) }
                      return (
                        <Tooltip key={i} content={name} className="whitespace-nowrap">
                          <Image
                            src={image}
                            alt=""
                            width={20}
                            height={20}
                            className="mr-1.5 mb-1.5"
                          />
                        </Tooltip>
                      )
                    })}
                  </div>
                </dd>
              </div>
            </>
          )}
          {cumulativeRewards && (
            <div className="px-4 sm:px-6 py-6 sm:grid sm:grid-cols-3 sm:gap-4">
              <dt className="text-zinc-900 dark:text-zinc-100 text-sm font-medium">Cumulative Rewards</dt>
              <dd className="sm:col-span-2 text-zinc-700 dark:text-zinc-300 text-sm leading-6 mt-1 sm:mt-0">
                <Tooltip
                  content={
                    <div className="flex flex-col gap-y-1">
                      {toArray(cumulativeRewards.chains).map((d, i) => (
                        <Number
                          key={i}
                          value={d.amount}
                          format="0,0.000000"
                          prefix={`${getChainData(d.chain, chains)?.name || d.chain}: `}
                          noTooltip={true}
                          className="font-medium"
                        />
                      ))}
                    </div>
                  }
                  className="whitespace-nowrap"
                  parentClassName="!justify-start"
                >
                  <Number
                    value={cumulativeRewards.total_rewards}
                    suffix={` ${getChainData('axelarnet', chains)?.native_token?.symbol}`}
                    noTooltip={true}
                    className="font-medium"
                  />
                </Tooltip>
              </dd>
            </div>
          )}
          {rewards && (
            <div className="px-4 sm:px-6 py-6 sm:grid sm:grid-cols-3 sm:gap-4">
              <dt className="text-zinc-900 dark:text-zinc-100 text-sm font-medium">Latest Rewards Distribution</dt>
              <dd className="sm:col-span-2 text-zinc-700 dark:text-zinc-300 text-sm leading-6 mt-1 sm:mt-0">
                <div className="flex flex-col gap-y-4">
                  <div className="overflow-x-auto lg:overflow-x-visible -mx-4 sm:-mx-0">
                    <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-700">
                      <thead className="sticky top-0 z-10 bg-white dark:bg-zinc-900">
                        <tr className="text-zinc-800 dark:text-zinc-200 text-sm font-semibold">
                          <th scope="col" className="pl-4 sm:pl-3 pr-3 py-2.5 text-left">
                            Height
                          </th>
                          {/*<th scope="col" className="whitespace-nowrap px-3 py-2.5 text-left">
                            Epoch Count
                          </th>*/}
                          <th scope="col" className="px-3 py-2.5 text-left">
                            Chain
                          </th>
                          <th scope="col" className="px-3 py-2.5 text-right">
                            Payout
                          </th>
                          <th scope="col" className="whitespace-nowrap pl-3 pr-4 sm:pr-3 px-3 py-2.5 text-right">
                            Payout at
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-zinc-900 divide-y divide-zinc-100 dark:divide-zinc-800">
                        {toArray(rewards).filter((d, i) => i >= (rewardsPage - 1) * rewardsSizePerPage && i < rewardsPage * rewardsSizePerPage).map((d, i) => {
                          const { name, image } = { ...getChainData(d.chain, chains) }
                          return (
                            <tr key={i} className="align-top text-zinc-400 dark:text-zinc-500 text-xs">
                              <td className="pl-4 sm:pl-3 pr-3 py-3 text-left">
                                <div className="flex flex-col gap-y-0.5">
                                  <Copy size={16} value={d.height}>
                                    <Link
                                      href={`/block/${d.height}`}
                                      target="_blank"
                                      className="text-blue-600 dark:text-blue-500 font-semibold"
                                    >
                                      <Number value={d.height} className="text-xs" />
                                    </Link>
                                  </Copy>
                                </div>
                              </td>
                              {/*<td className="px-3 py-3">
                                <Copy size={16} value={d.epoch_count}>
                                  <Number
                                    value={d.epoch_count}
                                    format="0,0"
                                    className="text-zinc-900 dark:text-zinc-100 text-xs font-medium"
                                  />
                                </Copy>
                              </td>*/}
                              <td className="px-3 py-3">
                                <div className="flex items-center">
                                  {name ?
                                    <Tooltip content={name} className="whitespace-nowrap">
                                      <Image
                                        src={image}
                                        alt=""
                                        width={20}
                                        height={20}
                                      />
                                    </Tooltip> :
                                    <span className="text-zinc-900 dark:text-zinc-100">{d.chain}</span>
                                  }
                                </div>
                              </td>
                              <td className="px-3 py-3 text-right">
                                <div className="flex items-center justify-end">
                                  <Number value={d.amount} className="text-zinc-900 dark:text-zinc-100 text-xs font-semibold" />
                                </div>
                              </td>
                              <td className="pl-3 pr-4 sm:pr-3 py-3 text-right">
                                <div className="flex items-center justify-end">
                                  <TimeAgo timestamp={d.created_at?.ms} />
                                </div>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                  {rewards.length > rewardsSizePerPage && (
                    <Pagination
                      data={rewards}
                      value={rewardsPage}
                      onChange={page => setRewardsPage(page)}
                      sizePerPage={rewardsSizePerPage}
                    />
                  )}
                </div>
              </dd>
            </div>
          )}
        </dl>
      </div>
    </div>
  )
}

function Votes({ data }) {
  const { chains } = useGlobalStore()
  const totalY = toArray(data).filter(d => typeof d.vote === 'boolean' && d.vote).length
  const totalN = toArray(data).filter(d => typeof d.vote === 'boolean' && !d.vote).length
  const totalUN = toArray(data).filter(d => typeof d.vote !== 'boolean').length
  const totalVotes = Object.fromEntries(Object.entries({ Y: totalY, N: totalN, UN: totalUN }).filter(([k, v]) => v || k === 'Y'))

  return data?.length > 0 && (
    <div className="flex flex-col gap-y-2 my-2.5">
      <div className="flex justify-between gap-x-4 pr-1">
        <div className="flex flex-col">
          <h3 className="text-zinc-900 dark:text-zinc-100 text-sm font-semibold leading-6">
            Amplifier Votes
          </h3>
          <p className="text-zinc-400 dark:text-zinc-500 text-xs leading-5">
            Latest {numberFormat(size, '0,0')} Polls{/* ({numberFormat(NUM_LATEST_BLOCKS, '0,0')} Blocks)*/}
          </p>
        </div>
        <div className="flex flex-col items-end">
          <Number
            value={data.filter(d => typeof d.vote === 'boolean').length * 100 / data.length}
            suffix="%"
            className="text-zinc-900 dark:text-zinc-100 text-sm font-semibold leading-6"
          />
          <Number
            value={data.length}
            format="0,0"
            prefix={`${Object.keys(totalVotes).length > 1 ? '(' : ''}${Object.entries(totalVotes).map(([k, v]) => `${numberFormat(v, '0,0')}${k}`).join(' : ')}${Object.keys(totalVotes).length > 1 ? ')' : ''}/`}
            className="text-zinc-400 dark:text-zinc-500 text-xs leading-5"
          />
        </div>
      </div>
      <div className="flex flex-wrap">
        {data.map((d, i) => {
          const { name } = { ...getChainData(d.sender_chain, chains) }
          return (
            <Link
              key={i}
              href={d.id ? `/amplifier-poll/${d.id}` : `/block/${d.height}`}
              target="_blank"
              className="w-5 h-5"
            >
              <Tooltip content={d.poll_id ? `Poll ID: ${d.poll_id} (${name})` : numberFormat(d.height, '0,0')} className="whitespace-nowrap">
                <div className={clsx('w-4 h-4 rounded-sm m-0.5', typeof d.vote === 'boolean' ? d.vote ? 'bg-green-600 dark:bg-green-500' : 'bg-red-600 dark:bg-red-500' : 'bg-zinc-300 dark:bg-zinc-700')} />
              </Tooltip>
            </Link>
          )
        })}
      </div>
    </div>
  )
}

function Signs({ data }) {
  const { chains } = useGlobalStore()
  const totalSigned = toArray(data).filter(d => typeof d.sign === 'boolean' && d.sign).length
  const totalUN = toArray(data).filter(d => typeof d.sign !== 'boolean').length
  const totalSigns = Object.fromEntries(Object.entries({ S: totalSigned, UN: totalUN }).filter(([k, v]) => v || k === 'S'))

  return data?.length > 0 && (
    <div className="flex flex-col gap-y-2 my-2.5">
      <div className="flex justify-between gap-x-4 pr-1">
        <div className="flex flex-col">
          <h3 className="text-zinc-900 dark:text-zinc-100 text-sm font-semibold leading-6">
            Amplifier Signings
          </h3>
          <p className="text-zinc-400 dark:text-zinc-500 text-xs leading-5">
            Latest {numberFormat(size, '0,0')} Signings{/* ({numberFormat(NUM_LATEST_BLOCKS, '0,0')} Blocks)*/}
          </p>
        </div>
        <div className="flex flex-col items-end">
          <Number
            value={data.filter(d => typeof d.sign === 'boolean').length * 100 / data.length}
            suffix="%"
            className="text-zinc-900 dark:text-zinc-100 text-sm font-semibold leading-6"
          />
          <Number
            value={data.length}
            format="0,0"
            prefix={`${Object.keys(totalSigns).length > 1 ? '(' : ''}${Object.entries(totalSigns).map(([k, v]) => `${numberFormat(v, '0,0')}${k === 'S' ? '' : k}`).join(' : ')}${Object.keys(totalSigns).length > 1 ? ')' : ''}/`}
            className="text-zinc-400 dark:text-zinc-500 text-xs leading-5"
          />
        </div>
      </div>
      <div className="flex flex-wrap">
        {data.map((d, i) => {
          const { name } = { ...getChainData(d.chain || d.destination_chain, chains) }
          return (
            <Link
              key={i}
              href={d.id ? `/amplifier-proof/${d.id}` : `/block/${d.height}`}
              target="_blank"
              className="w-5 h-5"
            >
              <Tooltip content={d.session_id ? `Session ID: ${d.session_id} (${name})` : numberFormat(d.height, '0,0')} className="whitespace-nowrap">
                <div className={clsx('w-4 h-4 rounded-sm m-0.5', typeof d.sign === 'boolean' ? d.sign ? 'bg-green-600 dark:bg-green-500' : 'bg-red-600 dark:bg-red-500' : 'bg-zinc-300 dark:bg-zinc-700')} />
              </Tooltip>
            </Link>
          )
        })}
      </div>
    </div>
  )
}

const size = 200
const NUM_LATEST_BLOCKS = 10000

export function Verifier({ address }) {
  const [data, setData] = useState(null)
  const [votes, setVotes] = useState(null)
  const [signs, setSigns] = useState(null)
  const [rewards, setRewards] = useState(null)
  const [cumulativeRewards, setCumulativeRewards] = useState(null)
  const { chains, verifiers } = useGlobalStore()

  useEffect(() => {
    const getData = async () => {
      if (address && verifiers) {
        const _data = verifiers.find(d => equalsIgnoreCase(d.address, address))
        if (_data && !_.isEqual(_data, data)) setData(_data)
      }
    }
    getData()
  }, [address, data, verifiers, setData])

  useEffect(() => {
    const getData = async () => {
      if (address && data) {
        const verifierAddress = data.address
        const { latest_block_height } = { ...await getRPCStatus() }

        if (latest_block_height) {
          await Promise.all(['votes', 'signs', 'rewards', 'cumulative_rewards'].map(d => new Promise(async resolve => {
            switch (d) {
              case 'votes':
                try {
                  const toBlock = latest_block_height - 1
                  const fromBlock = 1 // toBlock - NUM_LATEST_BLOCKS

                  const data = verifierAddress && (await searchVMPolls({ voter: verifierAddress, fromBlock, toBlock, size }))?.data
                  setVotes(toArray(data).map(d => Object.fromEntries(
                    Object.entries(d).filter(([k, v]) => !k.startsWith('axelar') || equalsIgnoreCase(k, verifierAddress)).flatMap(([k, v]) =>
                      equalsIgnoreCase(k, verifierAddress) ? Object.entries({ ...v }).map(([_k, _v]) => [_k === 'id' ? 'txhash' : _k, _v]) : [[k, v]]
                    )
                  )))
                } catch (error) {}
                break
              case 'signs':
                try {
                  const toBlock = latest_block_height - 1
                  const fromBlock = 1 // toBlock - NUM_LATEST_BLOCKS

                  const data = verifierAddress && (await searchVMProofs({ signer: verifierAddress, fromBlock, toBlock, size }))?.data
                  setSigns(toArray(data).map(d => Object.fromEntries(
                    Object.entries(d).filter(([k, v]) => !k.startsWith('axelar') || equalsIgnoreCase(k, verifierAddress)).flatMap(([k, v]) =>
                      equalsIgnoreCase(k, verifierAddress) ? Object.entries({ ...v }).map(([_k, _v]) => [_k === 'id' ? 'txhash' : _k, _v]) : [[k, v]]
                    )
                  )))
                } catch (error) {}
                break
              case 'rewards':
                try {
                  const data = verifierAddress && (await searchVerifiersRewards({ verifierAddress, fromBlock: 1, size }))?.data
                  setRewards(toArray(data))
                } catch (error) {}
                break
              case 'cumulative_rewards':
                try {
                  const data = verifierAddress && (await getVerifiersRewards({ verifierAddress, fromBlock: 1 }))?.data
                  setCumulativeRewards(_.head(data))
                } catch (error) {}
                break
              default:
                break
            }
            resolve()
          })))
        }
      }
    }

    getData()
  }, [address, data])

  return (
    <Container className="sm:mt-8">
      {!data ? <Spinner /> :
        <div className="grid md:grid-cols-3 md:gap-x-4 gap-y-4 md:gap-y-0">
          <div className="md:col-span-2">
            <Info
              data={data}
              rewards={rewards}
              cumulativeRewards={cumulativeRewards}
              address={address}
            />
          </div>
          {!(votes || signs) ? <Spinner /> :
            <div className="flex flex-col gap-y-4">
              <Votes data={votes} />
              <Signs data={signs} />
            </div>
          }
        </div>
      }
    </Container>
  )
}
