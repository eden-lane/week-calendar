import React, {
  ReactNode,
  useEffect,
  useMemo,
  useState,
  useRef,
  useLayoutEffect
} from "react";

type Props<T> = {
  items: T[];
  itemSize: number;
  windowSize: number;
  renderItem(item: T, style: React.CSSProperties): ReactNode;
};

const OFFSCREEN_ITEMS = 10;

export const useVirtualized = <T extends unknown>(props: Props<T>) => {
  const { items, itemSize, windowSize, renderItem } = props;

  const visibleItemsCount =
    Math.floor(windowSize / itemSize) + OFFSCREEN_ITEMS * 2;
  const containerStyle: React.CSSProperties = {
    height: `${(windowSize / itemSize + 4) * itemSize}px`,
    position: "relative"
  };

  const [scrollTop, setScrollTop] = useState(0);
  const [from, setFrom] = useState(0);
  const [to, setTo] = useState(Math.min(visibleItemsCount, items.length));

  useEffect(() => {
    const from = Math.max(
      0,
      Math.floor(scrollTop / itemSize) - OFFSCREEN_ITEMS
    );
    const to =
      from + Math.min(visibleItemsCount, items.length) + OFFSCREEN_ITEMS;

    setFrom(from);
    setTo(to);
  }, [visibleItemsCount, items.length, scrollTop, itemSize]);

  const visibleItems = useMemo(() => {
    return items.slice(from, to).map((item, index) =>
      renderItem(item, {
        position: "absolute",
        top: `${(from + index) * itemSize}px`
      })
    );
  }, [items, from, to, itemSize]);

  const onScroll = (ev) => {
    setScrollTop(ev.target.scrollTop);
  };

  return {
    containerStyle,
    visibleItems,
    onScroll
  };
};
