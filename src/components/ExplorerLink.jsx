'use client'

import Link from 'next/link'
import { constants } from 'ethers'
const { AddressZero: ZeroAddress } = { ...constants }
import clsx from 'clsx'

import { Image } from '@/components/Image'
import { useGlobalStore } from '@/components/Global'
import { getChainData } from '@/lib/config'
import { getInputType } from '@/lib/parser'
import { isString } from '@/lib/string'
import { isNumber } from '@/lib/number'

export const buildExplorerURL = (value, type, useContractLink, hasEventLog, explorer) => {
  const { url, address_path, contract_path, contract_0_path, transaction_path, block_path, no_0x, cannot_link_contract_via_address_path } = { ...explorer }

  let path
  let processedValue = value

  switch (type) {
    case 'address':
      path = useContractLink && cannot_link_contract_via_address_path && contract_path ? contract_path : address_path
      return `${url}${path?.replace(`{address}`, processedValue)}`
    case 'contract':
      path = (value === ZeroAddress && contract_0_path) || contract_path
      return `${url}${path?.replace(`{address}`, processedValue)}`
    case 'tx':
      path = transaction_path
      // remove prefix 0x
      if (no_0x && processedValue?.startsWith('0x')) {
        processedValue = processedValue.substring(2)
      }
      return `${url}${path?.replace(`{tx}`, processedValue)}${value.startsWith('0x') && hasEventLog ? '#eventlog' : ''}`
    case 'block':
      path = block_path
      return `${url}${path?.replace(`{block}`, processedValue)}`
    default:
      return undefined
  }
}

export function ExplorerLink({
  value,
  chain,
  type = 'tx',
  customURL,
  hasEventLog,
  useContractLink,
  title,
  iconOnly = true,
  width = 16,
  height = 16,
  containerClassName,
  nonIconClassName,
  className = 'h-4',
}) {
  const { chains } = useGlobalStore()
  const { explorer } = { ...getChainData(chain, chains) }

  if (type === 'tx') {
    // update type from input value
    switch (getInputType(value, chains)) {
      case 'evmAddress':
        type = 'address'
        break
      case 'block':
        if (isNumber(value) && (!isString(value) || !value.startsWith('0x'))) {
          type = 'block'
        }
        break
      default:
        break
    }
  }

  let href = customURL || buildExplorerURL(value, type, useContractLink, hasEventLog, explorer)

  return href && (
    <Link
      href={href}
      target="_blank"
      className={clsx('min-w-max flex items-center gap-x-2', containerClassName)}
    >
      {!iconOnly && (
        <span className={clsx('font-medium', nonIconClassName)}>
          {title || `View on ${explorer.name}`}
        </span>
      )}
      <Image
        src={explorer.icon}
        alt=""
        width={width}
        height={height}
        className={clsx('rounded-full opacity-60 hover:opacity-100', className)}
      />
    </Link>
  )
}
