import { useCallback, useEffect, useState } from 'react';

import { parseUrlPath, type ParsedRoute } from '../utils/game';

/**
 * Hook that parses the route (event type, game ID, league slug, quiz date)
 * from the URL path. Re-evaluates on popstate (browser back/forward).
 */
export function useUrlParams(): ParsedRoute {
  const [params, setParams] = useState<ParsedRoute>(() => parseUrlPath());

  const handlePopState = useCallback(() => {
    setParams(parseUrlPath());
  }, []);

  useEffect(() => {
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [handlePopState]);

  return params;
}
