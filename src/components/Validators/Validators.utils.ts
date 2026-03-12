import _ from 'lodash';

import { fetchChains } from '@/lib/queries/chainQueries';
import { fetchValidators } from '@/lib/queries/validatorQueries';
import {
  fetchInflationData,
  fetchNetworkParameters,
} from '@/lib/queries/networkQueries';
import { getValidatorsVotes, getChainMaintainers } from '@/lib/api/validator';
import { toArray } from '@/lib/parser';
import { equalsIgnoreCase, find } from '@/lib/string';
import { isNumber, toNumber, formatUnits, toFixed } from '@/lib/number';
import type {
  Chain,
  Validator,
  InflationData,
  NetworkParameters,
  ValidatorsVotesResponse,
} from '@/types';

import type { ValidatorsPageData } from './Validators.types';

export function getEVMChains(chains: Chain[]): Chain[] {
  return chains.filter(
    (d: Chain) =>
      d.chain_type === 'evm' && d.gateway?.address && !d.no_inflation
  );
}

export function processValidators(
  validators: Validator[],
  inflationData: InflationData,
  networkParameters: NetworkParameters,
  maintainers: Record<string, string[]>,
  validatorsVotes: ValidatorsVotesResponse
): Validator[] {
  const {
    tendermintInflationRate,
    keyMgmtRelativeInflationRate,
    externalChainVotingInflationRate,
    communityTax,
  } = inflationData;
  const { bankSupply, stakingPool } = networkParameters;

  return validators.map((d: Validator) => {
    const { rate } = { ...d.commission?.commission_rates };

    if (validatorsVotes?.data) {
      d.total_polls = toNumber(validatorsVotes.total);
      const vvData = validatorsVotes.data;
      d.votes = { ...vvData[d.broadcaster_address as string] };
      const dVotes = d.votes as Record<string, unknown>;
      d.total_votes = toNumber(dVotes.total);

      const getVoteCount = (
        vote: boolean | string,
        votes: Record<string, unknown>
      ) =>
        _.sum(
          Object.values({ ...votes }).map((v: unknown) =>
            toNumber(
              _.last(
                Object.entries({
                  ...((v as Record<string, unknown>)?.votes as Record<
                    string,
                    unknown
                  >),
                }).find(([k]) => equalsIgnoreCase(k, vote?.toString()))
              )
            )
          )
        );

      d.total_yes_votes = getVoteCount(
        true,
        dVotes.chains as Record<string, unknown>
      );
      d.total_no_votes = getVoteCount(
        false,
        dVotes.chains as Record<string, unknown>
      );
      d.total_unsubmitted_votes = getVoteCount(
        'unsubmitted',
        dVotes.chains as Record<string, unknown>
      );
    }

    const supportedChains = Object.entries({ ...maintainers })
      .filter(([_k, v]) => find(d.operator_address, v))
      .map(([k]) => k);

    const inflation = toFixed(
      ((d.uptime as number) / 100) * toNumber(tendermintInflationRate) +
        (isNumber(d.heartbeats_uptime)
          ? (d.heartbeats_uptime as number) / 100
          : 1) *
          toNumber(keyMgmtRelativeInflationRate) *
          toNumber(tendermintInflationRate) +
        toNumber(externalChainVotingInflationRate) *
          _.sum(
            supportedChains.map((c: string) => {
              const { total, total_polls } = {
                ...(
                  (d.votes as Record<string, unknown>)?.chains as
                    | Record<string, Record<string, unknown>>
                    | undefined
                )?.[c],
              } as Record<string, unknown>;
              return (
                1 -
                (total_polls
                  ? ((total_polls as number) - (total as number)) /
                    (total_polls as number)
                  : 0)
              );
            })
          ),
      6
    );

    return {
      ...d,
      inflation,
      apr:
        ((inflation as unknown as number) *
          100 *
          (formatUnits(bankSupply?.amount as string, 6) as number) *
          (1 - toNumber(communityTax)) *
          (1 - toNumber(rate))) /
        (formatUnits(stakingPool?.bonded_tokens as string, 6) as number),
      supportedChains,
      votes: d.votes && {
        ...(d.votes as Record<string, unknown>),
        chains: Object.fromEntries(
          Object.entries({
            ...((d.votes as Record<string, unknown>).chains as Record<
              string,
              unknown
            >),
          }).filter(([k]) => find(k, supportedChains))
        ),
      },
    };
  });
}

export async function fetchValidatorsPageData(): Promise<ValidatorsPageData | null> {
  const [
    chains,
    validators,
    inflationData,
    networkParameters,
    validatorsVotes,
  ] = await Promise.all([
    fetchChains(),
    fetchValidators(),
    fetchInflationData(),
    fetchNetworkParameters(),
    getValidatorsVotes() as Promise<ValidatorsVotesResponse | null>,
  ]);

  if (
    !chains ||
    !validators ||
    !inflationData ||
    !networkParameters ||
    !validatorsVotes
  ) {
    return null;
  }

  const evmChains = getEVMChains(chains);

  const maintainerEntries = await Promise.all(
    evmChains.map(async d => {
      const response = await getChainMaintainers({ chain: d.id });
      const { maintainers } = { ...(response as Record<string, unknown>) };
      return [d.id, toArray(maintainers) as string[]] as const;
    })
  );

  const maintainers = Object.fromEntries(maintainerEntries);
  const processed = processValidators(
    validators,
    inflationData,
    networkParameters,
    maintainers,
    validatorsVotes
  );

  return { validators: processed, chains };
}
