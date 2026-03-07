import clsx from 'clsx';
import _ from 'lodash';

import { Number } from '@/components/Number';
import { toArray } from '@/lib/parser';
import { toTitle } from '@/lib/string';
import { numberFormat } from '@/lib/number';
import { timeDiff } from '@/lib/time';

import type { ParticipantOptionProps } from './EVMPoll.types';
import * as styles from './EVMPoll.styles';

export function ParticipantOption({
  option,
  validators,
  totalParticipantsPower,
  createdAtMs,
  index,
}: ParticipantOptionProps) {
  const totalVotersPower = _.sumBy(
    validators.filter(d =>
      toArray(option.voters).includes(d.broadcaster_address!)
    ),
    'quadratic_voting_power'
  );

  const powerDisplay =
    totalVotersPower > 0 && totalParticipantsPower > 0
      ? `${numberFormat(totalVotersPower, '0,0.0a')} (${numberFormat((totalVotersPower * 100) / totalParticipantsPower, '0,0.0')}%)`
      : '';
  const isDisplayPower = powerDisplay && timeDiff(createdAtMs, 'days') < 3;

  const optionAbbrev = option.option.substring(
    0,
    option.option === 'unsubmitted' ? 2 : 1
  );

  return (
    <Number
      key={index}
      value={option.value}
      format="0,0"
      suffix={` ${toTitle(optionAbbrev)}${isDisplayPower ? `: ${powerDisplay}` : ''}`}
      noTooltip={true}
      className={clsx(styles.voteOptionBase, styles.getVoteOptionStyle(option.option))}
    />
  );
}
