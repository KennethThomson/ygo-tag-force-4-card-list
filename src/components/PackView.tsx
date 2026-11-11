import type { Pack } from '../types';
import { Unlocks } from './Unlocks';

const IMG = `${import.meta.env.BASE_URL}img/packs/`;

export default function PackView({ packs, onSelect }: {
  packs: Pack[]; onSelect: (packName: string) => void;
}) {
  return (
    <div className="packs">
      <div className="packgrid">
        {packs.map((p) => (
          <div className="packcard" key={p.name} onClick={() => onSelect(p.name)}
            role="button" tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && onSelect(p.name)}>
            <img
              className="art"
              src={`${IMG}${p.slug}.webp`}
              alt={`${p.name} booster pack`}
              width={64}
              height={128}
              loading="lazy"
              onError={(e) => { e.currentTarget.style.visibility = 'hidden'; }}
            />
            <div className="info">
              <h3>{p.name}</h3>
              <Unlocks list={p.unlocks} />
              <div className="stats">
                <span className="tag">{p.count} cards</span>
                {p.cost != null && <span className="tag">{p.cost} DP</span>}
                {p.coverCard && <span className="tag">Cover: {p.coverCard}</span>}
                {p.derivedFrom && <span className="tag" title={p.derivedFrom.join(', ')}>Compilation</span>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
