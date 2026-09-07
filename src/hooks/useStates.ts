import { useEffect, useState } from 'react';
import { getStates } from '../api/client.ts';
import { US_STATES } from '../utils/usStates.ts';
import type { USState } from '../types/index.ts';

/**
 * Load the state list from `GET /states`, falling back to the bundled list so
 * address forms remain usable when the backend is unreachable.
 */
export function useStates(): USState[] {
  const [states, setStates] = useState<USState[]>(US_STATES);

  useEffect(() => {
    let cancelled = false;

    getStates()
      .then((data) => {
        if (!cancelled && data.length > 0) {
          setStates(data);
        }
      })
      .catch(() => {
        // Keep the bundled fallback list.
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return states;
}
