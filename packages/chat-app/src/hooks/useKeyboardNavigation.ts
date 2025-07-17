import { useCallback, useEffect, useRef, useState } from 'react';

interface UseKeyboardNavigationOptions {
  itemCount: number;
  onSelect?: (index: number) => void;
  onEscape?: () => void;
  enabled?: boolean;
  loop?: boolean;
}

export const useKeyboardNavigation = ({
  itemCount,
  onSelect,
  onEscape,
  enabled = true,
  loop = true,
}: UseKeyboardNavigationOptions) => {
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return;

      switch (event.key) {
        case 'ArrowDown':
        case 'j':
          event.preventDefault();
          setFocusedIndex((prev) => {
            const next = prev + 1;
            return next >= itemCount ? (loop ? 0 : prev) : next;
          });
          break;

        case 'ArrowUp':
        case 'k':
          event.preventDefault();
          setFocusedIndex((prev) => {
            const next = prev - 1;
            return next < 0 ? (loop ? itemCount - 1 : prev) : next;
          });
          break;

        case 'Home':
          event.preventDefault();
          setFocusedIndex(0);
          break;

        case 'End':
          event.preventDefault();
          setFocusedIndex(itemCount - 1);
          break;

        case 'Enter':
        case ' ':
          if (focusedIndex !== -1) {
            event.preventDefault();
            onSelect?.(focusedIndex);
          }
          break;

        case 'Escape':
          event.preventDefault();
          setFocusedIndex(-1);
          onEscape?.();
          break;
      }
    },
    [enabled, itemCount, loop, focusedIndex, onSelect, onEscape]
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('keydown', handleKeyDown);
    return () => {
      container.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  const getItemProps = useCallback(
    (index: number) => ({
      tabIndex: index === focusedIndex ? 0 : -1,
      'aria-selected': index === focusedIndex,
      onFocus: () => setFocusedIndex(index),
      onBlur: () => setFocusedIndex(-1),
      onClick: () => onSelect?.(index),
    }),
    [focusedIndex, onSelect]
  );

  const getContainerProps = useCallback(
    () => ({
      ref: containerRef,
      tabIndex: focusedIndex === -1 ? 0 : -1,
      role: 'listbox',
      'aria-activedescendant': focusedIndex !== -1 ? `item-${focusedIndex}` : undefined,
    }),
    [focusedIndex]
  );

  return {
    focusedIndex,
    getItemProps,
    getContainerProps,
  };
}; 