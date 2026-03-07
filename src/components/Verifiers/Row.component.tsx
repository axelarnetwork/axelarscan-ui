import clsx from 'clsx';

import { Image } from '@/components/Image';
import { Tooltip } from '@/components/Tooltip';
import { Profile } from '@/components/Profile';
import { isString } from '@/lib/string';
import type { Chain } from '@/types';

import { ChainStats } from './ChainStats.component';
import type { VerifierRowProps, ChainVoteData, ChainSignData } from './Verifiers.types';
import * as styles from './Verifiers.styles';

interface ChainCellProps {
  chainEntry: Chain | string;
  votesChains: Record<string, ChainVoteData>;
  signsChains: Record<string, ChainSignData>;
  supportedChains: string[];
}

function ChainCell({ chainEntry, votesChains, signsChains, supportedChains }: ChainCellProps) {
  const { id: chain, name, image } = {
    ...(isString(chainEntry) ? { id: chainEntry, name: chainEntry } : chainEntry),
  } as { id: string; name: string; image?: string };

  const votes = votesChains[chain];
  const chainSigns = signsChains[chain];
  const isSupported = supportedChains.includes(chain);

  return (
    <div key={chain} className={styles.chainItem}>
      <div className={styles.chainInner}>
        <Tooltip
          content={`${name}${!isSupported ? `: Not Supported` : ''}`}
          className="whitespace-nowrap"
        >
          {image ? (
            <Image src={image} alt="" width={20} height={20} />
          ) : (
            <span className={styles.chainName}>{name}</span>
          )}
        </Tooltip>
        {!isSupported ? (
          <span className={styles.notSupported}>Not Supported</span>
        ) : (
          <ChainStats
            chain={chain}
            votes={votes}
            signs={chainSigns}
            signsTotal={signsChains[chain]?.total ?? 0}
            totalProofs={chainSigns?.total_proofs ?? 0}
          />
        )}
      </div>
    </div>
  );
}

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
