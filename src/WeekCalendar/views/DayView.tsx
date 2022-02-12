import {
  sub,
  add,
  eachDayOfInterval,
  eachHourOfInterval,
  endOfDay,
  startOfDay,
  format,
  startOfToday,
  endOfToday
} from "date-fns";
import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import styled from "styled-components";
import { useVirtualized } from "../hooks/useVirtualized";
import { CalendarEvent } from "../types";

type Props = {
  range: Interval;
  events: CalendarEvent[];
  daysCount: number;
};

const HOUR_HEIGHT = 100;
const HEADER_HEIGHT = 50;
const ASIDE_WIDTH = 60;
const REMOVE_ITEMS_COUNT = 10;

export const DayView = (props: Props) => {
  const { range, events, daysCount } = props;
  const rootRef = useRef<HTMLDivElement>(null);
  const contRef = useRef<HTMLDivElement>(null);
  const [days, setDays] = useState<Date[]>([]);
  const [width, setWidth] = useState(-1);
  const [date, setDate] = useState(range.start);
  const direction = useRef(0);
  const itemsDiff = useRef(-1);
  const scrollPosition = useRef(-1);

  useEffect(() => {
    setWidth((rootRef.current?.offsetWidth ?? 0) - ASIDE_WIDTH);
  }, []);

  const renderItem = (day: Date, style: { offset: number }) => {
    const hours = eachHourOfInterval({
      start: startOfDay(day),
      end: endOfDay(day)
    });

    return (
      <Day
        key={day.toDateString()}
        style={{
          position: "absolute",
          left: `${style.offset + ASIDE_WIDTH}px`,
          top: `${HEADER_HEIGHT}px`,
          width: `${width / daysCount}px`
        }}
      >
        {hours.map((h) => (
          <Hour key={h} />
        ))}
      </Day>
    );
  };

  const {
    containerStyle,
    visibleItemsRender,
    visibleItems,
    onScroll
  } = useVirtualized<Date>({
    items: days,
    itemSize: width / daysCount,
    windowSize: width,
    offscreenItems: 20,
    renderItem
  });

  const getDays = (range: Interval) => {
    return eachDayOfInterval(range);
  };

  const handleReachLeft = () => {
    const firstDate = days[0];

    const newDays = getDays({
      start: sub(firstDate, { weeks: 1 }),
      end: sub(firstDate, { days: 1 })
    });

    setDays([...newDays, ...days.slice(0, REMOVE_ITEMS_COUNT)]);
    direction.current = -1;
    itemsDiff.current = newDays.length;
  };

  const handleReachRight = () => {
    const lastDate = days[days.length - 1];

    const newDays = getDays({
      start: add(lastDate, { days: 1 }),
      end: add(lastDate, { weeks: 2 })
    });

    direction.current = 1;
    itemsDiff.current = days.length - REMOVE_ITEMS_COUNT;
    scrollPosition.current = contRef.current?.scrollLeft ?? 0;
    setDays([...days.slice(-REMOVE_ITEMS_COUNT), ...newDays]);
  };

  useEffect(() => {
    setDays(
      getDays({
        start: sub(date, { weeks: 3 }),
        end: add(date, { weeks: 3 })
      })
    );
  }, []);

  console.log(days.length);

  const handleScroll = (ev) => {
    onScroll(ev);

    if (days.length === 0) return;

    if (ev.target.scrollLeft <= 0) {
      handleReachLeft();
      return;
    }
    if (ev.target.scrollLeft + ev.target.clientWidth >= ev.target.scrollWidth) {
      handleReachRight();
      return;
    }
  };

  useLayoutEffect(() => {
    if (direction.current === -1) {
      contRef.current?.scroll({
        left: (itemsDiff.current * width) / daysCount
      });
    } else {
      contRef.current?.scroll({
        left: scrollPosition.current - itemsDiff.current * (width / daysCount)
      });
    }
  });

  return (
    <>
      <Days ref={rootRef}>
        <Container ref={contRef} onScroll={handleScroll}>
          <Aside width={width / visibleItems.length}>
            <Header></Header>
            {eachHourOfInterval({
              start: startOfToday(),
              end: endOfToday()
            }).map((h) => (
              <AsideHour key={h.getHours()}>
                <AsideHourLabel>{format(h, "HH:mm")}</AsideHourLabel>
              </AsideHour>
            ))}
          </Aside>
          <Header>
            {visibleItems.map((date) => (
              <Date key={date.getTime()} width={width / daysCount}>
                <div>{format(date, "EE")}</div>
                <div>{format(date, "dd, MMM")}</div>
              </Date>
            ))}
          </Header>
          <Content style={{ width: containerStyle.size }}>
            {visibleItemsRender}
          </Content>
        </Container>
      </Days>
    </>
  );
};

const Days = styled.div`
  height: 100%;
  width: 100%;
  display: flex;
`;

const Container = styled.div`
  display: flex;
  position: relative;
  /* white-space: nowrap; */
  flex-grow: 1;
  overflow-x: scroll;
  overflow-y: scroll;
`;

const Header = styled.header`
  height: ${HEADER_HEIGHT}px;

  white-space: nowrap;
  position: sticky;
  top: 0;
  left: 0;
  right: 0;
  background: #fff;
  z-index: 1;
`;

const Date = styled.div<{ width: number }>`
  width: ${(p) => p.width}px;
  display: inline-block;
  padding: 1px 5px;
  border-bottom: 1px solid #ccc;
  flex-shrink: 0;

  & div:nth-child(1) {
    font-size: 12px;
  }

  & div:nth-child(2) {
    font-size: 24px;
  }
`;

const Day = styled.div`
  height: 100%;
  display: inline-block;
  flex-shrink: 0;
`;

const Aside = styled.aside<{ width: number }>`
  width: ${(p) => p.width}px;
  left: 0;
  position: sticky;
  flex: 0 0 ${ASIDE_WIDTH}px;

  z-index: 2;
`;

const Content = styled.div`
  display: flex;
  flex-direction: column;
`;

const Hour = styled.div`
  width: 100%;
  height: ${HOUR_HEIGHT}px;
  border-bottom: 1px solid #ccc;
  border-right: 1px solid #ccc;
`;

const AsideHour = styled.div`
  display: flex;
  color: #555;
  justify-content: center;
  font-size: 12px;
  height: ${HOUR_HEIGHT}px;

  border-right: 1px solid #ccc;
  background: #fff;
`;

const AsideHourLabel = styled.span`
  transform: translateY(-10px);
  z-index: 2;
`;
