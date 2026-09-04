/**
 * @jest-environment node
 */
import {
  extractMessageSummaries,
  shortMessageType,
  type MessageField,
} from './txMessages';

const addressOf = (fields: MessageField[], label: string) => {
  const field = fields.find(f => f.label === label);
  return field?.kind === 'account' || field?.kind === 'validator'
    ? field.address
    : undefined;
};

const amountOf = (fields: MessageField[], label: string) => {
  const field = fields.find(f => f.label === label);
  return field?.kind === 'amount' ? field.amount : undefined;
};

// Verbatim from mainnet tx
// EBE3974D8AA27DA51C4F83A416A60DB0301548CEFB9733E3275C763523B441D8.
const redelegate = {
  '@type': '/cosmos.staking.v1beta1.MsgBeginRedelegate',
  delegator_address: 'axelar12dry54e2af8m7mvmr4vradgapk78g6mt0r9fds',
  validator_src_address: 'axelarvaloper17q4fqv86dxkes384tnmrvjr9ljp2slunr6k00w',
  validator_dst_address: 'axelarvaloper1qy9uq03rkpqkzwsa4fz7xxetkxttdcj6tf09pg',
  amount: { denom: 'uaxl', amount: '3999595000549' },
};

const wrap = (messages: unknown[]) => ({ tx: { body: { messages } } });

describe('extractMessageSummaries', () => {
  it('reads the four fields that matter out of a redelegation', () => {
    const [summary] = extractMessageSummaries(wrap([redelegate]));

    expect(summary).toEqual({
      index: 0,
      innerIndex: 0,
      type: 'MsgBeginRedelegate',
      label: 'Redelegate',
      fields: [
        {
          label: 'Delegator',
          kind: 'account',
          address: 'axelar12dry54e2af8m7mvmr4vradgapk78g6mt0r9fds',
        },
        {
          label: 'From validator',
          kind: 'validator',
          address: 'axelarvaloper17q4fqv86dxkes384tnmrvjr9ljp2slunr6k00w',
        },
        {
          label: 'To validator',
          kind: 'validator',
          address: 'axelarvaloper1qy9uq03rkpqkzwsa4fz7xxetkxttdcj6tf09pg',
        },
        {
          label: 'Amount',
          kind: 'amount',
          amount: { denom: 'uaxl', amount: '3999595000549' },
        },
      ],
    });
  });

  it('keeps the source and destination validators the right way round', () => {
    const [summary] = extractMessageSummaries(wrap([redelegate]));
    expect(addressOf(summary.fields, 'From validator')).toBe(
      redelegate.validator_src_address
    );
    expect(addressOf(summary.fields, 'To validator')).toBe(
      redelegate.validator_dst_address
    );
  });

  it('marks validators apart from the delegator account', () => {
    // The two render differently: a validator needs the axelarvaloper prefix,
    // without which Profile links to /account instead of /validator.
    const [summary] = extractMessageSummaries(wrap([redelegate]));
    const kinds = Object.fromEntries(
      summary.fields.map(f => [f.label, f.kind])
    );

    expect(kinds).toEqual({
      Delegator: 'account',
      'From validator': 'validator',
      'To validator': 'validator',
      Amount: 'amount',
    });
  });

  it('handles delegate and undelegate, which name the validator differently', () => {
    const delegate = {
      '@type': '/cosmos.staking.v1beta1.MsgDelegate',
      delegator_address: 'axelar1delegator',
      validator_address: 'axelarvaloper1target',
      amount: { denom: 'uaxl', amount: '1000000' },
    };

    expect(extractMessageSummaries(wrap([delegate]))[0]).toMatchObject({
      label: 'Delegate',
      fields: [
        { label: 'Delegator', kind: 'account', address: 'axelar1delegator' },
        {
          label: 'Validator',
          kind: 'validator',
          address: 'axelarvaloper1target',
        },
        {
          label: 'Amount',
          kind: 'amount',
          amount: { denom: 'uaxl', amount: '1000000' },
        },
      ],
    });

    expect(
      extractMessageSummaries(
        wrap([
          { ...delegate, '@type': '/cosmos.staking.v1beta1.MsgUndelegate' },
        ])
      )[0]
    ).toMatchObject({ label: 'Undelegate' });
  });

  it('numbers each message so one transaction can carry several', () => {
    const summaries = extractMessageSummaries(
      wrap([redelegate, { '@type': 'unknown' }, redelegate])
    );

    // The unrecognised message is skipped, but the index still points at the
    // real position in tx.body.messages.
    expect(summaries.map(s => s.index)).toEqual([0, 2]);
  });

  it('skips message types it does not know', () => {
    expect(
      extractMessageSummaries(
        wrap([{ '@type': '/cosmos.bank.v1beta1.MsgSend', amount: [] }])
      )
    ).toEqual([]);
  });

  it('skips a recognised message with nothing readable in it', () => {
    // Better to show nothing than a row of empty labels; the JSON is below.
    expect(
      extractMessageSummaries(
        wrap([{ '@type': '/cosmos.staking.v1beta1.MsgDelegate' }])
      )
    ).toEqual([]);
  });

  it('survives malformed input rather than throwing', () => {
    expect(extractMessageSummaries(undefined)).toEqual([]);
    expect(extractMessageSummaries(null)).toEqual([]);
    expect(extractMessageSummaries({})).toEqual([]);
    expect(extractMessageSummaries(wrap([null, 'a string', 42]))).toEqual([]);
    expect(
      extractMessageSummaries({ tx: { body: { messages: 'nope' } } })
    ).toEqual([]);
  });

  it('ignores an amount that is not the expected shape', () => {
    const noAmount = extractMessageSummaries(
      wrap([{ ...redelegate, amount: { denom: 'uaxl' } }])
    )[0];

    expect(noAmount.fields.map(f => f.label)).not.toContain('Amount');
    // The addresses still come through.
    expect(noAmount.fields).toHaveLength(3);
  });

  it('drops an amount that has no denom, which would render without a unit', () => {
    const [summary] = extractMessageSummaries(
      wrap([{ ...redelegate, amount: { amount: '5' } }])
    );

    expect(amountOf(summary.fields, 'Amount')).toBeUndefined();
  });

  it('drops a non-numeric amount rather than letting it reach formatUnits', () => {
    // formatUnits throws on input it cannot parse, and there is no error
    // boundary above this - it would blank the whole transaction page.
    for (const bad of ['abc', '', '1.2.3', '0x10', ' 5']) {
      const [summary] = extractMessageSummaries(
        wrap([{ ...redelegate, amount: { denom: 'uaxl', amount: bad } }])
      );
      expect(amountOf(summary.fields, 'Amount')).toBeUndefined();
    }

    expect(
      amountOf(extractMessageSummaries(wrap([redelegate]))[0].fields, 'Amount')
    ).toEqual({ denom: 'uaxl', amount: '3999595000549' });
  });

  it('does not resolve an @type off Object.prototype', () => {
    for (const bad of ['constructor', '__proto__', 'toString', 'valueOf']) {
      expect(extractMessageSummaries(wrap([{ '@type': bad }]))).toEqual([]);
    }
  });

  it('keeps the raw position when an earlier message is blank', () => {
    // The index has to match the raw JSON below, so blanks must not shift it.
    const summaries = extractMessageSummaries(wrap([null, redelegate]));

    expect(summaries.map(s => s.index)).toEqual([1]);
  });
});

