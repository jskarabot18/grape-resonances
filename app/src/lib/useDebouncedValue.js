/**
 * useDebouncedValue
 *
 * A standard debounce hook. Returns `value`, but only after `delay` ms
 * have passed without it changing. Used to delay firing the embedding
 * API call until the user has stopped typing for 400ms.
 */
import { useEffect, useState } from 'react';

export function useDebouncedValue(value, delay = 400) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}
