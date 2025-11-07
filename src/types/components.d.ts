import type { ReactNode } from 'react';

declare module '@/components/Copy' {
  export interface CopyProps {
    size?: number;
    value: unknown;
    onCopy?: () => void;
    children?: ReactNode;
    childrenClassName?: string;
    className?: string;
  }

  export function Copy(props: CopyProps): JSX.Element;
}

declare module '@/components/ExplorerLink' {
  export interface ExplorerLinkProps {
    value: string | number | undefined;
    chain: string | undefined;
    type?: string;
    customURL?: string;
    hasEventLog?: boolean;
    useContractLink?: boolean;
    title?: string;
    iconOnly?: boolean;
    width?: number;
    height?: number;
    containerClassName?: string;
    nonIconClassName?: string;
    className?: string;
  }

  export function ExplorerLink(props: ExplorerLinkProps): JSX.Element | null;
}

declare module '@/components/Profile' {
  export interface ProfileProps {
    address?: string | null;
    chain?: string | null;
    prefix?: string;
    width?: number;
    height?: number;
    noResolveName?: boolean;
    noCopy?: boolean;
    customURL?: string;
    useContractLink?: boolean;
    className?: string;
  }

  export interface ChainProfileProps {
    value?: string | null;
    width?: number;
    height?: number;
    className?: string;
    titleClassName?: string;
  }

  export interface AssetProfileProps {
    value?: string | null;
    chain?: string | null;
    amount?: number | string | null;
    addressOrDenom?: string | null;
    customAssetData?: Record<string, unknown> | null;
    ITSPossible?: boolean;
    onlyITS?: boolean;
    isLink?: boolean;
    width?: number;
    height?: number;
    className?: string;
    titleClassName?: string;
  }

  export function Profile(props: ProfileProps): JSX.Element;
  export function ChainProfile(props: ChainProfileProps): JSX.Element;
  export function AssetProfile(props: AssetProfileProps): JSX.Element;
}

declare module '@/components/Number' {
  export interface NumberProps {
    value?: number | string | null;
    format?: string;
    prefix?: string;
    suffix?: string;
    noTooltip?: boolean;
    className?: string;
    title?: string;
  }

  export function Number(props: NumberProps): JSX.Element;
}

declare module '@/components/Tag' {
  export interface TagProps {
    className?: string;
    children?: ReactNode;
  }

  export function Tag(props: TagProps): JSX.Element;
}

declare module '@/components/Time' {
  export interface TimeAgoProps {
    timestamp: number | string | Date | null | undefined;
    format?: string;
    title?: string;
    className?: string;
  }

  export interface TimeSpentProps {
    fromTimestamp: number | string | Date | null | undefined;
    toTimestamp?: number | string | Date | null | undefined;
    format?: string;
    noTooltip?: boolean;
    title?: string;
    className?: string;
  }

  export interface TimeUntilProps {
    timestamp: number | string | Date | null | undefined;
    prefix?: string;
    suffix?: string;
    noTooltip?: boolean;
    className?: string;
  }

  export function TimeAgo(props: TimeAgoProps): JSX.Element;
  export function TimeSpent(props: TimeSpentProps): JSX.Element;
  export function TimeUntil(props: TimeUntilProps): JSX.Element;
}

declare module '@/components/Tooltip' {
  export interface TooltipProps {
    content: ReactNode;
    className?: string;
    children: ReactNode;
  }

  export function Tooltip(props: TooltipProps): JSX.Element;
}

declare module '@/components/GMPs' {
  import type { GMPMessage } from '@/components/GMP/GMP.types';

  export function checkNeedMoreGasFromError(error: unknown): boolean;
  export function customData<T = GMPMessage | null>(value: unknown): Promise<T>;
  export function getEvent(data: GMPMessage): string;
}

