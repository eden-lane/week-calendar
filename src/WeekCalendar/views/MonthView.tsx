/* eslint-disable @typescript-eslint/no-use-before-define */
import React, {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState
} from "react";
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
  startOfWeek,
  getWeek
} from "date-fns";
import { useVirtualized } from "../hooks/useVirtualized";
import { CalendarEvent } from "../types";

type Props = {
  events: CalendarEvent[];
  range: Interval;
};

type DayData<TData = unknown> = {
  width: number;
  top: number;
  event: CalendarEvent<TData>;
};

const DAY_HEIGHT = 100;
const REMOVE_ITEMS_COUNT = 10;
const OFFSCREEN_ITEMS = 10;

let newItems = 0;
let direction = 0;

const DATE_FORMAT = "dd.MM.yyyy";

export const MonthView = (props: Props) => {
  const { range, events } = props;
  const rootRef = useRef<HTMLDivElement>(null);
  const [weeks, setWeeks] = useState<Date[][]>([]);
  const [date, setDate] = useState<Date>(new Date(range.start));
  const [height, setHeight] = useState(-1);

  const eventsMap = useMemo<Map<string, DayData[]>>(() => {
    const result = new Map();
    const places = new Map<string, boolean[]>();
    events
      .sort((a, b) => {
        return (
          (a.startDate?.getTime() || a.startDateTime!.getTime()) -
          (b.startDate?.getTime() || b.startDateTime!.getTime())
        );
      })
      .forEach((event) => {
        if (event.startDate && event.endDate) {
          const days = eachDayOfInterval({
            start: event.startDate,
            end: event.endDate
          });

          let lastWeekWithEvent = 0;
          let dayData: DayData;

          const place = places.get(format(event.startDate, DATE_FORMAT)) || [];

          const top =
            place.findIndex((p) => !p) === -1
              ? place.length
              : place.findIndex((p) => !p);

          days.forEach((day) => {
            const key = format(day, DATE_FORMAT);
            const dayEvents = result.get(key) || [];
            const weekNumber = getWeek(day);

            const place = places.get(key) || [];

            place[top] = true;
            places.set(key, place);

            if (weekNumber > lastWeekWithEvent) {
              dayData = {
                width: 1,
                top,
                event
              };
              dayEvents.push(dayData);
              result.set(key, dayEvents);
              lastWeekWithEvent = weekNumber;
            } else {
              dayData.width += 1;
            }
          });
        } else if (event.startDateTime && event.endDateTime) {
        }
      });

    return result;
  }, [events]);

  useEffect(() => {
    setHeight(rootRef.current?.offsetHeight ?? 0);
  }, []);

  const renderEvents = (date: Date) => {
    const key = format(date, DATE_FORMAT);
    const dayData = eventsMap.get(key);
    return dayData
      ? dayData.map((data) => (
          <Event
            style={{
              width: `${100 * data.width}%`,
              transform: `translateY(calc(${100 * data.top}% + ${
                1 * data.top
              }px))`
            }}
            key={data.event.id}
          >
            {data.event.title}
          </Event>
        ))
      : null;
  };

  const renderItem = (week: Date[], style: { offset: number }) => {
    return (
      <Week key={week[0].toDateString()} style={{ top: `${style.offset}px` }}>
        {week.map((day) => (
          <Day
            key={day.toDateString()}
            style={{
              color: day.getDay() === 0 || day.getDay() === 6 ? "red" : "black"
            }}
          >
            <div>
              {day.getDate() === 1
                ? format(day, "dd MMM yyyy")
                : format(day, "dd")}
            </div>
            <Events>{renderEvents(day)}</Events>
          </Day>
        ))}
      </Week>
    );
  };

  const { containerStyle, visibleItemsRender, onScroll } = useVirtualized<
    Date[]
  >({
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
        <Container style={{ height: containerStyle.size }}>
          {visibleItemsRender}
        </Container>
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
  flex-direction: column;
  border-bottom: 1px solid #ccc;
  & + & {
    border-left: 1px solid #ccc;
  }
`;

const Events = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
`;

const Event = styled.div`
  position: absolute;
  width: 100%;
  background: #03a9f4;
  font-size: 12px;
  padding: 2px 4px;
  color: #fff;
  box-sizing: border-box;
  z-index: 1;
  margin-bottom: 1px;
`;
