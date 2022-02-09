/* eslint-disable @typescript-eslint/no-use-before-define */
import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import styled from "styled-components";
import {
  Interval,
  sub,
  add,
  eachWeekOfInterval,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  endOfWeek,
  format,
  startOfWeek
} from "date-fns";
import { useVirtualized } from "../hooks/useVirtualized";

type Props = {
  range: Interval;
};

const DAY_HEIGHT = 100;

let newItems = 0;
let direction = 0;

export const MonthView = (props: Props) => {
  const { range } = props;
  const rootRef = useRef<HTMLDivElement>(null);
  const [weeks, setWeeks] = useState<Date[][]>([]);
  const [date, setDate] = useState<Date>(new Date(range.start));
  const [height, setHeight] = useState(-1);

  useEffect(() => {
    setHeight(rootRef.current?.offsetHeight ?? 0);
  }, []);

  const renderItem = (week: Date[], style: React.CSSProperties) => {
    return (
      <Week key={week[0].toDateString()} style={style}>
        {week.map((day) => (
          <Day
            key={day.toDateString()}
            style={{
              background:
                format(day, "dd MMM") === "01 Jan" ? "green" : "transparent"
            }}
          >
            {format(day, "dd MMM")}
          </Day>
        ))}
      </Week>
    );
  };

  const { containerStyle, visibleItems, onScroll } = useVirtualized<Date[]>({
    items: weeks,
    itemSize: DAY_HEIGHT,
    windowSize: height,
    renderItem
  });

  const getWeeks = (range: Interval) => {
    const weeks = eachWeekOfInterval(range);

    return weeks.map((week) =>
      eachDayOfInterval({
        start: startOfWeek(week),
        end: endOfWeek(week)
      })
    );
  };

  const handleReachTop = () => {
    const firstDate = weeks[0][0];

    const newWeeks = getWeeks({
      start: startOfWeek(startOfMonth(sub(firstDate, { months: 1 }))),
      end: sub(firstDate, { days: 1 })
    });

    newItems = newWeeks.length;
    direction = -1;

    setWeeks([...newWeeks, ...weeks.slice(0, 10)]);
  };

  const handleReachBottom = () => {
    const lastDate = weeks[weeks.length - 1][6];

    const newWeeks = getWeeks({
      start: add(lastDate, { days: 1 }),
      end: endOfWeek(endOfMonth(add(lastDate, { months: 1 })))
    });

    direction = 1;

    setWeeks([...weeks.slice(-10), ...newWeeks]);
  };

  const handleScroll = (ev) => {
    onScroll(ev);
    if (weeks.length === 0) return;
    if (ev.target.scrollTop <= 0) {
      handleReachTop();
      return;
    }
    if (
      ev.target.scrollTop + ev.target.offsetHeight >=
      ev.target.scrollHeight
    ) {
      handleReachBottom();
      return;
    }
  };

  useEffect(() => {
    setWeeks([
      ...getWeeks({
        start: startOfWeek(startOfMonth(sub(date, { months: 1 }))),
        end: endOfWeek(endOfMonth(add(date, { months: 1 })))
      })
    ]);
  }, [date]);

  useLayoutEffect(() => {
    if (direction === -1) {
      rootRef.current?.scroll({
        top: newItems * DAY_HEIGHT
      });
    } else {
      rootRef.current?.scroll({
        top: 600
      });
    }
  }, [weeks, height]);

  return (
    <>
      <Root ref={rootRef} onScroll={handleScroll}>
        <Container style={containerStyle}>{visibleItems}</Container>
      </Root>
    </>
  );
};

const Root = styled.div`
  height: 100%;
  overflow-y: scroll;
`;

const Container = styled.div``;

const Week = styled.div`
  display: flex;
  width: 100%;
  height: ${DAY_HEIGHT}px;
`;

const Day = styled.div`
  flex: 1 0;
  border: 1px solid red;
  display: flex;
  justify-content: center;
  align-items: center;
`;
