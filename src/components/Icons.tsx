import type { Card, SourceKind } from '../types';
import { frameOf } from '../cardFrame';

const ICONS = `${import.meta.env.BASE_URL}img/icons/`;

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

/**
 * An icon that removes itself if its file is missing, so a symbol we have no
 * artwork for degrades to plain text rather than a broken-image glyph.
 */
function Icon({ src, alt = '', title, size }: {
  src: string; alt?: string; title?: string; size: number;
}) {
  return (
    <img className="icon" src={src} alt={alt} title={title} width={size} height={size}
      loading="lazy" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
  );
}

/** Attribute symbol as printed on the card. Falls back to nothing if unknown. */
export function AttributeIcon({ attribute, size = 16 }: { attribute?: string | null; size?: number }) {
  if (!attribute) return null;
  return (
    <Icon src={`${ICONS}attr-${slug(attribute)}.svg`} alt={attribute} title={attribute} size={size} />
  );
}

/** Monster Type (Dragon, Spellcaster, …) icon. */
export function TypeIcon({ race, size = 16 }: { race?: string | null; size?: number }) {
  if (!race) return null;
  return (
    <Icon src={`${ICONS}type-${slug(race)}.svg`} title={race} size={size} />
  );
}

/**
 * The card's kind, matching what the physical card shows: Spells and Traps with
 * a property (Continuous, Equip, Quick-Play, Field, Ritual, Counter) get that
 * printed symbol; everything else — every monster, and Normal Spells and
 * Traps — gets its card frame.
 *
 * The in-game property icons are deliberately not used for the first
 * group: they draw the whole frame as a coloured box with the symbol tucked in
 * a corner, which is illegible at 16px. The frames themselves are that same
 * set, where a coloured box is exactly the intended meaning.
 */
export function CardTypeIcon({ card, size = 16 }: { card: Card; size?: number }) {
  const prop = card.spellTrapType;
  const hasProperty = card.cardType !== 'Monster' && prop && prop !== 'Normal';

  if (hasProperty) {
    return (
      <Icon src={`${ICONS}prop-${slug(prop)}.svg`} title={`${prop} ${card.cardType}`} size={size} />
    );
  }

  // frameOf covers all seven frames: normal, effect, fusion, synchro, ritual, spell, trap.
  const frame = frameOf(card);
  const label = card.cardType === 'Monster'
    ? `${frame[0].toUpperCase()}${frame.slice(1)} Monster`
    : `Normal ${card.cardType}`;
  return (
    <Icon src={`${ICONS}frame-${frame}.png`} title={label} size={size} />
  );
}

/** Property symbol by name, for the filter chips (no Card in hand there). */
export function PropIcon({ prop, size = 14 }: { prop: string; size?: number }) {
  if (prop === 'Normal') return null;
  return (
    <Icon src={`${ICONS}prop-${slug(prop)}.svg`} title={prop} size={size} />
  );
}

/** Frame swatch by name, for the card-type filter chips. */
export function FrameIcon({ frame, size = 14 }: { frame: string; size?: number }) {
  return (
    <Icon src={`${ICONS}frame-${slug(frame)}.png`} title={frame} size={size} />
  );
}

/**
 * Where a card comes from: a booster pack, a UMD, a deck, or anything else.
 * Drawn rather than fetched, like the ATK, DEF and ban marks.
 */
export function SourceIcon({ kind, size = 13 }: { kind: SourceKind; size?: number }) {
  const common = {
    className: 'icon', width: size, height: size,
    viewBox: '0 0 24 24', role: 'img' as const,
  };
  const stroke = {
    fill: 'none', stroke: 'currentColor', strokeWidth: 2,
    strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const,
  };

  if (kind === 'pack') {
    // A booster pack: upright, with the tear strip across the top.
    return (
      <svg {...common}><title>Booster Pack</title>
        <rect x="5" y="3" width="14" height="18" rx="2" {...stroke} />
        <line x1="5" y1="7.5" x2="19" y2="7.5" {...stroke} />
      </svg>
    );
  }
  if (kind === 'umd') {
    // A disc, for UMD Recognition.
    return (
      <svg {...common}><title>UMD Recognition</title>
        <circle cx="12" cy="12" r="8.5" {...stroke} />
        <circle cx="12" cy="12" r="2.5" {...stroke} />
      </svg>
    );
  }
  if (kind === 'converter') {
    // Two arrows chasing each other, for the Card Converter.
    return (
      <svg {...common}><title>Card Converter</title>
        <path d="M4 12a8 8 0 0 1 13.7-5.7L20 8.5M20 4v4.5h-4.5" {...stroke} />
        <path d="M20 12a8 8 0 0 1-13.7 5.7L4 15.5M4 20v-4.5h4.5" {...stroke} />
      </svg>
    );
  }
  // A star, for everything else: the Initial Deck, story rewards, minigame
  // prizes, downloads, connectivity bonuses.
  return (
    <svg {...common}><title>Others</title>
      <path d="M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1.1 5.9L12 16.9l-5.3 2.8 1.1-5.9-4.3-4.1 5.9-.8z" {...stroke} />
    </svg>
  );
}

