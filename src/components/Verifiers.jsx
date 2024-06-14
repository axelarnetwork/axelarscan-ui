'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import clsx from 'clsx'
import _ from 'lodash'

import { Container } from '@/components/Container'
import { Image } from '@/components/Image'
import { Tooltip } from '@/components/Tooltip'
import { Spinner } from '@/components/Spinner'
import { Number } from '@/components/Number'
import { Profile } from '@/components/Profile'
import { useGlobalStore } from '@/components/Global'
import { getVerifiersVotes } from '@/lib/api/validator'
import { ENVIRONMENT } from '@/lib/config'
import { toArray } from '@/lib/parser'
import { equalsIgnoreCase } from '@/lib/string'
import { toNumber, numberFormat } from '@/lib/number'

export function Verifiers() {
  const [verifiersVotes, setVerifiersVotes] = useState(null)
  const [data, setData] = useState(null)
  const { chains, verifiers } = useGlobalStore()

  useEffect(() => {
    const getData = async () => {
      const response = await getVerifiersVotes()
      if (response?.data) setVerifiersVotes(response)
    }
    getData()
  }, [setVerifiersVotes])

  useEffect(() => {
    if (verifiersVotes && verifiers) {
      const _data = verifiers.map(d => {
        if (verifiersVotes?.data) {
          d.total_polls = toNumber(verifiersVotes.total)
          d.votes = { ...verifiersVotes.data[`vm${d.address}`] }
          d.total_votes = toNumber(d.votes.total)

          const getVoteCount = (vote, votes) => _.sum(Object.values({ ...votes }).map(v => toNumber(_.last(Object.entries({ ...v?.votes }).find(([k, v]) => equalsIgnoreCase(k, vote?.toString()))))))
          d.total_yes_votes = getVoteCount(true, d.votes.chains)
          d.total_no_votes = getVoteCount(false, d.votes.chains)
          d.total_unsubmitted_votes = getVoteCount('unsubmitted', d.votes.chains)
        }
        return { ...d, votes: d.votes && { ...d.votes, chains: Object.fromEntries(Object.entries({ ...d.votes.chains }).filter(([k, v]) => toArray(d.supportedChains).includes(k))) } }
      })

      if (!_.isEqual(_data, data)) setData(_data)
    }
  }, [verifiersVotes, data, verifiers, setData])

  return (
    <Container className="sm:mt-8">
      {!data ? <Spinner /> :
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between sm:gap-x-4 gap-y-4 sm:gap-y-0">
            <div className="sm:flex-auto">
              <div className="flex items-center space-x-2">
                {['devnet-amplifier', 'devnet-verifiers'].includes(ENVIRONMENT) && (
                  <>
                    <Link href="/validators" className="text-blue-600 dark:text-blue-500 text-base font-medium leading-6">
                      Validators
                    </Link>
                    <span className="text-zinc-400 dark:text-zinc-500">|</span>
                  </>
                )}
                <h1 className="underline text-zinc-900 dark:text-zinc-100 text-base font-semibold leading-6">Verifiers</h1>
              </div>
              <p className="mt-2 text-zinc-400 dark:text-zinc-500 text-sm">
                List of active verifiers in Axelar Network with the latest 10K blocks performance.
              </p>
            </div>
          </div>
          <div className="overflow-x-auto lg:overflow-x-visible -mx-4 sm:-mx-0 mt-4">
            <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-700">
              <thead className="sticky top-0 z-10 bg-white dark:bg-zinc-900">
                <tr className="text-zinc-800 dark:text-zinc-200 text-sm font-semibold">
                  <th scope="col" className="pl-4 sm:pl-0 pr-3 py-3.5 text-left">
                    #
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left">
                    Verifier
                  </th>
                  <th scope="col" className="pl-3 pr-4 sm:pr-0 py-3.5 text-left whitespace-nowrap">
                    VM Supported
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-zinc-900 divide-y divide-zinc-100 dark:divide-zinc-800">
                {data.map((d, i) => (
                  <tr key={i} className="align-top text-zinc-400 dark:text-zinc-500 text-sm">
                    <td className="pl-4 sm:pl-0 pr-3 py-4 text-left">
                      {i + 1}
                    </td>
                    <td className="px-3 py-4 text-left">
                      <div className="flex flex-col gap-y-0.5">
                        <Profile i={i} address={d.address} customURL={`/verifier/${d.address}`} />
                      </div>
                    </td>
                    <td className="table-cell pl-3 pr-4 sm:pr-0 py-4 text-left">
                      <div className="min-w-56 max-w-64 grid grid-cols-2 lg:grid-cols-3 gap-x-2 gap-y-1">
                        {toArray(chains).filter(c => c.chain_type === 'vm' && !c.deprecated).map(c => {
                          const { id, maintainer_id, name, image } = { ...c }
                          const { votes, total, total_polls } = { ...d.votes.chains[id] }
                          const isSupported = d.supportedChains.includes(maintainer_id)
                          const details = !isSupported ? 'Not Supported' : ['true', 'false', 'unsubmitted'].map(s => [s === 'true' ? 'Y' : s === 'false' ? 'N' : 'UN', votes?.[s]]).filter(([k, v]) => v).map(([k, v]) => `${numberFormat(v, '0,0')}${k}`).join(' / ')

                          return (
                            <div key={id} className="flex justify-start">
                              <Tooltip content={`${name}${details ? `: ${details}` : ''}`} className="whitespace-nowrap">
                                <div className="flex items-center gap-x-2">
                                  <Image
                                    src={image}
                                    alt=""
                                    width={20}
                                    height={20}
                                  />
                                  {!isSupported ?
                                    <span className="text-xs text-zinc-400 dark:text-zinc-500 font-medium whitespace-nowrap">
                                      Not Supported
                                    </span> :
                                    <div className="flex items-center gap-x-1">
                                      <Number
                                        value={total || 0}
                                        format="0,0.0a"
                                        noTooltip={true}
                                        className={clsx('text-xs font-medium', total < total_polls ? 'text-zinc-400 dark:text-zinc-500' : 'text-zinc-900 dark:text-zinc-100')}
                                      />
                                      <Number
                                        value={total_polls || 0}
                                        format="0,0.0a"
                                        prefix=" / "
                                        noTooltip={true}
                                        className="text-zinc-900 dark:text-zinc-100 text-xs font-medium"
                                      />
                                    </div>
                                  }
                                </div>
                              </Tooltip>
                            </div>
                          )
                        })}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      }
    </Container>
  )
}
