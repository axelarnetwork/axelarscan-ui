'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import clsx from 'clsx'
import _ from 'lodash'

import { Container } from '@/components/Container'
import { Image } from '@/components/Image'
import { Tooltip } from '@/components/Tooltip'
import { Spinner } from '@/components/Spinner'
import { Tag } from '@/components/Tag'
import { Number } from '@/components/Number'
import { Profile } from '@/components/Profile'
import { useGlobalStore } from '@/components/Global'
import { getRPCStatus, searchVMPolls } from '@/lib/api/validator'
import { getChainData } from '@/lib/config'
import { toArray } from '@/lib/parser'
import { equalsIgnoreCase } from '@/lib/string'
import { numberFormat } from '@/lib/number'

function Info({ data, address }) {
  const { chains } = useGlobalStore()
  const { supportedChains } = { ...data }

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
                <dd className="sm:col-span-2 text-zinc-700 dark:text-zinc-300 text-sm leading-6 mt-1 sm:mt-0">
                  <Tag className={clsx('w-fit', supportedChains.length > 0 ? 'bg-green-600 dark:bg-green-500' : 'bg-red-600 dark:bg-red-500')}>
                    {supportedChains.length > 0 ? 'Active' : 'Inactive'}
                  </Tag>
                </dd>
              </div>
              <div className="px-4 sm:px-6 py-6 sm:grid sm:grid-cols-3 sm:gap-4">
                <dt className="text-zinc-900 dark:text-zinc-100 text-sm font-medium">VM Supported</dt>
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
            VM Votes
          </h3>
          <p className="text-zinc-400 dark:text-zinc-500 text-xs leading-5">
            Latest {numberFormat(size, '0,0')} Polls ({numberFormat(NUM_LATEST_BLOCKS, '0,0')} Blocks)
          </p>
        </div>
        <div className="flex flex-col items-end">
          <Number
            value={data.filter(d => typeof d.vote === 'boolean').length * 100 / data.length}
            format="0,0.00"
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
              href={d.id ? `/vm-poll/${d.id}` : `/block/${d.height}`}
              target="_blank"
              className="w-5 h-5"
            >
              <Tooltip content={d.id ? `Poll ID: ${d.id} (${name})` : numberFormat(d.height, '0,0')} className="whitespace-nowrap">
                <div className={clsx('w-4 h-4 rounded-sm m-0.5', typeof d.vote === 'boolean' ? d.vote ? 'bg-green-600 dark:bg-green-500' : 'bg-red-600 dark:bg-red-500' : 'bg-zinc-300 dark:bg-zinc-700')} />
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
          await Promise.all(['votes'].map(d => new Promise(async resolve => {
            switch (d) {
              case 'votes':
                try {
                  const toBlock = latest_block_height - 1
                  const fromBlock = toBlock - NUM_LATEST_BLOCKS

                  const data = verifierAddress && (await searchVMPolls({ voter: verifierAddress, fromBlock, toBlock, size }))?.data
                  setVotes(toArray(data).map(d => Object.fromEntries(
                    Object.entries(d).filter(([k, v]) => !k.startsWith('axelar') || equalsIgnoreCase(k, verifierAddress)).flatMap(([k, v]) =>
                      equalsIgnoreCase(k, verifierAddress) ? Object.entries({ ...v }).map(([_k, _v]) => [_k === 'id' ? 'txhash' : _k, _v]) : [[k, v]]
                    )
                  )))
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
            <Info data={data} address={address} />
          </div>
          {!votes ? <Spinner /> :
            <div className="flex flex-col gap-y-4">
              <Votes data={votes} />
            </div>
          }
        </div>
      }
    </Container>
  )
}
