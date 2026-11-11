import { useEffect, useState } from 'react';

/** Reactive CSS media query, so layout decisions JS owns stay in step with CSS. */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() =>
    typeof window !== 'undefined' && window.matchMedia(query).matches);

  useEffect(() => {
    const mq = window.matchMedia(query);
    const onChange = () => setMatches(mq.matches);
    onChange();
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [query]);

  return matches;
}

/** Single source of truth for the breakpoint, shared with styles.css. */
export const NARROW = '(max-width: 900px)';
