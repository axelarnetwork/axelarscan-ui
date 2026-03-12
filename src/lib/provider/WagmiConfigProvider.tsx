import { WagmiProvider } from 'wagmi';

import NonSSRWrapper from '@/components/NonSSRWrapper';
import { wagmiConfig } from '@/lib/provider/wagmi';

export default function WagmiConfigProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <NonSSRWrapper>
      <WagmiProvider config={wagmiConfig}>{children}</WagmiProvider>
    </NonSSRWrapper>
  );
}
