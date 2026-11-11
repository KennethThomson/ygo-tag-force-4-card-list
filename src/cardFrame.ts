import type { Card } from './types';

export type Frame = 'normal' | 'effect' | 'ritual' | 'fusion' | 'synchro' | 'spell' | 'trap';

/**
 * The card's frame colour category, matching the physical card.
 *
 * Order matters: a Fusion, Synchro or Ritual monster keeps its own frame even when it
 * also has an effect, while Flip/Toon/Spirit/Union are all Effect Monsters and
 * share the orange frame. (In this dataset Toon, Spirit and Union frequently
 * appear without an explicit "Effect" tag, so they are matched by name.)
 */
export function frameOf(card: Card): Frame {
  if (card.cardType === 'Spell') return 'spell';
  if (card.cardType === 'Trap') return 'trap';

  const types = card.monsterTypes ?? [];
  if (types.includes('Fusion')) return 'fusion';
  if (types.includes('Synchro')) return 'synchro';
  if (types.includes('Ritual')) return 'ritual';
  if (types.some((t) => ['Effect', 'Flip', 'Toon', 'Spirit', 'Union'].includes(t))) return 'effect';
  return 'normal';
}

export type God = 'slifer' | 'obelisk' | 'ra';

const GODS: Record<string, God> = {
  'Slifer the Sky Dragon': 'slifer',
  'Obelisk the Tormentor': 'obelisk',
  'The Winged Dragon of Ra': 'ra',
};

/**
 * The three Egyptian Gods are Effect Monsters, but they do not print in the
 * Effect orange — each has its own colour. Returns which, or null.
 */
export function godOf(card: Card): God | null {
  return card.race === 'Divine-Beast' ? GODS[card.name] ?? null : null;
}

/**
 * Frame colour classes for a card. `frame-*` colours text, `row-*` tints a
 * table row; a God adds a second class that overrides the first.
 */
export function frameClass(card: Card, prefix: 'frame' | 'row'): string {
  const god = godOf(card);
  return `${prefix}-${frameOf(card)}${god ? ` ${prefix}-god-${god}` : ''}`;
}

/** Frame order for sorting: monsters as the game groups them, then Spells, then Traps. */
export const FRAME_ORDER: Frame[] = ['normal', 'effect', 'ritual', 'fusion', 'synchro', 'spell', 'trap'];

/** The Type column's text: monster subtypes, or "<Property> Spell/Trap". */
export const subtype = (c: Card) =>
  c.cardType === 'Monster' ? (c.monsterTypes ?? []).join(' / ') : `${c.spellTrapType} ${c.cardType}`;

/** Human-readable frame name, used for the detail panel and tooltips. */
export const FRAME_LABEL: Record<Frame, string> = {
  normal: 'Normal',
  effect: 'Effect',
  ritual: 'Ritual',
  fusion: 'Fusion',
  synchro: 'Synchro',
  spell: 'Spell',
  trap: 'Trap',
};
