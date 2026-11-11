import { useEffect, useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import type { Card, Stat } from '../types';
import { frameClass, subtype } from '../cardFrame';
import { RARITY_CLASS } from '../rarity';
import { AttributeIcon, TypeIcon, CardTypeIcon, LevelIcon, AtkIcon, DefIcon, BanIcon } from './Icons';

export type SortKey = 'id' | 'name' | 'cardType' | 'attribute' | 'race' | 'level' | 'atk' | 'def' | 'banStatus' | 'rarity';

interface Column {
  key: SortKey;
  label: string;
  width: string;
  numeric?: boolean;
}



const COLUMNS: Column[] = [
  { key: 'id', label: '#', width: '64px', numeric: true },
  { key: 'name', label: 'Name', width: 'auto' },
  { key: 'cardType', label: 'Type', width: '176px' },
  { key: 'attribute', label: 'Attr', width: '96px' },
  { key: 'race', label: 'Monster Type', width: '120px' },
  { key: 'level', label: 'Lv', width: '68px', numeric: true },
  { key: 'atk', label: 'ATK', width: '86px', numeric: true },
  { key: 'def', label: 'DEF', width: '86px', numeric: true },
  { key: 'banStatus', label: 'Ban', width: '118px' },
  { key: 'rarity', label: 'Rarity', width: '104px' },
];

const ROW_HEIGHT = 30;
/** "?" is stored as -1; a string is a literal printed value ("X000", "????"). */
const stat = (v: Stat | undefined) =>
  v == null ? '' : typeof v === 'string' ? v : v < 0 ? '?' : String(v);


export default function CardTable({ cards, sort, desc, onSort, selected, onSelect }: {
  cards: Card[];
  sort: SortKey;
  desc: boolean;
  onSort: (key: SortKey) => void;
  selected: Card | null;
  onSelect: (c: Card) => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const columns = COLUMNS;

  // A full card pool is well past what the DOM handles comfortably, so only the
  // visible window is rendered; padding rows preserve the scrollbar geometry.
  const virtualizer = useVirtualizer({
    count: cards.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 12,
  });

  // Arrow keys walk the list, Enter/Escape open and close. Kept here because
  // moving the selection has to scroll the virtualizer, which only exists here.
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const el = document.activeElement as HTMLElement | null;
      const tag = el?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || el?.isContentEditable) return;
      if (!cards.length) return;

      const step = { ArrowDown: 1, ArrowUp: -1, PageDown: 10, PageUp: -10 }[e.key];
      if (step === undefined) return;

      e.preventDefault();
      const current = selected ? cards.findIndex((c) => c.id === selected.id) : -1;
      // With nothing selected, ArrowDown starts at the top and ArrowUp at the bottom.
      const next = current === -1
        ? (step > 0 ? 0 : cards.length - 1)
        : Math.min(cards.length - 1, Math.max(0, current + step));

      onSelect(cards[next]);
      virtualizer.scrollToIndex(next, { align: 'auto' });
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [cards, selected, onSelect, virtualizer]);

  const items = virtualizer.getVirtualItems();
  const padTop = items.length ? items[0].start : 0;
  const padBottom = items.length ? virtualizer.getTotalSize() - items[items.length - 1].end : 0;

  return (
    <div className="scroll" ref={scrollRef}>
      <table>
        <colgroup>{columns.map((c) => <col key={c.key} style={{ width: c.width }} />)}</colgroup>
        <thead>
          <tr>
            {columns.map((c) => (
              <th key={c.key} className={c.numeric ? 'num' : ''} onClick={() => onSort(c.key)}
                title={`Sort by ${c.label}`}>
                {c.label}{sort === c.key && <span className="arrow"> {desc ? '▼' : '▲'}</span>}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {padTop > 0 && <tr className="pad" style={{ height: padTop }} />}
          {items.map((v) => {
            const c = cards[v.index];
            return (
              <tr key={c.id} className={frameClass(c, 'row')} style={{ height: ROW_HEIGHT }}
                aria-selected={selected?.id === c.id} onClick={() => onSelect(c)}>
                {columns.map((col) => {
                  switch (col.key) {
                    case 'id': return <td key="id" className="num">{c.id}</td>;
                    case 'name': return (
                      <td key="name" title={c.variant ? `${c.name} (${c.variant})` : c.name}>
                        {c.name}
                        {c.variant && <span className="variant"> ({c.variant})</span>}
                      </td>);
                    case 'cardType': return (
                      <td key="cardType" className={frameClass(c, 'frame')} title={subtype(c)}>
                        <CardTypeIcon card={c} />{subtype(c)}
                      </td>);
                    case 'attribute': return (
                      <td key="attribute" className={c.attribute ? `attr-${c.attribute}` : ''}
                        title={c.attribute ?? ''}>
                        <AttributeIcon attribute={c.attribute} />{c.attribute ?? ''}
                      </td>);
                    case 'race': return (
                      <td key="race" title={c.race ?? ''}><TypeIcon race={c.race} />{c.race ?? ''}</td>);
                    case 'level': return (
                      <td key="level" className="num">
                        {c.level != null && <><LevelIcon />{c.level}</>}
                      </td>);
                    case 'atk': return (
                      <td key="atk" className="num">
                        {c.atk != null && <><AtkIcon />{stat(c.atk)}</>}
                      </td>);
                    case 'def': return (
                      <td key="def" className="num">
                        {c.def != null && <><DefIcon />{stat(c.def)}</>}
                      </td>);
                    case 'banStatus': return (
                      <td key="ban" className={`ban ban-${c.banStatus}`} title={c.banStatus}>
                        <BanIcon status={c.banStatus} />
                        {c.banStatus === 'Unlimited' ? '—' : c.banStatus}
                      </td>);
                    case 'rarity': return (
                      <td key="rarity" className={`rarity ${c.rarity ? RARITY_CLASS[c.rarity] ?? '' : ''}`}>
                        {c.rarity ?? '—'}
                      </td>);
                    default: return null;
                  }
                })}
              </tr>
            );
          })}
          {padBottom > 0 && <tr className="pad" style={{ height: padBottom }} />}
        </tbody>
      </table>
      {cards.length === 0 && <div className="empty">No cards match these filters.</div>}
    </div>
  );
}
