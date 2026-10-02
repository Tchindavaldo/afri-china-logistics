import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import { cn } from '../lib/format';

interface ComboInputProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  options: readonly string[];
  placeholder?: string;
  /** Classes du champ (ex. `input input-error`). */
  className?: string;
}

const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

/**
 * Champ texte libre avec liste de suggestions : la liste s'ouvre dès le clic
 * ou le focus sur le champ (pas seulement sur la flèche), se filtre pendant la
 * saisie et se pilote au clavier.
 */
export default function ComboInput({ id, value, onChange, options, placeholder, className }: ComboInputProps) {
  const [open, setOpen] = useState(false);
  // Filtre seulement après une saisie : au clic, on montre toute la liste.
  const [filtering, setFiltering] = useState(false);
  const [active, setActive] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const listId = useId();

  const items = useMemo(() => {
    const q = norm(value.trim());
    return filtering && q ? options.filter((o) => norm(o).includes(q)) : options;
  }, [filtering, value, options]);

  useEffect(() => {
    if (open && active >= 0) {
      listRef.current?.querySelector<HTMLElement>(`[data-index="${active}"]`)?.scrollIntoView({ block: 'nearest' });
    }
  }, [open, active]);

  const show = () => {
    setFiltering(false);
    setActive(options.indexOf(value));
    setOpen(true);
  };

  const pick = (v: string) => {
    onChange(v);
    setOpen(false);
  };

  return (
    <div className="relative">
      <input
        ref={inputRef}
        id={id}
        value={value}
        placeholder={placeholder}
        autoComplete="off"
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        aria-autocomplete="list"
        className={cn(className, 'pr-11')}
        onFocus={show}
        onClick={() => !open && show()}
        onBlur={() => setOpen(false)}
        onChange={(e) => {
          onChange(e.target.value);
          setFiltering(true);
          setActive(-1);
          setOpen(true);
        }}
        onKeyDown={(e) => {
          if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (!open) show();
            else setActive((a) => Math.min(items.length - 1, a + 1));
          } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setActive((a) => Math.max(0, a - 1));
          } else if (e.key === 'Enter' && open && items[active]) {
            e.preventDefault();
            pick(items[active]);
          } else if (e.key === 'Escape' && open) {
            // Ferme la liste sans fermer le panneau qui contient le champ.
            e.preventDefault();
            e.nativeEvent.stopPropagation();
            setOpen(false);
          }
        }}
      />
      <button
        type="button"
        tabIndex={-1}
        aria-label={open ? 'Fermer les suggestions' : 'Afficher les suggestions'}
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => {
          if (open) setOpen(false);
          else {
            inputRef.current?.focus();
            show();
          }
        }}
        className="absolute inset-y-0 right-0 grid w-11 place-items-center text-muted hover:text-cobalt-500"
      >
        <ChevronDown className={cn('size-4 transition-transform', open && 'rotate-180')} />
      </button>

      {open && items.length > 0 && (
        <ul
          ref={listRef}
          id={listId}
          role="listbox"
          className="absolute z-30 mt-1.5 max-h-60 w-full overflow-y-auto rounded-[12px] border border-line bg-white py-1 shadow-[0_24px_50px_-20px_rgba(10,27,77,0.4)]"
        >
          {items.map((o, i) => (
            <li
              key={o}
              role="option"
              aria-selected={o === value}
              data-index={i}
              onMouseDown={(e) => e.preventDefault()}
              onMouseEnter={() => setActive(i)}
              onClick={() => pick(o)}
              className={cn(
                'flex cursor-pointer items-center gap-2 px-4 py-2.5 text-sm',
                i === active ? 'bg-cobalt-50 text-cobalt-700' : 'text-ink',
                o === value && 'font-semibold'
              )}
            >
              <span className="flex-1">{o}</span>
              {o === value && <Check className="size-4 shrink-0 text-cobalt-500" />}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
