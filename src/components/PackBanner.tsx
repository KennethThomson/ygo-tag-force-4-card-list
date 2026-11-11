import type { Card, Pack } from '../types';
import { RARITY_RANK } from '../rarity';
import { Unlocks } from './Unlocks';

const IMG = `${import.meta.env.BASE_URL}img/packs/`;

/** Shown above the table while the list is filtered to a single pack. */
export default function PackBanner({ pack, shown, cards, onClear }: {
  pack: Pack;
  shown: number;
  /** Cards currently listed, used for the rarity composition bar. */
  cards: Card[];
  onClear: () => void;
}) {
  // Composition of what's on screen, best rarity first.
  const counts = new Map<string, number>();
  for (const c of cards) {
    const r = c.sources.find((s) => s.type === 'pack' && s.name === pack.name)?.rarity;
    if (r) counts.set(r, (counts.get(r) ?? 0) + 1);
  }
  const total = [...counts.values()].reduce((a, b) => a + b, 0);
  const bars = [...counts.entries()].sort((a, b) => (RARITY_RANK[b[0]] ?? 0) - (RARITY_RANK[a[0]] ?? 0));

  return (
    <div className="packbanner">
      <img
        className="art"
        src={`${IMG}${pack.slug}.webp`}
        alt={`${pack.name} booster pack`}
        width={64}
        height={128}
        onError={(e) => { e.currentTarget.style.visibility = 'hidden'; }}
      />
      <div className="info">
        <h2>{pack.name}</h2>
        <Unlocks list={pack.unlocks} />
        <div className="stats">
          <span className="tag">
            {shown === pack.count ? `${pack.count} cards` : `${shown} of ${pack.count} cards`}
          </span>
          {pack.cost != null && <span className="tag">{pack.cost} DP per pack</span>}
          {pack.coverCard && <span className="tag">Cover: {pack.coverCard}</span>}
          {pack.derivedFrom && (
            <span className="tag" title={`Contents drawn from: ${pack.derivedFrom.join(', ')}`}>
              Compilation of {pack.derivedFrom.length} packs
            </span>
          )}
        </div>
        {total > 0 && (
          <div className="raritybar" role="img"
            aria-label={bars.map(([r, n]) => `${n} ${r}`).join(', ')}>
            {bars.map(([r, n]) => (
              <span key={r} className={`seg seg-${r.toLowerCase().replace(/[^a-z]+/g, '-')}`}
                style={{ width: `${(100 * n) / total}%` }} title={`${n} ${r}`} />
            ))}
          </div>
        )}
      </div>
      <button className="clear" onClick={onClear} title="Show all cards again">Clear</button>
    </div>
  );
}
