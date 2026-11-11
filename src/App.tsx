import { useEffect, useMemo, useState } from 'react';
import cardsData from './data/cards.json';
import packsData from './data/packs.json';
import type { Card, Pack } from './types';
import { useMediaQuery, NARROW } from './useMediaQuery';
import { applyFilters, countActive, EMPTY_FILTERS, filtersFromParams, filtersToParams, type Filters } from './filters';
import FilterPanel from './components/FilterPanel';
import CardTable, { type SortKey } from './components/CardTable';
import CardDetail from './components/CardDetail';
import PackView from './components/PackView';
import PackBanner from './components/PackBanner';
import { RARITY_RANK } from './rarity';
import { FRAME_ORDER, frameOf, subtype } from './cardFrame';

const CARDS = cardsData as Card[];
const PACKS = packsData as Pack[];

const uniqueSorted = (values: (string | null | undefined)[]) =>
  [...new Set(values.filter((v): v is string => Boolean(v)))].sort();

export default function App() {
  const [filters, setFilters] = useState<Filters>(() => filtersFromParams(new URLSearchParams(location.search)));
  const [sort, setSort] = useState<SortKey>('id');
  const [desc, setDesc] = useState(false);
  const [selected, setSelected] = useState<Card | null>(null);
  const [tab, setTab] = useState<'cards' | 'packs'>('cards');
  const narrow = useMediaQuery(NARROW);
  const [drawerOpen, setDrawerOpen] = useState(false);
  // Wide layouts: the sidebar can be collapsed to give the table the room —
  // tablets and phones in landscape sit just above the drawer breakpoint.
  // Remembered per browser; storage can be unavailable (private mode), so
  // every access is guarded.
  const SIDEBAR_KEY = 'tf2.sidebar';
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    try { return localStorage.getItem(SIDEBAR_KEY) !== 'closed'; } catch { return true; }
  });
  const toggleSidebar = () => setSidebarOpen((v) => {
    try { localStorage.setItem(SIDEBAR_KEY, v ? 'closed' : 'open'); } catch { /* ignore */ }
    return !v;
  });

  // The drawer is a narrow-screen affordance; leaving that width closes it so
  // it can never stay open as a stuck overlay on the desktop layout.
  useEffect(() => { if (!narrow) setDrawerOpen(false); }, [narrow]);

  // Keep the URL in step with the filters so a view can be bookmarked or shared.
  useEffect(() => {
    const qs = filtersToParams(filters).toString();
    history.replaceState(null, '', qs ? `?${qs}` : location.pathname);
  }, [filters]);

  const facets = useMemo(() => ({
    races: uniqueSorted(CARDS.map((c) => c.race)),
    packs: PACKS.map((p) => p.name).sort(),
    monsterTypes: uniqueSorted(CARDS.flatMap((c) => c.monsterTypes ?? [])),
    spellTrapTypes: uniqueSorted(CARDS.map((c) => c.spellTrapType)),
  }), []);

  const activePack = useMemo(
    () => PACKS.find((p) => p.name === filters.pack) ?? null,
    [filters.pack],
  );

  const visible = useMemo(() => {
    const rows = applyFilters(CARDS, filters);
    const dir = desc ? -1 : 1;
    return [...rows].sort((a, b) => {
      // Rarity sorts by pull rate rather than alphabetically.
      if (sort === 'rarity') {
        const rx = RARITY_RANK[a.rarity ?? ''] ?? 0;
        const ry = RARITY_RANK[b.rarity ?? ''] ?? 0;
        return rx === ry ? a.id - b.id : (rx - ry) * dir;
      }
      // Type sorts by what the column shows: frame first (Normal, Effect,
      // Ritual, Fusion, Synchro, Spell, Trap), then the subtype text. Sorting
      // on cardType alone left every monster tied, so the column never moved.
      if (sort === 'cardType') {
        const fx = FRAME_ORDER.indexOf(frameOf(a)), fy = FRAME_ORDER.indexOf(frameOf(b));
        if (fx !== fy) return (fx - fy) * dir;
        return subtype(a).localeCompare(subtype(b)) * dir || a.id - b.id;
      }
      const x = a[sort as keyof typeof a] ?? null;
      const y = b[sort as keyof typeof b] ?? null;
      // Blanks always sort last, regardless of direction.
      if (x === null && y === null) return 0;
      if (x === null) return 1;
      if (y === null) return -1;
      if (typeof x === 'number' && typeof y === 'number') return (x - y) * dir;
      return String(x).localeCompare(String(y)) * dir;
    });
  }, [filters, sort, desc]);

  // Escape closes the card panel from anywhere.
  useEffect(() => {
    if (!selected) return;
    const onKeyDown = (e: KeyboardEvent) => { if (e.key === 'Escape') setSelected(null); };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [selected]);

  const activeCount = countActive(filters);
  const update = (patch: Partial<Filters>) => setFilters((f) => ({ ...f, ...patch }));

  const handleSort = (key: SortKey) => {
    if (key === sort) setDesc((d) => !d);
    else { setSort(key); setDesc(false); }
  };

  return (
    <div className="app">
      <header className="topbar">
        <img className="applogo" src={`${import.meta.env.BASE_URL}favicon.png`}
          alt="" width={22} height={22} />
        {/* The full name does not fit beside the Filters button and tabs
            on a phone, so the franchise prefix is dropped there. */}
        <h1>{narrow ? 'Tag Force 3 — Card List' : 'Yu-Gi-Oh! GX Tag Force 3 — Card List'}</h1>
        <span className="sub">{CARDS.length} cards · {PACKS.length} packs</span>
        <div className="spacer" />
        {tab === 'cards' && (
          <button className="tab filterbtn" aria-pressed={narrow ? undefined : sidebarOpen}
            title={narrow ? 'Show filters' : sidebarOpen ? 'Hide the filter sidebar' : 'Show the filter sidebar'}
            onClick={narrow ? () => setDrawerOpen(true) : toggleSidebar}>
            Filters{activeCount > 0 && <span className="n">{activeCount}</span>}
          </button>
        )}
        <div className="tabs" role="tablist">
          <button className="tab" role="tab" aria-selected={tab === 'cards'} onClick={() => setTab('cards')}>Cards</button>
          <button className="tab" role="tab" aria-selected={tab === 'packs'} onClick={() => setTab('packs')}>Packs</button>
        </div>
      </header>

      <div className="body">
        {tab === 'cards' && (
          <>
            {narrow && drawerOpen && (
              <div className="scrim" onClick={() => setDrawerOpen(false)} aria-hidden="true" />
            )}
            {(narrow || sidebarOpen) && (
              <div className={`filterhost${narrow ? ' is-drawer' : ''}${drawerOpen ? ' open' : ''}`}>
                <FilterPanel filters={filters} facets={facets} activeCount={activeCount}
                  onChange={update} onReset={() => setFilters(EMPTY_FILTERS)}
                  onDone={narrow ? () => setDrawerOpen(false) : undefined} />
              </div>
            )}
          </>
        )}

        <main className="main">
          {tab === 'cards' ? (
            <>
              {activePack && (
                <PackBanner
                  pack={activePack}
                  shown={visible.length}
                  cards={visible}
                  onClear={() => update({ pack: '' })}
                />
              )}
              <div className="count">
                <b>{visible.length.toLocaleString()}</b> of {CARDS.length.toLocaleString()} cards
              </div>
              <CardTable cards={visible} sort={sort} desc={desc} onSort={handleSort}
                selected={selected} onSelect={setSelected} />
            </>
          ) : (
            <PackView packs={PACKS} onSelect={(name) => {
              setFilters({ ...EMPTY_FILTERS, pack: name });
              setTab('cards');
            }} />
          )}
        </main>

        {tab === 'cards' && selected && narrow && (
          <div className="scrim" onClick={() => setSelected(null)} aria-hidden="true" />
        )}
        {tab === 'cards' && selected && (
          <CardDetail
            card={selected}
            onClose={() => setSelected(null)}
            onSelectPack={(name) => {
              setFilters({ ...EMPTY_FILTERS, pack: name });
              // The panel described one card; the list is now the whole pack,
              // so leaving it open would keep an unrelated card on screen.
              setSelected(null);
            }}
          />
        )}
      </div>
    </div>
  );
}
