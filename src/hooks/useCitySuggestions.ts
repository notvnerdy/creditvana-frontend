import { useEffect, useState } from 'react';
import { getCities } from '../api/client.ts';

const MIN_QUERY_LENGTH = 2;
const DEBOUNCE_MS = 300;
const MAX_SUGGESTIONS = 10;

const NO_SUGGESTIONS: string[] = [];

/**
 * Debounced city lookup against `GET /cities?q=`. Returns an empty list while
 * the query is too short or the request fails — suggestions are an aid, never
 * a gate on submitting the form.
 */
export function useCitySuggestions(query: string): string[] {
  const [suggestions, setSuggestions] = useState<string[]>(NO_SUGGESTIONS);
  const trimmed = query.trim();
  const isSearchable = trimmed.length >= MIN_QUERY_LENGTH;

  useEffect(() => {
    if (!isSearchable) return;

    let cancelled = false;
    const timer = setTimeout(() => {
      getCities(trimmed)
        .then((cities) => {
          if (cancelled) return;
          setSuggestions(
            [...new Set(cities.map((city) => city.name))].slice(0, MAX_SUGGESTIONS),
          );
        })
        .catch(() => {
          if (!cancelled) setSuggestions(NO_SUGGESTIONS);
        });
    }, DEBOUNCE_MS);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [trimmed, isSearchable]);

  return isSearchable ? suggestions : NO_SUGGESTIONS;
}
