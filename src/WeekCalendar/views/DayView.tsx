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
import React, { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { useVirtualized } from "../hooks/useVirtualized";
import { CalendarEvent } from "../types";

type Props = {
  range: Interval;
  events: CalendarEvent[];
};

const HOUR_HEIGHT = 100;

export const DayView = (props: Props) => {
  const { range, events } = props;
  const rootRef = useRef<HTMLDivElement>(null);
  const [days, setDays] = useState<Date[]>([]);
  const [width, setWidth] = useState(-1);
  const [date, setDate] = useState(range.start);

  useEffect(() => {
    setWidth(rootRef.current?.offsetWidth ?? 0);
  }, []);

  const renderItem = (day: Date, style: React.CSSProperties) => {
    const hours = eachHourOfInterval({
      start: startOfDay(day),
      end: endOfDay(day)
    });

    return (
      <Day key={day.toDateString()} width={width / 7}>
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
    itemSize: width / 7,
    windowSize: width,
    offscreenItems: 10,
    renderItem
  });

  const getDays = (range: Interval) => {
    return eachDayOfInterval(range);
  };

  useEffect(() => {
    setDays(
      getDays({
        start: sub(date, { weeks: 2 }),
        end: add(date, { weeks: 3 })
      })
    );
  }, []);

  return (
    <>
      <Days ref={rootRef}>
        <Container>
          <Aside width={width / visibleItems.length}>
            <Header></Header>
            {eachHourOfInterval({
              start: startOfToday(),
              end: endOfToday()
            }).map((h) => (
              <AsideHour key={h.toDateString()}>{format(h, "HH:mm")}</AsideHour>
            ))}
          </Aside>
          <Content style={{ width: containerStyle.size }}>
            <Header>
              {visibleItems.map((date) => (
                <Date width={width / 7}>
                  <div>{format(date, "EE")}</div>
                  <div>{format(date, "dd")}</div>
                </Date>
              ))}
            </Header>
            <Hours>{visibleItemsRender}</Hours>
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
  height: 50px;

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

const Day = styled.div<{ width: number }>`
  width: ${(p) => p.width}px;
  height: 100%;
  display: inline-block;
  flex-shrink: 0;

  & + & {
    border-left: 1px solid #ccc;
  }
`;

const Aside = styled.aside<{ width: number }>`
  width: ${(p) => p.width}px;
  left: 0;
  position: sticky;
  flex: 0 0 60px;
  padding: 5px;
  z-index: 2;
  border-right: 1px solid #ccc;
`;

const Content = styled.div`
  display: flex;
  flex-direction: column;
`;

const Hours = styled.div`
  display: flex;
`;

const Hour = styled.div`
  width: 100%;
  height: ${HOUR_HEIGHT}px;
  border-bottom: 1px solid #ccc;
`;

const AsideHour = styled.div`
  display: flex;
  color: #555;
  justify-content: center;
  font-size: 12px;
  height: ${HOUR_HEIGHT}px;
  transform: translateY(-14px);
`;
