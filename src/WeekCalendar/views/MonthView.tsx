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
const REMOVE_ITEMS_COUNT = 10;
const OFFSCREEN_ITEMS = 10;

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
              color: day.getDay() === 0 || day.getDay() === 6 ? "red" : "black"
            }}
          >
            {day.getDate() === 1
              ? format(day, "dd MMM yyyy")
              : format(day, "dd")}
          </Day>
        ))}
      </Week>
    );
  };

  const {
    containerStyle,
    visibleItems,
    visibleItemsRender,
    onScroll
  } = useVirtualized<Date[]>({
    items: weeks,
    itemSize: DAY_HEIGHT,
    windowSize: height,
    offscreenItems: OFFSCREEN_ITEMS,
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

    setWeeks([...newWeeks, ...weeks.slice(0, REMOVE_ITEMS_COUNT)]);
  };

  const handleReachBottom = () => {
    const lastDate = weeks[weeks.length - 1][6];

    const newWeeks = getWeeks({
      start: add(lastDate, { days: 1 }),
      end: endOfWeek(endOfMonth(add(lastDate, { months: 1 })))
    });

    direction = 1;

    setWeeks([...weeks.slice(-REMOVE_ITEMS_COUNT), ...newWeeks]);
  };

  const handleScroll = (ev) => {
    onScroll(ev);
    if (weeks.length === 0) return;

    const x = Math.floor(ev.target.scrollTop / DAY_HEIGHT);
    setDate(weeks[x][6]);

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
  }, []);

  useLayoutEffect(() => {
    if (direction === -1) {
      rootRef.current?.scroll({
        top: newItems * DAY_HEIGHT
      });
    } else {
      rootRef.current?.scroll({
        top: Math.max(REMOVE_ITEMS_COUNT * DAY_HEIGHT - height, 0)
      });
    }
  }, [weeks, height]);

  return (
    <>
      <Month>{format(date, "MMMM yyyy")}</Month>
      <DaysOfWeek>
        {eachDayOfInterval({
          start: startOfWeek(new Date()),
          end: endOfWeek(new Date())
        }).map((d) => (
          <DayOfWeek key={format(d, "EEEEEE")}>{format(d, "EEEEEE")}</DayOfWeek>
        ))}
      </DaysOfWeek>
      <Days ref={rootRef} onScroll={handleScroll}>
        <Container style={containerStyle}>{visibleItemsRender}</Container>
      </Days>
    </>
  );
};

const Month = styled.div`
  padding: 10px;
  border-bottom: 1px solid #ccc;
  font-weight: 700;
`;

const DaysOfWeek = styled.div`
  display: flex;
  overflow-y: scroll;
`;

const Days = styled.div`
  height: 100%;
  overflow-y: scroll;
`;

const Container = styled.div``;

const Week = styled.div`
  display: flex;
  width: 100%;
  height: ${DAY_HEIGHT}px;
`;

const DayOfWeek = styled.div`
  flex: 1 0;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 14px;

  border-bottom: 1px solid #ccc;
  & + & {
    border-left: 1px solid #ccc;
  }
`;

const Day = styled.div`
  flex: 1 0;
  font-size: 12px;
  display: flex;
  padding: 5px;
  border-bottom: 1px solid #ccc;
  & + & {
    border-left: 1px solid #ccc;
  }
`;
