import { WagmiConfig } from 'wagmi'

import NonSSRWrapper from '@/components/NonSSRWrapper'
import { wagmiConfig } from '@/lib/provider/wagmi'

export default function WagmiConfigProvider({ children }) { return <NonSSRWrapper><WagmiConfig config={wagmiConfig}>{children}</WagmiConfig></NonSSRWrapper> }