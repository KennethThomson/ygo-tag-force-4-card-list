export type CardType = 'Monster' | 'Spell' | 'Trap';
export type BanStatus = 'Forbidden' | 'Limited' | 'Semi-Limited' | 'Unlimited';

/**
 * How a card is obtained. `pack` is a Booster Pack bought at the shop.
 * `umd` is UMD Recognition: inserting another PSP game's disc. `converter` is
 * the Card Converter, which covers nearly the whole pool. `other` is the rest:
 * the Initial Deck, character story rewards, the Visitor from the Abyss
 * minigame, Konami downloads. Each
 * source still carries a descriptive `name`.
 */
export type SourceKind = 'pack' | 'umd' | 'converter' | 'other';

export interface CardSource {
  type: SourceKind;
  name: string;
  rarity?: string | null;
  /** Alternative conditions for a pack source; any one unlocks the pack. */
  unlock?: string[] | null;
  detail?: string | null;
}

/**
 * A printed ATK/DEF value. Usually a number; -1 encodes a printed "?", and a
 * string is a literal the card prints instead of a quantity (the Egyptian Gods
 * print "X000" and "????").
 */
export type Stat = number | string | null;

/**
 * The in-game Forbidden/Limited lists. The game ships on March 2009; the two
 * later lists were downloadable. `banStatus` on a card is the default list,
 * so filters and the table have one value to work with; the others are shown
 * in the detail panel only where they differ.
 */
export type BanList = 'March 2009' | 'September 2009' | 'March 2010';
export const BAN_LISTS: BanList[] = ['March 2009', 'September 2009', 'March 2010'];
export const DEFAULT_BAN_LIST: BanList = 'March 2009';

export interface Card {
  /**
   * Stable identifier: the image filename, and it appears in shared URLs, so
   * it must never change once published. See CLAUDE.md "Card IDs" for the
   * decision on where it comes from.
   */
  id: number;
  /**
   * The game's own internal card number, where known. The numbering is
   * continuous across the Tag Force series (Elemental Hero Neos is #6653 in
   * both games), so Tag Force 1's gallery supplies it for the shared cards and
   * the `{{Tag Force 4 card}}` template for the rest that have a page. Null
   * where neither source has it.
   */
  internalNumber: number | null;
  name: string;
  /**
   * Distinguishes an alternate artwork that is its own entry in the Trunk.
   * Null for the ordinary printing, which is every card unless the build
   * finds otherwise.
   */
  variant: string | null;
  /** The page whose stats and text are shown: "<Name> (Tag Force 4)" or the general page. */
  wikiPage: string;
  /**
   * Outbound link target. The "(Tag Force 4)" page exists for only ~1,022 cards,
   * so linking to it 404s for the rest; the card's general page always exists.
   */
  wikiLink: string;
  /** The card's TCG name where the game spells it differently (Vortex Kong → Voltic Kong). */
  tcgName: string | null;
  hasGamePage: boolean;
  /**
   * A CSS filter for this card's art, where the image does not come from a
   * Tag Force screenshot and so does not share its palette. Null for every
   * card whose art needs no correction.
   */
  artFilter: string | null;
  cardType: CardType;
  text: string | null;
  password: string | null;
  genres: string[];
  rarity: string | null;
  /** Monsters only. */
  race?: string | null;
  monsterTypes?: string[];
  attribute?: string | null;
  level?: number | null;
  atk?: Stat;
  def?: Stat;
  /** Spells and Traps only. */
  spellTrapType?: string;
  /** Anime-only card that never had a real printing when the game shipped. */
  gameOriginal: boolean;
  sources: CardSource[];
  /** Status on the default (March 2009) list. */
  banStatus: BanStatus;
  /** Status on each list, including the default, for the detail panel. */
  banStatusByList: Record<BanList, BanStatus>;
}

export interface Pack {
  page: string;
  name: string;
  /** Alternative conditions; any one unlocks the pack. */
  unlocks: string[];
  size: number | null;
  coverCard: string | null;
  /** Price in Duelist Points. */
  cost: number | null;
  count: number;
  slug: string;
  /** Position in the shop index page, which is also the in-game shop order. */
  order: number;
  /**
   * For a compilation pack whose page has no set list, the packs its contents
   * were derived from. Null for an ordinary pack.
   */
  derivedFrom: string[] | null;
}
