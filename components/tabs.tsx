'use client';

// Client: it holds the selected tab and moves focus on arrow keys. Panel
// content arrives as ReactNode, so a Server Component can still render it.
import { useId, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { cn, rovingIndex } from '@/lib/utils';

type Props = {
  /** Tab label (unique, also the value) and the panel it shows. */
  items: readonly { label: string; content: ReactNode }[];
  /** Accessible name of the tab strip, e.g. "Quest sections". */
  label: string;
  /** Label of the tab open on first render (uncontrolled). Defaults to the first one. */
  defaultValue?: string;
  /** Controlled: the open tab's label. Pair it with onValueChange. */
  value?: string;
  /** Called with the new label on every selection, controlled or not. */
  onValueChange?: (label: string) => void;
  className?: string;
};

/** HUD tab strip + panels, WAI-ARIA tabs pattern (roving tabindex, arrows, Home/End). Styles: tabs.css. */
export function Tabs({ items, label, defaultValue, value, onValueChange, className }: Props) {
  const id = useId();
  const [internal, setInternal] = useState(defaultValue ?? items[0]?.label);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const selected = value ?? internal;
  const current = Math.max(
    items.findIndex((it) => it.label === selected),
    0,
  );

  function select(index: number) {
    const next = items[index].label;
    setInternal(next);
    onValueChange?.(next);
  }

  function onKeyDown(event: KeyboardEvent) {
    const next = rovingIndex(event.key, current, items.length);
    if (next === null) return;
    event.preventDefault();
    select(next);
    tabs.current[next]?.focus();
  }

  return (
    <div className={cn('tabs', className)}>
      <div role="tablist" aria-label={label} className="tabs-list" onKeyDown={onKeyDown}>
        {items.map((it, i) => (
          <button
            key={it.label}
            ref={(el) => {
              tabs.current[i] = el;
            }}
            type="button"
            role="tab"
            id={`${id}-tab-${i}`}
            aria-controls={`${id}-panel-${i}`}
            aria-selected={i === current}
            tabIndex={i === current ? 0 : -1}
            className="tabs-tab"
            onClick={() => select(i)}
          >
            {it.label}
          </button>
        ))}
      </div>
      {items.map((it, i) => (
        <div
          key={it.label}
          role="tabpanel"
          id={`${id}-panel-${i}`}
          aria-labelledby={`${id}-tab-${i}`}
          hidden={i !== current}
          tabIndex={0}
        >
          {it.content}
        </div>
      ))}
    </div>
  );
}
