import clsx from 'clsx';

import { Profile } from '@/components/Profile';
import { isString } from '@/lib/string';
import type { Chain } from '@/types';

import { ChainCell } from './ChainCell.component';
import type { VerifierRowProps } from './Verifiers.types';
import * as styles from './Verifiers.styles';

export function VerifierRow({
  verifier,
  index,
  amplifierChains,
  additionalAmplifierChains,
}: VerifierRowProps) {
  const allChains: (Chain | string)[] = [...amplifierChains, ...additionalAmplifierChains];

  return (
    <tr className={styles.row}>
      <td className={styles.tdFirst}>{index + 1}</td>
      <td className={styles.tdMiddle}>
        <div className={styles.profileWrapper}>
          <Profile
            i={index}
            address={verifier.address}
            customURL={`/verifier/${verifier.address}`}
          />
        </div>
      </td>
      <td className={styles.tdLast}>
        <div
          className={clsx(
            styles.chainGridBase,
            additionalAmplifierChains.length > 0
              ? styles.chainGridWide
              : styles.chainGridNarrow
          )}
        >
          {allChains.map((c) => {
            const chainId = isString(c) ? c : c.id;
            return (
              <ChainCell
                key={chainId}
                chainEntry={c}
                votesChains={verifier.votes?.chains ?? {}}
                signsChains={verifier.signs?.chains ?? {}}
                supportedChains={verifier.supportedChains}
              />
            );
          })}
        </div>
      </td>
    </tr>
  );
}
