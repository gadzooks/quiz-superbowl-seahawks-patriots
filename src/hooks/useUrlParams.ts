import { useCallback, useEffect, useState } from 'react';

import { parseUrlPath } from '../utils/game';

interface UrlParams {
  gameId: string;
  leagueSlug: string | null;
}

/**
 * Hook that parses game ID and league slug from the URL path.
 * Re-evaluates on popstate (browser back/forward).
 */
export function useUrlParams(): UrlParams {
  const [params, setParams] = useState<UrlParams>(() => parseUrlPath());

  const handlePopState = useCallback(() => {
    setParams(parseUrlPath());
  }, []);

  useEffect(() => {
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [handlePopState]);

  return params;
}
