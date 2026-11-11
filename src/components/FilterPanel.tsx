import { useEffect, useRef } from 'react';
import type { Filters } from '../filters';
import { AttributeIcon, BanIcon, PropIcon, FrameIcon } from './Icons';

interface Facets {
  races: string[];
  packs: string[];
  monsterTypes: string[];
  spellTrapTypes: string[];
}

interface Props {
  filters: Filters;
  facets: Facets;
  activeCount: number;
  onChange: (patch: Partial<Filters>) => void;
  onReset: () => void;
  /** Present only when the panel is a drawer, i.e. on narrow screens. */
  onDone?: () => void;
}

// DIVINE belongs to the three Egyptian Gods and nothing else, so it sits last
// rather than among the six ordinary attributes.
const ATTRIBUTES = ['LIGHT', 'DARK', 'EARTH', 'WATER', 'FIRE', 'WIND', 'DIVINE'];
const CARD_TYPES = ['Monster', 'Spell', 'Trap'];
// Unlimited is the default state for the vast majority of cards, so offering it as a
// filter narrows almost nothing; only the restricted statuses are useful.
const BAN_STATUSES = ['Forbidden', 'Limited', 'Semi-Limited'];
const RARITIES = ['Ultra Rare', 'Super Rare', 'Rare', 'Common'];

/**
 * Multi-select chip row: clicking toggles membership. `icon` and `className`
 * let a group carry the same symbols and colours the table uses, so a filter
 * looks like the rows it produces.
 */
function ChipGroup({ options, selected, onToggle, icon, className }: {
  options: string[];
  selected: string[];
  onToggle: (v: string) => void;
  icon?: (o: string) => React.ReactNode;
  className?: (o: string) => string;
}) {
  return (
    <div className="chips">
      {options.map((o) => (
        <button key={o} className={`chip ${className?.(o) ?? ''}`}
          aria-pressed={selected.includes(o)} onClick={() => onToggle(o)}>
          {icon?.(o)}{o}
        </button>
      ))}
    </div>
  );
}

function Range({ label, min, max, onMin, onMax }: {
  label: string; min: string; max: string;
  onMin: (v: string) => void; onMax: (v: string) => void;
}) {
  return (
    <>
      <h2>{label}</h2>
      <div className="range">
        <input type="number" placeholder="Min" value={min} onChange={(e) => onMin(e.target.value)} />
        <span>–</span>
        <input type="number" placeholder="Max" value={max} onChange={(e) => onMax(e.target.value)} />
      </div>
    </>
  );
}