describe('shortMessageType', () => {
  it('takes the last segment of the type url', () => {
    expect(shortMessageType('/cosmos.staking.v1beta1.MsgBeginRedelegate')).toBe(
      'MsgBeginRedelegate'
    );
  });

  it('returns the input unchanged when there is nothing to strip', () => {
    expect(shortMessageType('MsgDelegate')).toBe('MsgDelegate');
  });
});

// --- Axelar validator traffic -------------------------------------------
// Nearly every transaction on the chain is a RefundMsgRequest envelope: the
// wrapper validators use so x/reward refunds their gas. Payloads below are
// verbatim from mainnet, trimmed only where noted.

const refundWrapped = (inner: unknown, sender = 'axelar1rym08uqf') => ({
  '@type': '/axelar.reward.v1beta1.RefundMsgRequest',
  sender_deprecated: '',
  inner_message: inner,
  sender,
});

describe('wrapped validator messages', () => {
  const voteRequest = {
    '@type': '/axelar.vote.v1beta1.VoteRequest',
    sender_deprecated: '',
    poll_key: null,
    vote_deprecated: null,
    poll_id: '1606705',
    vote: {
      '@type': '/axelar.evm.v1beta1.VoteEvents',
      chain: 'Avalanche',
      events: [
        {
          chain: 'Avalanche',
          // tx_id arrives as a JSON array of bytes, not a hex string.
          tx_id: [
            207, 182, 229, 190, 195, 62, 45, 105, 36, 33, 113, 222, 76, 219,
            109, 79, 90, 87, 85, 57, 10, 34, 254, 187, 41, 253, 21, 194, 180,
            136, 128, 225,
          ],
          index: '1',
          // Every gateway event voted on in practice is a contract call, which
          // is what makes the source transaction a GMP message.
          contract_call: {
            destination_chain: 'arbitrum-sepolia',
            contract_address: '0x57f3A1305010D7c88A83D48f00D7E2b80E990245',
          },
        },
      ],
    },
  };

  it('looks through the refund envelope to the message inside it', () => {
    const [summary] = extractMessageSummaries(
      wrap([refundWrapped(voteRequest)])
    );

    expect(summary.type).toBe('VoteRequest');
    expect(summary.label).toBe('Vote');
    // The envelope is still named, so the section matches the raw JSON.
    expect(summary.wrappedIn).toBe('RefundMsgRequest');
  });

  it('reads a validator vote: which poll, which chain, what was voted on', () => {
    const [summary] = extractMessageSummaries(
      wrap([refundWrapped(voteRequest)])
    );
    const byLabel = Object.fromEntries(summary.fields.map(f => [f.label, f]));

    expect(byLabel.Poll).toEqual({
      label: 'Poll',
      kind: 'link',
      text: '1606705',
      href: '/evm-poll/1606705',
    });
    expect(byLabel.Chain).toEqual({
      label: 'Chain',
      kind: 'chain',
      chain: 'Avalanche',
    });
    expect(byLabel.Voted.kind === 'text' && byLabel.Voted.text).toBe(
      '1 event confirmed'
    );
    // The byte array is decoded to the hash you can paste into an explorer.
    expect(byLabel['Source transaction']).toEqual({
      label: 'Source transaction',
      kind: 'hash',
      hashes: [
        '0xcfb6e5bec33e2d69242171de4cdb6d4f5a5755390a22febb29fd15c2b48880e1',
      ],
      chain: 'Avalanche',
      // Every gateway event voted on is a contract call, so the hash doubles
      // as a link to the cross-chain message.
      gmp: true,
    });
  });

  it('takes the voter from the envelope, which is where the signer is', () => {
    // The inner VoteRequest leaves its own sender empty.
    const [summary] = extractMessageSummaries(
      wrap([refundWrapped(voteRequest, 'axelar12d0sk3zvh')])
    );

    expect(addressOf(summary.fields, 'Voter')).toBe('axelar12d0sk3zvh');
  });

  it('says plainly when a validator voted that nothing happened', () => {
    const noEvents = {
      ...voteRequest,
      vote: { ...voteRequest.vote, events: [] },
    };
    const [summary] = extractMessageSummaries(wrap([refundWrapped(noEvents)]));
    const voted = summary.fields.find(f => f.label === 'Voted');

    expect(voted?.kind === 'text' && voted.text).toBe('No event found');
    // Nothing to link to, so no empty hash row.
    expect(summary.fields.map(f => f.label)).not.toContain(
      'Source transaction'
    );
  });

  it('reads the hex-string form of tx_id that the LCD actually returns', () => {
    // The indexer API returns tx_id as an array of byte values, but the LCD the
    // page fetches from returns it already hex encoded. Both must work.
    const lcdShape = {
      ...voteRequest,
      vote: {
        ...voteRequest.vote,
        events: [
          {
            chain: 'Avalanche',
            tx_id:
              '0xcfb6e5bec33e2d69242171de4cdb6d4f5a5755390a22febb29fd15c2b48880e1',
            contract_call: {},
          },
        ],
      },
    };
    const [summary] = extractMessageSummaries(wrap([refundWrapped(lcdShape)]));
    const hashes = summary.fields.find(f => f.label === 'Source transaction');

    expect(hashes?.kind === 'hash' && hashes.hashes).toEqual([
      '0xcfb6e5bec33e2d69242171de4cdb6d4f5a5755390a22febb29fd15c2b48880e1',
    ]);
  });

  it('describes the request that starts a confirmation poll', () => {
    const [summary] = extractMessageSummaries(
      wrap([
        {
          '@type': '/axelar.evm.v1beta1.ConfirmGatewayTxsRequest',
          chain: 'avalanche',
          tx_ids: [[207, 182, 229, 190]],
          sender: 'axelar1a5da6786f',
        },
      ])
    );

    expect(summary.label).toBe('Start confirmation poll');
    const hashes = summary.fields.find(f => f.label === 'Transactions');
    expect(hashes?.kind === 'hash' && hashes.hashes).toEqual(['0xcfb6e5be']);
  });

  it('describes a submitted signature', () => {
    const [summary] = extractMessageSummaries(
      wrap([
        refundWrapped({
          '@type': '/axelar.multisig.v1beta1.SubmitSignatureRequest',
          sig_id: '985668',
          signature: 'MEQCIH5Ayu...',
        }),
      ])
    );

    expect(summary.label).toBe('Submit signature');
    const id = summary.fields.find(f => f.label === 'Signature ID');
    expect(id?.kind === 'text' && id.text).toBe('985668');
  });

  it('leaves an envelope alone when it wraps something unrecognised', () => {
    expect(
      extractMessageSummaries(
        wrap([refundWrapped({ '@type': '/axelar.some.v1beta1.FutureRequest' })])
      )
    ).toEqual([]);
  });
});

