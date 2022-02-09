import {
  sub,
  add,
  eachDayOfInterval,
  eachHourOfInterval,
  endOfDay,
  startOfDay
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
    console.log(day);
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

  const { containerStyle, visibleItemsRender, onScroll } = useVirtualized<Date>(
    {
      items: days,
      itemSize: width / 7,
      windowSize: width,
      offscreenItems: 10,
      renderItem
    }
  );

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
        <Container style={{ width: containerStyle.size }}>
          {visibleItemsRender}
        </Container>
      </Days>
    </>
  );
};

const Days = styled.div`
  height: 100%;
  width: 100%;
  overflow: scroll;
`;

const Container = styled.div`
  position: relative;
  white-space: nowrap;
`;

const Day = styled.div<{ width: number }>`
  width: ${(p) => p.width}px;
  height: 100%;
  display: inline-block;

  & + & {
    border-left: 1px solid #ccc;
  }
`;

const Hour = styled.div`
  width: 100%;
  height: ${HOUR_HEIGHT}px;
  border-bottom: 1px solid #ccc;
`;
