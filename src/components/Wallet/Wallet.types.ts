export interface CosmosWalletProps {
  connectChainId?: string;
  children?: React.ReactNode;
  className?: string;
}

export interface EVMWalletProps {
  connectChainId?: number;
  children?: React.ReactNode;
  className?: string;
}

export interface StellarWalletProps {
  children?: React.ReactNode;
  className?: string;
}

export interface SuiAccount {
  address?: string;
}

export interface SuiWalletProps {
  children?: React.ReactNode;
  className?: string;
}

export interface XRPLWalletProps {
  children?: React.ReactNode;
  className?: string;
}