describe('messages a person sends themselves', () => {
  it('lists every coin on a bank send', () => {
    const [summary] = extractMessageSummaries(
      wrap([
        {
          '@type': '/cosmos.bank.v1beta1.MsgSend',
          from_address: 'axelar17ennqrgy3',
          to_address: 'axelar1eep5lc06g',
          amount: [
            { denom: 'uaxl', amount: '99291' },
            { denom: 'uusdc', amount: '5' },
          ],
        },
      ])
    );

    // Repeated coins get numbered so two rows cannot collide on their label.
    expect(summary.fields.map(f => f.label)).toEqual([
      'From',
      'To',
      'Amount 1',
      'Amount 2',
    ]);
    expect(amountOf(summary.fields, 'Amount 1')).toEqual({
      denom: 'uaxl',
      amount: '99291',
    });
  });

  it('does not number a single coin', () => {
    const [summary] = extractMessageSummaries(
      wrap([
        {
          '@type': '/cosmos.bank.v1beta1.MsgSend',
          from_address: 'axelar17ennqrgy3',
          to_address: 'axelar1eep5lc06g',
          amount: [{ denom: 'uaxl', amount: '99291' }],
        },
      ])
    );

    expect(summary.fields.map(f => f.label)).toEqual(['From', 'To', 'Amount']);
  });

  it('reads a governance vote and spells the option out', () => {
    const [summary] = extractMessageSummaries(
      wrap([
        {
          '@type': '/cosmos.gov.v1.MsgVote',
          proposal_id: '637',
          voter: 'axelar19a73rahc7',
          option: 'VOTE_OPTION_YES',
        },
      ])
    );

    const proposal = summary.fields.find(f => f.label === 'Proposal');
    const option = summary.fields.find(f => f.label === 'Option');
    expect(proposal?.kind === 'link' && proposal.href).toBe('/proposal/637');
    expect(option?.kind === 'text' && option.text).toBe('Yes');
  });

  it('reads an IBC transfer', () => {
    const [summary] = extractMessageSummaries(
      wrap([
        {
          '@type': '/ibc.applications.transfer.v1.MsgTransfer',
          source_channel: 'channel-612',
          token: { denom: 'uaxl', amount: '500000' },
          sender: 'axelar1n76jdx557',
          receiver: 'zig1n76jdx557',
        },
      ])
    );

    expect(summary.label).toBe('IBC transfer');
    expect(amountOf(summary.fields, 'Token')).toEqual({
      denom: 'uaxl',
      amount: '500000',
    });
  });
});

