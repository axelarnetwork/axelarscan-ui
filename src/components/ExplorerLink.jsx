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

export const buildExplorerURL = ({ value, type, useContractLink, hasEventLog, explorer }) => {
  const { url, address_path, contract_path, contract_0_path, transaction_path, block_path, no_0x, cannot_link_contract_via_address_path } = { ...explorer }

  // Return undefined if url or value are falsy
  if (!url || !value) {
    return undefined
  }

  let path
  let href
  let processedValue = value

  switch (type) {
    case 'address':
      path = useContractLink && cannot_link_contract_via_address_path && contract_path ? contract_path : address_path
      href = `${url}${path?.replace(`{address}`, processedValue)}`
      break;
    case 'contract':
      path = (value === ZeroAddress && contract_0_path) || contract_path
      href = `${url}${path?.replace(`{address}`, processedValue)}`
      break;
    case 'tx':
      path = transaction_path
      // remove prefix 0x
      if (no_0x && processedValue?.startsWith('0x')) {
        processedValue = processedValue.substring(2)
      }
      href = `${url}${path?.replace(`{tx}`, processedValue)}${processedValue.startsWith('0x') && hasEventLog ? '#eventlog' : ''}`
      break;
    case 'block':
      path = block_path
      href = `${url}${path?.replace(`{block}`, processedValue)}`
      break;
    default:
      return undefined
  }

  return href
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

  const href = customURL || buildExplorerURL({ value, type, useContractLink, hasEventLog, explorer })

  if (!href) { return null }

  return (
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
