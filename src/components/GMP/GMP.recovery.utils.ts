const isNumericKey = (value: string) => String(Number(value)) === value;

export const normalizeRecoveryBytes = (value: unknown): Uint8Array | null => {
  if (value instanceof Uint8Array) {
    return value;
  }

  if (Array.isArray(value)) {
    const bytes = value.map((entry) => Number(entry));
    if (bytes.every((entry) => Number.isFinite(entry))) {
      return new Uint8Array(bytes);
    }
    return null;
  }

  if (value && typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>);
    const isNumericKeys = entries.every(([key]) => isNumericKey(key));
    if (!isNumericKeys) {
      return null;
    }
    const bytes = entries
      .sort(([a], [b]) => Number(a) - Number(b))
      .map(([, entry]) => Number(entry));
    if (bytes.every((entry) => Number.isFinite(entry))) {
      return new Uint8Array(bytes);
    }
  }

  return null;
};
