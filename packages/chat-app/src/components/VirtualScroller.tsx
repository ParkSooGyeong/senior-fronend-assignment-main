import React, { useEffect, useRef, useState, useCallback, forwardRef, useImperativeHandle } from 'react';
import { useThrottle } from '../utils/performance';

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
  itemHeight: defaultItemHeight,
  overscan = 3,
  renderItem,
  className = '',
  onScroll,
  onItemVisible,
}: VirtualScrollerProps<T>, ref: React.Ref<VirtualScrollerRef>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeight, setContainerHeight] = useState(0);

  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        setContainerHeight(containerRef.current.clientHeight);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const calculateVisibleRange = useCallback(() => {
    const itemsPerPage = Math.ceil(containerHeight / defaultItemHeight);
    const startIndex = Math.max(0, Math.floor(scrollTop / defaultItemHeight) - overscan);
    const endIndex = Math.min(
      items.length,
      Math.ceil((scrollTop + containerHeight) / defaultItemHeight) + overscan
    );

    return {
      startIndex,
      endIndex,
      itemsPerPage
    };
  }, [scrollTop, containerHeight, defaultItemHeight, items.length, overscan]);

  const throttledOnScroll = useThrottle((scrollTop: number, scrollHeight: number, clientHeight: number) => {
    onScroll?.(scrollTop, scrollHeight, clientHeight);
  }, 100);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const scrollTop = e.currentTarget.scrollTop;
    const { scrollHeight, clientHeight } = e.currentTarget;
    setScrollTop(scrollTop);
    throttledOnScroll(scrollTop, scrollHeight, clientHeight);
  }, [throttledOnScroll]);

  const { startIndex, endIndex } = calculateVisibleRange();
  const visibleItems = items.slice(startIndex, endIndex);
  const totalHeight = items.length * defaultItemHeight;

  useImperativeHandle(ref, () => ({
    scrollToBottom: () => {
      if (containerRef.current) {
        const { scrollHeight, clientHeight } = containerRef.current;
        const maxScrollTop = scrollHeight - clientHeight;
        containerRef.current.scrollTo({
          top: maxScrollTop,
          behavior: 'smooth'
        });
      }
    },
    scrollToTop: () => {
      if (containerRef.current) {
        containerRef.current.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      }
    },
    scrollToIndex: (index: number) => {
      if (containerRef.current) {
        const targetScrollTop = index * defaultItemHeight;
        containerRef.current.scrollTo({
          top: targetScrollTop,
          behavior: 'smooth'
        });
      }
    },
    containerRef
  }), [defaultItemHeight]);

  return (
    <div
      ref={containerRef}
      className={`overflow-auto relative scroll-container ${className}`}
      onScroll={handleScroll}
      style={{ 
        willChange: 'scroll-position',
        transform: 'translateZ(0)',
        backfaceVisibility: 'hidden'
      }}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            transform: `translateY(${startIndex * defaultItemHeight}px)`,
          }}
        >
          {visibleItems.map((item, index) => (
            <div key={startIndex + index}>
              {renderItem(item, startIndex + index)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}); 