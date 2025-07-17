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
}

export const VirtualScroller = forwardRef<VirtualScrollerRef, VirtualScrollerProps<any>>(function VirtualScroller<T>({
  items,
  itemHeight,
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
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (containerRef.current) {
      setContainerHeight(containerRef.current.clientHeight);
    }
  }, []);

  const calculateVisibleRange = useCallback(() => {
    const startIndex = Math.floor(scrollTop / itemHeight);
    const endIndex = Math.min(
      startIndex + Math.ceil(containerHeight / itemHeight) + 1,
      items.length - 1
    );
    return { startIndex, endIndex };
  }, [scrollTop, itemHeight, containerHeight, items.length]);

  // 스크롤 이벤트 핸들러 최적화
  const throttledOnScroll = useThrottle((scrollTop: number, scrollHeight: number, clientHeight: number) => {
    onScroll?.(scrollTop, scrollHeight, clientHeight);
  }, 100);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const scrollTop = e.currentTarget.scrollTop;
    const { scrollHeight, clientHeight } = e.currentTarget;
    setScrollTop(scrollTop);
    throttledOnScroll(scrollTop, scrollHeight, clientHeight);
  }, [throttledOnScroll]);

  // Throttle visible items change callback
  const throttledVisibleItemsChange = useThrottle((startIndex: number) => {
    onItemVisible?.(startIndex);
  }, 200);

  const handleVisibleItemsChange = useCallback(() => {
    const { startIndex } = calculateVisibleRange();
    throttledVisibleItemsChange(startIndex);
  }, [calculateVisibleRange, throttledVisibleItemsChange]);

  useEffect(() => {
    handleVisibleItemsChange();
  }, [handleVisibleItemsChange]);

  const { startIndex, endIndex } = calculateVisibleRange();
  const visibleItems = items.slice(startIndex, endIndex + 1);

  const offsetY = startIndex * itemHeight;
  const totalHeight = items.length * itemHeight;

  // ref를 통해 스크롤 제어 메서드 노출
  useImperativeHandle(ref, () => ({
    scrollToBottom: () => {
      if (containerRef.current) {
        containerRef.current.scrollTo({
          top: totalHeight,
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
        const targetScrollTop = index * itemHeight;
        containerRef.current.scrollTo({
          top: targetScrollTop,
          behavior: 'smooth'
        });
      }
    }
  }), [totalHeight, itemHeight]);

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
      <div
        style={{
          height: totalHeight,
          position: 'relative',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            transform: `translateY(${offsetY}px)`,
          }}
        >
          {visibleItems.map((item, index) =>
            renderItem(item, startIndex + index)
          )}
        </div>
      </div>
    </div>
  );
}); 