export function LevelIcon({ size = 14 }: { size?: number }) {
  return <img className="icon" src={`${ICONS}level.png`} alt="Level" title="Level"
    width={size} height={size} loading="lazy" />;
}

// ATK and DEF have no printed symbol, so these are drawn rather than fetched.
export function AtkIcon({ size = 14 }: { size?: number }) {
  return (
    <svg className="icon" width={size} height={size} viewBox="0 0 24 24" aria-label="ATK" role="img">
      <title>ATK</title>
      <path fill="currentColor" d="M6.9 2 4 4.9l9.1 9.1 2.9-2.9L6.9 2Zm10.3 12.4-2.8 2.8 1.4 1.4-1.4 1.5 1.4 1.4 4.3-4.2-1.5-1.5-1.4 1.4-1.4-1.4ZM3 17.6 4.4 19 3 20.4 4.4 21.9l4.3-4.3-1.5-1.4-1.4 1.4-1.4-1.4L3 17.6Z" />
    </svg>
  );
}

export function DefIcon({ size = 14 }: { size?: number }) {
  return (
    <svg className="icon" width={size} height={size} viewBox="0 0 24 24" aria-label="DEF" role="img">
      <title>DEF</title>
      <path fill="currentColor" d="M12 2 4 5v6.5c0 5 3.4 9.4 8 10.5 4.6-1.1 8-5.5 8-10.5V5l-8-3Zm0 2.2 6 2.2v5.1c0 3.9-2.5 7.4-6 8.4-3.5-1-6-4.5-6-8.4V6.4l6-2.2Z" />
    </svg>
  );
}

/**
 * Ban status, by shape so the three read apart at 14px even before colour:
 * a slashed circle for Forbidden, a hazard triangle for Limited, and an
 * exclamation in a circle for Semi-Limited. Unlimited draws nothing, since an
 * icon on every unrestricted card would be noise.
 *
 * Drawn rather than downloaded: no canonical asset exists. Yugipedia renders
 * status as text, YGOPRODeck hosts no banlist image (every path 404s) and uses
 * Font Awesome Pro elsewhere, and the game itself has no limit icon. Uses
 * currentColor, so each inherits the .ban-* colour already on the cell.
 */
export function BanIcon({ status, size = 14 }: { status: string; size?: number }) {
  if (status === 'Unlimited') return null;

  const common = {
    className: 'icon', width: size, height: size,
    viewBox: '0 0 24 24', role: 'img' as const, 'aria-label': status,
  };
  const stroke = {
    fill: 'none', stroke: 'currentColor', strokeWidth: 2.2,
    strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const,
  };

  if (status === 'Forbidden') {
    return (
      <svg {...common}><title>{status}</title>
        <circle cx="12" cy="12" r="9" {...stroke} />
        <line x1="5.6" y1="18.4" x2="18.4" y2="5.6" {...stroke} />
      </svg>
    );
  }

  if (status === 'Limited') {
    return (
      <svg {...common}><title>{status}</title>
        <path d="M12 3.4 22.2 20.6H1.8L12 3.4Z" {...stroke} />
        <line x1="12" y1="10.2" x2="12" y2="14.8" {...stroke} />
        <circle cx="12" cy="17.7" r="1.15" fill="currentColor" />
      </svg>
    );
  }

  // Semi-Limited
  return (
    <svg {...common}><title>{status}</title>
      <circle cx="12" cy="12" r="9" {...stroke} />
      <line x1="12" y1="7.3" x2="12" y2="12.9" {...stroke} />
      <circle cx="12" cy="16.3" r="1.25" fill="currentColor" />
    </svg>
  );
}
