const CONFIRM_PENDING_ERROR_PATTERNS: RegExp[] = [
  /could not confirm and finalize event successfully/i,
  /is not confirmed on/i,
  /no event with ID/i,
  /could not determine status of event/i,
  /could not find event index/i,
];

export const shouldTreatConfirmErrorAsPending = (
  errorMessage: string | undefined,
  isConfirmAction: boolean
): boolean => {
  if (!isConfirmAction || !errorMessage) {
    return false;
  }

  return CONFIRM_PENDING_ERROR_PATTERNS.some(pattern => pattern.test(errorMessage));
};