describe('gaps the first round of review found', () => {
  it('reads the sender older validators still put in sender_deprecated', () => {
    // Real shape, tx 10DFCC226A7A5DE518CB980ABB5EC7FD9F30F9F405D094DB6F139D0920F79D6C:
    // both the envelope and the inner message leave `sender` empty.
    const [summary] = extractMessageSummaries(
      wrap([
        {
          '@type': '/axelar.reward.v1beta1.RefundMsgRequest',
          sender: '',
          sender_deprecated: 'axelar17xh2ka3jll',
          inner_message: {
            '@type': '/axelar.multisig.v1beta1.SubmitSignatureRequest',
            sender: '',
            sender_deprecated: 'axelar17xh2ka3jll',
            sig_id: '1859477',
          },
        },
      ])
    );

    expect(addressOf(summary.fields, 'Signer')).toBe('axelar17xh2ka3jll');
  });

  it('shows one source transaction when a vote covers several events', () => {
    // A poll covers a single source transaction, so a multicall tx produces
    // several events all carrying the same tx_id. Repeating it would also give
    // two rows the same React key.
    const [summary] = extractMessageSummaries(
      wrap([
        refundWrapped({
          '@type': '/axelar.vote.v1beta1.VoteRequest',
          poll_id: '1',
          vote: {
            '@type': '/axelar.evm.v1beta1.VoteEvents',
            chain: 'Avalanche',
            events: [
              { tx_id: '0xabc', contract_call: {} },
              { tx_id: '0xabc', contract_call: {} },
            ],
          },
        }),
      ])
    );
    const hashes = summary.fields.find(f => f.label === 'Source transaction');

    expect(hashes?.kind === 'hash' && hashes.hashes).toEqual(['0xabc']);
    const voted = summary.fields.find(f => f.label === 'Voted');
    expect(voted?.kind === 'text' && voted.text).toBe('2 events confirmed');
  });

  it('ignores a byte field that is not hex, which would link nowhere', () => {
    const [summary] = extractMessageSummaries(
      wrap([
        {
          '@type': '/axelar.evm.v1beta1.ConfirmGatewayTxsRequest',
          chain: 'avalanche',
          tx_ids: ['z7blvsM+LWkkIXHeTNttT1pXVTkKIv67Kf0VwrSIgOE='],
          sender: 'axelar1a5da6786f',
        },
      ])
    );

    expect(summary.fields.map(f => f.label)).not.toContain('Transactions');
  });

  it('unwraps a BatchRequest, which carries an array of messages', () => {
    const summaries = extractMessageSummaries(
      wrap([
        {
          '@type': '/axelar.auxiliary.v1beta1.BatchRequest',
          sender: 'axelar1batchsender',
          messages: [
            {
              '@type': '/axelar.multisig.v1beta1.SubmitSignatureRequest',
              sig_id: '1',
            },
            {
              '@type': '/axelar.multisig.v1beta1.SubmitSignatureRequest',
              sig_id: '2',
            },
          ],
        },
      ])
    );

    expect(summaries).toHaveLength(2);
    expect(summaries.map(s => s.wrappedIn)).toEqual([
      'BatchRequest',
      'BatchRequest',
    ]);
    // Both keep the raw message index so they line up with the JSON, but they
    // are told apart by innerIndex - without it two identical calls in one
    // batch would collide on the React key that renders them.
    expect(summaries.map(s => s.index)).toEqual([0, 0]);
    expect(summaries.map(s => s.innerIndex)).toEqual([0, 1]);
    expect(addressOf(summaries[0].fields, 'Signer')).toBe('axelar1batchsender');
  });

  it('reads the older governance vote type as well as the current one', () => {
    for (const type of [
      '/cosmos.gov.v1.MsgVote',
      '/cosmos.gov.v1beta1.MsgVote',
    ]) {
      const [summary] = extractMessageSummaries(
        wrap([
          {
            '@type': type,
            proposal_id: '497',
            voter: 'axelar1qk9',
            option: 'VOTE_OPTION_YES',
          },
        ])
      );
      expect(summary.label).toBe('Governance vote');
      const option = summary.fields.find(f => f.label === 'Option');
      expect(option?.kind === 'text' && option.text).toBe('Yes');
    }
  });

  it('reads the singular confirm request, which carries tx_id not tx_ids', () => {
    const [summary] = extractMessageSummaries(
      wrap([
        {
          '@type': '/axelar.evm.v1beta1.ConfirmGatewayTxRequest',
          chain: 'ethereum',
          tx_id: [1, 2, 3],
          sender: 'axelar1sender',
        },
      ])
    );
    const hashes = summary.fields.find(f => f.label === 'Transaction');

    expect(summary.label).toBe('Start confirmation poll');
    expect(hashes?.kind === 'hash' && hashes.hashes).toEqual(['0x010203']);
  });

  it('describes the remaining handlers end to end', () => {
    const cases: [Record<string, unknown>, string, string[]][] = [
      [
        {
          '@type': '/axelar.evm.v1beta1.SignCommandsRequest',
          chain: 'base',
          sender: 'axelar1signer',
        },
        'Sign commands',
        ['Chain', 'Sender'],
      ],
      [
        {
          '@type': '/cosmos.distribution.v1beta1.MsgWithdrawDelegatorReward',
          delegator_address: 'axelar1del',
          validator_address: 'axelarvaloper1val',
        },
        'Withdraw rewards',
        ['Delegator', 'Validator'],
      ],
    ];

    for (const [message, label, labels] of cases) {
      const [summary] = extractMessageSummaries(wrap([message]));
      expect(summary.label).toBe(label);
      expect(summary.fields.map(f => f.label)).toEqual(labels);
    }
  });

  it('keeps every field of an IBC transfer, not just the token', () => {
    const [summary] = extractMessageSummaries(
      wrap([
        {
          '@type': '/ibc.applications.transfer.v1.MsgTransfer',
          source_channel: 'channel-612',
          token: { denom: 'uaxl', amount: '500000' },
          sender: 'axelar1n76jdx557',
          receiver: 'zig1n76jdx557',
        },
      ])
    );
    const byLabel = Object.fromEntries(summary.fields.map(f => [f.label, f]));

    expect(addressOf(summary.fields, 'Sender')).toBe('axelar1n76jdx557');
    expect(byLabel.Receiver.kind === 'text' && byLabel.Receiver.text).toBe(
      'zig1n76jdx557'
    );
    expect(byLabel.Channel.kind === 'text' && byLabel.Channel.text).toBe(
      'channel-612'
    );
  });

  it('keeps a single coin that arrives as an object rather than a list', () => {
    const [summary] = extractMessageSummaries(
      wrap([
        {
          '@type': '/cosmos.bank.v1beta1.MsgSend',
          from_address: 'axelar1from',
          to_address: 'axelar1to',
          amount: { denom: 'uaxl', amount: '5' },
        },
      ])
    );

    expect(amountOf(summary.fields, 'Amount')).toEqual({
      denom: 'uaxl',
      amount: '5',
    });
  });
});

