/**
 * A pack's unlock conditions. They are alternatives — any one unlocks the
 * pack — so two or more read as a bullet list; a single one is plain text.
 */
export function Unlocks({ list, className = '' }: { list: string[]; className?: string }) {
  if (list.length <= 1) return <div className={`unlock ${className}`.trim()}>{list[0] ?? ''}</div>;
  return <ul className={`unlock ${className}`.trim()}>{list.map((u) => <li key={u}>{u}</li>)}</ul>;
}
