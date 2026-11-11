import type { Card, CardSource } from './types';
import packs from './data/packs.json';

// Compilation packs (Checkered Flag: every card; Taste the Attributes: the six
// attribute packs) re-list other packs' cards, and the Card Converter covers
// all but 21 of the obtainable pool. Counting them, no card would ever be
// exclusive to anything, so exclusivity looks past them.
const compilations = new Set(packs.filter((p) => p.derivedFrom).map((p) => p.name));
export const isUniversal = (s: CardSource) =>
  (s.type === 'pack' && compilations.has(s.name)) || s.type === 'converter';

/**
 * The sources that actually distinguish where a card comes from: everything
 * but the universal ones, or those themselves when they are all there is (the
 * eleven Card Converter exclusives).
 */
export function exclusiveSources(card: Card): CardSource[] {
  const specific = card.sources.filter((s) => !isUniversal(s));
  return specific.length ? specific : card.sources;
}
