import { Image } from '@/components/Image';
import clsx from 'clsx';

import { walletButton } from './WalletButton.styles';
import type { WalletButtonProps } from './WalletButton.types';

export function WalletButton({
  iconSrc,
  label,
  onClick,
  className,
}: WalletButtonProps) {
  return (
    <button onClick={onClick} className={clsx('w-fit', className)}>
      <div className={walletButton}>
        <Image src={iconSrc} alt={label} width={16} height={16} className="" />
        {label}
      </div>
    </button>
  );
}