describe('amplifier and routing traffic', () => {
  it('names the action inside a CosmWasm execute payload', () => {
    // The payload is base64 JSON whose single top level key is the action.
    // This is how an amplifier poll identifies itself.
    const msg = Buffer.from(
      JSON.stringify({ verify_messages: [{ cc_id: {} }] })
    ).toString('base64');
    const [summary] = extractMessageSummaries(
      wrap([
        {
          '@type': '/cosmwasm.wasm.v1.MsgExecuteContract',
          contract: 'axelar1votingverifier',
          sender: 'axelar1sender',
          msg,
        },
      ])
    );
    const action = summary.fields.find(f => f.label === 'Action');

    expect(summary.label).toBe('Contract call');
    expect(action?.kind === 'text' && action.text).toBe('Verify Messages');
    expect(addressOf(summary.fields, 'Contract')).toBe('axelar1votingverifier');
  });

  it('still describes a contract call whose payload cannot be decoded', () => {
    const [summary] = extractMessageSummaries(
      wrap([
        {
          '@type': '/cosmwasm.wasm.v1.MsgExecuteContract',
          contract: 'axelar1contract',
          sender: 'axelar1sender',
          msg: 'not base64 json',
        },
      ])
    );

    expect(summary.fields.map(f => f.label)).toEqual(['Contract', 'Sender']);
  });

  it('links a routed GMP message to its own page', () => {
    const [summary] = extractMessageSummaries(
      wrap([
        {
          '@type': '/axelar.axelarnet.v1beta1.RouteMessageRequest',
          id: '0xe1574cc1159f6ef7dcaa7b4e48ae989ff995f9eb54014eca839a2f61a4c07a34-6',
          sender: 'axelar1router',
        },
      ])
    );
    const link = summary.fields.find(f => f.label === 'Message');

    expect(summary.label).toBe('Route message');
    expect(link?.kind === 'link' && link.href).toBe(
      '/gmp/0xe1574cc1159f6ef7dcaa7b4e48ae989ff995f9eb54014eca839a2f61a4c07a34-6'
    );
  });
});

