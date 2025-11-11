'use client';

import { useCallback, useState } from 'react';

interface UseInfoStateOptions {
  initialSeeMore?: boolean;
}

export function useInfoState(options: UseInfoStateOptions = {}) {
  const { initialSeeMore = false } = options;
  const [seeMore, setSeeMore] = useState(initialSeeMore);

  const toggleSeeMore = useCallback(
    () => setSeeMore(value => !value),
    [setSeeMore]
  );

  return { seeMore, setSeeMore, toggleSeeMore };
}
