import React, { useEffect, useRef, useState, useCallback, forwardRef, useImperativeHandle, useMemo } from 'react';

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
  overscan = 5,
  renderItem,
  className = '',
  onScroll,
  onItemVisible,
}: VirtualScrollerProps<T>, ref: React.Ref<VirtualScrollerRef>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeight, setContainerHeight] = useState(0);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  const isScrollingRef = useRef(false);

  // 컨테이너 크기 업데이트 함수
  const updateContainerHeight = useCallback(() => {
    if (containerRef.current) {
      const height = containerRef.current.clientHeight;
      if (height !== containerHeight) {
        setContainerHeight(height);
      }
    }
  }, [containerHeight]);

  useEffect(() => {
    updateContainerHeight();

    // ResizeObserver 설정
    if (containerRef.current && 'ResizeObserver' in window) {
      resizeObserverRef.current = new ResizeObserver(updateContainerHeight);
      resizeObserverRef.current.observe(containerRef.current);
    }

    // 폴백으로 window resize 이벤트 사용
    window.addEventListener('resize', updateContainerHeight);

    return () => {
      window.removeEventListener('resize', updateContainerHeight);
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
      }
    };
  }, [updateContainerHeight]);

  // 가시 범위 계산 (메모화)
  const { startIndex, endIndex, totalHeight } = useMemo(() => {
    if (!containerHeight || items.length === 0) {
      return { startIndex: 0, endIndex: 0, totalHeight: 0 };
    }

    const total = items.length * defaultItemHeight;
    const start = Math.max(0, Math.floor(scrollTop / defaultItemHeight) - overscan);
    const end = Math.min(
      items.length,
      Math.ceil((scrollTop + containerHeight) / defaultItemHeight) + overscan
    );

    return {
      startIndex: start,
      endIndex: end,
      totalHeight: total
    };
  }, [scrollTop, containerHeight, defaultItemHeight, items.length, overscan]);

  // 가시 아이템 메모화
  const visibleItems = useMemo(() => {
    return items.slice(startIndex, endIndex);
  }, [items, startIndex, endIndex]);

  // 스크롤 이벤트 핸들러
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    if (isScrollingRef.current) return;

    const target = e.currentTarget;
    if (!target) return;

    isScrollingRef.current = true;

    requestAnimationFrame(() => {
      try {
        if (target && target.scrollTop !== undefined) {
          const { scrollTop, scrollHeight, clientHeight } = target;
          setScrollTop(scrollTop);
          onScroll?.(scrollTop, scrollHeight, clientHeight);
        }
      } catch (error) {
        console.warn('Scroll handler error:', error);
      } finally {
        isScrollingRef.current = false;
      }
    });
  }, [onScroll]);

  // ref 메서드 구현
  useImperativeHandle(ref, () => ({
    scrollToBottom: () => {
      if (!containerRef.current) return;
      
      try {
        containerRef.current.scrollTo({
          top: containerRef.current.scrollHeight,
          behavior: 'smooth'
        });
      } catch (error) {
        // 폴백: 즉시 스크롤
        if (containerRef.current) {
          containerRef.current.scrollTop = containerRef.current.scrollHeight;
        }
      }
    },
    scrollToTop: () => {
      if (!containerRef.current) return;
      
      try {
        containerRef.current.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      } catch (error) {
        if (containerRef.current) {
          containerRef.current.scrollTop = 0;
        }
      }
    },
    scrollToIndex: (index: number) => {
      if (!containerRef.current) return;
      
      try {
        const targetScrollTop = index * defaultItemHeight;
        containerRef.current.scrollTo({
          top: targetScrollTop,
          behavior: 'smooth'
        });
      } catch (error) {
        if (containerRef.current) {
          containerRef.current.scrollTop = index * defaultItemHeight;
        }
      }
    },
    containerRef
  }), [defaultItemHeight]);

  // 아이템들이 변경될 때 스크롤 위치 조정
  useEffect(() => {
    if (containerRef.current && items.length > 0) {
      const { scrollHeight, clientHeight, scrollTop } = containerRef.current;
      // 스크롤이 하단 근처에 있었다면 새 아이템 추가 시 하단으로 스크롤
      if (scrollTop + clientHeight >= scrollHeight - 100) {
        setTimeout(() => {
          if (containerRef.current) {
            containerRef.current.scrollTop = containerRef.current.scrollHeight;
          }
        }, 0);
      }
    }
  }, [items.length]);

  return (
    <div
      ref={containerRef}
      className={`overflow-auto ${className}`}
      onScroll={handleScroll}
      style={{
        height: '100%',
        overflowAnchor: 'none' // 자동 스크롤 앵커 비활성화
      }}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            transform: `translateY(${startIndex * defaultItemHeight}px)`
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