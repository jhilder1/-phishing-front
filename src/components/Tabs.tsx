import { useId, useRef, type KeyboardEvent, type ReactNode } from 'react';

export interface TabItem {
  id: string;
  label: string;
}

interface TabsProps {
  items: TabItem[];
  activeId: string;
  onChange: (id: string) => void;
  className?: string;
}

/**
 * Componente de pestañas accesible con soporte completo para teclado (WAI-ARIA Tabs pattern).
 * Conforme a §4.2 (P03-E3) y AC-A11Y-01.
 */
export function Tabs({ items, activeId, onChange, className = '' }: TabsProps) {
  const baseId = useId();
  const tabRefs = useRef<Map<string, HTMLButtonElement>>(new Map());

  const handleKeyDown = (e: KeyboardEvent<HTMLButtonElement>, currentIndex: number) => {
    let targetIndex = currentIndex;

    if (e.key === 'ArrowRight') {
      targetIndex = (currentIndex + 1) % items.length;
    } else if (e.key === 'ArrowLeft') {
      targetIndex = (currentIndex - 1 + items.length) % items.length;
    } else if (e.key === 'Home') {
      targetIndex = 0;
    } else if (e.key === 'End') {
      targetIndex = items.length - 1;
    } else {
      return;
    }

    e.preventDefault();
    const nextItem = items[targetIndex];
    if (nextItem) {
      onChange(nextItem.id);
      tabRefs.current.get(nextItem.id)?.focus();
    }
  };

  return (
    <div className={`tabs-container ${className}`.trim()} role="tablist">
      {items.map((item, index) => {
        const isSelected = item.id === activeId;
        const tabId = `${baseId}-tab-${item.id}`;
        const panelId = `${baseId}-panel-${item.id}`;

        return (
          <button
            key={item.id}
            id={tabId}
            ref={(el) => {
              if (el) tabRefs.current.set(item.id, el);
              else tabRefs.current.delete(item.id);
            }}
            type="button"
            role="tab"
            aria-selected={isSelected}
            aria-controls={panelId}
            tabIndex={isSelected ? 0 : -1}
            className={`tab-button ${isSelected ? 'tab-button--active' : ''}`}
            onClick={() => onChange(item.id)}
            onKeyDown={(e) => handleKeyDown(e, index)}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}

interface TabPanelProps {
  id: string;
  activeId: string;
  children: ReactNode;
  className?: string;
}

export function TabPanel({ id, activeId, children, className = '' }: TabPanelProps) {
  const isSelected = id === activeId;

  return (
    <div
      role="tabpanel"
      id={`panel-${id}`}
      aria-labelledby={`tab-${id}`}
      hidden={!isSelected}
      tabIndex={0}
      className={`tab-panel ${isSelected ? 'tab-panel--active' : ''} ${className}`.trim()}
    >
      {isSelected && children}
    </div>
  );
}
