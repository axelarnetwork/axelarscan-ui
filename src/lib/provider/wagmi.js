import { QueryClient } from '@tanstack/react-query'
import { defaultWagmiConfig } from '@web3modal/wagmi/react/config'
import { createWeb3Modal } from '@web3modal/wagmi/react'
import { mainnet, sepolia, bsc, bscTestnet, polygon, polygonAmoy, avalanche, avalancheFuji, fantom, fantomTestnet, moonbeam, moonbaseAlpha, arbitrum, arbitrumSepolia, optimism, optimismSepolia, base, baseSepolia, mantle, mantleSepoliaTestnet, celo, celoAlfajores, kava, kavaTestnet, filecoin, filecoinCalibration, linea, lineaSepolia, scroll, scrollSepolia, immutableZkEvm, immutableZkEvmTestnet, fraxtal, fraxtalTestnet, blast, blastSepolia, flowMainnet, flowTestnet, hedera, hederaTestnet } from 'wagmi/chains'

import { ENVIRONMENT } from '@/lib/config'
import { toArray } from '@/lib/parser'

export const CHAINS = toArray(ENVIRONMENT === 'mainnet' ?
  [
    { _id: 'ethereum', ...mainnet },
    { _id: 'binance', ...bsc },
    { _id: 'polygon', ...polygon },
    { _id: 'avalanche', ...avalanche },
    { _id: 'fantom', ...fantom, rpcUrls: { default: { http: ['https://rpc.fantom.network'] } } },
    { _id: 'moonbeam', ...moonbeam },
    { _id: 'arbitrum', ...arbitrum },
    { _id: 'optimism', ...optimism },
    { _id: 'base', ...base },
    { _id: 'mantle', ...mantle },
    { _id: 'celo', ...celo },
    { _id: 'kava', ...kava },
    { _id: 'filecoin', ...filecoin },
    { _id: 'linea', ...linea },
    { _id: 'centrifuge', id: 2031, network: 'centrifuge', name: 'Centrifuge', nativeCurrency: { name: 'Centrifuge', symbol: 'CFG', decimals: 18 }, rpcUrls: { default: { http: ['https://fullnode.parachain.centrifuge.io'] } }, blockExplorers: { default: { name: 'Centrifuge', url: 'https://centrifuge.subscan.io' } } },
    { _id: 'scroll', ...scroll },
    { _id: 'immutable', ...immutableZkEvm },
    { _id: 'fraxtal', ...fraxtal },
    { _id: 'blast', ...blast },
    { _id: 'flow', ...flowMainnet },
    { _id: 'hedera', ...hedera },
  ] :
  [
    ['testnet', 'stagenet'].includes(ENVIRONMENT) && { _id: 'ethereum-sepolia', ...sepolia },
    ['testnet', 'stagenet'].includes(ENVIRONMENT) && { _id: 'test-sepolia', ...sepolia, name: `${sepolia.name} (Amplifier)` },
    ['devnet-amplifier'].includes(ENVIRONMENT) && { _id: 'core-ethereum', ...sepolia },
    ['devnet-amplifier'].includes(ENVIRONMENT) && { _id: 'eth-sepolia', ...sepolia, name: `${sepolia.name} (Amplifier)` },
    { _id: 'binance', ...bscTestnet },
    { _id: 'polygon-sepolia', ...polygonAmoy },
    ['testnet', 'stagenet'].includes(ENVIRONMENT) && { _id: 'avalanche', ...avalancheFuji },
    ['testnet', 'stagenet'].includes(ENVIRONMENT) && { _id: 'test-avalanche', ...avalancheFuji, name: `${avalancheFuji.name} (Amplifier)` },
    ['devnet-amplifier'].includes(ENVIRONMENT) && { _id: 'core-avalanche', ...avalancheFuji },
    ['devnet-amplifier'].includes(ENVIRONMENT) && { _id: 'avalanche-fuji', ...avalancheFuji, name: `${avalancheFuji.name} (Amplifier)` },
    { _id: 'fantom', ...fantomTestnet },
    { _id: 'moonbeam', ...moonbaseAlpha },
    { _id: 'arbitrum-sepolia', ...arbitrumSepolia },
    { _id: 'optimism-sepolia', ...optimismSepolia },
    { _id: 'base-sepolia', ...baseSepolia },
    { _id: 'mantle-sepolia', ...mantleSepoliaTestnet },
    { _id: 'celo', ...celoAlfajores },
    { _id: 'kava', ...kavaTestnet },
    { _id: 'filecoin-2', ...filecoinCalibration },
    { _id: 'linea-sepolia', ...lineaSepolia },
    { _id: 'centrifuge-2', id: 2090, network: 'centrifuge', name: 'Centrifuge', nativeCurrency: { name: 'Algol', symbol: 'ALGL', decimals: 18 }, rpcUrls: { default: { http: ['https://fullnode.demo.k-f.dev'] } }, blockExplorers: { default: { name: 'Centrifuge', url: '' } }, testnet: true },
    { _id: 'scroll', ...scrollSepolia },
    { _id: 'immutable', ...immutableZkEvmTestnet },
    { _id: 'fraxtal', ...fraxtalTestnet },
    { _id: 'blast-sepolia', ...blastSepolia },
    { _id: 'flow', ...flowTestnet },
    ['testnet', 'stagenet'].includes(ENVIRONMENT) && { _id: 'hedera', ...hederaTestnet },
    ['devnet-amplifier'].includes(ENVIRONMENT) && { _id: 'hedera-testnet', ...hederaTestnet },
  ]
)

export const queryClient = new QueryClient()

export const wagmiConfig = defaultWagmiConfig({
  chains: CHAINS,
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID,
  metadata: {
    name: 'Axelarscan',
    description: process.env.NEXT_PUBLIC_DEFAULT_TITLE,
    icons: ['/icons/favicon-32x32.png'],
  },
})

export const xrplConfig = {
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID,
  metadata: {
    name: 'Axelarscan',
    description: process.env.NEXT_PUBLIC_DEFAULT_TITLE,
    icons: ['/icons/favicon-32x32.png'],
  },
  networks: [`xrpl:${ENVIRONMENT === 'mainnet' ? 'mainnet' : ENVIRONMENT === 'devnet-amplifier' ? 'devnet' : 'testnet'}`],
}

export const Web3Modal = createWeb3Modal({
  wagmiConfig,
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID,
  chains: CHAINS,
  themeVariables: {},
  excludeWalletIds: ['19177a98252e07ddfc9af2083ba8e07ef627cb6103467ffebb3f8f4205fd7927'],
})