describe('links to the cross-chain message', () => {
  const gmpFlagOf = (fields: MessageField[], label: string) => {
    const field = fields.find(f => f.label === label);
    return field?.kind === 'hash' ? field.gmp : undefined;
  };

  it('marks vote and poll hashes as GMP calls', () => {
    const [vote] = extractMessageSummaries(
      wrap([
        refundWrapped({
          '@type': '/axelar.vote.v1beta1.VoteRequest',
          poll_id: '1',
          vote: {
            '@type': '/axelar.evm.v1beta1.VoteEvents',
            chain: 'Avalanche',
            events: [{ tx_id: '0xabc', contract_call: {} }],
          },
        }),
      ])
    );
    expect(gmpFlagOf(vote.fields, 'Source transaction')).toBe(true);

    const [poll] = extractMessageSummaries(
      wrap([
        {
          '@type': '/axelar.evm.v1beta1.ConfirmGatewayTxsRequest',
          chain: 'avalanche',
          tx_ids: [[1, 2, 3]],
        },
      ])
    );
    expect(gmpFlagOf(poll.fields, 'Transactions')).toBe(true);
  });

  it('marks the singular confirm request too', () => {
    const [summary] = extractMessageSummaries(
      wrap([
        {
          '@type': '/axelar.evm.v1beta1.ConfirmGatewayTxRequest',
          chain: 'ethereum',
          tx_id: [1, 2, 3],
        },
      ])
    );

    expect(gmpFlagOf(summary.fields, 'Transaction')).toBe(true);
  });
});

describe('shapes the LCD actually sends', () => {
  it('reads a contract action from an already decoded msg object', () => {
    // The LCD returns msg decoded; base64 is only what the raw protobuf holds.
    // Real mainnet actions look like this one, not "verify_messages".
    const [summary] = extractMessageSummaries(
      wrap([
        {
          '@type': '/cosmwasm.wasm.v1.MsgExecuteContract',
          contract: 'axelar1multisig',
          sender: 'axelar1signer',
          msg: { submit_signature: { session_id: '50488' } },
        },
      ])
    );
    const action = summary.fields.find(f => f.label === 'Action');

    expect(action?.kind === 'text' && action.text).toBe('Submit Signature');
  });

  it('does not link a vote to /gmp when the event is not a contract call', () => {
    // A gateway confirmation can be a token transfer, which has no GMP page.
    const [summary] = extractMessageSummaries(
      wrap([
        refundWrapped({
          '@type': '/axelar.vote.v1beta1.VoteRequest',
          poll_id: '1',
          vote: {
            '@type': '/axelar.evm.v1beta1.VoteEvents',
            chain: 'Ethereum',
            events: [{ tx_id: '0xabc', transfer: { to: '0x1' } }],
          },
        }),
      ])
    );
    const hashes = summary.fields.find(f => f.label === 'Source transaction');

    expect(hashes?.kind === 'hash' && hashes.hashes).toEqual(['0xabc']);
    expect(hashes?.kind === 'hash' && hashes.gmp).toBe(false);
  });
});

