import { BAN_LISTS, DEFAULT_BAN_LIST, type Card, type Stat } from '../types';
import { frameOf, frameClass, FRAME_LABEL } from '../cardFrame';
import { RARITY_CLASS } from '../rarity';
import { AttributeIcon, TypeIcon, CardTypeIcon, LevelIcon, AtkIcon, DefIcon, BanIcon, SourceIcon } from './Icons';
import { Unlocks } from './Unlocks';

const WIKI = 'https://yugipedia.com/wiki/';
// BASE_URL keeps these correct under the /<repo>/ path GitHub Pages serves from.
const IMG = `${import.meta.env.BASE_URL}img/cards/`;


/**
 * ATK/DEF of "?" is stored as -1. A string is a literal the card prints in
 * place of a number, e.g. the Egyptian Gods' "X000" and "????".
 */
const stat = (v: Stat | undefined) =>
  v == null ? '—' : typeof v === 'string' ? v : v < 0 ? '?' : String(v);

export default function CardDetail({ card, onClose, onSelectPack }: {
  card: Card;
  onClose: () => void;
  /** Filter the card list to a pack. Only pack sources are actionable. */
  onSelectPack: (packName: string) => void;
}) {
  const monsterLine = [card.race, ...(card.monsterTypes ?? [])].filter(Boolean).join(' / ');

  return (
    <aside className="detail">
      <button className="close" onClick={onClose} aria-label="Close">×</button>
      <img
        className="cardart"
        src={`${IMG}${card.id}.webp`}
        alt={`${card.name} card art`}
        width={108}
        height={152}
        loading="lazy"
        // A card whose art is not a Tag Force screenshot may need a filter to
        // line its palette up with the rest. See artOverrides in overrides.
        style={card.artFilter ? { filter: card.artFilter } : undefined}
        onError={(e) => { e.currentTarget.style.display = 'none'; }}
      />
      <h3 className={frameClass(card, 'frame')}>{card.name}</h3>
      <div className="id">
        <span className="num">#{card.id}</span>
        {card.gameOriginal && <span className="tag tag-accent">Game Original</span>}
        {/* An alternate artwork is its own entry in the Trunk, so it needs a
            label to tell it apart from the ordinary printing of the same card. */}
        {card.variant && (
          <span className="tag tag-accent" title="Alternate artwork, a separate card in the Trunk">
            {card.variant}
          </span>
        )}
      </div>

      <dl>
        <dt>Type</dt>
        <dd className={frameClass(card, 'frame')} title={`${FRAME_LABEL[frameOf(card)]} frame`}>
          {/* Monsters show only their Type icon here: the frame is already
              carried by the heading colour, so a frame swatch would repeat it.
              Spells and Traps keep theirs, which is their property symbol. */}
          {card.cardType === 'Monster'
            ? <><TypeIcon race={card.race} />{monsterLine}</>
            : <><CardTypeIcon card={card} />{`${card.spellTrapType} ${card.cardType}`}</>}
        </dd>
        {card.cardType === 'Monster' && (
          <>
            <dt>Attribute</dt>
            <dd className={card.attribute ? `attr-${card.attribute}` : ''}>
              <AttributeIcon attribute={card.attribute} />{card.attribute}
            </dd>
            <dt>Level</dt><dd><LevelIcon />{card.level}</dd>
            <dt>ATK / DEF</dt>
            <dd><AtkIcon />{stat(card.atk)}<span className="sep" /><DefIcon />{stat(card.def)}</dd>
          </>
        )}
        <dt title={`The default in-game list (${DEFAULT_BAN_LIST})`}>Ban Status</dt>
        <dd className={`ban ban-${card.banStatus}`}>
          <BanIcon status={card.banStatus} />{card.banStatus}
        </dd>
        {/* The two downloadable lists, only where they differ from the default. */}
        {BAN_LISTS.filter((l) => l !== DEFAULT_BAN_LIST && card.banStatusByList[l] !== card.banStatus).map((l) => (
          <span key={l} style={{ display: 'contents' }}>
            <dt title={`The downloadable ${l} list`}>{l}</dt>
            <dd className={`ban ban-${card.banStatusByList[l]}`}>
              <BanIcon status={card.banStatusByList[l]} />{card.banStatusByList[l]}
            </dd>
          </span>
        ))}
        {card.password && (<><dt>Password</dt><dd className="mono">{card.password}</dd></>)}
      </dl>

      {card.text && <div className="cardtext">{card.text}</div>}

      <h4>How to Obtain ({card.sources.length})</h4>
      {card.sources.length === 0 && (
        <div className="source">
          <div className="nm"><span className="label">Not Obtainable</span></div>
          <div className="meta">A Game Original card counted in the game's 3,501, but in no Booster Pack, not in
            the Card Converter, and on no documented download. Reportedly obtained by UMD Recognition or
            download; the exact method is not documented.</div>
        </div>
      )}
      {card.sources.map((s, i) => {
        const body = (
          <>
            <div className="nm">
              <span className="kind"><SourceIcon kind={s.type} /></span>
              <span className="label">{s.name}</span>
              {s.rarity && (
                <span className={`badge rarity ${RARITY_CLASS[s.rarity] ?? ''}`}>{s.rarity}</span>
              )}
            </div>
            {s.unlock?.length
              ? <Unlocks list={s.unlock} className="meta" />
              : s.detail && <div className="meta">{s.detail}</div>}
          </>
        );
        return s.type === 'pack' ? (
          <button className="source is-link" key={i} onClick={() => onSelectPack(s.name)}
            title={`Show every card in ${s.name}`}>
            {body}
          </button>
        ) : (
          <div className="source" key={i}>{body}</div>
        );
      })}

      {card.genres.length > 0 && (
        <>
          <h4 style={{ marginTop: 14 }}>Genres</h4>
          <div className="chips">{card.genres.map((g) => <span className="tag" key={g}>{g}</span>)}</div>
        </>
      )}

      <div className="links">
        {/* Always the general card page: the "(Tag Force 3)" page exists for
            only a quarter of the pool, so linking it would 404 for the rest. */}
        <a href={`${WIKI}${encodeURIComponent(card.wikiLink)}`} target="_blank" rel="noreferrer">Yugipedia ↗</a>
        <a href={`https://ygoprodeck.com/card/?search=${encodeURIComponent(card.name)}`} target="_blank" rel="noreferrer">YGOPRODeck ↗</a>
      </div>
    </aside>
  );
}
