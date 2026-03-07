export const normalizeType = (type: string | undefined) =>
  ['wrap', 'unwrap', 'erc20_transfer'].includes(type as string)
    ? 'deposit_service'
    : type || 'deposit_address';