describe('IBC packet lifecycle', () => {
  // Verbatim from testnet, proofs and the client update stripped.
  const packet = (overrides: Record<string, unknown> = {}) => ({
    sequence: '209',
    source_port: 'transfer',
    source_channel: 'channel-612',
    destination_port: 'transfer',
    destination_channel: 'channel-0',
    data: Buffer.from(
      JSON.stringify({
        denom: 'uaxl',
        amount: '1',
        sender: 'axelar1dv4u5k73pzqrxlzujxg3qp8kvc3pje7j',
        receiver: 'zig1n76jdx557exce9s0ule2usynfvpykj9fm7mn22',
      })
    ).toString('base64'),
    ...overrides,
  });

  it('describes a received packet, reading the transfer inside it', () => {
    const [summary] = extractMessageSummaries(
      wrap([
        {
          '@type': '/ibc.core.channel.v1.MsgRecvPacket',
          packet: packet(),
          signer: 'axelar139wppx205',
        },
      ])
    );
    const byLabel = Object.fromEntries(summary.fields.map(f => [f.label, f]));

    expect(summary.label).toBe('Receive IBC packet');
    expect(byLabel.Sequence.kind === 'text' && byLabel.Sequence.text).toBe(
      '209'
    );
    expect(byLabel.Channel.kind === 'text' && byLabel.Channel.text).toBe(
      'channel-612 -> channel-0'
    );
    expect(amountOf(summary.fields, 'Amount')).toEqual({
      denom: 'uaxl',
      amount: '1',
    });
    expect(addressOf(summary.fields, 'Relayer')).toBe('axelar139wppx205');
  });

  it('says whether an acknowledgement succeeded', () => {
    const ok = extractMessageSummaries(
      wrap([
        {
          '@type': '/ibc.core.channel.v1.MsgAcknowledgement',
          packet: packet(),
          // {"result":"AQ=="} is how a success is encoded.
          acknowledgement: Buffer.from('{"result":"AQ=="}').toString('base64'),
          signer: 'axelar139wppx205',
        },
      ])
    )[0];
    const result = ok.fields.find(f => f.label === 'Result');

    expect(ok.label).toBe('Acknowledge IBC packet');
    expect(result?.kind === 'text' && result.text).toBe('Success');
  });

  it('surfaces the reason a packet was rejected', () => {
    const failed = extractMessageSummaries(
      wrap([
        {
          '@type': '/ibc.core.channel.v1.MsgAcknowledgement',
          packet: packet(),
          acknowledgement: Buffer.from(
            '{"error":"ABCI code: 1: error handling packet"}'
          ).toString('base64'),
          signer: 'axelar139wppx205',
        },
      ])
    )[0];
    const result = failed.fields.find(f => f.label === 'Result');

    expect(result?.kind === 'text' && result.text).toBe(
      'ABCI code: 1: error handling packet'
    );
  });

  it('describes a timed out packet', () => {
    const [summary] = extractMessageSummaries(
      wrap([
        {
          '@type': '/ibc.core.channel.v1.MsgTimeout',
          packet: packet({ sequence: '201' }),
          next_sequence_recv: '201',
          signer: 'axelar15wnw52zkr',
        },
      ])
    );

    expect(summary.label).toBe('IBC packet timed out');
    expect(addressOf(summary.fields, 'Sender')).toBe(
      'axelar1dv4u5k73pzqrxlzujxg3qp8kvc3pje7j'
    );
  });

  it('still describes a packet whose payload is not a transfer', () => {
    // Not every IBC packet carries a fungible token payload.
    const [summary] = extractMessageSummaries(
      wrap([
        {
          '@type': '/ibc.core.channel.v1.MsgRecvPacket',
          packet: packet({ data: Buffer.from('not json').toString('base64') }),
          signer: 'axelar139wppx205',
        },
      ])
    );

    expect(summary.fields.map(f => f.label)).toEqual([
      'Sequence',
      'Channel',
      'Relayer',
    ]);
  });
});

describe('IBC light client updates', () => {
  // Verbatim from testnet tx 2BB03AC43DE374DA0816D992C64147D4B3CC86003EE83887B73B7B0CF4085E8D,
  // with the validator set and commit signatures stripped.
  const updateClient = {
    '@type': '/ibc.core.client.v1.MsgUpdateClient',
    client_id: '07-tendermint-1163',
    signer: 'axelar139wppx205q2vp3m8ygugyrf8e0xq4whqp2t9nl',
    client_message: {
      '@type': '/ibc.lightclients.tendermint.v1.Header',
      signed_header: {
        header: { chain_id: 'zig-test-2', height: '7493822' },
      },
      trusted_height: { revision_number: '2', revision_height: '7478413' },
    },
  };

  it('reads which chain the client tracks and how far it advanced', () => {
    const [summary] = extractMessageSummaries(wrap([updateClient]));
    const byLabel = Object.fromEntries(summary.fields.map(f => [f.label, f]));

    expect(summary.label).toBe('Update IBC light client');
    expect(byLabel['Counterparty chain']).toEqual({
      label: 'Counterparty chain',
      kind: 'chain',
      chain: 'zig-test-2',
    });
    expect(byLabel.Client.kind === 'text' && byLabel.Client.text).toBe(
      '07-tendermint-1163'
    );
    // The advance is the substance of the message.
    expect(byLabel.Height.kind === 'text' && byLabel.Height.text).toBe(
      '7478413 -> 7493822'
    );
  });

  it('falls back to the new height alone when there is no trusted height', () => {
    const [summary] = extractMessageSummaries(
      wrap([
        {
          ...updateClient,
          client_message: {
            ...updateClient.client_message,
            trusted_height: undefined,
          },
        },
      ])
    );
    const height = summary.fields.find(f => f.label === 'Height');

    expect(height?.kind === 'text' && height.text).toBe('7493822');
  });

  it('still names the client when the header cannot be read', () => {
    // Other light client types exist; the envelope fields are always there.
    const [summary] = extractMessageSummaries(
      wrap([
        {
          '@type': '/ibc.core.client.v1.MsgUpdateClient',
          client_id: '07-tendermint-9',
          signer: 'axelar1relayer',
          client_message: {
            '@type': '/ibc.lightclients.solomachine.v3.Header',
          },
        },
      ])
    );

    expect(summary.fields.map(f => f.label)).toEqual(['Client', 'Relayer']);
  });
});