export default function FilterPanel({ filters, facets, activeCount, onChange, onReset, onDone }: Props) {
  const searchRef = useRef<HTMLInputElement>(null);

  // "/" focuses search, the usual shortcut for it. Ignored while the user is
  // already typing somewhere, or when a modifier is held, so it never steals a
  // real slash or a browser shortcut.
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== '/' || e.ctrlKey || e.metaKey || e.altKey) return;
      const el = document.activeElement as HTMLElement | null;
      const tag = el?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || el?.isContentEditable) return;
      e.preventDefault();
      searchRef.current?.focus();
      searchRef.current?.select();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, []);

  const toggle = (key: 'cardTypes' | 'monsterTypes' | 'spellTrapTypes' | 'attributes' | 'banStatuses' | 'rarities') => (value: string) => {
    const list = filters[key];
    onChange({ [key]: list.includes(value) ? list.filter((v) => v !== value) : [...list, value] });
  };

  return (
    <aside className="filters">
      <div className="filterhead">
        <span className="label">Filters</span>
        {activeCount > 0 && <span className="n">{activeCount}</span>}
        <span className="spacer" />
        <button className="clear" onClick={onReset} disabled={activeCount === 0}>
          Clear all
        </button>
        {onDone && <button className="clear done" onClick={onDone}>Done</button>}
      </div>

      <h2>Search</h2>
      <div className="searchwrap">
        <input
          ref={searchRef}
          className="search"
          placeholder="Name or card text…"
          value={filters.q}
          onChange={(e) => onChange({ q: e.target.value })}
          onKeyDown={(e) => { if (e.key === 'Escape') e.currentTarget.blur(); }}
        />
        {!filters.q && <kbd className="hint" aria-hidden="true">/</kbd>}
      </div>

      <h2>Card Type</h2>
      <ChipGroup options={CARD_TYPES} selected={filters.cardTypes} onToggle={toggle('cardTypes')}
        icon={(o) => <FrameIcon frame={o === 'Monster' ? 'effect' : o} />}
        className={(o) => `chip-frame-${o.toLowerCase()}`} />

      <h2>Attribute</h2>
      <ChipGroup options={ATTRIBUTES} selected={filters.attributes} onToggle={toggle('attributes')}
        icon={(o) => <AttributeIcon attribute={o} size={14} />}
        className={(o) => `chip-attr-${o}`} />

      <h2>Monster Type</h2>
      <ChipGroup options={facets.monsterTypes} selected={filters.monsterTypes} onToggle={toggle('monsterTypes')}
        className={(o) => `chip-frame-${['Fusion', 'Synchro', 'Ritual', 'Normal'].includes(o) ? o.toLowerCase() : o === 'Dark Synchro' ? 'darksynchro' : 'effect'}`} />

      <h2>Spell / Trap Type</h2>
      <ChipGroup options={facets.spellTrapTypes} selected={filters.spellTrapTypes} onToggle={toggle('spellTrapTypes')}
        icon={(o) => <PropIcon prop={o} />} />

      <h2>Rarity</h2>
      <ChipGroup options={RARITIES} selected={filters.rarities} onToggle={toggle('rarities')}
        className={(o) => `chip-rarity-${o.toLowerCase().replace(/[^a-z]+/g, '-')}`} />

      <h2>Ban Status</h2>
      <ChipGroup options={BAN_STATUSES} selected={filters.banStatuses} onToggle={toggle('banStatuses')}
        icon={(o) => <BanIcon status={o} />}
        className={(o) => `chip-ban-${o}`} />

      <h2>Type</h2>
      <select className="control" value={filters.race} onChange={(e) => onChange({ race: e.target.value })}>
        <option value="">Any</option>
        {facets.races.map((r) => <option key={r} value={r}>{r}</option>)}
      </select>

      <h2>Packs</h2>
      <select className="control" value={filters.pack} onChange={(e) => onChange({ pack: e.target.value })}>
        <option value="">Any</option>
        {facets.packs.map((p) => <option key={p} value={p}>{p}</option>)}
      </select>

      <h2>Source</h2>
      <select className="control" value={filters.sourceKind} onChange={(e) => onChange({ sourceKind: e.target.value })}>
        <option value="">Any</option>
        <option value="pack">Booster Pack</option>
        <option value="umd">UMD Recognition</option>
        <option value="converter">Card Converter</option>
        <option value="other">Others</option>
        <option value="none">Not Obtainable</option>
      </select>
      <div className="chips">
        <button className="chip" aria-pressed={filters.exclusive}
          title="Only cards obtainable nowhere else — from that one pack or source kind, or from a single source if none is chosen. Compilation packs and the Card Converter don't count, since they hold (nearly) every card."
          onClick={() => onChange({ exclusive: !filters.exclusive })}>Exclusive</button>
      </div>

      <h2>Other</h2>
      <div className="chips">
        <button className="chip" aria-pressed={filters.gameOriginal}
          onClick={() => onChange({ gameOriginal: !filters.gameOriginal })}>Game Original Cards</button>
      </div>

      <Range label="Level" min={filters.levelMin} max={filters.levelMax}
        onMin={(v) => onChange({ levelMin: v })} onMax={(v) => onChange({ levelMax: v })} />
      <Range label="ATK" min={filters.atkMin} max={filters.atkMax}
        onMin={(v) => onChange({ atkMin: v })} onMax={(v) => onChange({ atkMax: v })} />
      <Range label="DEF" min={filters.defMin} max={filters.defMax}
        onMin={(v) => onChange({ defMin: v })} onMax={(v) => onChange({ defMax: v })} />
    </aside>
  );
}
