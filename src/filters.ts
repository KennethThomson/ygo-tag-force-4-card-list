import type { Card } from './types';
import { exclusiveSources } from './sources';

export interface Filters {
  q: string;
  cardTypes: string[];
  monsterTypes: string[];
  spellTrapTypes: string[];
  attributes: string[];
  banStatuses: string[];
  rarities: string[];
  race: string;
  pack: string;
  sourceKind: string;
  exclusive: boolean;
  gameOriginal: boolean;
  levelMin: string; levelMax: string;
  atkMin: string; atkMax: string;
  defMin: string; defMax: string;
}

export const EMPTY_FILTERS: Filters = {
  q: '', cardTypes: [], monsterTypes: [], spellTrapTypes: [], attributes: [], banStatuses: [], rarities: [],
  race: '', pack: '', sourceKind: '', exclusive: false, gameOriginal: false,
  levelMin: '', levelMax: '', atkMin: '', atkMax: '', defMin: '', defMax: '',
};

const inRange = (value: number | string | null | undefined, min: string, max: string) => {
  if (!min && !max) return true;
  // "?" is stored as -1, and the Egyptian Gods print a literal like "X000".
  // Neither is a quantity, so neither can satisfy a numeric range.
  if (typeof value !== 'number' || value < 0) return false;
  if (min && value < Number(min)) return false;
  if (max && value > Number(max)) return false;
  return true;
};

export function applyFilters(cards: Card[], f: Filters): Card[] {
  const q = f.q.trim().toLowerCase();
  return cards.filter((c) => {
    if (q && !c.name.toLowerCase().includes(q) && !(c.tcgName ?? '').toLowerCase().includes(q)
      && !(c.text ?? '').toLowerCase().includes(q)) return false;
    if (f.cardTypes.length && !f.cardTypes.includes(c.cardType)) return false;
    if (f.monsterTypes.length && !(c.monsterTypes ?? []).some((t) => f.monsterTypes.includes(t))) return false;
    if (f.spellTrapTypes.length && !f.spellTrapTypes.includes(c.spellTrapType ?? '')) return false;
    if (f.attributes.length && !f.attributes.includes(c.attribute ?? '')) return false;
    if (f.banStatuses.length && !f.banStatuses.includes(c.banStatus)) return false;
    if (f.rarities.length && !f.rarities.includes(c.rarity ?? '')) return false;
    if (f.race && c.race !== f.race) return false;
    if (f.pack && !c.sources.some((s) => s.name === f.pack)) return false;
    // "none" is the handful of cards in the game data with no way to obtain them.
    if (f.sourceKind === 'none' ? c.sources.length > 0
      : f.sourceKind && !c.sources.some((s) => s.type === f.sourceKind)) return false;
    // Exclusive narrows whatever pack / source kind is chosen to cards obtainable
    // nowhere else (Checkered Flag and the Card Converter aside); with neither
    // chosen it means a single source of any kind.
    if (f.exclusive) {
      const ex = exclusiveSources(c);
      if (f.pack ? !(ex.length === 1 && ex[0].name === f.pack)
        : f.sourceKind && f.sourceKind !== 'none' ? !ex.length || ex.some((s) => s.type !== f.sourceKind)
        : ex.length !== 1) return false;
    }
    if (f.gameOriginal && !c.gameOriginal) return false;
    if (!inRange(c.level, f.levelMin, f.levelMax)) return false;
    if (!inRange(c.atk, f.atkMin, f.atkMax)) return false;
    if (!inRange(c.def, f.defMin, f.defMax)) return false;
    return true;
  });
}

/** How many filters are actually narrowing the list — drives the "Clear all" button. */
export function countActive(f: Filters): number {
  let n = 0;
  for (const key of Object.keys(EMPTY_FILTERS) as (keyof Filters)[]) {
    const v = f[key];
    if (Array.isArray(v)) n += v.length ? 1 : 0;
    else if (typeof v === 'boolean') n += v ? 1 : 0;
    else n += v ? 1 : 0;
  }
  return n;
}

/** Serialise only non-default values, so shared URLs stay short and readable. */
export function filtersToParams(f: Filters): URLSearchParams {
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries(f) as [keyof Filters, Filters[keyof Filters]][]) {
    if (Array.isArray(v)) { if (v.length) p.set(k, v.join('~')); }
    else if (typeof v === 'boolean') { if (v) p.set(k, '1'); }
    else if (v) p.set(k, v);
  }
  return p;
}

export function filtersFromParams(p: URLSearchParams): Filters {
  const f = { ...EMPTY_FILTERS };
  for (const key of Object.keys(EMPTY_FILTERS) as (keyof Filters)[]) {
    const raw = p.get(key);
    if (raw == null) continue;
    const current = EMPTY_FILTERS[key];
    if (Array.isArray(current)) (f[key] as string[]) = raw.split('~').filter(Boolean);
    else if (typeof current === 'boolean') (f[key] as boolean) = raw === '1';
    else (f[key] as string) = raw;
  }
  return f;
}
