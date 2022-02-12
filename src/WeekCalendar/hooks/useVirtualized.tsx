import React, { ReactNode, useEffect, useMemo, useState } from "react";

type Props<T> = {
  items: T[];
  itemSize: number;
  windowSize: number;
  renderItem(item: T, params: { offset: number }): ReactNode;
  offscreenItems?: number;
};

const OFFSCREEN_ITEMS = 10;

export const useVirtualized = <T extends unknown>(props: Props<T>) => {
  const {
    items,
    itemSize,
    windowSize,
    renderItem,
    offscreenItems = OFFSCREEN_ITEMS
  } = props;

  const visibleItemsCount =
    Math.floor(windowSize / itemSize) + offscreenItems * 2;
  const containerStyle = {
    size: `${(windowSize / itemSize + 4) * itemSize}px`
  };

  const [scroll, setScroll] = useState(0);
  const [from, setFrom] = useState(0);
  const [to, setTo] = useState(Math.min(visibleItemsCount, items.length));

  useEffect(() => {
    const from = Math.max(0, Math.floor(scroll / itemSize) - offscreenItems);
    const to =
      from + Math.min(visibleItemsCount, items.length) + offscreenItems;

    setFrom(from);
    setTo(to);
  }, [visibleItemsCount, items.length, scroll, itemSize, offscreenItems]);

  const visibleItems = useMemo(() => {
    return items.slice(from, to);
  }, [items, from, to]);

  const visibleItemsRender = useMemo(() => {
    return visibleItems.map((item, index) =>
      renderItem(item, {
        offset: (from + index) * itemSize
      })
    );
  }, [visibleItems, itemSize, from]);

  const onScroll = (ev) => {
    setScroll(ev.target.scrollTop);
  };

  return {
    containerStyle,
    visibleItems,
    visibleItemsRender,
    onScroll
  };
};
