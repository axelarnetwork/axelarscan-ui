/**
 * @jest-environment node
 */
import { shouldTreatConfirmErrorAsPending } from './ApproveButton.error.utils';

describe('shouldTreatConfirmErrorAsPending', () => {
  it('returns true for finalize error when confirming', () => {
    const result = shouldTreatConfirmErrorAsPending(
      'findEventAndConfirmIfNeeded(): could not confirm and finalize event successfully: 0xabc',
      true
    );
    expect(result).toBe(true);
  });

  it('returns true for missing event errors when confirming', () => {
    const result = shouldTreatConfirmErrorAsPending(
      'rpc error: code = NotFound desc = no event with ID [0xabc-25] was found',
      true
    );
    expect(result).toBe(true);
  });

  it('returns false for non-confirm actions', () => {
    const result = shouldTreatConfirmErrorAsPending(
      'findEventAndConfirmIfNeeded(): could not confirm and finalize event successfully: 0xabc',
      false
    );
    expect(result).toBe(false);
  });

  it('returns false for unrelated errors', () => {
    const result = shouldTreatConfirmErrorAsPending(
      'findBatchAndApproveGateway(): unable to retrieve batch data',
      true
    );
    expect(result).toBe(false);
  });
});
