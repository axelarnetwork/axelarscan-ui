declare global {
  interface Window {
    keplr?: KeplrWallet;
    crossmark?: CrossmarkWallet;
  }
}

export interface KeplrChain {
  chainId: string;
  chainName: string;
  rpc: string;
  rest: string;
  bip44: {
    coinType: number;
  };
  bech32Config: {
    bech32PrefixAccAddr: string;
    bech32PrefixAccPub: string;
    bech32PrefixValAddr: string;
    bech32PrefixValPub: string;
    bech32PrefixConsAddr: string;
    bech32PrefixConsPub: string;
  };
  currencies: Array<{
    coinDenom: string;
    coinMinimalDenom: string;
    coinDecimals: number;
  }>;
  feeCurrencies: Array<{
    coinDenom: string;
    coinMinimalDenom: string;
    coinDecimals: number;
  }>;
  stakeCurrency: {
    coinDenom: string;
    coinMinimalDenom: string;
    coinDecimals: number;
  };
  features: string[];
}

export interface KeplrSigner {
  getAccounts(): Promise<Array<{ address: string }>>;
  signAmino(
    signerAddress: string,
    signDoc: Record<string, unknown>
  ): Promise<Record<string, unknown>>;
  signDirect(
    signerAddress: string,
    signDoc: Record<string, unknown>
  ): Promise<Record<string, unknown>>;
}

interface KeplrWallet {
  enable(chainId: string): Promise<void>;
  experimentalSuggestChain(chain: KeplrChain): Promise<void>;
  getOfflineSignerAuto(chainId: string): Promise<KeplrSigner>;
}

interface CrossmarkWallet {
  isConnected: boolean;
  connect(): Promise<void>;
  disconnect(): Promise<void>;
}