describe('gaps the third round of review found', () => {
  const wrappedAck = (inner: unknown) =>
    Buffer.from(
      JSON.stringify({
        contract_result: 'e30=',
        ibc_ack: Buffer.from(JSON.stringify(inner)).toString('base64'),
      })
    ).toString('base64');

  const ackTx = (acknowledgement: string) => ({
    '@type': '/ibc.core.channel.v1.MsgAcknowledgement',
    packet: { sequence: '1', source_channel: 'a', destination_channel: 'b' },
    acknowledgement,
    signer: 'axelar1relayer',
  });

  const resultOf = (acknowledgement: string) => {
    const [summary] = extractMessageSummaries(wrap([ackTx(acknowledgement)]));
    const field = summary.fields.find(f => f.label === 'Result');
    return field?.kind === 'text' ? field.text : undefined;
  };

  it('finds the failure inside a middleware-wrapped success ack', () => {
    // ibc-hooks and CosmWasm deliberately report an application failure inside
    // a successful envelope so the tokens are not reverted. Trusting the outer
    // envelope reports a failed delivery as a success.
    expect(resultOf(wrappedAck({ error: 'contract execution failed' }))).toBe(
      'contract execution failed'
    );
  });

  it('reports a wrapped success as a success', () => {
    expect(resultOf(wrappedAck({ result: 'AQ==' }))).toBe('Success');
  });

  it('only calls the ICS-20 success byte a success', () => {
    expect(resultOf(Buffer.from('{"result":"AQ=="}').toString('base64'))).toBe(
      'Success'
    );
    // Any other payload proves delivery, not that the application succeeded.
    expect(
      resultOf(Buffer.from('{"result":"eyJvayI6e319"}').toString('base64'))
    ).toBe('Delivered');
  });

  it('reports fatal_error, which is the name some contracts use', () => {
    expect(
      resultOf(
        Buffer.from('{"fatal_error":"codespace sdk code 11"}').toString(
          'base64'
        )
      )
    ).toBe('codespace sdk code 11');
  });

  it('says nothing rather than something wrong for an unreadable ack', () => {
    // ICS-004 actually specifies a protobuf envelope; ibc-go's JSON is the
    // deviation, so a conformant counterparty may send bytes we cannot read.
    expect(
      resultOf(Buffer.from([0xaa, 0x01, 0x02]).toString('base64'))
    ).toBeUndefined();
  });

  it('surfaces where a GMP packet is actually headed', () => {
    // The receiver is the escrow account; the destination is in the memo.
    const [summary] = extractMessageSummaries(
      wrap([
        {
          '@type': '/ibc.core.channel.v1.MsgRecvPacket',
          packet: {
            sequence: '5',
            source_channel: 'channel-0',
            destination_channel: 'channel-612',
            data: Buffer.from(
              JSON.stringify({
                denom: 'uaxl',
                amount: '1',
                sender: 'osmo1sender',
                receiver: 'axelar1escrow',
                memo: JSON.stringify({
                  destination_chain: 'ethereum',
                  destination_address: '0xabc',
                }),
              })
            ).toString('base64'),
          },
          signer: 'axelar1relayer',
        },
      ])
    );
    const byLabel = Object.fromEntries(summary.fields.map(f => [f.label, f]));

    expect(byLabel['Destination chain']).toEqual({
      label: 'Destination chain',
      kind: 'chain',
      chain: 'ethereum',
    });
    expect(
      byLabel['Destination address'].kind === 'text' &&
        byLabel['Destination address'].text
    ).toBe('0xabc');
  });

  it('shows a foreign sender as text, not as an axelar account', () => {
    // Rendering it as an account would link to a dead /account/osmo1... page.
    const [summary] = extractMessageSummaries(
      wrap([
        {
          '@type': '/ibc.core.channel.v1.MsgRecvPacket',
          packet: {
            sequence: '5',
            source_channel: 'a',
            destination_channel: 'b',
            data: Buffer.from(
              JSON.stringify({ sender: 'osmo1sender', receiver: 'axelar1r' })
            ).toString('base64'),
          },
          signer: 'axelar1relayer',
        },
      ])
    );
    const sender = summary.fields.find(f => f.label === 'Sender');

    expect(sender?.kind).toBe('text');
  });

  it('unwraps MsgExec, a third envelope', () => {
    const summaries = extractMessageSummaries(
      wrap([
        {
          '@type': '/cosmos.authz.v1beta1.MsgExec',
          grantee: 'axelar1grantee',
          msgs: [
            {
              '@type': '/cosmos.gov.v1beta1.MsgVote',
              proposal_id: '9',
              voter: 'axelar1voter',
              option: 'VOTE_OPTION_NO',
            },
          ],
        },
      ])
    );

    expect(summaries[0].label).toBe('Governance vote');
    expect(summaries[0].wrappedIn).toBe('MsgExec');
  });

  it('describes a validator commission withdrawal', () => {
    const [summary] = extractMessageSummaries(
      wrap([
        {
          '@type':
            '/cosmos.distribution.v1beta1.MsgWithdrawValidatorCommission',
          validator_address: 'axelarvaloper1val',
        },
      ])
    );

    expect(summary.label).toBe('Withdraw commission');
    expect(addressOf(summary.fields, 'Validator')).toBe('axelarvaloper1val');
  });
});
