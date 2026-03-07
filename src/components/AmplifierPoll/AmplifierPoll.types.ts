export interface VoteOption {
  option: string;
  value: number;
  voters?: string[];
  i?: number;
}

export interface PollVote {
  voter?: string;
  vote?: boolean;
  height?: number;
  id?: string;
  created_at?: number;
  option?: string;
  confirmed?: boolean;
  verifierData?: VerifierEntry;
}

export interface VerifierEntry {
  address?: string;
  [key: string]: unknown;
}

export interface Timestamp {
  ms?: number;
}

export interface AmplifierPollData {
  poll_id?: string;
  contract_address?: string;
  transaction_id?: string;
  event_index?: number;
  sender_chain?: string;
  status?: string;
  height?: number;
  initiated_txhash?: string;
  confirmation_txhash?: string;
  completed_txhash?: string;
  expired_height?: number;
  participants?: string[];
  voteOptions?: VoteOption[];
  votes?: PollVote[];
  created_at?: Timestamp;
  updated_at?: Timestamp;
  success?: boolean;
  failed?: boolean;
  expired?: boolean;
  url?: string;
  [key: string]: unknown;
}

export interface RPCStatusData {
  latest_block_height?: number;
  [key: string]: unknown;
}

export interface InfoProps {
  data: AmplifierPollData;
  id: string;
}

export interface VotesProps {
  data: AmplifierPollData;
}

export interface AmplifierPollProps {
  id: string;
}

/**
 * Maps a vote option string to a sort index.
 * 'yes' = 0, 'no' = 1, everything else = 2.
 */
export function getVoteOptionIndex(option: string): number {
  if (option === 'yes') return 0;
  if (option === 'no') return 1;
  return 2;
}

/**
 * Derives a vote label from a boolean vote value.
 * true = 'yes', false = 'no', undefined = 'unsubmitted'.
 */
export function getVoteLabel(vote: boolean | undefined): string {
  if (vote === true) return 'yes';
  if (vote === false) return 'no';
  return 'unsubmitted';
}

/**
 * Returns the style class for a vote option tag.
 */
export function getVoteOptionStyle(
  option: string,
  styles: { voteOptionNo: string; voteOptionYes: string; voteOptionDefault: string },
): string {
  if (option === 'no') return styles.voteOptionNo;
  if (option === 'yes') return styles.voteOptionYes;
  return styles.voteOptionDefault;
}

/**
 * Returns the style class for a poll status tag.
 */
export function getStatusStyle(
  status: string,
  styles: {
    statusCompleted: string;
    statusFailed: string;
    statusExpired: string;
    statusPending: string;
  },
): string {
  if (status === 'completed') return styles.statusCompleted;
  if (status === 'failed') return styles.statusFailed;
  if (status === 'expired') return styles.statusExpired;
  return styles.statusPending;
}

/**
 * Derives a poll status from the poll data fields and current block height.
 */
export function derivePollStatus(
  data: Pick<AmplifierPollData, 'success' | 'failed' | 'expired' | 'expired_height'>,
  latestBlockHeight: number,
): string {
  if (data.success) return 'completed';
  if (data.failed) return 'failed';
  if (data.expired || (data.expired_height ?? 0) < latestBlockHeight) return 'expired';
  return 'pending';
}

/**
 * Returns the abbreviated suffix for a vote option in participant counts.
 * 'unsubmitted' => first 2 chars ('Un'), others => first 1 char ('Y', 'N').
 */
export function getVoteOptionSuffix(option: string): string {
  const length = option === 'unsubmitted' ? 2 : 1;
  return option.substring(0, length);
}
