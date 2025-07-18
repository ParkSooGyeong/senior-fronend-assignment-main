import React, { useEffect, useRef, useCallback, forwardRef, useImperativeHandle } from 'react';

interface VirtualScrollerProps<T> {
  items: T[];
  itemHeight: number;
  overscan?: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  className?: string;
  onScroll?: (scrollTop: number, scrollHeight?: number, clientHeight?: number) => void;
  onItemVisible?: (index: number) => void;
}

export interface VirtualScrollerRef {
  scrollToBottom: () => void;
  scrollToTop: () => void;
  scrollToIndex: (index: number) => void;
  containerRef: React.RefObject<HTMLDivElement>;
}

export const VirtualScroller = forwardRef<VirtualScrollerRef, VirtualScrollerProps<any>>(function VirtualScroller<T>({
  items,
  renderItem,
  className = '',
  onScroll,
}: VirtualScrollerProps<T>, ref: React.Ref<VirtualScrollerRef>) {
  const containerRef = useRef<HTMLDivElement>(null);

  // 스크롤 이벤트 핸들러
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    if (!target) return;

    const { scrollTop, scrollHeight, clientHeight } = target;
    onScroll?.(scrollTop, scrollHeight, clientHeight);
  }, [onScroll]);

  // ref 메서드 구현
  useImperativeHandle(ref, () => ({
    scrollToBottom: () => {
      if (!containerRef.current) return;
      
      requestAnimationFrame(() => {
        if (containerRef.current) {
          containerRef.current.scrollTop = containerRef.current.scrollHeight;
        }
      });
    },
    scrollToTop: () => {
      if (!containerRef.current) return;
      
      requestAnimationFrame(() => {
        if (containerRef.current) {
          containerRef.current.scrollTop = 0;
        }
      });
    },
    scrollToIndex: (index: number) => {
      if (!containerRef.current) return;
      
      const element = containerRef.current.children[index] as HTMLElement;
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    },
    containerRef
  }), []);

  return (
    <div
      ref={containerRef}
      className={`overflow-auto scroll-container ${className}`}
      onScroll={handleScroll}
      style={{
        height: '100%'
      }}
    >
      {items.map((item, index) => (
        <div key={index}>
          {renderItem(item, index)}
        </div>
      ))}
    </div>
  );
}); 