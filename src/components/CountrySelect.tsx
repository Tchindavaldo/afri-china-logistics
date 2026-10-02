import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { Check, ChevronDown, Search } from 'lucide-react';
import { COUNTRIES, flag, REGIONS } from '../lib/countries';
import { cn } from '../lib/format';

interface CountrySelectProps {
  value: string;
  onChange: (code: string) => void;
  placeholder?: string;
  hasError?: boolean;
  id?: string;
}

// Recherche insensible aux accents et à la casse.
const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

export default function CountrySelect({ value, onChange, placeholder = 'Sélectionner un pays', hasError = false, id }: CountrySelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const listId = useId();

  const selected = COUNTRIES.find((c) => c.code === value);

  const filtered = useMemo(() => {
    const q = norm(query.trim());
    const list = q ? COUNTRIES.filter((c) => norm(c.name).includes(q) || norm(c.code).includes(q)) : COUNTRIES;
    // Ordre stable par région pour l'affichage groupé
    return REGIONS.flatMap((r) => list.filter((c) => c.region === r));
  }, [query]);

  const close = useCallback(() => {
    setOpen(false);
    setQuery('');
    setActive(0);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) close();
    };
    document.addEventListener('mousedown', onClickOutside);
    inputRef.current?.focus();
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, [open, close]);

  useEffect(() => {
    listRef.current?.querySelector<HTMLElement>(`[data-index="${active}"]`)?.scrollIntoView({ block: 'nearest' });
  }, [active]);

  const select = (code: string) => {
    onChange(code);
    close();
  };

  return (
    <div className="relative" ref={containerRef}>
      <button
        id={id}
        type="button"
        onClick={() => (open ? close() : setOpen(true))}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={cn('input flex items-center justify-between gap-2 text-left', hasError && 'input-error', !selected && 'text-muted/70')}
      >
        <span className="flex min-w-0 items-center gap-2 truncate">
          {selected ? (
            <>
              <span className="text-lg leading-none">{flag(selected.code)}</span>
              <span className="truncate text-ink">{selected.name}</span>
              <span className="font-mono text-xs text-muted">{selected.code}</span>
            </>
          ) : (
            placeholder
          )}
        </span>
        <ChevronDown className={cn('size-4 shrink-0 text-muted transition-transform', open && 'rotate-180')} />
      </button>

      {open && (
        <div className="absolute z-30 mt-1.5 w-full overflow-hidden rounded-[12px] border border-line bg-white shadow-[0_24px_50px_-20px_rgba(10,27,77,0.4)]">
          <div className="relative border-b border-line p-2">
            <Search className="pointer-events-none absolute top-1/2 left-5 size-4 -translate-y-1/2 text-muted/70" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setActive(0);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Escape') close();
                else if (e.key === 'ArrowDown') {
                  e.preventDefault();
                  setActive((a) => Math.min(filtered.length - 1, a + 1));
                } else if (e.key === 'ArrowUp') {
                  e.preventDefault();
                  setActive((a) => Math.max(0, a - 1));
                } else if (e.key === 'Enter' && filtered[active]) {
                  e.preventDefault();
                  select(filtered[active].code);
                }
              }}
              placeholder="Rechercher un pays…"
              aria-controls={listId}
              className="h-10 w-full rounded-lg bg-cobalt-50/60 pr-3 pl-9 text-sm focus:outline-none"
            />
          </div>
          <ul ref={listRef} id={listId} role="listbox" className="max-h-64 overflow-y-auto py-1">
            {filtered.length === 0 && <li className="px-4 py-3 text-sm text-muted">Aucun pays trouvé</li>}
            {filtered.map((c, i) => {
              const header = i === 0 || filtered[i - 1].region !== c.region ? c.region : null;
              return (
                <li key={c.code} role="presentation">
                  {header && <p className="px-4 pt-3 pb-1 font-mono text-[10px] tracking-[0.18em] text-muted uppercase">{header}</p>}
                  <button
                    type="button"
                    role="option"
                    aria-selected={c.code === value}
                    data-index={i}
                    onMouseEnter={() => setActive(i)}
                    onClick={() => select(c.code)}
                    className={cn(
                      'flex w-full items-center gap-2.5 px-4 py-2 text-left text-sm',
                      i === active ? 'bg-cobalt-50 text-cobalt-700' : 'text-ink',
                      c.code === value && 'font-semibold'
                    )}
                  >
                    <span className="text-base leading-none">{flag(c.code)}</span>
                    <span className="flex-1">{c.name}</span>
                    <span className="font-mono text-[11px] text-muted">{c.code}</span>
                    {c.code === value && <Check className="size-4 text-cobalt-500" />}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
